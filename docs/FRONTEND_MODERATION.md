# Frontend — complete moderation system consume guide

**Audience:** Jevah admin web (Vite/React) + Creator Studio  
**Last updated:** 27 September 2026  
**This file is the source of truth** for wiring the moderation console and the creator song rights / gospel gate. Do not invent a second handoff.

Companions (do **not** mix their endpoints into this UI unless noted):

| Doc | Use |
|-----|-----|
| [FRONTEND_ADMIN.md](./FRONTEND_ADMIN.md) | Login, dashboard KPIs, users, churches, email |
| [FRONTEND_CREATOR_NOTIFICATIONS_HANDOFF.md](./FRONTEND_CREATOR_NOTIFICATIONS_HANDOFF.md) | What the **uploader** sees after you decide |
| [r2-browser-upload-cors-handoff.md](./r2-browser-upload-cors-handoff.md) | Bucket CORS so the admin / Studio origin can `GET` / `PUT` |

---

## 0. What you are building

Admins review **two content-safety lanes** plus one **music-track** sibling. All three write the same Mongo collections the public app reads. There is no separate “admin media” store.

| Lane | Meaning | Primary screen | Consume these APIs |
|------|---------|----------------|--------------------|
| **Upload queue** | New videos / sermons / ebooks / music Media held by AI or pending human | `/admin/moderation` | `/api/admin/moderation/*` + `/api/admin/media/*` |
| **Reports inbox** | Users flagged **already-published** media or comments | `/admin/reports` | `/api/admin/reports/*` |
| **Track review** | Copyright-free / artist tracks (different collection) | `/admin/audio` Artist Catalog | `/api/admin/audio/tracks/:id/moderation` |

Admin role does **not** unlock playback. The browser loads the file from Cloudflare R2 / CDN with no Bearer token.

---

## 1. Auth (every call)

```http
Authorization: Bearer <accessToken>
```

- Login: `POST /api/auth/login` → enter dashboard only if `user.role === "admin"`.
- Boot: `GET /api/auth/me`.
- Base URL: `VITE_API_URL` must include `/api`.

---

## 2. Creator Studio — song rights + gospel gate

Signing up as a creator and uploading someone else’s secular song used to work. The API stamped `copyrightStatus: original` with no checkbox. We cannot prove ownership from audio. We **can** refuse the upload unless they attest, then hear the track and keep non-gospel songs off the public shelf.

This does **not** replace a lawyer or Content ID. It creates a dated legal record and blocks the easy “upload Drake” path.

### What Studio must show before Publish

Copy comes from `GET /api/creators/me` → `uploadPolicy` (always render that text; fallback copy is last resort only):

| Field | UI |
|--------|-----|
| `rightsAttested` | Checkbox. Label = `uploadPolicy.rightsCopy` |
| `gospelAttested` | Checkbox. Label = `uploadPolicy.gospelCopy` |
| `rightsType` | Required select: `original` \| `licensed` \| `public_domain` |
| `licenseNote` | Required **only** when `rightsType=licensed` |

Do **not** enable upload / send-for-review until both boxes are checked and `rightsType` is set. Do **not** send a fake `copyrightStatus: "original"` default.

### Intent body (breaking)

`POST /api/creators/tracks/upload-intent`

```json
{
  "title": "Still Waters",
  "artistName": "Grace Collective",
  "genre": "gospel",
  "category": "worship",
  "language": "en",
  "contentType": "audio/mpeg",
  "fileName": "still-waters.mp3",
  "fileSizeBytes": 5242880,
  "rightsAttested": true,
  "gospelAttested": true,
  "rightsType": "original",
  "licenseNote": null
}
```

Missing attestation → **400**, no `putUrl`:

| `code` | Meaning |
|--------|---------|
| `RIGHTS_ATTESTATION_REQUIRED` | Rights box not checked |
| `GOSPEL_ATTESTATION_REQUIRED` | Gospel box not checked |
| `INVALID_RIGHTS_TYPE` | Not `original` / `licensed` / `public_domain` |
| `LICENSE_NOTE_REQUIRED` | Licensed without a note |

Show `message` under the checkboxes.

Admin curated upload-intent is unchanged (no checkboxes).

### After finalize (product)

Same idea as video: creator PUT → we hear it → it does **not** appear on the public shelf until a human accepts.

1. Guardian **hears** the file (Whisper). Title alone cannot approve.
2. Heard but **not** gospel / off-theme → `rejected`. Studio stays `draft`.
3. Heard as possible gospel, or could not hear / gray → `under_review`, stays **`draft`**. Admin must play the song then `PATCH /admin/audio/tracks/:id/moderation` with `heardConfirmed: true`.
4. Creator AI never sets `approved`. Songs do not “just appear.”

