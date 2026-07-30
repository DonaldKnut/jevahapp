# Backend Handoff — What the Admin Dashboard Still Needs

**Audience:** `jevahapp-backend` team  
**From:** Jevah web admin frontend (Vite/React)  
**Date:** 29 July 2026  
**Goal:** Make this a serious, secure, comprehensive admin console — not a thin CRUD shell.

The frontend is largely wired. Gaps below are **backend contracts, protections, and new endpoints** required for a dope dashboard.

---

## 0. How to read this

| Priority | Meaning |
|----------|---------|
| **P0** | Blockers / security holes — do first |
| **P1** | Core ops quality (moderation, reports, users) |
| **P2** | Platform management power features |
| **P3** | Nice-to-have / scale / realtime |

Assume every `/api/admin/*` route already uses:

```http
Authorization: Bearer <accessToken>
```

and `requireAdmin` (role `admin` only — **not** moderator).

Canonical response shape (keep consistent):

```json
{ "success": true, "data": { ... } }
```

Errors:

```json
{ "success": false, "message": "Human-readable reason" }
```

With status codes: `400` / `401` / `403` / `404` / `409` / `429` / `500`.

---

## 1. P0 — Security & master account (must)

Frontend currently treats `support@jevahapp.com` as master **in the client only**. That is not security.

### 1.1 Hard-protect the master account

**Constant:** `SUPER_ADMIN_EMAIL = support@jevahapp.com` (env-configurable)

Backend **must refuse**:

| Action | Endpoint | Required behaviour |
|--------|----------|-------------------|
| Ban master | `POST /api/admin/users/:id/ban` | `403` — “Cannot ban master support account” |
| Demote master | `PATCH /api/admin/users/:id/role` | `403` if target is master and `role !== "admin"` |
| Delete master | `DELETE /api/users/:userId` | `403` |
| Self-demotion by non-master | `PATCH .../role` | Only master may set/unset `admin` |

### 1.2 Who can promote admins

```http
PATCH /api/admin/users/:id/role
{ "role": "admin" }
```

| Caller | Can set `role: "admin"`? | Can demote an admin? |
|--------|--------------------------|----------------------|
| Master (`support@…`) | Yes | Yes (except self) |
| Other admins | **No** → `403` | **No** → `403` |
| Moderator | Never touches `/api/admin/*` | — |

Optional body for audit:

```json
{ "role": "admin", "reason": "Trusted ops hire" }
```

### 1.3 Seed / bootstrap

Ensure Mongo user exists:

```json
{
  "email": "support@jevahapp.com",
  "role": "admin",
  "isEmailVerified": true,
  "isBanned": false,
  "password": "<bcrypt>"
}
```

Add field (recommended):

```ts
isSuperAdmin?: boolean  // true only for support@
// or derive strictly from email/env — either is fine if enforced server-side
```

### 1.4 Auth hardening (dashboard-grade)

| Item | Spec |
|------|------|
| Login | `POST /api/auth/login` — already used |
| Me | `GET /api/auth/me` — must return `role`, `email`, `id`, verification flags, `isBanned` |
| Refresh | `POST /api/auth/refresh` — stable; document cookie vs body |
| Logout | `POST /api/auth/logout` — revoke refresh / blacklist access if you have one |
| Rate limit | Login: e.g. 10/min/IP + 5/min/email |
| Lockout | Temporary lock after N failures; never lock master permanently without recovery path |
| Banned admin | `verifyToken` → `403` (already noted) — keep |
| CORS | Explicit allowlist for admin web origins (localhost:5173 + production domain) |
| Admin JWT claims | Prefer short-lived access token + refresh; include `role` in claims |

### 1.5 Audit everything sensitive

Every admin mutation must write an audit row consumed by:

- `GET /api/admin/activity` (current admin)
- Prefer also `GET /api/admin/activity?scope=all` for master (see §5)

Minimum fields:

```ts
{
  actorId, actorEmail,
  action,           // ban_user | change_role | approve_media | resolve_report | ...
  targetType,       // user | media | report | church | song | system
  targetId,
  meta: object,
  ip?, userAgent?,
  createdAt
}
```

---

