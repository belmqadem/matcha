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
**Notes:** `user` includes `tags: string[]` and `photos: { id, url, order_index, created_at }[]`

PATCH /api/users/me

**Body:** `{ first_name?, last_name?, email?, username? }`
**Response 200:** `{ user }`
**Notes:** If email changes, `is_verified` is reset and a new verification email is sent
**Errors:** 400 validation, 409 username/email taken

---

## Profile

PATCH /api/profile/me

**Body:** `{ gender?, sexual_preference?, biography?, latitude?, longitude?, location_city? }`
**Response 200:** `{ user }`
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
