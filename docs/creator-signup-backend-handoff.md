# Backend handoff — Creator web signup

**Date:** 2026-09-25  
**Audience:** `jevahapp-backend`  
**Frontend:** `/creators/signup` (new) → existing `/creators/login` → `/creators/apply` → `/creators/studio`  
**Status:** UI is **blocked** on a public register + verify contract. Web can only log in today. Apply and Studio are already built.

Related:

- `docs/creator-apply-spotify-handoff.md` — apply form (already shipped)
- `docs/creator-studio-backend-handoff.md` — desk after approval
- `docs/artist-welcome-email-backend-handoff.md` — post-approval invite email

---

## 0. What we are asking you to unlock

We are building a **Spotify for Artists–quality** signup on the web:

- Split promo + form (same shell as `/creators/login` and `/creators/apply`)
- Short, beautiful first step: name, email, password
- Inline field errors, password strength, “already have an account?”
- Email verification gate with a polished waiting screen
- Then apply (already live) — not a second account

**Frontend cannot invent users.** If register lives only in the mobile app, the web funnel dies at “Create your account.”

Please give us the **same identity API the mobile app uses** (or the same user table behind a documented public route). One Jevah account. Web and mobile both sign in with it.

---

## 1. Product decision (do not fork this)

| Do | Do not |
|----|--------|
| One `User` for listener + creator | A separate “creator account” collection |
| Signup = identity | Signup = auto-approve artist |
| Apply = ministry profile (`POST /api/creators/apply`) | Merge register + apply into one backend write |
| Admin review unlocks Studio | Auto-promote `role` to `artist` on register |
| Same JWT / refresh as `POST /api/auth/login` | Web-only tokens that mobile cannot use |

Role after register should stay whatever a normal new member is today (`learner` or equivalent). Creator status comes from **apply + admin Artists queue**, not from signup.

Admin Settings already has `registrationEnabled`. Web signup must honor that flag.

---

## 2. Journey we will render (so you know the states)

```
/creators                  marketing
    │
    ├─ signed out ──► /creators/signup     ← NEW (needs you)
    │                      │
    │                      ├─ 201 + tokens, email unverified
    │                      │         └─► /creators/verify   waiting UI
    │                      │                  │ resend OTP / link
    │                      │                  ▼ verified
    │                      └─ 201 + tokens, email already verified
    │                                └─► /creators/apply    (exists)
    │                                         ▼
    │                                   /creators/studio    (exists, read-only until approved)
    │
    └─ has account ──► /creators/login     (exists, keep)
```

We will **not** put ministry name, genres, or socials on signup. That is apply. Keep register tiny so the UI can stay cinematic.

---

## 3. Already wired on web (keep)

| Method | Path | Notes |
|--------|------|--------|
| POST | `/api/auth/login` | Creator login uses this with `requireAdmin: false` |
| GET | `/api/auth/me` | Must return `id`, `email`, `firstName`, `lastName`, `role`, `isEmailVerified`, `isBanned`, artist flags |
| POST | `/api/auth/refresh` | Cookie or body — stay consistent with login |
| POST | `/api/auth/logout` | |
| POST | `/api/creators/apply` | Auth required. See apply handoff |
| GET | `/api/creators/me` | Capabilities + pending banner |

Login response we already unwrap:

```ts
{
  success: boolean
  token?: string
  accessToken?: string
  user: AdminUser
}
```

`user` shape we already persist (`src/types/admin.ts`):

```ts
{
  id: string
  email: string
  firstName?: string
  lastName?: string
  username?: string
  avatar?: string | null
  role: string
  isEmailVerified?: boolean
  isBanned?: boolean
  isVerifiedArtist?: boolean
  isVerifiedCreator?: boolean
  createdAt?: string
}
```

**Register success should look like login success.** Same keys. Then we reuse `AuthContext` and send them to apply or verify.

---

## 4. New / public endpoints we need

Base: `VITE_API_URL` always includes `/api`. Paths below are relative to that.  
All of these are **`auth: false`** except verify-with-session variants.

### 4.1 Register

