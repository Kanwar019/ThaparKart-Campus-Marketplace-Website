# Reservation lifecycle

From **My Reservations**, buyers manage their reservations and sellers use
**Requests for my listings**. Existing cards, navigation, and page styling are retained.

| Action | Allowed actor | Current order status | New order status | Listing status |
| --- | --- | --- | --- | --- |
| Reserve | Buyer other than the owner | No live reservation | Reserved | reserved |
| Confirm | Seller | Reserved | Pending Pickup | reserved |
| Complete pickup | Seller | Pending Pickup | Completed | sold |
| Cancel | Buyer or seller | Reserved or Pending Pickup | Cancelled | active |

Completed and cancelled orders are final. A cancelled item can be reserved again,
creating a new order while preserving the cancelled history. Listing editing is
limited to active items; reserved items cannot be deleted. Status cannot be changed
through the listing edit endpoint. Sold listings can be hidden through soft deletion.

## API

- `POST /api/orders` accepts `listingId` and reserves an active listing.
- `GET /api/orders` returns the authenticated buyer's orders, retaining its array shape.
- `GET /api/orders/selling` returns orders for listings owned by the authenticated seller.
- `PATCH /api/orders/:id/status` accepts `action` (`confirm`, `complete`, or `cancel`)
  and `expectedStatus` from the displayed order. Only participants can change an order.
  A stale or disallowed transition returns 409. The page refreshes on conflicts.

## Database requirement

**Use MongoDB Atlas or a MongoDB replica set (including a single-node development
replica set). A standalone MongoDB server does not support these transactions.**

Creation and transitions put both the order write and listing write in one MongoDB
transaction. Conditional writes and the existing unique order index prevent duplicate
live reservations. Mongoose retries transient transaction conflicts. Errors abort
the transaction; there is no blind compensating write to reactivate a listing.

Keep the existing unique partial index on `Order.listing` for Reserved, Pending
Pickup, and Completed orders. No schema migration or new seller field is required.
Existing inconsistent records (for example a Reserved order pointing to an active
listing) return a conflict rather than silently overwriting the listing. Inspect
and reconcile such records separately; this change does not modify existing data.

## Verification

New reservations store an immutable `priceAtReservation` from the listing returned
by the conditional update inside the transaction. Request-supplied prices are ignored.
Order history displays this saved price, including zero for free items. Legacy orders
without a snapshot display **Original price unavailable**; current listing prices
are not backfilled because they may differ from the original agreed price.

Listing creation and editing share validation: a non-empty title (maximum 150
characters), a finite price from 0 to 10000000, description up to 3000 characters,
category/condition up to 100 characters, and at most five non-empty image strings.
Text is trimmed. Invalid types and overlong values return 400 rather than being
silently coerced or truncated. Partial edits update only supplied fields. Image
storage and file-content validation remain a separate improvement.

`node --test src/utils/*.test.js backend/tests/*.test.js`

Lifecycle tests run the real handlers with simulated database operations and assert
the transaction session, ownership, transitions, stale requests, and failure paths.
They do not prove live MongoDB rollback or concurrent transaction behavior. Before
deployment, verify on a disposable replica-set database: two buyers reserve the
same item concurrently (one succeeds); a failed order insert leaves the item active;
cancellation allows a new reservation; completed pickup leaves the item sold.