| `moderationStatus` | Public catalog | Studio |
|--------------------|----------------|--------|
| `approved` | Yes if they asked to publish | Live |
| `under_review` | No | “In review” |
| `rejected` | No | “Not published” + creator-facing reason |
| `pending` | No | Still uploading |

Creator-facing reject/hold copy: *Jevah publishes worship, Scripture, and teaching centered on Jesus Christ.*

This does **not** fingerprint Billboard / YouTube Content ID. A liar can still check the box. We store `rightsAttestation` (who, when, policy version) for takedowns and admin.

---

## 3. Always consume (canonical)

| Need | Consume |
|------|---------|
| Queue list | `GET /api/admin/moderation/queue` → `data.media` or `data.items` |
| One item in the review pane | `GET /api/admin/moderation/:id` → `data.media` + `data.moderationCase` |
| Play / thumbnail | `data.media.preview` only |
| Decide | `PATCH /api/admin/moderation/:id/status` |
| Bulk decide | `POST /api/admin/moderation/bulk` |
| Refresh a dead player URL | `POST /api/admin/media/:id/preview-refresh` |
| AI evidence | `GET /api/admin/moderation/:id/case` |
| Assign reviewer | `PATCH /api/admin/moderation/:id/assign` |
| Internal notes thread | `GET` / `POST /api/admin/moderation/:id/notes` |
| Re-run AI | `POST /api/admin/moderation/:id/rerun` |
| Edit labels (not the file) | `PATCH /api/admin/media/:id` |
| Hard-delete the file | `DELETE /api/admin/media/:id` |
| Find any media | `GET /api/admin/media/search` |
| Latest uploads widget | `GET /api/admin/media/recent` |
| Reports list | `GET /api/admin/reports` |
| Media report drawer | `GET /api/admin/reports/media/:reportId` |
| Close a media report | `POST /api/admin/reports/media/:reportId/review` |
| Comment report drawer | `GET /api/admin/reports/comments/:commentId` |
| Hide / unhide / dismiss comment | `POST /api/admin/reports/comments/:commentId/{hide\|unhide\|dismiss}` |
| Track approve / reject | `PATCH /api/admin/audio/tracks/:id/moderation` |
| Ban uploader | `POST /api/admin/users/:id/ban` |

### Do not consume for this UI

| Tempting field / route | Why not |
|------------------------|---------|
| `GET /api/media/:id` or public feed cards | Hidden / pending / staged items are filtered out |
| Raw `fileUrl` / `playbackUrl` / `hlsUrl` on a public serializer | Admin cards wrap the right URL in `preview` |
| Stored signed URLs cached yesterday | They die in ~1 hour |
| `/api/media/reports/*` | Legacy. Use `/api/admin/reports/*` |
| Putting `preview.hlsUrl` (`.m3u8`) into a plain `<video src>` | Chrome/Edge cannot play HLS without hls.js |
| Sending the admin JWT to R2 | Playback is a naked `GET` of `preview.mediaUrl` |

---

## 4. How to play media in the admin dashboard

Use `resolveAdminPlayable()` in `src/lib/mediaParts/preview.ts`.

1. **Videos / sermons:** `<video controls playsInline preload="metadata">` with progressive MP4 (`preview.playbackUrl`, then non-HLS `mediaUrl`).
2. **HLS** only if there is no MP4 — do not put `.m3u8` in a plain `<video>`.
3. **Music / audio:** `<audio controls src={url}>`.
4. **Ebook / books:** “Open file” → `window.open(url)`. Never a video player.
5. **Processing:** if `processing.status` is `queued` / `processing` / `pending` and there is no HTTP MP4, show “Still processing”.
6. On player `error` → `POST /admin/media/:id/preview-refresh` once.
7. `X-Amz-Signature` with `signed: false` after a failed refresh → stale stored link; ask backend to heal.

`preview.mediaUrl` is often filled as `hlsUrl || playbackUrl || fileUrl`. If an `.m3u8` exists, `mediaUrl` is HLS even when `preview.playbackUrl` is an MP4.

---

## 5. Screen: Moderation queue

- List: `GET /api/admin/moderation/queue` — omit `status` so the API returns `pending` **and** `under_review` (“Needs review”).
- Detail: `GET /api/admin/moderation/:mediaId` → `media` + `moderationCase`.
- Decide: `PATCH /api/admin/moderation/:mediaId/status` with `approved` / `rejected` / `under_review` / `pending`.
- Keyboard: `A` approve · `R` reject · `H` hold · `J` / `K` next / prev · `Esc` close.

Public feed visibility: `moderationStatus === "approved"` **and** `isHidden !== true` **and** `publicationState` not in `draft | staged | publishing | tombstoned`.

---

## 6. Screen: Reports inbox

Reports are a **different** collection from the upload queue. A live video that users flag appears here even if `moderationStatus` is already `approved`.

