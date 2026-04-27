# Matcha — architectural decisions log

> Every significant technical decision goes here with a rationale.
> Format: date · decision · why · alternatives considered.

---

## Initial Setup

### Stack

- **Frontend:** React + Vite
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

## Understanding Subject

- Users should be able to register, log in, complete their profile, search for and view other
  users’ profiles, and express interest in them with a “like”1
  . They should also be able to
  chat with those who have reciprocated their interest.

User A visits User B's profile and clicks "like" — this means "I'm interested in this person." Nothing happens yet. User B doesn't get a chat window, just a notification that someone liked them.

User B then visits User A's profile and also clicks "like" — now it's mutual. At this point they become "connected", and only then can they chat with each other.

If User B never likes back, they stay strangers. No chat, no connection. This prevents harassment — you can't message someone who hasn't expressed interest in you first