```http
POST /api/auth/register
Content-Type: application/json
```

```json
{
  "firstName": "Grace",
  "lastName": "Okoye",
  "email": "grace@ministry.com",
  "password": "Correct-horse-battery-1",
  "rememberMe": true,
  "source": "creators_web"
}
```

| Field | Rules | UI |
|-------|--------|-----|
| `firstName` | trim, 1–40 chars | Required |
| `lastName` | trim, 1–40 chars | Required |
| `email` | valid email, store lowercased | Required |
| `password` | see §6 | Required |
| `rememberMe` | boolean, default `false` | Same cookie / refresh lifetime as login |
| `source` | optional string | Analytics only. We send `creators_web`. Mobile can send `ios` / `android` |

Do **not** require username, phone, avatar, or creator type here.

**Success — 201 Created**

```json
{
  "success": true,
  "accessToken": "eyJ…",
  "token": "eyJ…",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "user": {
    "id": "…",
    "email": "grace@ministry.com",
    "firstName": "Grace",
    "lastName": "Okoye",
    "role": "learner",
    "isEmailVerified": false,
    "isBanned": false,
    "createdAt": "2026-09-25T16:00:00.000Z"
  },
  "nextStep": "verify_email",
  "message": "Account created. Check your email to verify."
}
```

If you auto-verify in a given environment, set `isEmailVerified: true` and `nextStep: "apply"`. We branch the UI off those two fields.

Set the **same refresh cookie** you set on login (`credentials: include` is already on every `fetch`).

---

### 4.2 Public registration gate (needed for a graceful closed state)

```http
GET /api/auth/registration-status
```

```json
{
  "registrationEnabled": true,
  "message": null
}
```

When admin flips `registrationEnabled` off:

```json
{
  "registrationEnabled": false,
  "message": "New accounts are paused. Sign in if you already have a Jevah account."
}
```

We will hide the form and show a beautiful “registration paused” panel with a link to `/creators/login`.  
`POST /api/auth/register` must still return **403** with `code: "REGISTRATION_DISABLED"` if someone posts anyway.

---

### 4.3 Verify email

Support **both** if you can. We will ship the OTP screen first (better web UX). Deep links still matter for mail clients.

#### Option A — OTP (preferred for the waiting UI)

```http
POST /api/auth/verify-email
Content-Type: application/json
```

```json
{ "email": "grace@ministry.com", "code": "482193" }
```

If they already have a session, also accept:

```http
POST /api/auth/verify-email
Authorization: Bearer <accessToken>
```

```json
{ "code": "482193" }
```

**Success — 200**

Same envelope as login (`accessToken` + `user` with `isEmailVerified: true`).  
`nextStep`: `"apply"` for creator-web; `"home"` is fine if you do not know the client.

#### Option B — magic link

```
GET /api/auth/verify-email?token=…
```

Redirect to:

```
https://www.jevahapp.com/creators/verify?status=ok
```

or, on failure:

```
https://www.jevahapp.com/creators/verify?status=expired
```

If you can attach the session cookie on that redirect, even better. Otherwise the page tells them to sign in.

---

### 4.4 Resend verification

```http
POST /api/auth/resend-verification
Content-Type: application/json
```

```json
{ "email": "grace@ministry.com" }
```

**Always 200** (do not leak whether the email exists):

```json
{
  "success": true,
  "message": "If an account needs verification, we sent a new code.",
  "retryAfterSec": 60
}
```

Rate-limit: we will disable the Resend button using `retryAfterSec` and `Retry-After`.

---

### 4.5 Password reset (needed so signup → forgot is not a dead end)

Login currently has **no** forgot-password link because there is no API. Please add:

```http
POST /api/auth/forgot-password
{ "email": "grace@ministry.com" }
```

Always 200. Same anti-enumeration rule as resend.

```http
POST /api/auth/reset-password
{ "token": "…", "password": "New-correct-horse-1" }
```

Success 200. Invalid/expired token 400 `code: "RESET_TOKEN_INVALID"`.

Web routes we will add once this lands: `/creators/forgot` and `/creators/reset`.

---