## 2. Already expected by frontend (confirm / harden)

These are **called today**. Backend should confirm they match shapes, are stable, and are fully admin-gated.

### 2.1 Auth

| Method | Path |
|--------|------|
| POST | `/api/auth/login` |
| GET | `/api/auth/me` |
| POST | `/api/auth/logout` |
| POST | `/api/auth/refresh` |

### 2.2 Dashboard

| Method | Path | Notes |
|--------|------|------|
| GET | `/api/admin/dashboard/analytics` | Wrap in `{ success, data }` — frontend unwraps both |
| GET | `/api/admin/dashboard/feed?limit=` | Include `onlineCount` if available |
| GET | `/api/admin/media/recent` | Prefer `AdminMediaCard` shape + `preview.*` |
| GET | `/api/admin/users/presence` | `status=online\|offline\|all` |

### 2.3 Users

| Method | Path |
|--------|------|
| GET | `/api/admin/users` |
| GET | `/api/admin/users/presence` |
| POST | `/api/admin/users/:id/ban` `{ reason, duration? }` |
| POST | `/api/admin/users/:id/unban` |
| PATCH | `/api/admin/users/:id/role` `{ role }` |
| PATCH | `/api/admin/users/:id/verification` |
| POST | `/api/admin/email` |

### 2.4 Moderation

| Method | Path |
|--------|------|
| GET | `/api/admin/moderation/queue` |
| GET | `/api/admin/moderation/:id` |
| GET | `/api/admin/moderation/:id/case` |
| PATCH | `/api/admin/moderation/:id/status` |
| PATCH | `/api/admin/media/:id` |
| DELETE | `/api/admin/media/:id` |

### 2.5 Reports

| Method | Path |
|--------|------|
| GET | `/api/admin/reports` |
| GET | `/api/admin/reports/media/:reportId` |
| POST | `/api/admin/reports/media/:reportId/review` |
| DELETE | `/api/admin/reports/media/:mediaId/content` |
| GET | `/api/admin/reports/comments` |
| POST | `/api/admin/reports/comments/:commentId/hide` |
| POST | `/api/admin/reports/comments/:commentId/unhide` |
| POST | `/api/admin/reports/comments/:commentId/dismiss` |

### 2.6 Catalog

| Method | Path |
|--------|------|
| GET | `/api/admin/churches` |
| PATCH | `/api/admin/churches/:id/verification` |
| POST | `/api/churches` |
| GET | `/api/audio/copyright-free` |
| POST | `/api/audio/copyright-free` |
| PUT | `/api/audio/copyright-free/:songId` |
| DELETE | `/api/audio/copyright-free/:songId` |

### 2.7 Activity

| Method | Path |
|--------|------|
| GET | `/api/admin/activity` |

**Ask backend to publish a short “contract freeze” checklist** (status 200 samples for each). Frontend will fix any field mismatches quickly once samples are shared.

---

## 3. P1 — Moderation: make it excellent

Docs already cover core approve/reject. To feel *dope*, add the following.

### 3.1 Bulk moderation

```http
POST /api/admin/moderation/bulk
{
  "mediaIds": ["…", "…"],
  "status": "approved" | "rejected" | "under_review",
  "adminNotes": "optional"
}
```

Max 50 IDs. Partial success response:

```json
{ "success": true, "data": { "updated": ["…"], "failed": [{ "id": "…", "message": "…" }] } }
```

### 3.2 Refresh signed preview (critical for player)

Frontend plays `preview.mediaUrl`. When `signed: true`, URLs expire (~3600s).

```http
POST /api/admin/media/:id/preview-refresh
```

Returns updated `AdminMediaCard.preview` only (or full card).

### 3.3 Force re-run AI moderation

```http
POST /api/admin/moderation/:id/rerun
{ "reason": "Admin requested new scan" }
```

Enqueues worker; returns `{ jobId }` or updated case soon after.

### 3.4 Admin notes thread (optional but strong)

```http
GET  /api/admin/moderation/:id/notes
POST /api/admin/moderation/:id/notes
{ "body": "Checked frames 3–6; false positive" }
```

Persist author + timestamp. Don’t overwrite a single string forever.

### 3.5 Escalation / assign

