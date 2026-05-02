# GitHub Copilot Instructions

## Overview

This repository contains the source code for a dating website project named "Matcha".
The project is structured as a monorepo with separate directories for the frontend (client/)
and backend (server/). The frontend is built with React + Vite (TypeScript).
The backend is built with Express.js and Node.js. PostgreSQL is used for data storage.
Real-time features (chat, notifications, WebRTC signaling) are handled via Socket.io.

---

## General Development Guidelines

- Generate clean, modern, scalable code.
- Write modular, decoupled, and reusable components.
- Use TypeScript only for the frontend. Do not use TypeScript in the backend.
- Use JavaScript (ES6+) in the backend.
- Use Tailwind CSS v4 for all styling in the frontend. Do not use plain CSS, CSS-in-JS, or any other CSS framework.
- Follow DRY (Don't Repeat Yourself) principles.
- Write small, focused functions and components.
- Use descriptive names for variables, functions, and components.
- Do not use emojis in any generated code, comments, or documentation.
- Follow separation of concerns: logic, UI, services, state, routing.
- Do not produce excessive comments — only explain code when something is unclear.
- Prefer composition over inheritance.
- Follow the architecture and folder structures defined below.
- Avoid tightly coupled or monolithic code.
- Reuse patterns and ensure consistency across frontend and backend.
- All documentation must be placed inside docs/.

---

## Containers

The application uses Docker for containerization. The docker-compose.yml file defines three services:

- matcha_db: PostgreSQL 16 (alpine) database service.
- matcha_server: Express.js backend service.
- matcha_client: React + Vite frontend service.

There is a shared network for communication between services and volumes for data persistence.
The backend depends on the database service being healthy before starting.
All environment variables are stored in a root .env file (never committed to Git).

---

## Tech Stack

### Frontend

- React + Vite (UI library + build tool)
- TypeScript (static typing in frontend only)
- Tailwind CSS v4 (utility-first styling — no other CSS allowed)
- CSS variables in :root for design tokens (colors, spacing, radii) referenced by Tailwind config
- Lucide React (icons)
- React Router DOM (routing)
- React Context (global state management)
- Fetch API (HTTP requests inside services only)
- Socket.io client (real-time chat, notifications, WebRTC signaling)
- ESLint + Prettier (code quality)

### Backend

- Express.js (micro-framework — router only, no ORM, no built-in validators)
- Node.js 20+ (runtime)
- JavaScript ES6+ (ES modules — "type": "module" in package.json)
- PostgreSQL 16 via pg (node-postgres) — raw SQL only, no ORM
- JWT stored in http-only cookies (authentication)
- Socket.io (real-time WebSocket server — chat, notifications, WebRTC signaling)
- bcrypt (password hashing — salt rounds 12)
- helmet (secure HTTP headers)
- cors (cross-origin resource sharing)
- express-rate-limit (brute force protection on auth endpoints)
- multer + sharp (file uploads and image processing)
- nodemailer (email — verification, password reset)
- @faker-js/faker (seed script — 500+ fake profiles)
- Zod (request body and params validation)
- Pino + pino-http (logging)
- Docker (containerization)
- ESLint + Prettier (code quality)

---

## Theming & Styling

- Use Tailwind CSS v4 exclusively for all styling in the frontend.
- Define all design tokens (colors, font sizes, spacing, border radii) as CSS variables in :root inside index.css.
- Use semantic variable names: --color-primary, --color-secondary, --color-text, --color-text-muted, --color-background, --color-border, etc.
- Never use hardcoded color values (e.g. text-red-500) — always use the custom CSS variable-based classes.
- Never use inline styles unless a value is purely dynamic (e.g. calculated width from JS).
- Never use plain CSS, CSS modules, styled-components, or any other styling method.
- Use className for all styling in React components.
- Use Lucide React for all icons.

Example index.css:

```css
@import "tailwindcss";

:root {
  --color-primary: #e94057;
  --color-background: #f7f7f7;
  --color-text: #1a1a2e;
  --color-text-muted: #6b7280;
  --color-border: #e5e7eb;
}
```

---

## Security Requirements (peer-eval — any breach = score 0)

- Never store plain-text passwords. Always use bcrypt with salt rounds 12.
- Never store secrets in code. Always use environment variables via .env.
- Protect all endpoints against SQL injection — use parameterized queries only.
- Sanitize all user inputs to prevent XSS (HTML/JS injection).
- Validate all file uploads server-side: type (JPEG, PNG, WebP only) and size (max 5MB).
- Rate-limit all authentication endpoints.
- Use helmet() on every Express app instance.
- JWT must be stored in http-only cookies — never in localStorage.
- Blocked users must not appear in search results or trigger notifications.
- Coordinates sent to other users must be rounded to ~1km precision (privacy).

---

## Database Rules

- Use PostgreSQL 16 with raw SQL queries only. No ORM (Sequelize, Prisma, etc.).
- All queries must be parameterized to prevent SQL injection.
- Use the pool from server/src/db/pool.js for all queries.
- Never store counts (likes, visits) as columns — always COUNT() from the relevant table.
- Never store arrays as columns — use junction tables (user_tags, likes, visits).
- Schema is defined in server/src/db/migrate.js — all table changes go there.
- Run migrations with: node src/db/migrate.js
- Run seed (500+ fake profiles) with: node src/db/seed.js

### Tables

users, photos, tags, user_tags, likes, visits, blocks, reports,
messages, notifications, email_tokens, dates (bonus)

### Key schema decisions

- users.id is UUID (DEFAULT gen_random_uuid())
- photos table is created before profile_picture_id is added to users (circular dependency fix via ALTER TABLE)
- likes, visits, blocks, reports use composite PRIMARY KEY — no separate id column
- messages and notifications have no UNIQUE constraint on is_read
- gender is nullable — filled in after registration on the profile page

---

## Authentication

- JWT stored in http-only cookies (not localStorage, not Authorization header).
- JWT is verified in server/src/middlewares/authenticate.js.
- All protected routes use the authenticate middleware.
- Socket.io connections are authenticated via JWT passed in socket.handshake.auth.token.
- OAuth (bonus): passport.js with Google and GitHub strategies.
  users table has oauth_provider and oauth_id columns for this.

---

## Real-time (Socket.io)

Socket.io handles three real-time features. All use the same persistent connection.

### Chat events

- Client emits: chat:send { to: userId, content }
- Server emits: chat:receive { from: userId, content, sentAt }

### Notification events

- Server emits: notification:new { type, from: userId }
- Notification types: like | visit | message | match | unlike
- Max delay: 10 seconds (requirement from project spec)

### WebRTC signaling events (bonus)

- webrtc:offer, webrtc:answer, webrtc:ice-candidate, webrtc:hang-up

Socket.io server is initialized in server/src/socket/index.js.
The online users map is maintained in memory (Map: userId -> socketId).

---

## Frontend Architecture

```
client/src/
├── pages/
│   ├── auth/
│   │   ├── ForgotPasswordPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── ResetPasswordPage.jsx
│   │   └── VerifyEmailPage.jsx
│   ├── BrowsePage.jsx
│   ├── ChatPage.jsx
│   ├── EditProfilePage.jsx
│   ├── LikesPage.jsx
│   ├── MapPage.jsx
│   ├── MyProfilePage.jsx
│   ├── NotificationsPage.jsx
│   ├── ProfilePage.jsx
│   ├── SearchPage.jsx
│   └── VisitorsPage.jsx
├── components/
│   ├── ui/         (reusable UI components — Button, Input, Modal, etc.)
│   ├── layouts/    (Layout.jsx with header/main/footer)
│   └── routing/    (ProtectedRoute.jsx)
├── context/
│   ├── AuthContext.jsx
│   └── SocketContext.jsx
├── hooks/          (custom React hooks)
├── services/       (all fetch calls — one file per resource)
├── utils/          (utility functions)
├── constants/      (constant values)
├── App.jsx         (React Router entry point)
├── index.css       (Tailwind directives + :root CSS variables)
└── main.jsx        (entry point)
```

### Frontend Rules

- Use .tsx extension for React component files and .ts for other TypeScript files.
- Use TypeScript for all frontend code.
- Use Tailwind CSS v4 exclusively for styling — no plain CSS, no CSS modules, no inline styles.
- All color and design tokens are CSS variables in :root (index.css).
- Never use hardcoded Tailwind color values — always use the custom token classes (e.g. text-text-muted not text-gray-500).
- Use React Router for all routing.
- Use React Context only for global state (auth, socket).
- Use Fetch API for HTTP calls — only inside /services files.
- Never put fetch calls or business logic inside components.
- Extract reusable UI elements into /components/ui.
- Use ProtectedRoute from /components/routing for auth-gated routes.
- Use AuthContext (useAuth) to access the current user and auth actions.
- Use SocketContext (useSocket) to access the socket, unread counts, and real-time state.
- No monolithic components — keep files small and focused.

---

## Backend Architecture

```
server/src/
├── routes/         (Express route definitions — one file per resource)
├── controllers/    (handle HTTP requests and responses)
├── services/       (business logic — one file per domain)
├── db/
│   ├── pool.js     (pg Pool — single shared instance)
│   ├── migrate.js  (schema definition and migrations)
│   ├── seed.js     (faker seed — 500+ profiles)
│   └── reset.js    (drop all tables)
├── middlewares/
│   ├── authenticate.js   (JWT verification from http-only cookie)
│   ├── errorHandler.js   (global error handler)
│   └── notFound.js       (404 handler)
├── socket/
│   └── index.js    (Socket.io server — chat, notifications, WebRTC)
├── utils/          (utility functions — email, tokens, fame rating, etc.)
└── index.js        (entry point — Express app + HTTP server + Socket.io)
```

### Backend Rules

- Use ES modules throughout (import/export). The package.json has "type": "module".
- Define routes in /routes — one file per resource (auth, users, profile, browse, etc.).
- Controllers handle HTTP req/res only — no business logic.
- Business logic lives in /services.
- Database queries live inside services — never in controllers or routes.
- Use Zod for validating all request bodies and params.
- Use parameterized queries for every database call — no string interpolation in SQL.
- Use the authenticate middleware on all protected routes.
- Use express-rate-limit on all auth endpoints.
- Never expose stack traces in production — the errorHandler handles this.
- File uploads go to server/uploads/ — never committed to Git.
- Filenames for uploads are UUID-generated to prevent path traversal attacks.

---

## API Conventions

- Base URL: /api
- Auth routes are public. All other routes require a valid JWT cookie.
- Error format: { "error": "message" }
- Success format: flat object or { "data": ... }
- Dates: ISO 8601 strings
- HTTP status codes must be used correctly:
  200 OK, 201 Created, 400 Bad Request, 401 Unauthorized,
  403 Forbidden, 404 Not Found, 409 Conflict, 500 Internal Server Error
- Full API contract is documented in docs/API.md — update it when adding endpoints.

---

## Fame Rating

Fame rating is a decimal score (0–100) stored on users.fame_rating.
It is recalculated by calling recalculateFameRating(userId) from server/src/utils/fameRating.js.

Formula (runs as a single SQL UPDATE):
likes*received * 3 (each like someone gave this user)
visits*received * 1 (each profile view this user received)
blocks_received \* -5 (each block this user received)
profile_complete ? +10 : 0

Profile is complete when ALL are true:

- gender is not null
- biography is not null and not empty
- latitude and longitude are not null
- at least 1 row in user_tags for this user
- at least 1 row in photos for this user

Result is clamped: LEAST(100, GREATEST(0, score))

Call recalculateFameRating(targetUserId) after:

- like given or removed → recalculate liked user
- visit recorded → recalculate visited user
- block added → recalculate blocked user
- profile fields updated → recalculate that user
- tags added or removed → recalculate that user
- photo uploaded or deleted → recalculate that user

---

## Matching Algorithm (browse)

Suggested profiles must:

- Respect sexual orientation (hetero / homosexual / bisexual — default bisexual)
- Exclude blocked users (both directions)
- Exclude already-connected users
- Be ranked by: geographic proximity (primary), shared tags, fame rating
- Be sortable and filterable by: age, location, fame rating, common tags

---

## Bonus Features

The following bonus features are planned. Do not use stubs — implement fully when requested.

- OmniAuth: Google and GitHub OAuth via passport.js
- Photo gallery: drag-and-drop upload, crop, rotate, filters (react-image-crop + sharp.js)
- Interactive map: Leaflet.js, precise GPS, user pins, profile preview on click
- Video/audio chat: WebRTC via existing Socket.io signaling (offer/answer/ICE/hang-up)
- Schedule dates: proposal/accept/decline flow, dates table in PostgreSQL

---

## Coding Standards

### Do

- Use TypeScript only in the frontend.
- Use Tailwind CSS v4 exclusively for all styling in the frontend.
- Write readable, minimalistic, scalable code.
- Keep functions short and focused.
- Use descriptive variable and function names.
- Use async/await consistently.
- Extract repeated logic into helpers in /utils.
- Use Zod for all backend input validation.
- Use parameterized SQL queries always.
- Follow the defined architecture strictly.

### Do Not

- Use TypeScript in the backend.
- Use plain CSS, CSS modules, styled-components, or any styling method other than Tailwind.
- Use hardcoded Tailwind color values (e.g., text-red-500). Always use custom CSS variable token classes instead (e.g., text-primary).
- Use inline styles.
- Use any ORM (Sequelize, Prisma, TypeORM, etc.).
- Use localStorage for JWT — use http-only cookies.
- Place fetch calls inside React components — use /services.
- Place business logic inside controllers — use /services.
- Hardcode secrets, credentials, or API keys.
- Use string interpolation in SQL queries.
- Create monolithic components or files.
- Write unused or dead code.
- Mix UI and business logic.

---

## Commenting Guidelines

- Add comments only when necessary (complex logic or genuinely unclear situations).
- Prefer self-explanatory code over comments.
- Avoid long, auto-generated, or redundant comments.
