# Matcha — API contract

> This document is the contract between frontend and backend.
> Every endpoint must be documented here before it is built.
> Last updated: initial scaffold

---

## Conventions

- **Base URL:** `/api`
- **Auth:** http-only cookie named `token` on all protected routes
- **Error format:** `{ "error": "message" }`
- **Success format:** `{ "data": ... }` or flat object
- **Dates:** ISO 8601 strings

---

## Auth

POST /api/auth/register

**Body:** `{ email, username, first_name, last_name, password }`
**Response 201:** `{ message: "Verification email sent. Please check your inbox." }`
**Errors:** 400 validation, 409 username/email taken

GET /api/auth/verify/:token

**Response 200:** `{ message: "Email verified successfully." }`
**Errors:** 400 invalid/expired token

POST /api/auth/login

**Body:** `{ username, password }`
**Response 200:** `{ user: { id, username, email, first_name, last_name, profile_picture_id, is_profile_complete: boolean, missing_fields: string[] } }` + sets `token` cookie
**Errors:** 401 invalid credentials, 403 not verified, 401 oauth account (password login not available)

POST /api/auth/logout

**Response 200:** `{ message: "Logged out." }`
**Errors:** 401 unauthenticated

POST /api/auth/forgot-password

**Body:** `{ email }`
**Response 200:** `{ message: "If that email exists, a reset link has been sent." }`
**Errors:** 400 validation

POST /api/auth/resend-verification

**Body:** `{ email }`
**Response 200:** `{ message: "If that email exists, a verification link has been sent." }`
**Errors:** 400 validation

POST /api/auth/reset-password

**Body:** `{ token, password }`
**Response 200:** `{ message: "Password updated successfully." }`
**Errors:** 400 invalid/expired token, 400 validation

GET /api/auth/google

**Response 302:** Redirects to Google consent screen

GET /api/auth/google/callback

**Response 302:** Sets `token` cookie and redirects to `${CLIENT_URL}/browse`
**Errors:** Redirects to `${CLIENT_URL}/login?error=oauth_failed`

GET /api/auth/42

**Response 302:** Redirects to 42 consent screen
**Notes:** 42 uses the Intra OAuth provider; email access is required.

GET /api/auth/42/callback

**Response 302:** Sets `token` cookie and redirects to `${CLIENT_URL}/browse`
**Errors:** Redirects to `${CLIENT_URL}/login?error=oauth_failed`

---

## Users

GET /api/users/me

**Response 200:** `{ user }`
**Notes:** `user` includes `birth_date`, `tags: string[]`, and `photos: { id, url, order_index, created_at }[]`

PATCH /api/users/me

**Body:** `{ first_name?, last_name?, email?, username? }`
**Response 200:** `{ user }`
**Notes:** If email changes, `is_verified` is reset and a new verification email is sent.
**Errors:** 400 validation, 409 username/email taken

GET /api/users/:id

**Response 200:**

```
{
  "user": {
    "id",
    "username",
    "first_name",
    "last_name",
    "gender",
    "sexual_preference",
    "biography",
    "fame_rating",
    "location_city",
    "is_online",
    "last_seen",
    "profile_picture_id",
    "profile_picture_url",
    "birth_date",
    "created_at",
    "distance_km",
    "photos": [{ "id", "url", "order_index", "created_at" }],
    "tags": ["tag"],
    "liked_by_me",
    "liked_me",
    "is_connected",
    "is_blocked_by_me"
  }
}
```

**Notes:** Records a visit unless the user requests their own profile. Returns 404 if either user blocked the other.
**Errors:** 400 invalid user id, 404 not found, 401 unauthenticated

---

## Profile

PATCH /api/profile/me

**Body:** `{ gender?, sexual_preference?, biography?, birth_date?, latitude?, longitude?, location_city? }`
**Response 200:** `{ user }`
**Notes:** `birth_date` must be a valid ISO 8601 date in the past; user must be at least 18 years old.
**Errors:** 400 validation

POST /api/profile/me/tags

**Body:** `{ tags: string[] }`
**Response 200:** `{ tags }`
**Errors:** 400 validation

