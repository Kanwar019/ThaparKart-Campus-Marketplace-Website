import assert from "node:assert/strict";
import { test } from "node:test";
import * as controller from "../controllers/orderController.js";
import Order from "../models/Order.js";
import Listing from "../models/Listing.js";

const buyer = "000000000000000000000001";
const seller = "000000000000000000000002";
const outsider = "000000000000000000000003";
const listingId = "000000000000000000000004";
const orderId = "000000000000000000000005";

function response() {
  return { statusCode: 200, status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; } };
}

// Only the database boundary is replaced. These tests exercise the actual handlers
// and verify that every mutation is attached to the same transaction session.
function database(t, { status = "Reserved", listingStatus = "reserved", failCreate = false, failListing = false } = {}) {
  const state = { listing: { _id: listingId, user: seller, status: listingStatus, price: 450 },
    order: { _id: orderId, buyer, listing: listingId, status } };
  const session = {};
  const query = (value) => ({ session(actual) { assert.equal(actual, session); return Promise.resolve(value); } });
  const document = (value) => value && ({ ...value, async populate() { return this; } });
  t.mock.method(Order.db, "transaction", async (work) => {
    const before = structuredClone(state);
    try { return await work(session); } catch (error) { Object.assign(state, before); throw error; }
  });
  t.mock.method(Listing, "findById", () => query(document(state.listing)));
  t.mock.method(Order, "findById", () => query(document(state.order)));
  t.mock.method(Listing, "findOneAndUpdate", async (filter, update, options) => {
    assert.equal(options.session, session);
    assert.equal(String(filter._id), listingId);
    if (failListing || filter.status !== state.listing.status) return null;
    Object.assign(state.listing, update.$set || update);
    return document(state.listing);
  });
  t.mock.method(Order, "findOneAndUpdate", async (filter, update, options) => {
    assert.equal(options.session, session);
    assert.equal(String(filter._id), orderId);
    if (filter.status !== state.order.status) return null;
    Object.assign(state.order, update.$set || update);
    return document(state.order);
  });
  t.mock.method(Order, "create", async (rows, options) => {
    assert.equal(options.session, session);
    if (failCreate) throw Object.assign(new Error("Duplicate reservation"), { code: 11000 });
    state.order = { _id: orderId, ...rows[0] };
    return [document(state.order)];
  });
  return state;
}

test("reserving commits the listing and buyer order together", async (t) => {
  const state = database(t, { listingStatus: "active" });
  const res = response();
  await controller.createOrder({ user: { _id: buyer }, body: { listingId } }, res);
  assert.equal(res.statusCode, 201);
  assert.equal(state.listing.status, "reserved");
  assert.equal(res.body.buyer, buyer);
});

test("an order creation failure does not leave a reserved listing", async (t) => {
  const state = database(t, { listingStatus: "active", failCreate: true });
  const res = response();
  await controller.createOrder({ user: { _id: buyer }, body: { listingId } }, res);
  assert.equal(res.statusCode, 409);
  assert.equal(state.listing.status, "active");
});

test("reservation freezes the server price even after the listing changes", async (t) => {
  const state = database(t, { listingStatus: "active" });
  const res = response();
  await controller.createOrder({ user: { _id: buyer }, body: { listingId, priceAtReservation: 1 } }, res);
  assert.equal(res.statusCode, 201);
  state.listing.price = 900;
  assert.equal(state.order.priceAtReservation, 450);
  const stored = new Order(state.order);
  assert.equal(stored.priceAtReservation, 450, "the schema must persist the snapshot");
  stored.isNew = false;
  stored.priceAtReservation = 900;
  assert.equal(stored.priceAtReservation, 450, "the snapshot must be immutable");
});

test("a legacy listing with an invalid price cannot create an order", async (t) => {
  const state = database(t, { listingStatus: "active" });
  state.listing.price = -20;
  const res = response();
  await controller.createOrder({ user: { _id: buyer }, body: { listingId } }, res);
  assert.equal(res.statusCode, 409);
  assert.equal(state.listing.status, "active");
});