```http
PATCH /api/admin/moderation/:id/assign
{ "assigneeId": "adminUserId" | null }
```

Queue list should return `assignee` so the UI can show “Mine / Unassigned”.

### 3.6 Moderation analytics slice

Extend analytics `data.moderation` with:

```json
{
  "pending": 0,
  "under_review": 0,
  "rejected": 0,
  "approvedToday": 0,
  "avgReviewMinutes": 12.4,
  "byFlag": { "sexual_content": 3, "violence": 1 }
}
```

### 3.7 Stable `AdminMediaCard` everywhere

Single shape for queue, detail, recent, report detail. Frontend depends on:

- `preview.mediaUrl` / `thumbnailUrl` / `signed` / `expiresInSeconds`
- `moderationStatus`, `publicationState`, `isHidden`
- `moderationResult`, `processing`, `uploader`, `reportCount`

No silent shape drift between endpoints.

---

## 4. P1 — Reports inbox: close the loop

### 4.1 Confirm review semantics (already designed — enforce)

| Status | Effect |
|--------|--------|
| `dismissed` | Close report only |
| `reviewed` | Close report only |
| `resolved` | Hide media + notify uploader `content_moderation` |

### 4.2 Bulk report review

```http
POST /api/admin/reports/media/bulk-review
{
  "reportIds": ["…"],
  "status": "dismissed" | "reviewed" | "resolved",
  "adminNotes": "…"
}
```

### 4.3 Report timeline / SLA

On media report detail, include:

```json
{
  "sla": {
    "createdAt": "…",
    "ageHours": 14.2,
    "breached": false
  },
  "history": [
    { "at": "…", "actorEmail": "…", "action": "created|reviewed|resolved|…" }
  ]
}
```

### 4.4 Auto-escalation (backend job — no UI required first)

Already partially described (3+ reports → under_review + email). Ensure:

- Idempotent
- Audited
- Surfaces on feed as `report` / `review` events

### 4.5 Comment report parity

Return a shaped comment card (body preview truncated, author, `isHidden`, reportCount) on:

```http
GET /api/admin/reports/comments/:commentId
```

(Frontend can add a drawer once this exists.)

---

## 5. P1 — Users & trust / safety

### 5.1 User detail (frontend missing page — needs API first)

```http
GET /api/admin/users/:id
```

Return:

```json
{
  "user": { /* full profile + flags + ban + roles + verification */ },
  "stats": {
    "uploads": 0,
    "reportsAgainst": 0,
    "reportsFiled": 0,
    "comments": 0,
    "lastLoginAt": null,
    "lastSeenAt": null,
    "isOnline": false
  },
  "recentMedia": [ /* AdminMediaCard[] limit 10 */ ],
  "recentReports": [ /* against this user */ ],
  "moderationHistory": [ /* bans, role changes, verifies */ ]
}
```

### 5.2 Ban improvements

```http
POST /api/admin/users/:id/ban
{
  "reason": "Spam",
  "duration": 7,          // days; omit = permanent
  "shadowBan": false,     // optional: soft restrict without full lock
  "revokeSessions": true  // kick Socket.IO + invalidate refresh tokens
}
```

On ban with `revokeSessions: true`:

- Disconnect sockets
- Invalidate refresh tokens
- Optional: invalidate active access tokens if you have a denylist

### 5.3 Warn user (lighter than ban)

```http
POST /api/admin/users/:id/warn
{
  "subject": "Community guidelines",
  "message": "…",
  "sendEmail": true
}
```

Creates in-app notification + optional Resend email. Audited as `warn_user`.

### 5.4 Verification completeness

`PATCH /api/admin/users/:id/verification` — keep supporting all:

- `isVerifiedCreator`
- `isVerifiedVendor`
- `isVerifiedChurch`
- `isVerifiedArtist`

Validate at least one field. Sync `artistProfile.isVerifiedArtist` (already noted).

### 5.5 Impersonation — **do not build** unless product explicitly wants it

If ever: short-lived token, master-only, heavy audit, impossible to escalate. Default recommendation: **skip**.

---

## 6. P2 — Platform management APIs

These turn the console into a real platform control center.

