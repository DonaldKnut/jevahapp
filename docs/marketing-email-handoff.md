# Frontend ↔ Backend: Marketing email, unsubscribe, artist onboard

Implements the 2026-08-03 marketing email handoff against `jevahapp-backend` (Resend).

## Shipped on web

| Item | Location |
|------|----------|
| Ops compose (unchanged) | `/admin/email` → `POST /admin/email` |
| Marketing compose + preview | `/admin/email/marketing` → `POST/GET …/email/marketing` |
| Artist onboard compose + preview | `/admin/email/artist-onboard` → `POST/GET …/email/artist-onboard` |
| Email log kinds | `/admin/email/log` shows `meta.kind`: `marketing` \| `artist_onboard` \| ops |
| Activate + onboard | Artists activate modal → `PATCH /admin/artists/:id` with `sendOnboardEmail`, `onboardMessage` |
| Overview banner | When `verification.activeArtistsMissingOnboardEmail > 0` or `reminders[]` |
| Marketing prefs | Admin Settings + Creator Studio → `GET/PATCH /me/marketing-email` |
| Public unsubscribe | `/email/unsubscribe?token=…` → `GET/POST /email/unsubscribe` (no auth) |

## Backend env (confirm)

```bash
PUBLIC_WEB_URL=https://www.jevahapp.com
# or FRONTEND_URL — unsubscribe links must hit the web app, not the API host
```

Unsubscribe link in emails should be:

`https://www.jevahapp.com/email/unsubscribe?token=…`

## Do not mix endpoints

- Password / security / verify → existing transactional mail only
- Artist onboard → `/admin/email/artist-onboard` (or activate with `sendOnboardEmail`)
- Marketing blasts → `/admin/email/marketing` only (opt-in filtered)

## Optional later

- Deep-link `/admin/moderation?mediaId=`
- Mobile app settings also calling `/me/marketing-email`