POST /api/profile/me/photos

**Body:** `multipart/form-data` with field `photo`
**Response 201:** `{ photo }`
**Errors:** 400 validation, 400 photo limit reached, 400 invalid file type

DELETE /api/profile/me/photos/:photoId

**Response 200:** `{ message: "Photo deleted." }`
**Errors:** 404 not found

PATCH /api/profile/me/photos/:photoId/set-main

**Response 200:** `{ message: "Profile picture updated." }`
**Errors:** 404 not found

GET /api/profile/me/visitors

**Response 200:** `{ visitors }`

GET /api/profile/me/liked-by

**Response 200:** `{ likers }`

GET /api/profile/me/blocked

**Response 200:** `{ blocked }`
**Notes:** Each blocked entry includes `blocked_at`.

---

## Likes

POST /api/likes/:id

**Response 200:** `{ liked: true, connected: boolean }`
**Notes:** Requires a profile picture. A mutual like sets `connected` to true.
**Errors:** 400 cannot like yourself, 403 profile picture required, 404 not found/blocked, 409 already liked

DELETE /api/likes/:id

**Response 200:** `{ liked: false, connected: false }`
**Errors:** 400 cannot unlike yourself, 404 not liked

---

## Blocks

POST /api/blocks/:id

**Response 200:** `{ blocked: true }`
**Notes:** Removes likes in both directions.
**Errors:** 400 cannot block yourself, 404 not found, 409 already blocked

DELETE /api/blocks/:id

**Response 200:** `{ blocked: false }`
**Errors:** 404 not blocked

---

## Reports

POST /api/reports/:id

**Body:** `{ reason? }`
**Response 200:** `{ reported: true }`
**Notes:** Reports are reviewed manually; no automatic action.
**Errors:** 400 cannot report yourself, 404 not found/blocked, 409 already reported

---

## Chat

GET /api/chat/unread/count

**Response 200:** `{ unread: number }`
**Errors:** 401 unauthenticated

GET /api/chat/conversations

**Response 200:**

```
{
  "conversations": [
    {
      "id",
      "username",
      "first_name",
      "last_name",
      "profile_picture_id",
      "profile_picture_url",
      "is_online",
      "last_message",
      "last_message_at",
      "last_message_sender_id",
      "unread_count"
    }
  ]
}
```

**Field notes:**

- `last_message` (string): full message content (not truncated). Plain text only (no HTML/Markdown). Max length 1000 chars (matches chat validation). Example: `"Hey, still up for coffee this week?"`.

**Errors:** 401 unauthenticated

GET /api/chat/:userId

**Query params:** `page` (default 1), `limit` (default 30, max 50)
**Response 200:** `{ messages, total, page, limit }`
**Notes:** Only available for mutually connected users.
**Errors:** 400 invalid user id, 401 unauthenticated, 403 not connected

POST /api/chat/:userId/read

**Response 200:** `{ message: "Messages marked as read" }`
**Notes:** Marks all unread messages from `userId` as read.
**Errors:** 400 invalid user id, 401 unauthenticated

---

## Notifications

GET /api/notifications

**Auth:** required
**Response 200:**

```
{
  "notifications": [
    {
      "id": 1,
      "type": "like | visit | message | match | unlike | date_proposed | date_accepted | date_declined | date_cancelled",
      "is_read": false,
      "created_at": "ISO8601",
      "from_id": "uuid",
      "from_username": "string",
      "from_first_name": "string",
      "from_last_name": "string",
      "from_profile_picture_id": null,
      "from_profile_picture_url": null
    }
  ],
  "unread_count": 3
}
```

**Notes:** Cached 30s TTL per user, invalidated on read/delete.

PATCH /api/notifications/read-all

**Auth:** required
**Response 200:** `{ "updated": N }`
**Notes:** Invalidates notifications cache.

PATCH /api/notifications/:id/read

**Auth:** required
**Params:** `id` (integer)
**Response 200:** `{ "id": 1 }`
**Errors:** 404 not found or not owned by current user
**Notes:** Invalidates notifications cache.

DELETE /api/notifications/:id