### 6.1 Feature flags / remote config

```http
GET  /api/admin/config
PATCH /api/admin/config
{
  "uploadsEnabled": true,
  "registrationEnabled": true,
  "liveStreamingEnabled": true,
  "maintenanceMode": false,
  "maintenanceMessage": "Back soon",
  "minAppVersion": { "ios": "1.2.0", "android": "1.2.0" }
}
```

Mobile reads a public (or auth) config endpoint; admin writes here.

### 6.2 Announcements / broadcast

```http
POST /api/admin/announcements
{
  "title": "…",
  "body": "…",
  "channels": ["in_app", "email"],
  "audience": "all" | "artists" | "admins" | { "userIds": [] },
  "scheduleAt": null
}
GET /api/admin/announcements
DELETE /api/admin/announcements/:id
```

### 6.3 Content search for admins

```http
GET /api/admin/media/search?q=&contentType=&moderationStatus=&uploaderId=&from=&to=&page=&limit=
```

Returns paginated `AdminMediaCard[]`. Overview “search anything” depends on this.

### 6.4 Churches — finish catalog

Frontend has list / verify / create name+state. Still need admin-complete:

| Method | Path | Job |
|--------|------|-----|
| GET | `/api/admin/churches/:id` | Full detail + branches |
| PATCH | `/api/admin/churches/:id` | Edit name/location/meta |
| DELETE | `/api/admin/churches/:id` | Soft or hard delete |
| POST | `/api/churches/:id/branches` | Add branch (confirm admin-only) |
| PATCH | `/api/admin/churches/:id/branches/:branchId` | Edit branch |
| DELETE | `/api/admin/churches/:id/branches/:branchId` | Remove branch |
| POST | `/api/churches/bulk` | Bulk upsert (already listed — ensure `requireAdmin`) |

### 6.5 Audio library — admin list + pagination

Public `GET /api/audio/copyright-free` is fine for small sets. For admin scale:

```http
GET /api/admin/audio/copyright-free?search=&page=&limit=
```

CRUD remains admin-gated:

- POST / PUT / DELETE `/api/audio/copyright-free...`

Prefer multipart upload later (P3); URL-based create is OK for now.

### 6.6 Categories / taxonomy

```http
GET    /api/admin/categories
POST   /api/admin/categories
PATCH  /api/admin/categories/:id
DELETE /api/admin/categories/:id
```

Used when admins edit media metadata `category`.

### 6.7 Metrics beyond KPIs

```http
GET /api/admin/dashboard/timeseries?metric=signups|uploads|reports|activeUsers&range=7d|30d
```

Returns `{ points: [{ t, v }] }` for charts on Overview.

### 6.8 Email ops

`POST /api/admin/email` exists. Improve with:

```json
{
  "userIds": [],
  "emails": [],
  "subject": "",
  "message": "",
  "html": "",
  "templateId": "optional",
  "dryRun": false
}
```

Response:

```json
{ "accepted": 12, "rejected": [{ "email": "…", "reason": "…" }], "auditId": "…" }
```

Optional:

```http
GET /api/admin/email/log?page=&limit=
```

### 6.9 Notification center for admins

```http
GET  /api/admin/notifications?unread=true
POST /api/admin/notifications/read
{ "ids": ["…"] } | { "all": true }
```

Types already used: `content_report`, `moderation_alert`. Expose them in API so the shell can show a bell badge (instead of email-only).

---

## 7. P2 / P3 — Realtime & ops

### 7.1 Socket.IO for admins

```ts
io(SOCKET_URL, { auth: { token: accessToken } });
```

Emit to admin rooms:

| Event | Payload | UI use |
|-------|---------|--------|
| `admin:presence` | `{ onlineCount }` | Shell badge |
| `admin:report:new` | `{ reportId, kind }` | Toast + badge |
| `admin:moderation:new` | `{ mediaId }` | Queue bump |
| `admin:analytics:tick` | light KPI deltas | Optional |

Until then, frontend keeps 30–60s polling (already done).

### 7.2 Health & jobs (ops page)

```http
GET /api/admin/system/health
```

