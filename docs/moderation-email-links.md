# Backend handoff: moderation / report email dashboard links

**Audience:** API / notification mailer  
**Frontend status:** SPA deep links + login return path are implemented; ship with `vercel.json` on Production.

---

## Required change (do this)

Update the **“Review in Dashboard”** (and any similar) CTA in moderation / content-report emails.

| | |
|---|---|
| **Preferred CTA** | `https://www.jevahapp.com/admin/moderation` |
| **Also valid** | `https://admin.jevahapp.com/admin/moderation` |
| **Stop using** | `https://admin.jevahapp.com/moderation` as the *source of truth* (it only works after frontend redirects deploy; use the full `/admin/moderation` path) |

Suggested env (backend):

```bash
ADMIN_WEB_URL=https://www.jevahapp.com
# CTA = `${ADMIN_WEB_URL}/admin/moderation`
# Optional later: `${ADMIN_WEB_URL}/admin/moderation?mediaId=${id}`
```

---

## Why emails were breaking

1. **Wrong path** — React route is `/admin/moderation`, not `/moderation`.
2. **SPA hosting** — direct hits to `/login` or `/admin/...` need Vercel rewrite to `index.html` (frontend `vercel.json`).
3. **Auth** — frontend already sends unauthenticated admins to `/login?from=/admin/moderation`, then returns them to the queue after login. Backend does **not** need to link to `/login` itself.

---

## Domains (already on Vercel Production for this web app)

- `www.jevahapp.com` — primary
- `admin.jevahapp.com` — same deployment (alias)
- `jevahapp.com` — redirects to `www`

Use **www** in email templates for consistency.

---

## Backend checklist

- [ ] Set moderation alert CTA → `https://www.jevahapp.com/admin/moderation`
- [ ] Set report / content-review CTAs the same way (if separate templates)
- [ ] Prefer `ADMIN_WEB_URL` env over hard-coded hosts
- [ ] Do not point CTAs at `api.jevahapp.com` or deleted preview URLs
- [ ] (Optional) Add `?mediaId=` / `?reportId=` when ready; frontend can adopt query deep-links later

---

## Smoke test (after frontend + mailer deploy)

1. Trigger a moderation alert email.
2. Incognito: click CTA → should load app (not Vercel `NOT_FOUND` / `DEPLOYMENT_NOT_FOUND`).
3. Land on login if logged out → sign in as admin → arrive at moderation queue.