**Auth:** required
**Params:** `id` (integer)
**Response 200:** `{ "deleted": true }`
**Errors:** 404 not found or not owned by current user
**Notes:** Invalidates notifications cache.

---

## Dates

POST /api/dates

**Auth:** required
**Body:** `{ receiver_id, scheduled_at, location? }`
**Response 201:** `{ date }`
**Notes:** Only connected users can propose. `scheduled_at` must be in the future. `status` defaults to `pending`.
**Errors:** 400 validation, 403 not connected, 409 pending date exists

GET /api/dates

**Auth:** required
**Response 200:**

```
{
  "dates": [
    {
      "id": 1,
      "proposer_id": "uuid",
      "receiver_id": "uuid",
      "scheduled_at": "ISO8601",
      "location": "string",
      "status": "pending | accepted | declined | cancelled",
      "created_at": "ISO8601",
      "updated_at": "ISO8601",
      "my_role": "proposer | receiver",
      "other_user_id": "uuid",
      "other_username": "string",
      "other_first_name": "string",
      "other_last_name": "string",
      "other_profile_picture_id": null
    }
  ],
  "upcoming": 2,
  "total": 5
}
```

GET /api/dates/:id

**Auth:** required
**Params:** `id` (integer)
**Response 200:** `{ date }`
**Errors:** 404 not found

PATCH /api/dates/:id

**Auth:** required
**Params:** `id` (integer)
**Body:** `{ status: "accepted" | "declined", scheduled_at? }`
**Response 200:** `{ date }`
**Notes:** Only the receiver can respond. Only pending proposals can be updated.
**Errors:** 403 forbidden, 404 not found, 409 not pending

DELETE /api/dates/:id

**Auth:** required
**Params:** `id` (integer)
**Response 200:** `{ date }`
**Notes:** Only the proposer can cancel. Only pending or accepted dates can be cancelled.
**Errors:** 403 forbidden, 404 not found, 409 not cancellable

---

## WebSocket (Socket.io)

**Endpoint:** same host as API (Socket.io path: `/socket.io`)

**Auth:**

- Use the `token` http-only cookie (same as REST auth)

**Error on connect:** connection is rejected if no valid token is provided.

### Chat events

| Direction       | Event          | Payload                                         |
| --------------- | -------------- | ----------------------------------------------- |
| client → server | `chat:send`    | `{ to: userId, content: string }`               |
| server → client | `chat:receive` | `{ id, from: userId, content, sentAt, isRead }` |
| server → client | `chat:sent`    | `{ id, to: userId, content, sentAt }`           |
| server → client | `chat:error`   | `{ message: string }`                           |

**Notes:** Chat is only available between mutually connected users (mutual like). If a user unlikes or blocks, chat is disabled immediately.

### Notification events

| Direction       | Event              | Payload                             |
| --------------- | ------------------ | ----------------------------------- |
| server → client | `notification:new` | `{ type, from: userId, createdAt }` |

**Types:** `like` | `visit` | `message` | `match` | `unlike` | `date_proposed` | `date_accepted` | `date_declined` | `date_cancelled`

---

## Location

PATCH /api/profile/me/location

**Body:** `{ latitude, longitude, location_city? }`
**Response 200:** `{ latitude, longitude, location_city }`
**Errors:** 400 validation

POST /api/profile/me/location/gps

**Body:** `{ latitude, longitude }`
**Response 200:** `{ latitude, longitude, location_city }`
**Errors:** 400 validation

GET /api/profile/me/location/ip

**Response 200:** `{ latitude, longitude, location_city }`
**Errors:** 400 could not determine location

---

## Browse

GET /api/browse/map

**Auth:** required
**Query params:** `max_km` (integer, 1–500, default 50)

**Response 200:**

```json
{
  "users": [
    {
      "id": "uuid",
      "username": "string",
      "first_name": "string",
      "last_name": "string",
      "profile_picture_id": 1,
      "profile_picture_url": null,
      "fame_rating": "0.00",
      "is_online": false,
      "lat": 33.57,
      "lng": -7.59,
      "location_city": "Casablanca",
      "distance_km": 12.34,
      "tags": ["vegan", "geek"]
    }
  ],
  "total": 42,
  "radius_km": 50,
  "center": {
    "lat": 33.5731,
    "lng": -7.5898
  }
}
```

