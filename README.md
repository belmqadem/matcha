# matcha.

> A modern dating web application built as a 42 school project.

Matcha connects users based on compatibility — sexual preferences, shared interests, geographic proximity, and fame rating. It features real-time chat, notifications, and a Tinder-style browse experience.

---

## Features

**Core**

- Registration with email verification and password reset
- JWT authentication via http-only cookies
- Profile setup — photos (up to 5), bio, gender, sexual preference, interest tags
- GPS location with manual fallback
- Fame rating system based on likes, visits, and blocks

**Matching**

- Tinder-style swipe browse with orientation-aware algorithm
- Advanced search with filters (age, fame, distance, tags)
- Like / unlike / match system — chat unlocks on mutual like
- Block and report users

**Real-time**

- Socket.io chat between connected users
- Live notifications (likes, visits, matches, messages)
- Online status tracking

**Bonus**

- Google and 42 OAuth
- Interactive map of nearby users
- Schedule real-life dates
- Photo gallery with crop, rotate, and filters
- Dark / light theme

---

## Tech Stack

| Layer          | Technology                                  |
| -------------- | ------------------------------------------- |
| Frontend       | React 19, TypeScript, Vite, Tailwind CSS v4 |
| Backend        | Node.js, Express.js, JavaScript ES6+        |
| Database       | PostgreSQL 16 (raw SQL)                     |
| Cache          | Redis (caching + JWT blocklist)             |
| Real-time      | Socket.io                                   |
| Reverse proxy  | nginx (SSL termination)                     |
| Infrastructure | Docker, Docker Compose                      |

---

## Getting Started

**Prerequisites:** Docker + Docker Compose

```bash
# Clone the repository
git clone https://github.com/belmqadem/matcha.git
cd matcha

# Copy environment file and fill in values
cp .env.example .env

# Start the stack
docker compose up --build

# Run database migration
docker compose exec matcha_server node src/db/migrate.js

# Seed 500 fake profiles (optional)
docker compose exec matcha_server node src/db/seed.js
```

Open **https://localhost** — accept the self-signed certificate warning in dev.
MailHog (dev email): **http://localhost:8025**

---

## Environment Variables

See `.env.example` for the full list. Key variables:

```env
JWT_SECRET=           # min 32 chars
POSTGRES_PASSWORD=    # strong password
SMTP_HOST=            # smtp.gmail.com for production
GOOGLE_CLIENT_ID=     # Google Cloud OAuth credentials
FORTYTWO_CLIENT_ID=   # 42 Intra OAuth credentials
```

---

## Project Structure

```
matcha/
├── client/          # React + Vite frontend
├── server/          # Express.js backend
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── db/
│   │   ├── socket/
│   │   └── utils/
├── nginx/           # nginx config
├── certs/           # SSL certificates (local dev)
└── docker-compose.yml
```

---

## Authors

| Name           | Role     | GitHub                                       |
| -------------- | -------- | -------------------------------------------- |
| Adil Belmqadem | Backend  | [@belmqadem](https://github.com/belmqadem)   |
| Kaouthar Kouaz | Frontend | [@kaoutharrr](https://github.com/kaoutharrr) |

---

_42 School — 1337 Ben Guerir_
