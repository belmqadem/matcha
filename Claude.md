# Matcha — Claude Code Instructions

## Project overview

Matcha is a dating web application built as a 42 school project.
Monorepo with `client/` (React + TypeScript + Vite) and `server/` (Express.js + Node.js).
PostgreSQL for data storage, Redis for caching and JWT blocklist, Socket.io for real-time features.

---

## Quick reference

### Start the stack

```bash
docker-compose up
```

### Server commands (run from server/)

```bash
npm run dev          # start with nodemon (hot reload)
npm run start        # start without nodemon
npm run lint         # run ESLint
npm run lint:fix     # auto-fix ESLint errors
npm run db:migrate   # run database migrations
npm run db:seed      # seed 500+ fake profiles
npm run db:reset     # drop all tables (careful)
```

### Client commands (run from client/)

```bash
npm run dev          # Vite dev server
npm run build        # tsc + vite build
npm run lint         # ESLint
npm run lint:fix     # auto-fix
npm run format       # Prettier format
npm run format:check # Prettier check
```

---

## Stack

### Backend

- Node.js 20+, Express.js 5, JavaScript ES6+ (ES modules — `"type": "module"`)
- PostgreSQL 16 via `pg` (raw SQL only — no ORM)
- Redis via `ioredis` (caching + JWT blocklist)
- Socket.io 4 (chat, notifications, WebRTC signaling)
- JWT in http-only cookies (`jsonwebtoken` + `cookie-parser`)
- bcrypt salt rounds 12, helmet, cors, express-rate-limit
- multer + sharp (file uploads), nodemailer (email)
- Zod (validation), Pino + pino-http (logging)
- passport + passport-google-oauth20 + passport-42 (OAuth)
- xss (input sanitization), envalid (env validation)

### Frontend

- React 19 + Vite 8, TypeScript (strict)
- Tailwind CSS v4 (`@tailwindcss/vite`)
- React Router DOM v7, Socket.io client
- Lucide React (icons only)
- Fetch API (no axios)

---

## Server file structure

