# Backend: replace the old “You’re invited to create on Jevah” email

**To:** `jevahapp-backend` / mailer (EJS + Resend)  
**From:** web admin (`jevahapp_web`)  
**Date:** 2026-09-26  
**Template id:** `creator_welcome_v1`

This is the email that goes out when an admin **Activates a creator** (Unlock Studio) or uses **Admin → Email → Welcome artists**.

Please **delete or stop using** the current body. It is too technical and reads like an internal playbook.

---

## 1. Kill this copy (live today — wrong)

```
Hi Ibrahim,

You’re invited to create on Jevah — gospel media for everyday life.
Upload your music to the Artists catalog (separate from Copyright-free beds).

Getting started:
Open the creator hub and finish your profile
Upload a track (intent → upload → finalize)
Publish when you’re ready — listeners find you on Music → Artists
```

Do **not** mention any of these in the email:

| Do not say | Why |
|------------|-----|
| Copyright-free beds | Internal catalog name. Listeners/creators don’t need it. |
| Artists catalog | Internal. Say “your music on Jevah”. |
| creator hub | We call it **Studio** in the product. |
| intent → upload → finalize | Engineering steps. Never show this to people. |
| Music → Artists | Nav path. Say “people can find you on Jevah”. |
| PATCH / upload-intent / finalize | API talk. |

Write for a pastor, singer, or podcaster who just got approved. Short sentences. Everyday words.

---

## 2. Logo (every Jevah email, not only this one)

Use this URL as-is in the EJS header. Light + gold mark — sit it on a dark bar (`#0b1a1f`).

```
https://res.cloudinary.com/bt01nio6/image/upload/v1790381597/jevahha-removebg-preview.png
```

```bash
JEVAH_EMAIL_LOGO_URL=https://res.cloudinary.com/bt01nio6/image/upload/v1790381597/jevahha-removebg-preview.png
```

```ejs
<%# views/emails/_header.ejs — include in ALL mails %>
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

---

## 3. Tokens

| Token | Source | Fallback |
|-------|--------|----------|
| `{{firstName}}` | Artist `firstName`, else first word of `displayName` / `name` | `friend` |
| `{{optionalNote}}` | Admin “Optional note” (`onboardMessage` / `message`) | omit the whole block |
| `{{studioUrl}}` | Web Studio | `https://www.jevahapp.com/creators/studio` |

If FE already sends `onboardSubject` filled in (e.g. `Welcome to Jevah, Ibrahim`), use that subject. Otherwise default to:

```
Welcome to Jevah, {{firstName}}
```

---

## 4. Official letter (plain text — source of truth)

Leave out the optional-note paragraph when the admin typed nothing.

```
Hi {{firstName}},

Welcome to Jevah. We’re glad you’re here.

Whether you share music, ministry, a podcast, a message, or your story — Jevah is a place for your voice to reach people who need to hear it.

Your creator profile is ready. You can post your work, meet your listeners, and grow your community from here.

{{optionalNote}}

Here’s what you can do next:

🎙️ Share your work
Upload a song, sermon, podcast, teaching, or anything you’ve made.

🌍 Reach more people
Let people outside your usual circle find you on Jevah.

💬 Build your community
Connect with the people who listen, watch, follow, and believe in what you do.

🚀 Keep going
Show up, keep creating, and let the journey unfold.

When you’re ready, open Studio and add your first upload. People will be able to find you on Jevah.

Your next chapter starts here.

Welcome to Jevah, {{firstName}}.

Create. Connect. Inspire.

The Jevah Team
```

**Button (required):** `Open Studio` → `https://www.jevahapp.com/creators/studio`  
(You may also add the mobile app store links if you already have them. Do not replace the web button.)

From-name: **Jevah**.  
Kind / log: `artist_onboard`.  
**No marketing unsubscribe footer** — this is a one-time “you’re approved” mail. Send even if they opted out of promos.

---

## 5. Suggested EJS body (simple, not technical)

