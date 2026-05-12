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

**Body:** `{ username, email, password, first_name, last_name }`
**Response 201:** `{ message: "Verification email sent. Please check your inbox." }`
**Errors:** 400 validation, 409 username/email taken

GET /api/auth/verify/:token

**Response 200:** `{ message: "Email verified successfully." }`
**Errors:** 400 invalid/expired token

POST /api/auth/login

**Body:** `{ username, password }`
**Response 200:** `{ user: { id, username, email, first_name, last_name, profile_picture_id } }` + sets `token` cookie
**Errors:** 401 invalid credentials, 401 not verified

POST /api/auth/logout

**Response 200:** `{ message: "Logged out." }`
**Errors:** 401 unauthenticated

POST /api/auth/forgot-password

**Body:** `{ email }`
**Response 200:** `{ message: "If that email exists, a reset link has been sent." }`
**Errors:** 400 validation

POST /api/auth/reset-password

**Body:** `{ token, password }`
**Response 200:** `{ message: "Password updated successfully." }`
**Errors:** 400 invalid/expired token, 400 validation

GET /api/auth/google

**Response 501:** `{ error: "Not implemented" }`

GET /api/auth/google/callback

**Response 501:** `{ error: "Not implemented" }`

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

## WebSocket (Socket.io)

**Endpoint:** same host as API (Socket.io path: `/socket.io`)

**Auth:**

- Pass JWT in `socket.handshake.auth.token`, or
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

**Types:** `like` | `visit` | `message` | `match` | `unlike`

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
