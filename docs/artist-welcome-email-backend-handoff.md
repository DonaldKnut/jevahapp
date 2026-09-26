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

## 3b. Logo in every EJS mail

Use this Cloudinary URL for the header mark on **all** Jevah emails (creator welcome, verify, reset, marketing, moderation, ops). Do not swap in a local file.

```
https://res.cloudinary.com/bt01nio6/image/upload/v1790381597/jevahha-removebg-preview.png
```

Suggested env:

```bash
JEVAH_EMAIL_LOGO_URL=https://res.cloudinary.com/bt01nio6/image/upload/v1790381597/jevahha-removebg-preview.png
```

Shared header partial (dark bar — the mark is light + gold):

```ejs
<%# views/emails/_header.ejs %>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b1a1f;">
  <tr>
    <td align="center" style="padding:28px 24px 20px;">
      <img
        src="<%= typeof logoUrl !== 'undefined' && logoUrl ? logoUrl : 'https://res.cloudinary.com/bt01nio6/image/upload/v1790381597/jevahha-removebg-preview.png' %>"
        alt="Jevah"
        width="156"
        style="display:block;border:0;outline:none;text-decoration:none;max-width:156px;height:auto;"
      />
    </td>
  </tr>
</table>
```

Pass `logoUrl` from the mailer locals (or `process.env.JEVAH_EMAIL_LOGO_URL`). Include `_header.ejs` in every template.

---

## 4. Official template (`creator_welcome_v1`)

Use this as the **default** Studio-ready email (activate + Welcome artists).  
Interpolate `{{firstName}}` from the artist display name / first name (fallback `friend`).  
If `message` / `onboardMessage` is present, insert it as a short personal note after the “profile is now ready” paragraph.  
CTA button: **Open Studio** → `/creators/studio`.  
**No marketing unsubscribe footer.**

Default subject:

```
Welcome to Jevah, {{firstName}}
```

FE may also send `onboardSubject` / `subject` already filled for a single activate (e.g. `Welcome to Jevah, Jizzy`), plus `onboardTemplate` / `templateId`: `creator_welcome_v1`.

Body (plain-text equivalent):

```
Hi {{firstName}},

Welcome to Jevah. We’re glad you’re here.

Whether you’re here to share your music, ministry, podcast, message, or your story, Jevah was built to give your voice a place to reach people who need to hear it.

Your creator profile is now ready. This is your space to publish, connect with your audience, grow your community, and make an impact beyond the moment.

{{optionalNote}}

Here’s what you can do next:

🎙️ Share your work — Upload your music, podcasts, sermons, teachings, or other content.

🌍 Reach more people — Put your voice in front of an audience beyond your immediate circle.

💬 Build your community — Connect with people who listen, watch, follow, and believe in what you do.

🚀 Grow with Jevah — Keep creating, keep showing up, and let your journey unfold.

Your next chapter starts here.

Welcome to Jevah, {{firstName}}.

Create. Connect. Inspire.

The Jevah Team
```

Activate PATCH extras (ignore unknown fields safely):

```json
{
  "sendOnboardEmail": true,
  "onboardTemplate": "creator_welcome_v1",
  "onboardSubject": "Welcome to Jevah, Jizzy",
  "onboardMessage": "Studio is unlocked — upload your first track when you’re ready."
}
```

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