**Notes:**

- `lat`/`lng` on other users are rounded to 2 decimal places (~1.1 km precision) — never exact
- `center` contains the current user's own exact coordinates for map centering
- Returns `{ users: [], total: 0, radius_km }` if current user has no location set
- Applies orientation filter and block filter (both directions) identical to browse
- Only verified users with a known location appear in results
- Results ordered by `distance_km` ascending
- Not cached — location data changes frequently

**Errors:**

- `400` `max_km` out of range (must be 1–500) or non-numeric
- `401` unauthenticated

---

GET /api/browse

**Query params:**
`sort` = distance|age|fame|tags (default distance)
`order` = asc|desc (default asc for distance, desc for fame)
`age_min`, `age_max` (ints)
`fame_min`, `fame_max` (0-100)
`max_km` (decimal)
`tags` (comma-separated string)
`page` (default 1)
`limit` (default 20, max 50)

**Response 200:** `{ users, total, page, limit }`
**Errors:**

- `400` invalid query parameters
  - Triggered by invalid `sort`/`order` values
  - `age_min`/`age_max` out of range or non-integer
  - `fame_min`/`fame_max` out of range (must be 0-100)
  - non-numeric `max_km`, `page`, or `limit`
  - `limit > 50`
  - malformed `tags` value

**Example 400 payload:**
`{ "error": "invalid query parameters", "details": ["sort: Invalid option", "limit: Too big"] }`

### Browse vs Map — comparison

|                   | `GET /api/browse`                                           | `GET /api/browse/map`                                                                                     |
| ----------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **Purpose**       | Discover compatible profiles to interact with               | See where nearby users are geographically                                                                 |
| **Returns**       | Paginated list optimized for card UI                        | All users within a radius for pin placement                                                               |
| **Coordinates**   | Never returned — only `distance_km`                         | Returns `lat`/`lng` rounded to ~1km precision                                                             |
| **Pagination**    | Yes — `page` + `limit` (max 50)                             | No — returns all matching users at once                                                                   |
| **Sorting**       | User-controlled: `distance`, `fame`, `tags`, `age`          | Always by `distance_km ASC`                                                                               |
| **Filters**       | `fame_min/max`, `age_min/max`, `tags`, `max_km`             | `max_km` only (default 50km, max 500km)                                                                   |
| **Data returned** | Full — bio, photos, tags, shared_tags, age_years, last_seen | Minimal — id, username, name, profile_picture_id, fame_rating, lat, lng, location_city, distance_km, tags |
| **Caching**       | Yes — 120s Redis cache per user + params                    | No — always fetched fresh                                                                                 |
| **Use case**      | "Who should I like?"                                        | "Who is near me on a map?"                                                                                |

Both endpoints apply the same security filters:

- Orientation compatibility (heterosexual / homosexual / bisexual)
- Block filter — both directions
- Verified users only
- Current user excluded from results

---

## Search

GET /api/search

**Query params:**
`sort` = distance|age|fame|tags (default fame)
`order` = asc|desc (default desc for fame, asc otherwise)
`age_min`, `age_max` (ints, 18-120)
`fame_min`, `fame_max` (0-100)
`max_km` (decimal, mutually exclusive with `city`)
`city` (partial match against location_city)
`tags` (comma-separated string)
`page` (default 1)
`limit` (default 20, max 50)

**Response 200:** `{ users, total, page, limit }`
**Notes:** Results include `liked_by_me`, `liked_me`, and `is_connected` booleans per user.
**Errors:**

- `400` invalid query parameters
  - Triggered by invalid `sort`/`order` values
  - `age_min`/`age_max` out of range or non-integer
  - `fame_min`/`fame_max` out of range (must be 0-100)
  - `age_min > age_max` or `fame_min > fame_max`
  - non-numeric `max_km`, `page`, or `limit`
  - `limit > 50`
  - malformed `tags` value
  - `max_km` and `city` used together