```
server/src/
├── config/
│   ├── env.js                 # envalid env validation — all process.env access goes here
│   └── passport.js            # Google + 42 OAuth strategies
├── constants/
│   └── httpStatus.js          # HTTP status code constants
├── controllers/               # HTTP req/res only — no business logic
│   ├── auth.controller.js
│   ├── browse.controller.js
│   ├── chat.controller.js
│   ├── dates.controller.js
│   ├── location.controller.js
│   ├── notifications.controller.js
│   ├── profile.controller.js
│   ├── search.controller.js
│   └── users.controller.js
├── db/
│   ├── migrate.js             # full schema — DO NOT edit without understanding all dependencies
│   ├── pool.js                # single pg Pool instance — import query/getClient from here
│   ├── redis.js               # ioredis client with fail-open helpers (get/set/del/keys)
│   ├── reset.js               # drops all tables via DROP SCHEMA
│   └── seed.js                # generates 500+ fake users with faker.js
├── middleware/
│   ├── authenticate.js        # reads JWT cookie, checks Redis blocklist, sets req.user
│   ├── errorHandler.js        # global error handler — distinguishes AppError vs unexpected
│   ├── notFound.js            # 404 handler — must be last before errorHandler
│   ├── rateLimiter.js         # createRateLimiter factory
│   ├── upload.js              # multer config — UUID filenames, 5MB limit, jpeg/png/webp only
│   ├── validate.js            # Zod body validation — sets req.body to parsed data
│   ├── validateId.js          # validates :id param as positive integer (for SERIAL PKs)
│   ├── validateQuery.js       # Zod query param validation — sets req.validatedQuery
│   └── validateUUID.js        # validates :id or custom param as UUID
├── routes/                    # route definitions — one file per resource
│   ├── auth.route.js
│   ├── blocks.route.js
│   ├── browse.route.js
│   ├── chat.route.js
│   ├── dates.route.js
│   ├── likes.route.js
│   ├── location.route.js
│   ├── notifications.route.js
│   ├── profile.route.js
│   ├── reports.route.js
│   ├── search.route.js
│   └── users.route.js
├── services/                  # all business logic — no HTTP concerns
│   ├── auth.service.js
│   ├── browse.service.js
│   ├── chat.service.js
│   ├── dates.service.js
│   ├── location.service.js
│   ├── notifications.service.js
│   ├── oauth.service.js
│   ├── profile.service.js
│   ├── search.service.js
│   └── users.service.js
├── socket/
│   ├── index.js               # Socket.io server — auth, chat:send, WebRTC signaling, online tracking
│   └── notifications.js       # emitNotification() — emits socket event AND inserts into DB
├── utils/
│   ├── AppError.js            # extends Error with statusCode + isOperational
│   ├── asyncHandler.js        # wraps async route handlers for errorHandler
│   ├── cacheKeys.js           # Redis key conventions — always use these, never hardcode keys
│   ├── commonPasswords.js     # isCommonPassword() — checked on register and reset
│   ├── email.js               # nodemailer transporter — sendVerificationEmail, sendPasswordResetEmail
│   ├── fameRating.js          # recalculateFameRating(userId, client?) — call after mutations
│   ├── geoip.js               # getLocationFromIp(ip) — ip-api.com, returns null on failure
│   ├── haversine.js           # haversineKm(lat1,lng1,lat2,lng2) — JS implementation
│   ├── invalidateCache.js     # invalidateUserCaches, invalidateProfileCache, invalidateBrowseForUser
│   ├── issueAuthCookie.js     # signs JWT with jti, sets http-only cookie
│   ├── logger.js              # pino logger + httpLogger middleware — never use console.log
│   ├── queryHelpers.js        # buildOrientationFilter, parseTags, buildSort — shared by browse+search
│   ├── sanitize.js            # sanitizeObject() — xss sanitization for user text fields
│   └── validationErrors.js    # formats Zod errors into readable messages
└── validators/                # Zod schemas — all use .strict()
    ├── auth.validator.js
    ├── browse.validator.js
    ├── chat.validator.js
    ├── dates.validator.js
    ├── location.validator.js
    ├── profile.validator.js
    ├── reports.validator.js
    ├── search.validator.js
    ├── users.validator.js
    └── validationConstants.js
```

---

## Client file structure

```
client/src/
├── pages/
│   ├── auth/
│   │   ├── ForgotPasswordPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── ResetPasswordPage.tsx
│   │   └── VerifyEmailPage.tsx
│   ├── BrowsePage.tsx
│   ├── ChatPage.tsx
│   ├── EditProfilePage.tsx
│   ├── LikesPage.tsx
│   ├── MapPage.tsx
│   ├── MyProfilePage.tsx
│   ├── NotificationsPage.tsx
│   ├── ProfilePage.tsx
│   ├── SearchPage.tsx
│   └── VisitorsPage.tsx
├── components/
│   ├── ui/              # reusable: Button, Input, Modal, Avatar, Badge, etc.
│   ├── layouts/         # Layout.tsx (header + main + footer)
│   └── routing/         # ProtectedRoute.tsx
├── context/
│   ├── AuthContext.tsx   # useAuth() — current user, login, logout, isLoading
│   └── SocketContext.tsx # useSocket() — socket, unreadMessages, unreadNotifications
├── hooks/               # custom hooks
├── services/            # all fetch calls — one file per API resource
├── utils/               # pure utility functions
├── constants/           # constant values
├── App.tsx              # React Router setup
├── index.css            # Tailwind v4 @import + :root CSS variables
└── main.tsx             # entry point
```

---

## Architecture rules — strictly enforced

### Backend layers (never skip, never mix)

```
route → middleware (authenticate, validate) → controller → service → db query
```

