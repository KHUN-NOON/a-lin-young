# Project Specification: Electrical Shop Inventory Management PWA

## 1. Project Overview & Goals

This project is an **Offline-First, Mobile-First Progressive Web App (PWA)** built to manage inventory for electrical shops. The system is designed to handle the fast-paced retail environment where internet connectivity may be unreliable and item prices fluctuate frequently. It enables staff to perform quick price checks, track buying and selling prices over time, process invoices, and generate reports—all seamlessly, whether online or offline.

## 2. User Roles & Permissions (RBAC)

The system utilizes Role-Based Access Control (RBAC) to restrict actions based on user roles.

| Feature / Action                   | Admin |       Sale Person        |
| :--------------------------------- | :---: | :----------------------: |
| **Login / Auth**                   |  ✅   |            ✅            |
| **View Items & Quick Price Check** |  ✅   |            ✅            |
| **Create / Edit Items**            |  ✅   |            ❌            |
| **Record / Update Buying Prices**  |  ✅   |            ❌            |
| **Record / Update Selling Prices** |  ✅   | ✅ (Optional/Restricted) |
| **Create Invoices / Checkout**     |  ✅   |            ✅            |
| **View Past Invoices (All)**       |  ✅   |      ❌ (Own only)       |
| **Generate & View Reports**        |  ✅   |            ❌            |
| **Manage Users & Roles**           |  ✅   |            ❌            |
| **Trigger Manual Sync**            |  ✅   |            ✅            |
| **View Activity Log**              |  ✅   |   ❌ (Admin can grant)   |

_Permissions are role defaults. Admin can grant individual permissions (e.g., `activity_log.view`) to a Sale Person; grants are stored server-side, delivered in the session, and cached in `session.permissions` for offline gating (the server re-validates on sync/pull)._

## 3. Core Features

- **Item Management:** Search, filter, and categorize electrical items.
- **Dynamic Price Tracking:** Record and maintain a history of frequently changing buying and selling prices.
- **Invoicing (POS):** Fast cart creation, quantity adjustments, and invoice generation.
- **Reporting:** Sales summaries, profit calculations (Admin only), and inventory levels.
- **Offline-First Engine:** Fully functional without an internet connection using local IndexedDB, with background sync queuing.

## 4. Workflows

1.  **Item Setup & Maintenance:** Admin creates an item profile (Name, Category, Barcode/SKU). Admin updates buying price; Admin/Sale Person updates current selling price. The system archives the previous prices for historical tracking.
2.  **Quick Price Check:** Sale Person searches for an item via text or category filter to instantly view the current selling price for a customer.
3.  **Invoicing:** Sale Person adds items to the cart, adjusts quantities, applies current selling prices, and finalizes the invoice. If offline, the invoice is saved locally and queued.
4.  **Syncing:** Upon network restoration, the background sync pushes queued local mutations (invoices, price updates) to the server.
5.  **Reporting:** Admin navigates to the reports dashboard to view daily/weekly sales and pricing trends.

## 5. Offline & Sync Architecture

### 5.1 Principles

- Dexie.js (IndexedDB) is the single source of truth for the UI. Every read and write hits local storage first; the network is never on the critical path.
- All IDs are client-generated UUIDv7 (sortable), so records can be created offline without collisions.
- Money is stored as **integer minor units** (e.g., kyat as integer). Never floats.
- Deletes are **soft deletes** (`deletedAt`) so they can propagate during sync.
- Each device has a stable `deviceId` (generated once, kept in Dexie `meta`).

### 5.2 Authentication & RBAC Offline

- On successful online login, store in the `session` table: `userId`, `role`, access/refresh tokens, `lastOnlineAt`, and an `offlineValidUntil` (e.g., 7 days from the last successful online auth).
- While offline and before `offlineValidUntil`, the app trusts the cached session and enforces RBAC locally from the cached `role` (UI gating only; the server re-validates on sync).
- After `offlineValidUntil`, the app is read-only/locked until the user re-authenticates online.
- Expired access tokens are refreshed when online. A 401 on sync pauses the queue and prompts re-login; queued mutations are **never discarded** because of auth failure.
- A 403 on a queued mutation (e.g., role was revoked) marks that entry `failed` and surfaces it to the user.
- Users and roles are cached locally only for the current device user (and for display names via `users_cache`).
- Logout while the queue is non-empty must warn the user; pending data stays in Dexie until synced.