## 5. Error contract (this is what makes the UI feel expensive)

Frontend already reads `body.message` / `body.error`. Please **also** send `code` and `fields` so we can highlight inputs instead of a generic toast.

```json
{
  "success": false,
  "code": "EMAIL_TAKEN",
  "message": "That email already has a Jevah account. Sign in instead.",
  "fields": {
    "email": "That email already has a Jevah account."
  }
}
```

| HTTP | `code` | When | UI we will show |
|------|--------|------|-----------------|
| 400 | `VALIDATION_ERROR` | Zod/Joi fail | Inline under each `fields.*` key |
| 400 | `WEAK_PASSWORD` | Fails §6 | Password field + strength meter red |
| 409 | `EMAIL_TAKEN` | Email exists | Email field + CTA “Sign in” |
| 403 | `REGISTRATION_DISABLED` | Flag off | Full-page paused state |
| 403 | `BANNED` | Banned email/device | Support copy, no retry loop |
| 409 | `ALREADY_VERIFIED` | Verify on verified user | Redirect to login / apply |
| 400 | `INVALID_CODE` | Wrong OTP | Code inputs shake, keep digits |
| 400 | `CODE_EXPIRED` | OTP stale | “Resend a new code” |
| 429 | `RATE_LIMITED` | Too many tries | Disable CTA; honor `Retry-After` |
| 422 | `EMAIL_NOT_VERIFIED` | Login / apply while unverified | Send them to `/creators/verify` |

`GET /api/creators/apply` and `POST /api/auth/login` should return `EMAIL_NOT_VERIFIED` (not a vague 401) when the password is correct but mail is unverified. That lets us resume the pretty verify screen instead of “sign in failed.”

---

## 6. Password rules (shared with mobile)

Enforce the **same** policy in one place. We will mirror it in Zod so the UI fails before the request.

Recommended (tell us if mobile already differs — we will match you):

- 8–72 characters
- At least 1 letter and 1 number
- Reject common passwords (`password`, `12345678`, email-local-part)
- Hash with the same algorithm as login (bcrypt/argon — do not weaken for web)

Return `fields.password` with a human sentence, e.g. `"Use at least 8 characters with a letter and a number."`

---

## 7. Emails we need you to send

These are product emails, not marketing. Same idea as the artist welcome: send even if they are opted out of promos.

| Event | Subject (suggested) | Body must include |
|-------|---------------------|-------------------|
| Register | `Verify your Jevah account` | 6-digit code + optional `https://www.jevahapp.com/creators/verify` |
| Resend | same | New code; invalidate the old one |
| Welcome (optional, after verify) | `You're in — apply as a creator` | Link to `https://www.jevahapp.com/creators/apply` |
| Forgot password | `Reset your Jevah password` | One-time link to `https://www.jevahapp.com/creators/reset?token=` |

OTP: 6 digits, 10–15 min TTL, 5 attempts then lock + resend.

From-name: **Jevah**. Not a raw noreply dump. This mail is the first brand moment after a beautiful form.

Logo in the EJS header (same URL as every other Jevah mail):

```
https://res.cloudinary.com/bt01nio6/image/upload/v1790381597/jevahha-removebg-preview.png
```

`JEVAH_EMAIL_LOGO_URL` + shared `_header.ejs` — see `docs/artist-welcome-email-backend-handoff.md` §3b.

---

## 8. Session, CORS, cookies

Web client (`src/lib/api.ts`):

- Base: `https://api.jevahapp.com/api` in prod
- `credentials: "include"`
- Bearer `Authorization` from `localStorage.accessToken`

Please:

1. Allow CORS from `https://www.jevahapp.com`, `https://jevahapp.com`, Vercel previews, and `http://localhost:5173` (or whatever Vite uses).
2. `Access-Control-Allow-Credentials: true`.
3. Refresh cookie: `HttpOnly`, `Secure`, `SameSite=None` if API and web are on different hosts (`api.jevahapp.com` vs `www.jevahapp.com`).
4. Register, login, and verify must mint the **same** refresh cookie.

If register returns a user but no `accessToken` / `token`, we cannot enter apply. That is a blocker.

