# Matcha — architectural decisions log

> Every significant technical decision goes here with a rationale.
> Format: date · decision · why · alternatives considered.

---

## Initial Setup

### Stack

- **Frontend:** React + Vite + Typescript
  - Fast dev server, modern tooling, free choice per spec
- **Backend:** Node.js + Express
  - Micro-framework (router only, no ORM) — satisfies spec constraint
  - Native JS across the whole stack reduces context switching
- **Database:** PostgreSQL
  - Relational — fits the project's social graph perfectly
  - Raw SQL queries as required by spec (no ORM)
- **Real-time:** Socket.io
  - Handles WebSocket + fallback transports
  - Used for chat, notifications, and WebRTC signaling in one connection
- **Auth:** JWT stored in HttpOnly cookie
  - Better protection against token theft via XSS (token is not readable from JS)
  - Still stateless on the backend when using signed/verified JWTs
- **Web server:** Nginx
  - Nginx handles reverse proxying, static assets, and SSL termination efficiently
- **Containerization:** Docker + docker-compose
  - Docker ensures consistent environments across dev and production
  - Docker Compose simplifies multi-service setup

## Redis

Use Redis for caching, JWT blocklist, and online status · Reduce DB load for hot reads, enable immediate cache invalidation, revoke JWTs on logout, and share online state across instances · Alternatives: in-memory cache per instance, DB-only queries, or shorter JWT lifetimes

## Like algorithm

Users should be able to register, log in, complete their profile, search for and view other
users’ profiles, and express interest in them with a “like”. They should also be able to
chat with those who have reciprocated their interest.

1️⃣ User A visits User B's profile and clicks "like" — this means "I'm interested in this person." Nothing happens yet. User B doesn't get a chat window, just a notification that someone liked them.

2️⃣ User B then visits User A's profile and also clicks "like" — now it's mutual. At this point they become "connected", and only then can they chat with each other.

3️⃣ If User B never likes back, they stay strangers. No chat, no connection. This prevents harassment — you can't message someone who hasn't expressed interest in you first

## Matching algorithm

Suggested profiles must:

- Respect sexual orientation (heterosexual / homosexual / bisexual)
- Exclude blocked users (both directions)
- Exclude already-connected users
- Be ranked by: geographic proximity (primary), shared tags, fame rating
- Be sortable and filterable by: age, location, fame rating, common tags

## Fame Rating

Fame rating is a decimal score (0–100).

Formula:

- likes_received \* 3 (each like someone gave this user)
- visits_received \* 1 (each profile view this user received)
- blocks_received \* -5 (each block this user received)
- profile_complete ? +10 : 0

Profile is complete when ALL are true:

- gender is not null
- biography is not null and not empty
- latitude and longitude are not null
- at least 1 tag for this user
- at least 1 photo for this user

Result is clamped: LEAST(100, GREATEST(0, score))

Recalculate Fame Rating after:

- like given or removed → recalculate liked user
- visit recorded → recalculate visited user
- block added → recalculate blocked user
- profile fields updated → recalculate that user
- tags added or removed → recalculate that user
- photo uploaded or deleted → recalculate that user

---

## Database

### Raw SQL via `pg` instead of an ORM

**What:** All queries use parameterized raw SQL through the `pg` pool. No ORM (Sequelize, Prisma, etc.) is used.

**Why:** Required by the 42 project spec. Beyond compliance, raw SQL makes the browse and search queries practical — both involve dynamic WHERE clause construction, computed columns (haversine distance, shared tag count, age in years), and multi-column sort/pagination that would be awkward or impossible to express in an ORM's query builder without dropping to raw SQL anyway.

**Alternative considered:** Knex.js as a query builder (not a full ORM). Rejected — adds a dependency without solving the dynamic query problem and obscures what SQL is actually sent.

---

### `users.id` is UUID; all other tables use SERIAL

**What:** `users.id` is `UUID DEFAULT gen_random_uuid()`. Every other table with a surrogate key (`photos`, `messages`, `notifications`, `dates`) uses `SERIAL` (auto-increment integer).

**Why UUID for users:** User IDs appear in JWT payloads, cookies, API responses, and URLs. A sequential integer leaks the total user count and makes enumeration trivial. UUIDs are opaque and safe to expose. Generation is handled by PostgreSQL's `gen_random_uuid()` so there is no application-layer coordination needed.

**Why SERIAL for everything else:** Photos, messages, notifications, and dates are internal records never directly exposed in URLs or tokens. SERIALs are smaller (4–8 bytes vs 16), index faster, and are sufficient because the rows are always accessed via their parent user's UUID — the SERIAL is just an opaque handle for update/delete operations (`PATCH /notifications/:id`).

---

### Composite primary keys for relationship tables

**What:** `likes`, `visits`, `blocks`, and `reports` have no surrogate id column. Their primary key is the composite of both participant UUIDs — e.g. `PRIMARY KEY (liker_id, liked_id)`.

**Why:** These tables model a directed relationship between two users, and that pair is already a natural unique key. Adding a separate `id` column would cost space, require a unique index on the pair anyway to enforce the constraint, and provide no benefit — nothing in the application needs to reference an individual like or block by an opaque id. The composite PK is the index and the constraint in one.

---

### Notification grouping via partial unique indexes and `ON CONFLICT` upsert

**What:** Rather than inserting a new notification row every time an event occurs, two notification types are deduplicated with partial unique indexes and `ON CONFLICT DO UPDATE`:

