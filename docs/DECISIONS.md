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
