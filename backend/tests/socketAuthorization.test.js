import assert from "node:assert/strict";
import { test } from "node:test";
import { createServer } from "node:http";
import { once } from "node:events";
import { env } from "node:process";
import { Server } from "socket.io";
import { io as connect } from "socket.io-client";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { configureChatSockets } from "../socket.js";

const alice = "000000000000000000000001";
const bob = "000000000000000000000002";
const secret = "socket-tests-only-secret";

async function setup(t) {
  const previousSecret = env.JWT_SECRET;
  env.JWT_SECRET = secret;
  t.after(() => {
    if (previousSecret === undefined) delete env.JWT_SECRET;
    else env.JWT_SECRET = previousSecret;
  });
  t.mock.method(User, "findById", (id) => ({
    select: async () => id === alice || id === bob ? new User({ _id: id }) : null,
  }));
  // Expected JWT rejection logs are irrelevant to the assertions.
  t.mock.method(console, "error", () => {});
  const http = createServer();
  const io = new Server(http);
  configureChatSockets(io);
  const clients = [];
  t.after(async () => {
    clients.forEach((client) => client.disconnect());
    await new Promise((resolve) => io.close(resolve));
  });
  http.listen(0, "127.0.0.1");
  await once(http, "listening");
  return {
    io,
    async open(cookie, transport = "websocket") {
      const client = connect(`http://127.0.0.1:${http.address().port}`, {
        autoConnect: false, reconnection: false,
        transports: [transport],
        extraHeaders: cookie ? { Cookie: cookie } : {},
        timeout: 1500,
      });
      clients.push(client);
      const result = new Promise((resolve) => {
        client.once("connect", () => resolve({ client }));
        client.once("connect_error", (error) => resolve({ client, error }));
      });
      client.connect();
      return result;
    },
  };
}

function cookie(userId, options = {}) {
  return `token=${jwt.sign({ userId }, secret, { expiresIn: "1h", ...options })}`;
}

for (const [name, credentials] of [
  ["missing cookie", undefined],
  ["malformed token", "token=not-a-jwt"],
  ["forged token", `token=${jwt.sign({ userId: alice }, "wrong-secret")}`],
  ["expired token", cookie(alice, { expiresIn: -1 })],
  ["deleted user", cookie("000000000000000000000099")],
]) {
  test(`rejects socket connection with ${name}`, { timeout: 5000 }, async (t) => {
    const fixture = await setup(t);
    const { client, error } = await fixture.open(credentials);
    assert.ok(error, "Unauthorized connection must fail its handshake");
    assert.equal(error.message, "Not authenticated.");
    assert.equal(client.connected, false);
    assert.equal(fixture.io.of("/").sockets.size, 0);
  });
}

for (const transport of ["websocket", "polling"]) {
  test(`${transport}: verified users join only their own room and receive private notifications`, { timeout: 5000 }, async (t) => {
    const fixture = await setup(t);
    const { client: a, error } = await fixture.open(cookie(alice), transport);
    assert.equal(error, undefined);
    const { client: b } = await fixture.open(cookie(bob), transport);
    const serverA = fixture.io.of("/").sockets.get(a.id);
    assert.ok(serverA.rooms.has(alice), "Room assignment must not require a client user ID");

    // Round-trip barrier: Socket.IO preserves order, so the forged join is
    // processed before this acknowledgement. No timing sleeps are needed.
    serverA.on("test-barrier", (ack) => ack());
    a.emit("join", bob);
    await a.timeout(1000).emitWithAck("test-barrier");
    assert.equal(serverA.rooms.has(bob), false);

    const receivedByAlice = [];
    a.on("message", (payload) => receivedByAlice.push(payload));
    const bobMessage = once(b, "message");
    fixture.io.to(bob).emit("message", { text: "For Bob only" });
    assert.deepEqual((await bobMessage)[0], { text: "For Bob only" });
    const aliceMessage = once(a, "message");
    fixture.io.to(alice).emit("message", { text: "For Alice only" });
    await aliceMessage;
    assert.deepEqual(receivedByAlice, [{ text: "For Alice only" }]);
  });
}