- **Routes** — define path, attach middleware, call controller. No logic.
- **Controllers** — extract `req` data, call service, send `res`. No logic, no DB.
- **Services** — all business logic. Throw `AppError` for operational errors.
- **DB** — raw parameterized SQL via `query()` from `db/pool.js`. Never in controllers.

### Never do these in the backend

- `try/catch` in controllers — `asyncHandler` handles it
- `console.log` anywhere — use `logger` from `utils/logger.js`
- `process.env.X` directly — use `env.X` from `config/env.js`
- String interpolation with user data in SQL — always parameterized
- Returning `password_hash`, `oauth_id`, or `oauth_secret` in any response
- Storing JWT in anything other than an http-only cookie
- Using `req.body` directly in services — Zod parses it first via `validate` middleware
- Using `req.query` directly — use `req.validatedQuery` after `validateQuery` middleware

### Frontend rules

- `.tsx` for React components, `.ts` for everything else
- Tailwind CSS v4 only — no plain CSS, no inline styles, no CSS modules
- Never use hardcoded Tailwind colors like `text-red-500` — use CSS variable tokens
- `fetch` calls only inside `services/` — never in components or hooks
- `useAuth()` for auth state, `useSocket()` for real-time state
- No business logic in components

---

## Key patterns

### Throwing errors in services

```js
import AppError from "../utils/AppError.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
throw new AppError("Invalid credentials", HTTP_STATUS.UNAUTHORIZED);
throw new AppError("Already liked", HTTP_STATUS.CONFLICT);
```

### Parameterized SQL (dynamic WHERE — browse/search pattern)

```js
const params = [];
const addParam = (value) => {
  params.push(value);
  return `$${params.length}`;
};

const userIdParam = addParam(userId);
const latSQL = hasLocation ? `${addParam(lat)}::numeric` : `NULL::numeric`;
// use latSQL directly in SQL string — the ::cast tells PostgreSQL the type
```

### Redis caching pattern

```js
import { get as redisGet, set as redisSet } from "../db/redis.js";
import { CacheKeys } from "../utils/cacheKeys.js";

const cached = await redisGet(CacheKeys.myProfile(userId));
if (cached) return cached;
// ... DB query ...
await redisSet(CacheKeys.myProfile(userId), result, 60); // 60s TTL
return result;
```

### Cache invalidation — call after every mutation

```js
import {
  invalidateUserCaches,
  invalidateProfileCache,
} from "../utils/invalidateCache.js";

await invalidateUserCaches(userId); // clears browse, search, myProfile, notifications
await invalidateProfileCache(profileId); // clears publicProfile cache
```

### Fame rating — call after every relevant mutation

```js
import { recalculateFameRating } from "../utils/fameRating.js";

await recalculateFameRating(targetUserId); // after like, unlike, visit, block, profile update
```

### Emitting notifications — always DB + socket

```js
import { emitNotification } from "../socket/notifications.js";

void emitNotification(toUserId, "like", fromUserId); // fire and forget
// emitNotification inserts into notifications table AND emits socket event
```

### Validators — always .strict()

```js
export const mySchema = z
  .object({
    field: z.string(),
  })
  .strict(); // rejects unknown fields
```

---

## Database

### Tables

`users`, `photos`, `tags`, `user_tags`, `likes`, `visits`, `blocks`, `reports`,
`messages`, `notifications`, `email_tokens`, `dates`

### Key schema facts

- `users.id` — UUID, `DEFAULT gen_random_uuid()`
- `users.profile_picture_id` — added via `ALTER TABLE` after `photos` (circular dep fix)
- `users.birth_date` — DATE, nullable
- `users.failed_login_attempts` + `users.locked_until` — account lockout
- `likes`, `visits`, `blocks`, `reports` — composite PRIMARY KEY, no serial id
- `messages`, `notifications` — SERIAL id, no UNIQUE on is_read
- `dates.id` — SERIAL (integer), not UUID — use `validateId` not `validateUUID`
- `notifications.id` — SERIAL (integer) — same as above
- `gender` — nullable (filled after registration)

