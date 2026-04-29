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
