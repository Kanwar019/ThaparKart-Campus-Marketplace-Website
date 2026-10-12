import assert from "node:assert/strict";
import { test } from "node:test";
import Chat from "../models/Chat.js";
import router from "../routes/chat/chatRoutes.js";

const alice = "000000000000000000000001";
const bob = "000000000000000000000002";
const outsider = "000000000000000000000003";

// Exercise the real route handlers and Mongoose documents without a live DB.
function setup(t) {
  const chat = new Chat({
    participants: [alice, bob],
    messages: [{ sender: alice, text: "Private message", read: false }],
  });
  let saves = 0;
  const emissions = [];
  t.mock.method(chat, "save", async () => { saves += 1; return chat; });
  t.mock.method(Chat, "findById", async (id) =>
    String(id) === String(chat._id) ? chat : null);
  return {
    chat, emissions,
    get saves() { return saves; },
    io: { to(room) { return { emit(event, payload) { emissions.push({ room, event, payload }); } }; } },
  };
}

async function invoke(path, method, req) {
  const route = router.stack.find((layer) =>
    layer.route?.path === path && layer.route.methods[method]);
  const res = {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
  // Authentication is upstream; req.user represents its verified identity.
  await route.route.stack.at(-1).handle(req, res);
  return res;
}

test("outsiders cannot read or mark another conversation's messages read", async (t) => {
  const fixture = setup(t);
  const res = await invoke("/:id/messages", "get", {
    params: { id: fixture.chat.id }, user: { id: outsider },
  });
  assert.equal(res.statusCode, 403);
  assert.equal(res.body.messages, undefined);
  assert.equal(fixture.chat.messages[0].read, false);
  assert.equal(fixture.saves, 0);
});

test("outsiders cannot append messages or emit notifications", async (t) => {
  const fixture = setup(t);
  const res = await invoke("/send", "post", {
    body: { chatId: fixture.chat.id, recipientId: bob, text: "Intrusion" },
    user: { id: outsider }, io: fixture.io,
  });
  assert.equal(res.statusCode, 403);
  assert.equal(res.body.chat, undefined);
  assert.equal(fixture.chat.messages.length, 1);
  assert.equal(fixture.saves, 0);
  assert.equal(fixture.emissions.length, 0);
});

for (const member of [alice, bob]) {
  test(`participant ${member} can read conversation history`, async (t) => {
    const fixture = setup(t);
    const res = await invoke("/:id/messages", "get", {
      params: { id: fixture.chat.id }, user: { id: member },
    });
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.messages[0].text, "Private message");
    assert.equal(fixture.chat.messages[0].read, member === bob);
  });

  test(`participant ${member} can send only to the actual conversation recipient`, async (t) => {
    const fixture = setup(t);
    const res = await invoke("/send", "post", {
      body: { chatId: fixture.chat.id, recipientId: outsider, text: "Hello" },
      user: { id: member }, io: fixture.io,
    });
    assert.equal(res.statusCode, 200);
    assert.equal(fixture.chat.messages.at(-1).text, "Hello");
    assert.equal(String(fixture.chat.messages.at(-1).sender), member);
    assert.equal(fixture.saves, 1);
    assert.equal(fixture.emissions.length, 1);
    assert.equal(fixture.emissions[0].room, member === alice ? bob : alice);
  });
}

test("missing conversation returns 404 on read", async (t) => {
  setup(t);
  const res = await invoke("/:id/messages", "get", {
    params: { id: "000000000000000000000099" }, user: { id: alice },
  });
  assert.equal(res.statusCode, 404);
});