### Running migrations

```bash
cd server && npm run db:migrate
```

Schema is in `server/src/db/migrate.js`. The `haversine_km` PostgreSQL function
is defined there too — required by browse and search queries.

### NEVER edit migrate.js to remove existing tables or columns

Only add new `CREATE TABLE IF NOT EXISTS` or `ALTER TABLE ADD COLUMN IF NOT EXISTS`.
Destructive changes go in `reset.js` or a separate migration step.

---

## Redis

### Cache TTLs

| Key                   | TTL              | Invalidated by                                     |
| --------------------- | ---------------- | -------------------------------------------------- |
| `user:{id}:me`        | 60s              | profile update, tag update, photo upload/delete    |
| `profile:{id}:public` | 300s             | any change to that profile                         |
| `browse:{id}:*`       | 120s             | like, unlike, block, logout                        |
| `search:{id}:*`       | 120s             | like, unlike, block, logout                        |
| `notifications:{id}`  | 30s              | mark read, new notification                        |
| `blocklist:{jti}`     | until JWT expiry | issued on logout                                   |
| `online:{id}`         | 86400s           | refreshed on socket connect, deleted on disconnect |

### JWT blocklist

Every JWT has a `jti` (UUID) claim. On logout, `jti` is added to Redis blocklist.
`authenticate.js` checks blocklist on every request. This means logout is instant
even though JWTs are stateless.

---

## Security

### Non-negotiable (peer-eval score 0 if violated)

- Passwords: bcrypt, salt rounds 12, never stored plain, never logged
- SQL: parameterized queries only — no interpolation of user data
- XSS: `sanitizeObject()` applied to all user text fields before DB insert
- JWT: http-only cookies only — never localStorage, never Authorization header
- Files: multer validates mime type + 5MB limit + UUID filenames + sharp magic byte check
- Blocked users: never appear in browse, search, profile view (404 not 403)
- Coordinates: `ROUND(lat::numeric, 2)` before sending to other users (~1km precision)

### Auth flow

1. Register → bcrypt hash → DB insert → email token → verification email (MailHog in dev)
2. Verify email → `is_verified = true` → token deleted
3. Login → bcrypt compare → JWT issued with `jti` → http-only cookie
4. Request → `authenticate.js` → JWT verify → Redis blocklist check → `req.user`
5. Logout → DB update → `jti` added to Redis blocklist → cookie cleared

---

## Real-time events

### Socket.io — client → server

| Event                  | Payload                           |
| ---------------------- | --------------------------------- |
| `chat:send`            | `{ to: userId, content: string }` |
| `webrtc:offer`         | `{ to: userId, offer }`           |
| `webrtc:answer`        | `{ to: userId, answer }`          |
| `webrtc:ice-candidate` | `{ to: userId, candidate }`       |
| `webrtc:hang-up`       | `{ to: userId }`                  |

### Socket.io — server → client

| Event                  | Payload                                         |
| ---------------------- | ----------------------------------------------- |
| `chat:receive`         | `{ id, from: userId, content, sentAt, isRead }` |
| `chat:sent`            | `{ id, to: userId, content, sentAt }`           |
| `chat:error`           | `{ message: string }`                           |
| `notification:new`     | `{ type, from: userId, createdAt }`             |
| `webrtc:offer`         | `{ from: userId, offer }`                       |
| `webrtc:answer`        | `{ from: userId, answer }`                      |
| `webrtc:ice-candidate` | `{ from: userId, candidate }`                   |
| `webrtc:hang-up`       | `{ from: userId }`                              |

### Notification types

`like` | `unlike` | `visit` | `match` | `message` |
`date_proposed` | `date_accepted` | `date_declined` | `date_cancelled`

---

## API conventions

- Base URL: `/api`
- Auth routes public. All others require JWT cookie.
- Error: `{ "error": "message" }`
- Success: flat object or `{ "data": ... }`
- Dates: ISO 8601 strings
- Status codes: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized,
  403 Forbidden, 404 Not Found, 409 Conflict, 500 Internal Server Error
