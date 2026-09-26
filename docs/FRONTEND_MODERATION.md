# Frontend — complete moderation system consume guide

**Audience:** Jevah admin web (Vite/React)  
**Last updated:** 26 September 2026  
**This file is the source of truth** for wiring the moderation console. Do not invent a second handoff.

The full contract (lanes, reports inbox, track sibling, QA script) lives with the backend handoff the team shared. This repo implements that contract as follows.

## Play from `preview` only

Admin role does **not** unlock playback. The browser `GET`s Cloudflare R2 / CDN with no Bearer token.

`preview.mediaUrl` is often filled as `hlsUrl || playbackUrl || fileUrl`. If an `.m3u8` exists, `mediaUrl` is HLS even when `preview.playbackUrl` is an MP4. Never do `<video src={preview.mediaUrl}>`.

Use `resolveAdminPlayable()` in `src/lib/mediaParts/preview.ts`:

1. Videos / sermons → progressive MP4 (`playbackUrl`, then non-HLS `mediaUrl`)
2. HLS (`.m3u8`) only if there is no MP4 — do not put it in a plain `<video>`
3. Music / audio → `<audio>`
4. Ebook / books → Open file (`window.open`), never `<video>`
5. Processing (`queued` / `processing` / `pending`) and no HTTP MP4 → “Still processing”
6. On player error → `POST /admin/media/:id/preview-refresh` once
7. `X-Amz-Signature` with `signed: false` after a failed refresh → stale stored link; ask backend to heal

## Canonical endpoints this UI consumes

| Need | Consume |
|------|---------|
| Queue list | `GET /admin/moderation/queue` → `data.media` or `data.items` |
| Review pane | `GET /admin/moderation/:id` → `data.media` + `data.moderationCase` |
| Play / thumbnail | `data.media.preview` only |
| Decide | `PATCH /admin/moderation/:id/status` |
| Bulk decide | `POST /admin/moderation/bulk` |
| Refresh player URL | `POST /admin/media/:id/preview-refresh` |
| AI evidence | `GET /admin/moderation/:id/case` |
| Assign | `PATCH /admin/moderation/:id/assign` |
| Notes | `GET` / `POST /admin/moderation/:id/notes` |
| Re-run AI | `POST /admin/moderation/:id/rerun` |
| Edit labels | `PATCH /admin/media/:id` |
| Hard-delete | `DELETE /admin/media/:id` |
| Search / recent | `GET /admin/media/search` · `GET /admin/media/recent` |
| Reports | `GET /admin/reports*` |
| Track review | `PATCH /admin/audio/tracks/:id/moderation` |
| Ban | `POST /admin/users/:id/ban` |

Do **not** play from public `GET /api/media/:id`, raw `fileUrl` on the card root, or cached signed URLs from yesterday.

## Keyboard (review pane)

`A` approve · `R` reject · `H` hold · `J` / `K` next / prev · `Esc` close

## Queue default

Omit `status` so the API returns `pending` **and** `under_review` (“Needs review”).