for (const [name, actor, status, action, code, next, listingStatus] of [
  ["seller confirms", seller, "Reserved", "confirm", 200, "Pending Pickup", "reserved"],
  ["seller completes pickup", seller, "Pending Pickup", "complete", 200, "Completed", "sold"],
  ["buyer cancels request", buyer, "Reserved", "cancel", 200, "Cancelled", "active"],
  ["seller cancels pickup", seller, "Pending Pickup", "cancel", 200, "Cancelled", "active"],
  ["buyer cannot confirm", buyer, "Reserved", "confirm", 403, "Reserved", "reserved"],
  ["buyer cannot complete", buyer, "Pending Pickup", "complete", 403, "Pending Pickup", "reserved"],
  ["outsider cannot cancel", outsider, "Reserved", "cancel", 403, "Reserved", "reserved"],
  ["pickup cannot be skipped", seller, "Reserved", "complete", 409, "Reserved", "reserved"],
  ["completed orders are final", seller, "Completed", "cancel", 409, "Completed", "sold"],
  ["cancelled orders are final", buyer, "Cancelled", "cancel", 409, "Cancelled", "active"],
]) {
  test(name, async (t) => {
    assert.equal(typeof controller.updateOrderStatus, "function", "reservation actions must be available");
    const initialListing = status === "Completed" ? "sold" : status === "Cancelled" ? "active" : "reserved";
    const state = database(t, { status, listingStatus: initialListing });
    const res = response();
    await controller.updateOrderStatus({ user: { _id: actor }, params: { id: orderId }, body: { action, expectedStatus: status } }, res);
    assert.equal(res.statusCode, code);
    assert.equal(state.order.status, next);
    assert.equal(state.listing.status, listingStatus);
  });
}

test("stale actions cannot overwrite a newer reservation status", async (t) => {
  assert.equal(typeof controller.updateOrderStatus, "function");
  const state = database(t, { status: "Pending Pickup" });
  const res = response();
  await controller.updateOrderStatus({ user: { _id: buyer }, params: { id: orderId }, body: { action: "cancel", expectedStatus: "Reserved" } }, res);
  assert.equal(res.statusCode, 409);
  assert.equal(state.order.status, "Pending Pickup");
});

test("a listing conflict aborts the order transition", async (t) => {
  assert.equal(typeof controller.updateOrderStatus, "function");
  const state = database(t, { failListing: true });
  const res = response();
  await controller.updateOrderStatus({ user: { _id: seller }, params: { id: orderId }, body: { action: "confirm", expectedStatus: "Reserved" } }, res);
  assert.equal(res.statusCode, 409);
  assert.equal(state.order.status, "Reserved");
});

for (const [name, actor, id, body, expected] of [
  ["anonymous action", null, orderId, { action: "cancel", expectedStatus: "Reserved" }, 401],
  ["malformed order ID", seller, "invalid", { action: "cancel", expectedStatus: "Reserved" }, 400],
  ["unsupported action", seller, orderId, { action: "reopen", expectedStatus: "Reserved" }, 400],
  ["missing version of status", seller, orderId, { action: "cancel" }, 400],
]) {
  test(`${name} is rejected before database access`, async (t) => {
    t.mock.method(Order.db, "transaction", () => assert.fail("Invalid requests must not access orders"));
    const res = response();
    await controller.updateOrderStatus({ user: actor && { _id: actor }, params: { id }, body }, res);
    assert.equal(res.statusCode, expected);
  });
}

test("sellers only receive orders for their own listings", async (t) => {
  let filter;
  t.mock.method(Listing, "find", (value) => {
    assert.deepEqual(value, { user: seller });
    return { select: async () => [{ _id: listingId }] };
  });
  const visible = [{ _id: orderId, status: "Reserved" }];
  t.mock.method(Order, "find", (value) => {
    filter = value;
    return { populate() { return this; }, sort: async () => visible };
  });
  const res = response();
  await controller.getSellerOrders({ user: { _id: seller } }, res);
  assert.deepEqual(filter, { listing: { $in: [listingId] } });
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, visible);
});

for (const [name, actor, listingStatus, expected] of [
  ["seller cannot reserve own item", seller, "active", 400],
  ["another buyer cannot reserve an unavailable item", outsider, "reserved", 409],
]) {
  test(name, async (t) => {
    const state = database(t, { listingStatus });
    const res = response();
    await controller.createOrder({ user: { _id: actor }, body: { listingId } }, res);
    assert.equal(res.statusCode, expected);
    assert.equal(state.listing.status, listingStatus);
    assert.equal(state.order.buyer, buyer);
  });
}