- Full contract: `docs/API.md` — update it when adding endpoints

---

## Environment variables

All validated by envalid in `server/src/config/env.js`. Never use `process.env` directly.

```
PORT, NODE_ENV, CORS_ORIGIN, CLIENT_URL
POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD
REDIS_URL
JWT_SECRET (min 32 chars), JWT_EXPIRES_IN
SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, EMAIL_FROM
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL
FORTYTWO_CLIENT_ID, FORTYTWO_CLIENT_SECRET, FORTYTWO_CALLBACK_URL
```

In Docker dev: `SMTP_HOST=matcha_mailhog`, `SMTP_PORT=1025` (overridden in docker-compose.yml)
MailHog UI: http://localhost:8025

---

## Docker services

| Service            | Container      | Port      | Purpose                 |
| ------------------ | -------------- | --------- | ----------------------- |
| postgres:16-alpine | matcha_db      | 5432      | Database                |
| node:20 (./server) | matcha_server  | 3000      | Express API + Socket.io |
| node:20 (./client) | matcha_client  | 5173      | Vite dev server         |
| mailhog/mailhog    | matcha_mailhog | 1025/8025 | SMTP catch-all (dev)    |
| redis:7-alpine     | matcha_redis   | 6379      | Cache + JWT blocklist   |

---

## Completed features

### Mandatory

- Auth: register, email verify, login, logout, forgot/reset password
- Profile: gender, bio, sexual preference, tags, photos (up to 5), location
- Browse: matching algorithm (orientation, geo, tags, fame), sort, filter, pagination
- Search: advanced search with city/radius/tags/fame/age filters
- Profile view: like, unlike, block, unblock, report, visit recording
- Chat: real-time via Socket.io, message history, read receipts, unread count
- Notifications: real-time + DB persistence, mark read, delete
- Location: GPS endpoint, IP fallback, manual adjustment, haversine distance

### Bonus

- OmniAuth: Google OAuth + 42 OAuth (passport.js)
- Interactive map: GET /api/browse/map — nearby users with rounded coordinates
- Schedule dates: propose, accept, decline, cancel flow
- Redis caching + JWT blocklist
- Account lockout after 5 failed login attempts

### Not yet started

- Photo gallery bonus (drag-and-drop, crop, rotate, filters)
- Video/audio chat (WebRTC)
- Frontend (all pages are placeholder stubs)

---

## Things Claude Code should know

### DO

- Run `npm run lint` in the relevant directory after making changes
- Use `logger` from `utils/logger.js` — never `console.log`
- Use `env.X` from `config/env.js` — never `process.env.X`
- Throw `AppError` from services — never plain `Error`
- Wrap async route handlers with `asyncHandler`
- Use `req.validatedQuery` not `req.query` in controllers
- Call `recalculateFameRating(userId)` after: like, unlike, visit, block, profile/tag/photo changes
- Call appropriate `invalidateCache` helpers after every mutation
- Check both block directions: `(blocker=A AND blocked=B) OR (blocker=B AND blocked=A)`
- Use `validateId` middleware for SERIAL integer params (notifications.id, dates.id)
- Use `validateUUID` middleware for UUID params (users.id)
- Add new endpoints to `docs/API.md`

### DO NOT

- Edit `server/src/db/migrate.js` destructively — only additive changes
- Commit `.env` files
- Use `console.log` anywhere
- Add `try/catch` in controllers
- Query the DB in controllers or routes
- Use TypeScript in the backend
- Use plain CSS or inline styles in the frontend
- Use hardcoded Tailwind color classes — use CSS variable tokens
- Return `password_hash`, `oauth_id`, `oauth_secret` in any API response
- Return raw `latitude`/`longitude` of other users — always `ROUND(x::numeric, 2)`
- Skip cache invalidation after mutations
- Skip `recalculateFameRating` after relevant mutations