### 5.3 Push Sync (Local → Server)

1. Every local mutation writes the entity **and** a `sync_queue` entry in a single Dexie transaction. The entity gets `syncStatus = 'pending'`.
2. The queue is processed by a single worker (guarded by a Web Lock so multiple tabs don't double-process), triggered by: the `online` event, app start, a successful manual sync, and a periodic timer while online. Background Sync API is used where supported, with the above as fallback.
3. Entries are sent **in order** (see 5.5). On success, the entry is removed and the entity's `syncStatus` becomes `synced` (unless it changed again meanwhile; compare `updatedAt`/`version`).
4. On network error: keep the entry, increment `retryCount`, and retry with exponential backoff (e.g., 5s → 5min cap) with jitter.
5. On 4xx validation errors (non-auth): mark `status = 'failed'` with `lastError`, do not retry automatically, and surface in the sync status UI. Entries that depend on a failed entry are `blocked`.
6. After `maxRetries` (default 10) for network/5xx errors, the entry moves to `failed` and requires manual retry.
7. Consecutive queued updates to the same entity may be **coalesced** into one entry, but never across entity types or across a create/delete boundary.

### 5.4 Idempotency

- Every queue entry has a unique `idempotencyKey` (UUID) sent as the `Idempotency-Key` header. The server must store keys and return the original result on repeats, so retries after a lost response never duplicate invoices or price records.
- Creation endpoints are also upserts by client-generated `id`.
- Invoice numbers: `invoiceNumber` is generated locally as `{deviceCode}-{yyyymmdd}-{localSequence}` (unique across devices). The server may assign an additional official `serverInvoiceNumber` on sync, stored on pull.

### 5.5 Ordering & Dependencies

- Queue entries are processed by ascending `sequence` (a local monotonically increasing counter), preserving causal order per device.
- Dependency rule: an entry that references another entity (e.g., an `invoice_items` row → item, or an invoice → its items) is only sent after the entries creating the referenced entities succeed. Entries carry `dependsOn` (optional entry IDs) to make this explicit.
- An invoice and its `invoice_items` are pushed as **one atomic mutation** (`CREATE_INVOICE`) to avoid partial invoices.
- Price changes are pushed as append-only `price_history` records plus an item update, in one mutation (`UPDATE_PRICE`).

### 5.6 Pull Sync (Server → Local)

- **Initial sync:** After first login, download items, categories, current prices, and the user's allowed data (Sale Person: own invoices only; Admin: all) in paginated batches, showing progress. The app is usable once the core item catalog is loaded.
- **Delta pull:** Each entity type stores a `lastPulledCursor` in `meta` (server-issued cursor or server `updatedAt`). The client requests changes since the cursor, including tombstones (`deletedAt`).
- Pull runs after a successful push, on reconnect, on app foreground, and on manual sync. Push always happens **before** pull.
- Applying pulled records: if the local record is `pending`, apply conflict rules (5.7); otherwise overwrite local data. All applied in Dexie transactions.
- Cached data reconciles on pull. Reports are computed locally from local data and show a "data as of `lastSyncedAt`" notice.

### 5.7 Conflict Resolution

| Data type                                | Strategy                                                                                                    |
| :--------------------------------------- | :---------------------------------------------------------------------------------------------------------- |
| Item name, category, SKU, other metadata | **Last Write Wins** by `updatedAt` (server time authoritative; tie-break by `deviceId`).                    |
| Current buying/selling price             | LWW on the current value. Every change still appends to `price_history`, so no price is ever lost.          |
| `price_history`, invoices, invoice items | **Append-only / immutable**: no conflicts. Corrections are new records (e.g., invoice `void` status).       |
| `stockLevel`                             | **Never overwritten.** Stock changes are synced as signed deltas (`stock_movements`); the server sums them. |
| Edit vs. delete                          | Delete wins unless the edit is newer **and** the user chooses to restore; flagged as a conflict.            |
| Critical conflicts                       | Entity set to `syncStatus = 'conflict'`, both versions kept in `conflicts`, UI asks the user to choose.     |

"Critical" means: the same item's buying price edited by different users on different devices within one sync window with differing values, or an edit conflicting with a delete/void. Conflicts are shown in a badge on the sync status indicator and a resolution screen (Admin resolves; Sale Person sees read-only notice).

### 5.8 PWA & Storage

- Service worker precaches the app shell (HTML, JS, CSS, icons, fonts, bundled i18n dictionaries) using a versioned cache. API data is **never** cached by the service worker; data lives in Dexie.
- Updates: new service worker is installed in the background, and the user is prompted to reload; never auto-reload mid-checkout.
- Call `navigator.storage.persist()` after login to reduce the risk of browser eviction of IndexedDB.
- Sync status UI (translated en/my): online/offline, pending count, last synced time, failed/conflict counts, and a "Sync now" button.

### 5.9 Dexie Versioning & Migrations

- The schema is versioned with `db.version(n).stores({...})`. Every version bump includes an `upgrade()` routine that preserves existing rows and backfills new fields (e.g., `syncStatus = 'pending'` for unknown data, `updatedAt = now`).
- Never drop a table or index with unsynced data; the migration must first confirm the `sync_queue` is preserved or converted.

### 5.10 Activity Log (Audit Trail)

- Scope: **create, update, delete (soft delete), restore, void** only. Reads and logins are not logged.
- Table `activity_logs` is **append-only and immutable** (never conflicts, never soft-deleted). Written in the **same Dexie transaction** as the entity and its `sync_queue` entry through a single `withAudit()` helper; no CRUD path may bypass it.
- The log row travels inside the same queue entry as its mutation (e.g., `CREATE_INVOICE` carries its log). The server stores entity + log in one DB transaction; the idempotency key prevents duplicate logs.
- Fields: `id`, `userId`, `userName` (snapshot), `deviceId`, `action`, `entityType`, `entityId`, `entityLabel` (snapshot), `changes` (`{field: [old, new]}` diff), `occurredAt` (client, display only), `serverReceivedAt` (authoritative).
- The server sets `userId` from the auth token (client value ignored). Tokens and secrets are never logged. Buying-price diffs are visible only to Admin.
- Visibility: permission `activity_log.view`, Admin by default; Admin can grant it to individual users later. Viewers see a global Activity screen (filter by user/entity/date) and a per-item History tab. Labels translated en/my.
- Retention: server keeps full history; the client may prune **synced** rows older than N days (default 90). Unsynced rows are never pruned.
- `price_history` remains the domain record; the log references it rather than duplicating it.

### 5.11 Server REST API Contract

Custom REST API; all endpoints require a bearer token and the server re-validates RBAC/permissions from the token, never from client-claimed roles.

- `POST /sync/push`: body is an ordered array of operations `{idempotencyKey, operation, entityType, entityId, baseVersion, payload, activityLog}`; header `Idempotency-Key` per operation. Each operation runs in its own DB transaction: idempotency check → RBAC → conflict check (`baseVersion` vs server `version`) → write entity, `stock_movements`, activity log → bump `version`. Response is per operation: `applied` | `duplicate` | `rejected{reason}` | `conflict{serverVersion}`. Status codes follow 5.3 (401 pause, 403 failed, other 4xx failed, 5xx/network retry).
- `GET /sync/pull?entity=…&cursor=…&limit=…`: returns changes plus tombstones and a `nextCursor`. The cursor is a **monotonic server change-sequence id**, not `updatedAt` (avoids skipped rows from overlapping commits or clock drift).
- `GET /activity-logs?cursor=…&userId=&entityType=&from=&to=`: gated by `activity_log.view`; Admin-only data pulled into local `activity_logs` (a user without the permission only has their own logs locally).
- `GET/PUT /users/:id/permissions`: Admin only.
- Triggers: `online` event, app start, debounced after each mutation, foreground, periodic timer, manual sync; Background Sync API where supported. Push always before pull. Server timestamps are authoritative.

## 6. Data Model (Dexie.js Local Schema)

_Common fields on all **synced entity** tables: `id` (UUIDv7), `createdAt`, `updatedAt` (ms epoch), `deletedAt?`, `version` (server-assigned revision), `syncStatus` (`synced` | `pending` | `conflict`). They are omitted below for brevity unless noted._

| Table                 | Fields (beyond common)                                                                                                                                                                                                                                                                  | Dexie indexes                                      |
| :-------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------- |
| **`categories`**      | `name`, `parentId?`                                                                                                                                                                                                                                                                     | `id, name, syncStatus`                             |
| **`items`**           | `sku`, `name`, `categoryId`, `barcode?`, `unit`, `stockLevel` (derived cache), `currentBuyingPrice` (int), `currentSellingPrice` (int)                                                                                                                                                  | `id, sku, name, categoryId, updatedAt, syncStatus` |
| **`price_history`**   | `itemId`, `priceType` (`buying`/`selling`), `amount` (int), `effectiveDate`, `recordedBy` (append-only)                                                                                                                                                                                 | `id, itemId, [itemId+priceType], syncStatus`       |
| **`stock_movements`** | `itemId`, `delta` (signed int), `reason` (`sale`/`restock`/`adjustment`/`void`), `refId?` (invoice id), `recordedBy` (append-only)                                                                                                                                                      | `id, itemId, refId, syncStatus`                    |
| **`invoices`**        | `invoiceNumber` (local, unique), `serverInvoiceNumber?`, `totalAmount` (int), `date`, `createdBy`, `deviceId`, `status` (`completed`/`void`)                                                                                                                                            | `id, &invoiceNumber, date, createdBy, syncStatus`  |
| **`invoice_items`**   | `invoiceId`, `itemId`, `quantity`, `unitPrice` (int, snapshot), `subTotal` (int); synced with parent invoice                                                                                                                                                                            | `id, invoiceId, itemId`                            |
| **`sync_queue`**      | `sequence` (auto-inc), `idempotencyKey`, `operation` (`CREATE_INVOICE`, `UPDATE_ITEM`, `UPDATE_PRICE`, `DELETE_ITEM`, …), `entityType`, `entityId`, `payload`, `dependsOn?`, `status` (`queued`/`in_flight`/`failed`/`blocked`), `retryCount`, `nextRetryAt`, `lastError?`, `createdAt` | `++sequence, &idempotencyKey, status, entityId`    |
| **`activity_logs`**   | `userId`, `userName`, `deviceId`, `action` (`create`/`update`/`delete`/`restore`/`void`), `entityType`, `entityId`, `entityLabel`, `changes`, `occurredAt`, `serverReceivedAt?` (append-only; no `updatedAt`/`deletedAt`)                                                               | `id, entityId, userId, occurredAt, syncStatus`     |
| **`conflicts`**       | `entityType`, `entityId`, `localVersion`, `serverVersion`, `detectedAt`, `resolvedAt?`, `resolution?` (`local`/`server`)                                                                                                                                                                | `id, entityId, resolvedAt`                         |
| **`session`**         | `userId`, `name`, `role` (`admin`/`sale_person`), `permissions` (granted extras, e.g. `activity_log.view`), tokens, `lastOnlineAt`, `offlineValidUntil` (single row, local only)                                                                                                        | `userId`                                           |
| **`users_cache`**     | `id`, `name`, `role` (display lookups only; local only, not synced)                                                                                                                                                                                                                     | `id`                                               |
| **`meta`**            | key/value: `deviceId`, `deviceCode`, `invoiceSequence`, `lastPulledCursor:{entity}`, `lastSyncedAt`, `schemaVersion` (local only)                                                                                                                                                       | `key`                                              |

_Notes:_

- `items.stockLevel` is a **cache** recomputed from the server baseline plus local `stock_movements`; it is never pushed directly.
- `sync_queue`, `session`, `users_cache`, `meta`, and `conflicts` are local-only and never pulled from the server.
- `invoice_items` and `stock_movements` created by an invoice are included in the single `CREATE_INVOICE` queue entry.
- User-entered data is stored as entered; no translated strings are stored in Dexie.
