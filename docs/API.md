# Matcha — API contract

This document is the contract between frontend and backend.
Every endpoint must be documented here before it is built.

## Conventions

- **Base URL:** `/api`
- **Auth:** `Authorization: Bearer <token>` header on all protected routes
- **Error format:** `{ "error": "message" }`
- **Success format:** `{ "data": ... }` or flat object
- **Dates:** ISO 8601 strings

---

## Auth

POST /api/auth/register

**Body:** `{ username, email, password, first_name, last_name }`
**Response 201:** `{ message: "Verification email sent" }`
**Errors:** 400 validation, 409 username/email taken
