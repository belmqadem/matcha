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

## Like algorithm

- Users should be able to register, log in, complete their profile, search for and view other
  users’ profiles, and express interest in them with a “like”. They should also be able to
  chat with those who have reciprocated their interest.

1️⃣ User A visits User B's profile and clicks "like" — this means "I'm interested in this person." Nothing happens yet. User B doesn't get a chat window, just a notification that someone liked them.

2️⃣ User B then visits User A's profile and also clicks "like" — now it's mutual. At this point they become "connected", and only then can they chat with each other.

3️⃣ If User B never likes back, they stay strangers. No chat, no connection. This prevents harassment — you can't message someone who hasn't expressed interest in you first

## Matching algorithm

Suggested profiles must:

- Respect sexual orientation (hetero / homosexual / bisexual — default bisexual)
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