```json
{
  "api": "ok",
  "mongo": "ok",
  "redis": "ok",
  "storage": "ok",
  "queues": {
    "moderation": { "waiting": 3, "failed": 0 },
    "email": { "waiting": 0, "failed": 1 }
  },
  "version": "gitsha"
}
```

### 7.3 Failed jobs retry

```http
GET  /api/admin/system/jobs?status=failed
POST /api/admin/system/jobs/:id/retry
```

### 7.4 Full audit log

```http
GET /api/admin/activity?scope=all&actorId=&action=&from=&to&page=&limit=
```

Master sees org-wide; normal admin sees own (current behaviour).  
(`GET /api/logs/logs` can stay internal — prefer one admin-facing activity API.)

---

## 8. Response & pagination contract (please standardize)

Preferred list envelope:

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": { "page": 1, "limit": 20, "total": 100, "pages": 5 }
  }
}
```

Aliases frontend already tolerates: `users`, `media`, `reports`, `feed`, `activity`, nested `data`.  
**Pick one and stick to it** to reduce unwrap edge cases.

IDs: always string `id` (map `_id` → `id` in serializers).

---

## 9. Suggested backend delivery order

```text
Week 1 (P0)
  □ Master account seed + hard bans on ban/demote/delete
  □ Only master can promote/demote admins
  □ CORS + login rate limits
  □ Contract freeze samples for existing /admin routes

Week 2 (P1)
  □ preview-refresh
  □ User detail payload
  □ Ban revokeSessions
  □ Bulk moderation + bulk report review
  □ Comment report detail
  □ Org-wide activity for master

Week 3 (P2)
  □ Feature flags / maintenance mode
  □ Media admin search + timeseries
  □ Church full CRUD + branches
  □ Admin notifications API
  □ Email send log

Week 4 (P3)
  □ Socket.IO admin events
  □ System health + job retry
  □ AI rerun + assign
  □ Announcements
```

---

## 10. Explicit non-goals (don’t build unless asked)

- Replacing media binary via CMS (“replace video file”) — not offered; UI won’t support  
- Clerk-only admin login (no `accessToken`) — dashboard must stay email/password JWT  
- Letting `moderator` role call `/api/admin/*` in v1  

---

## 11. Definition of “dope dashboard” (acceptance)

Backend is done for v1 when an admin can:

1. Log in as `support@…`, promote another admin safely, never lose the master account  
2. See accurate KPIs + feed; drill into reports and queue  
3. Play staged/private media via signed preview; refresh when expired  
4. Approve / reject / hold / edit metadata / delete / ban from one flow  
5. Resolve / dismiss reports and see uploader notified  
6. Manage users (ban with session kill, verify, email, detail page data)  
7. Manage churches + copyright-free audio  
8. Put platform in maintenance mode / disable uploads via config  
9. Every action audited; sensitive actions rate-limited and 403-safe  
10. (Stretch) Live toast when a new report lands  

---

## 12. What frontend will build once these APIs land

| Backend delivers | Frontend follows with |
|------------------|------------------------|
| `GET users/:id` detail | User detail drawer/page |
| `preview-refresh` | Auto-refresh player |
| Bulk moderation/reports | Multi-select + bulk bar |
| `/admin/config` | Settings / kill-switch screen |
| Notifications API | Bell badge in shell |
| Timeseries | Overview charts |
| Socket admin events | Live badges (drop polling) |
| System health | Ops page |
| Church full CRUD | Expand Churches UI |
| `GET .../comments/:id` | Comment report detail drawer |

---

## 13. Contact / samples needed from backend

Please return:

1. OpenAPI or Postman collection for `/api/admin/*`  
2. Example JSON for: analytics, queue item (`AdminMediaCard`), media report detail, user list item  
3. Confirmation that `support@jevahapp.com` is seeded and protected  
4. Production `VITE_API_URL` + CORS origins to allow  

---

**Bottom line:** Core admin/moderation endpoints are largely in place. To make this console *elite*, backend must (1) **hard-enforce master + role security**, (2) **stabilize card/pagination contracts**, (3) add **preview refresh, user detail, bulk actions, session-killing bans**, then (4) unlock **platform config, search, notifications, health, and sockets**. Frontend is ready to consume them.