---

## 9. Auth `/me` fields the signup UI will read

After register / verify / login, we branch on:

| Field | UI |
|-------|-----|
| `isEmailVerified === false` | `/creators/verify` — waiting / OTP |
| `isBanned === true` | Hard stop, support |
| `isVerifiedArtist` / creator capabilities | Skip apply → Studio (already done) |
| `firstName` | “Welcome, Grace” on verify + apply |

If you add `nextStep` on `/auth/me` (`verify_email` \| `apply` \| `studio`), we will use it. Optional but nice.

---

## 10. What frontend will ship once this is live

We will implement (do not block on these):

1. `/creators/signup` — same split layout as login (amber creator promo + form)
2. `/creators/verify` — 6-box OTP, resend countdown, success → apply
3. Login footer: “New here? Create an account” → signup (not just “Learn about Studio”)
4. Landing `/creators` CTA: signed-out users go to **signup**, not login
5. Zod schema + field errors mapped from `fields`
6. Closed-registration state from `GET /auth/registration-status`
7. Forgot / reset pages when §4.5 is ready

You do **not** need to design the UI. You need the contracts above so every state has a real payload.

---

## 11. Security (please do not skip)

- Rate-limit register + verify + resend per IP **and** per email
- Normalize email (trim, lowercase) before uniqueness check
- Do not return “email exists” on forgot / resend (409 is OK on register — we want the Sign in CTA)
- Same password hash as mobile
- No auto-admin, no auto-artist
- Banned emails cannot register again
- `source` is telemetry, not a privilege
- Log signups so admin `timeseries?metric=signups` stays true

---

## 12. Definition of done

Backend is done for this UI when we can, on production API:

1. `GET /api/auth/registration-status` → `{ registrationEnabled }`
2. `POST /api/auth/register` with the body in §4.1 → **201** + tokens + `user`
3. Duplicate email → **409** `EMAIL_TAKEN` + `fields.email`
4. Flag off → **403** `REGISTRATION_DISABLED`
5. Weak password → **400** `WEAK_PASSWORD` + `fields.password`
6. Verification email arrives with a 6-digit code
7. `POST /api/auth/verify-email` → `user.isEmailVerified: true` + tokens
8. `POST /api/auth/resend-verification` → 200 + `retryAfterSec`
9. Same email/password works on `POST /api/auth/login` and in the **mobile app**
10. After verify, `POST /api/creators/apply` works with that JWT (no extra role required)
11. CORS + cookie work from `https://www.jevahapp.com`

---

## 13. Suggested implementation order

1. **P0** — `POST /auth/register` + `GET /auth/registration-status` + error codes  
2. **P0** — verify email (OTP) + resend  
3. **P1** — login returns `EMAIL_NOT_VERIFIED` instead of generic 401  
4. **P1** — forgot / reset password  
5. **P2** — `nextStep` on `/auth/me`

We can ship the signup page against P0 and keep verify as a follow-up if mail is not ready — but the beautiful waiting screen needs P0 verify.

---

## 14. Open questions (reply on the PR / ticket)

1. Does mobile already have `POST /api/auth/register`? If yes, **document it and we will call that** — do not add a second route unless the body is incompatible.
2. Is the default new-user `role` `learner`? We will not treat any role as “creator” until apply + approval.
3. OTP vs magic-link only — confirm so we do not build the wrong verify page.
4. Password policy if it already differs from §6.

If mobile register exists but is undocumented, paste the current request/response and we will match it exactly. Consistency beats a prettier payload.

---

## 15. Contact / surfaces

| Surface | URL |
|---------|-----|
| Marketing | `https://www.jevahapp.com/creators` |
| Signup (FE, after this) | `https://www.jevahapp.com/creators/signup` |
| Login (exists) | `https://www.jevahapp.com/creators/login` |
| Apply (exists) | `https://www.jevahapp.com/creators/apply` |
| Studio (exists) | `https://www.jevahapp.com/creators/studio` |

Questions on path shapes: prefer existing `/api/auth/*` over inventing `/api/creators/register`. Creators are users first.
