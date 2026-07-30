# Master admin account (support@jevahapp.com)

## What the frontend does

| Rule | Behavior |
|------|----------|
| Master email | `support@jevahapp.com` only (`src/lib/superAdmin.ts`) |
| Web console login | Only emails on the **login allowlist** |
| Default allowlist | Just `support@jevahapp.com` |
| Promote to admin | Master can set a user’s role to `admin` in **Users** |
| After promote | That email is added to the allowlist → they can log in |
| Demote from admin | Removed from allowlist → cannot use `/login` |
| Role changes | **Only** the master account can change roles |
| Ban master | UI blocks banning / demoting `support@jevahapp.com` |

**Password is never stored in this repo.** Create the user on Mongo / backend with your chosen password.

## Backend setup (required)

In `jevahapp-backend` / Mongo `User` collection, ensure:

```json
{
  "email": "support@jevahapp.com",
  "password": "<bcrypt hash of your password>",
  "role": "admin",
  "isEmailVerified": true,
  "isBanned": false
}
```

Recommended backend protections (ask backend team):

1. Never allow demoting or banning `support@jevahapp.com`
2. Optionally enforce the same login allowlist server-side (frontend-only allowlist can be cleared in DevTools)

## Frontend env

```env
VITE_API_URL=http://localhost:4000/api
# production example:
# VITE_API_URL=https://api.jevahapp.com/api
```

## How to add another dashboard admin

1. Sign in as `support@jevahapp.com`
2. Open **Users**
3. Change that user’s role to **admin**
4. They can now sign in at `/login` with their own password

## Security note

Frontend gates are UX + convenience. Real security is JWT + `requireAdmin` on the API. Prefer also locking role changes / ban of the master account on the backend.