- List: `GET /api/admin/reports?type=all&status=pending`
- Play on detail: `GET /api/admin/reports/media/:reportId` → `data.media.preview`
- Close: `POST /api/admin/reports/media/:reportId/review` (`dismissed` / `reviewed` / `resolved`)
- Comments: hide / unhide / dismiss on `/api/admin/reports/comments/:commentId/*`

---

## 7. Artist-track moderation (sibling lane)

**Screen:** `/admin/audio/artist-review` (nav: **Creator songs**). Not the video queue.

Tracks live in `CopyrightFreeSong`, not `Media`. Do not send a track id to `/api/admin/moderation/:id`.

`lane=artist` is **required** on the list. Omit it and the API defaults to curated beds — the inbox looks empty.

```http
GET   /api/admin/audio/tracks?lane=artist&moderationStatus=under_review&page=1&limit=20
GET   /api/admin/audio/tracks/:id
PATCH /api/admin/audio/tracks/:id/moderation
{
  "status": "approved" | "rejected" | "under_review",
  "heardConfirmed": true,
  "reason": "optional"
}
DELETE /api/admin/audio/tracks/:id
```

Tabs: In review (`under_review`) · Rejected · Live (`approved`) · All (`lane=artist` only).

- Play in `<audio>` from `playbackUrl` / `audioUrl` / `fileUrl`. Never `<video>`. `pending://` → “File not uploaded”, Approve disabled.
- **Approve** only after ~20% played or `ended`, then `heardConfirmed: true`. Missing flag → `400 ADMIN_MUST_HEAR_TRACK`.
- Reject / hold do **not** require a listen.
- `approved` + `heardConfirmed` → public Artists shelf. Do not treat FE `visibility: "public"` as live while status is still `under_review`.
- `rejected` → stays `draft`, off the public shelf.

---

## 8. `adminApi.ts` methods

```ts
getModerationQueue(params)
getModerationMedia(mediaId)
getModerationCase(mediaId)
updateModerationStatus(mediaId, { status, adminNotes? })
bulkUpdateModeration(payload)
assignModeration(mediaId, { assigneeId })
getModerationNotes(mediaId)
addModerationNote(mediaId, { body })
rerunModeration(mediaId, { reason? })
refreshMediaPreview(mediaId)
updateMediaMetadata(mediaId, fields)
deleteMedia(mediaId)
searchAdminMedia(params)
getRecentMedia(params)
getReports(params)
getMediaReportDetail(reportId)
reviewMediaReport(reportId, { status, adminNotes? })
bulkReviewMediaReports(payload)
deleteReportedMedia(mediaId)
listCommentReports(params)
getCommentReportDetail(commentId)
hideComment(commentId, { reason? })
unhideComment(commentId)
dismissCommentReports(commentId)
listAdminTracks(params)
reviewTrackModeration(trackId, { status, reason?, heardConfirmed? })
banUser(userId, { reason, duration?, revokeSessions? })
```

---

## 9. Error handling

| Status | `code` (when present) | UI |
|--------|------------------------|-----|
| 401 | — | Clear session → `/login` |
| 403 | — | Not admin / banned |
| 404 | — | Toast + drop the row |
| 400 | `NO_MEDIA_SOURCE` | Cannot re-run AI — no file |
| 400 | `ADMIN_MUST_HEAR_TRACK` | Disable Approve until they listen |
| 400 | `RIGHTS_ATTESTATION_REQUIRED` / `GOSPEL_ATTESTATION_REQUIRED` / `INVALID_RIGHTS_TYPE` / `LICENSE_NOTE_REQUIRED` | Show `message` under Studio checkboxes |
| 400 | — | Show `message` |
| 500 | — | Retry button |

---

## 10. Smoke

**Studio**

1. Creator with boxes **unchecked** → intent 400, no R2 PUT.
2. Boxes checked, secular mp3 → finalize `rejected` or `under_review`, not on `GET /api/music/tracks?lane=artist`.
3. Own worship song that names Jesus → still `under_review` until admin listens and approves. Then public.

**Admin**

1. Admin login (`role: "admin"`) → Overview KPIs load.
2. Open `/admin/audio/artist-review` → In review lists the creator upload (`lane=artist`).
3. Approve without play → button disabled; if forced, `400 ADMIN_MUST_HEAR_TRACK`.
4. Play ~20% or finish, then approve with `heardConfirmed: true` → song on `GET /api/music/tracks?lane=artist`.
5. Queue / reports still play from `preview` (MP4 first). Ebooks open in a new tab.

---

**Bottom line:** Studio must attest rights + gospel before intent. Songs stay draft until a human hears them. Consume `/api/admin/moderation/*`, `/api/admin/media/*`, and `/api/admin/reports/*`. Play from `preview`, but **never** blindly stuff `preview.mediaUrl` into `<video>` — prefer `preview.playbackUrl` (MP4), refresh signed URLs on error, and keep ebooks/audio out of the video element.