- **Messages:** `UNIQUE (user_id, from_id, type) WHERE is_read = false AND type = 'message'` — consecutive unread messages from the same sender increment a `count` column and refresh `created_at` instead of creating separate rows.
- **Visits:** `UNIQUE (user_id, from_id, type) WHERE type = 'visit'` — repeated visits within a 24-hour window increment the counter rather than flooding the recipient's notification list. A visit older than 24 hours resets the counter to 1.

**Why:** Simple inserts would create one row per event. A user sending 10 chat messages before the recipient reads them would produce 10 separate notifications. The upsert approach keeps the notification list readable. The partial index on `is_read = false` for messages means that once a message notification is read, the next message starts a fresh row — correctly showing the new unread batch as a new notification.

---

## Authentication

### JWT in http-only cookies + jti Redis blocklist

**What:** JWTs are issued as `httpOnly`, `SameSite=Strict` (production) / `SameSite=Lax` (dev) cookies. Each token carries a `jti` (JWT ID) claim — a UUID generated at issue time. On logout, the `jti` is written to Redis with a TTL equal to the remaining token lifetime.

**Why cookies over localStorage:** An `httpOnly` cookie is not accessible from JavaScript, so a stored XSS payload cannot steal the token. A token in `localStorage` is readable by any script on the page.

**Why `jti` + Redis blocklist:** JWTs are stateless — validating the signature alone cannot detect a logout. Without a blocklist, a stolen token remains valid until expiry. Writing the `jti` to Redis on logout and checking it on every authenticated request gives immediate revocation without invalidating all tokens or requiring a DB hit on every request (Redis is O(1) key lookup).

**Why not CSRF tokens:** The cookies are `SameSite=Strict` in production, which prevents cross-site request forgery because the browser will not attach the cookie on cross-origin requests. An additional CSRF token would be redundant overhead.

---

## Real-time

### Socket.io for chat and notifications instead of polling

**What:** A persistent Socket.io connection per authenticated user carries chat messages, notification events, and WebRTC signaling. Polling is not used.

**Why:** Chat requires low latency — polling at even 1-second intervals is visible as lag during a conversation. Notifications triggered by other users (likes, matches, messages) cannot be delivered promptly with polling without an unacceptably short interval. A persistent WebSocket connection handles all three real-time concerns (chat, notifications, WebRTC signaling) in a single connection per client, avoiding the overhead of separate transports.

### Online status via Redis, not the DB `is_online` column

**What:** Whether a user is currently online is determined by a Redis key (`online:{userId}`) that is set on socket connect and deleted on disconnect. The `is_online` column in `users` is updated on connect/disconnect but is not the authoritative source for real-time presence.

**Why:** A DB column has race conditions under multiple connections (two browser tabs, reconnect loops) and requires a DB write + invalidation cycle to be read accurately. Redis `SCARD` on a socket-id set is atomic and reflects the true number of active connections. The DB column is kept for persistence (e.g., "last seen" display after a server restart clears Redis).

---

## Location

### Haversine distance calculated in PostgreSQL, not JavaScript

**What:** The `haversine_km(lat1, lng1, lat2, lng2)` function is defined in PostgreSQL and called inside browse and search queries.

**Why:** Browse and search return up to hundreds of candidates sorted by proximity. Computing distance in JS would require fetching all candidates first, then sorting in application memory — two round trips and O(n) memory for a result set that the DB can already filter and sort in a single query. The `IMMUTABLE` function qualifier also allows PostgreSQL to inline the result into the query plan. A JS implementation (`haversine.js`) exists for the few cases where distance is computed outside a SQL context (profile view).

---

## OAuth

### Account linking by email, reject on provider collision

**What:** When a user authenticates via Google or 42 OAuth for the first time, the service checks for an existing account with the same email. If one exists and has no `oauth_provider`, it links the OAuth identity to that account. If one exists with a _different_ `oauth_provider`, it throws a 409 error telling the user which provider to use.

**Why link by email:** A user who registered with email/password and then logs in via Google (with the same email) should not get a second account. Linking by email provides seamless account unification without requiring an explicit "connect account" flow.

**Why reject on provider collision:** Two different OAuth providers sharing an email would silently overwrite the first provider's credentials. Rejecting with a clear error message preserves the user's existing login method and prevents accidental account takeover.

---

## Matching

### Orientation filter design (`buildOrientationFilter`)

**What:** Browse and search apply a bidirectional orientation filter: a heterosexual male sees only heterosexual and bisexual females; a bisexual female sees heterosexual and bisexual males plus homosexual and bisexual females; users with `gender` values other than `male`/`female`, or with no preference set, receive no filter (`1=1`).

**Why bidirectional:** Showing only users who are _also_ interested in you reduces irrelevant results. A gay male should not appear in results for a straight female even if she would appear for him. Both directions of interest are checked in the same clause.

**Why non-binary users bypass the filter:** The orientation model (heterosexual/homosexual/bisexual) is defined relative to the binary male/female axis. Applying it to non-binary genders would produce logically incorrect exclusions. The safest decision is to show non-binary users an unfiltered pool and let them assess compatibility manually.

### Blocked users return 404, not 403

**What:** When a profile is requested and a block exists in either direction between viewer and target, the service throws `AppError("User not found", HTTP_STATUS.NOT_FOUND)` — the same error used when the user genuinely does not exist.

**Why 404 over 403:** A 403 tells the requester that the resource exists but they are forbidden. This leaks the existence of a block, which could be used to infer who has blocked whom. A 404 is indistinguishable from a real "user not found", preventing either party from confirming whether a block is in place.