```ejs
<%- include('_header') %>

<p>Hi <%= firstName %>,</p>

<p><strong>Welcome to Jevah. We’re glad you’re here.</strong></p>

<p>Whether you share music, ministry, a podcast, a message, or your story — Jevah is a place for your voice to reach people who need to hear it.</p>

<p>Your creator profile is ready. You can post your work, meet your listeners, and grow your community from here.</p>

<% if (optionalNote) { %>
  <p style="padding:12px 14px;background:#fff8e8;border:1px solid #f0d48a;border-radius:10px;"><%= optionalNote %></p>
<% } %>

<p><strong>Here’s what you can do next:</strong></p>

<p>🎙️ <strong>Share your work</strong><br>
Upload a song, sermon, podcast, teaching, or anything you’ve made.</p>

<p>🌍 <strong>Reach more people</strong><br>
Let people outside your usual circle find you on Jevah.</p>

<p>💬 <strong>Build your community</strong><br>
Connect with the people who listen, watch, follow, and believe in what you do.</p>

<p>🚀 <strong>Keep going</strong><br>
Show up, keep creating, and let the journey unfold.</p>

<p>When you’re ready, open Studio and add your first upload. People will be able to find you on Jevah.</p>

<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
  <tr>
    <td bgcolor="#256E63" style="border-radius:12px;">
      <a href="<%= studioUrl %>"
         style="display:inline-block;padding:12px 22px;color:#ffffff;font-weight:700;text-decoration:none;">
        Open Studio
      </a>
    </td>
  </tr>
</table>

<p><strong>Your next chapter starts here.</strong></p>
<p>Welcome to Jevah, <%= firstName %>.</p>
<p><strong>Create. Connect. Inspire.</strong></p>
<p>The Jevah Team</p>
```

---

## 6. How the frontend triggers this

### A. Activate creator (Artists page)

`PATCH /api/admin/artists/:id` (or your existing activate / verification route):

```json
{
  "status": "active",
  "isActive": true,
  "isVerified": true,
  "sendOnboardEmail": true,
  "onboardTemplate": "creator_welcome_v1",
  "onboardSubject": "Welcome to Jevah, Ibrahim",
  "onboardMessage": "Studio is ready — add your first song when you want."
}
```

If `sendOnboardEmail` is true, queue **this** template, interpolate `{{firstName}}`, insert `onboardMessage` only if it is non-empty, and set `onboardEmailSentAt`.

### B. Bulk welcome

`POST /api/admin/email/artist-onboard`

```json
{
  "segment": "active_missing_onboard",
  "templateId": "creator_welcome_v1",
  "subject": "Welcome to Jevah, {{firstName}}",
  "message": "",
  "dryRun": false,
  "limit": 100
}
```

`message` = optional personal note for everyone in the batch. Still interpolate `{{firstName}}` **per recipient**.

---

## 7. Worked example (Ibrahim, no extra note)

**Subject:** Welcome to Jevah, Ibrahim

```
Hi Ibrahim,

Welcome to Jevah. We’re glad you’re here.

Whether you share music, ministry, a podcast, a message, or your story — Jevah is a place for your voice to reach people who need to hear it.

Your creator profile is ready. You can post your work, meet your listeners, and grow your community from here.

Here’s what you can do next:

🎙️ Share your work
Upload a song, sermon, podcast, teaching, or anything you’ve made.

🌍 Reach more people
Let people outside your usual circle find you on Jevah.

💬 Build your community
Connect with the people who listen, watch, follow, and believe in what you do.

🚀 Keep going
Show up, keep creating, and let the journey unfold.

When you’re ready, open Studio and add your first upload. People will be able to find you on Jevah.

Your next chapter starts here.

Welcome to Jevah, Ibrahim.

Create. Connect. Inspire.

The Jevah Team
```

---

## 8. Done when

- [ ] Ibrahim-style activate email no longer mentions catalogs, beds, hub, or intent → upload → finalize  
- [ ] Subject is `Welcome to Jevah, {firstName}`  
- [ ] Cloudinary logo is in the header  
- [ ] **Open Studio** goes to `https://www.jevahapp.com/creators/studio`  
- [ ] Optional admin note appears only when provided  
- [ ] Same template for activate + Welcome artists  
- [ ] Logged as `artist_onboard`  
- [ ] No promo unsubscribe footer  

Ship this EJS swap. Frontend already previews this letter and sends `onboardTemplate: creator_welcome_v1`.
