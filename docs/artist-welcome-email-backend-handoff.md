# Backend handoff — Welcome artists email (artist onboard)

**Date:** 2026-08-09  
**Audience:** `jevahapp-backend`  
**Frontend:** Admin → Email → **Welcome artists** (`/admin/email/artist-onboard`) + Artists activate modal  
**Product language:** Prefer “welcome / invite” in UI; API paths may keep `artist-onboard`.

---

## 0. What this email is

A **one-time ops invite** after a creator is approved.

| Is | Is not |
|----|--------|
| “Studio is ready — here’s how to upload” | Marketing newsletter |
| Sent even if marketing is opted out | Subject to unsubscribe footer |
| Logged as `kind: artist_onboard` | Same queue as promo blasts |

Default audience: **approved artists who have never received this invite** (`onboardEmailSentAt` empty).

---

## 1. Endpoints (FE already calls these)

Base: `VITE_API_URL` includes `/api` → paths below are relative to that.

### Send

```http
POST /api/admin/email/artist-onboard
Authorization: Bearer <admin JWT>
Content-Type: application/json
```

```json
{
  "segment": "active_missing_onboard",
  "subject": "You're invited to create on Jevah",
  "message": "Congrats — you're live. Open Studio and upload your first track.",
  "dryRun": true,
  "limit": 100,
  "artistIds": [],
  "userIds": [],
  "emails": []
}
```

| Field | Notes |
|-------|--------|
| `segment` | See §2 |
| `subject` | Optional; default subject if omitted |
| `message` | Optional personal note in the template |
| `dryRun` | `true` = count / simulate only, no Resend |
| `limit` | Cap batch (FE sends `100`) |
| `artistIds` / `userIds` / `emails` | Only for matching segments |

### Preview count

```http
GET /api/admin/email/artist-onboard/preview-count?segment=active_missing_onboard&limit=100
Authorization: Bearer <admin JWT>
```

Response (any of these shapes is fine; FE unwraps):

```json
{ "success": true, "data": { "count": 12 } }
```

### Activate + send in one step (Artists page)

When admin activates an application, FE may send:

```json
{
  "isVerifiedArtist": true,
  "sendOnboardEmail": true,
  "onboardMessage": "Congrats — you're live."
}
```

Wire this on the existing verification / activate route (whatever you already use for Artists flags). If `sendOnboardEmail: true`, queue the same template and set `onboardEmailSentAt`.

---

## 2. Segments

| `segment` | Meaning |
|-----------|---------|
| `active_missing_onboard` | Approved + no `onboardEmailSentAt` (**default**) |
| `active` | All approved artists |
| `pending` | Applications not yet approved |
| `artistIds` | Explicit artist document IDs |
| `userIds` | Explicit user IDs |
| `emails` | Explicit addresses (resolve to users when possible) |

---

## 3. Side effects after a real send

1. Deliver via Resend (or your mailer).  
2. Set `onboardEmailSentAt` (ISO) on each artist who was emailed.  
3. Write email log row with `kind: "artist_onboard"` (so Admin → Past emails can filter).  
4. Dashboard analytics should expose:

```json
{
  "verification": {
    "activeArtistsMissingOnboardEmail": 3,
    "pendingCreatorApplications": 2
  },
  "reminders": [ /* optional strings or objects FE already tolerates */ ]
}
```

FE Overview banner uses `activeArtistsMissingOnboardEmail`.

---

## 4. Template expectations

- Clear CTA to web Studio (`/creators/studio` or deep link you prefer) and/or mobile.  
- Include optional `message` body when provided.  
- **No marketing unsubscribe footer** (this is transactional/ops).  
- Default subject if empty: `You're invited to create on Jevah`.

---

## 5. Auth & safety

- Admin JWT only.  
- Respect `dryRun`.  
- Enforce `limit` (FE uses 100).  
- Never blank the FE on empty lists — return `count: 0` / `sent: 0`.

Suggested success payload for send:

```json
{
  "success": true,
  "data": {
    "dryRun": false,
    "queued": 12,
    "sent": 12,
    "skipped": 0
  }
}
```

FE reads `sent` | `queued` | `accepted` | `count`.

---

## 6. Smoke

```bash
BASE=https://api.jevahapp.com/api
TOKEN="<admin JWT>"

curl -s "$BASE/admin/email/artist-onboard/preview-count?segment=active_missing_onboard" \
  -H "Authorization: Bearer $TOKEN"

curl -s -X POST "$BASE/admin/email/artist-onboard" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"segment":"active_missing_onboard","dryRun":true,"limit":100,"message":"Welcome to Studio."}'
```

---

## 7. FE already done

- Compose UI: plain-language **Welcome artists** page  
- Tabs: Direct email / News & promos / Welcome artists  
- Activate modal checkbox + note  
- Overview reminder banner  
- Email log kind badge  

Ship / confirm the activate `sendOnboardEmail` flag + `onboardEmailSentAt` + dashboard count if any of those are still stubbed.
