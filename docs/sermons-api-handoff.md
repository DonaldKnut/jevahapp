# Handoff: Public Sermons API (Jevah Web)

## Context

The marketing site page `/sermons` is currently a **theme-aware landing page only**. It does **not** fetch sermons — there is no sermon client in the web app yet.

We want a real catalog so `/sermons` can list and play messages (same pattern as `/music` → `/music/tracks` and `/audio/copyright-free`).

Admin already has a **Categories** registry that includes `sermons`. Prefer reusing the media/audio stack rather than inventing a totally separate product silo — unless sermons need video + speaker metadata that tracks don’t cover.

---

## Recommended approach (pick one)

### Option A — Preferred: Media/tracks filtered by category (fastest)

Treat sermons as **published media/tracks** with `category = "sermons"` (slug from Categories).

| | |
|---|---|
| **Pros** | Reuses upload, storage, processing, admin Audio Library, categories |
| **Cons** | Track fields are music-oriented (`artistName`); map speaker → `artistName` or add optional sermon fields |

### Option B — Dedicated Sermons resource (cleaner long-term)

New `Sermon` model + `/sermons` routes, still sharing the same storage/presign pipeline as audio.

| | |
|---|---|
| **Pros** | Clear speaker/church/scripture/series fields, video vs audio |
| **Cons** | More work; still should plug into Categories + admin moderation |

**Recommendation:** Start with **Option A** if sermons are mostly audio. Use **Option B** if you need video, series, church, scripture as first-class fields.

---

## Public endpoints the web needs

- Base URL: same API host the web already uses
- Auth: **public read** (`auth: false`)
- Write stays admin/creator-only

### 1. List sermons

`GET /sermons`

*(or `GET /music/tracks?category=sermons&visibility=published` if Option A)*

#### Query params

| Param | Type | Notes |
|--------|------|--------|
| `page` | number | default `1` |
| `limit` | number | default `20`, max `50` |
| `search` | string | title, speaker, church |
| `topic` / `series` | string | optional |
| `language` | string | optional |

#### Response shape

Match existing unwrap style: `{ success, data }` or `{ data: { items, total } }`.

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "…",
        "title": "Walking in Faith Through Trials",
        "speaker": "Pastor Michael Johnson",
        "church": "Grace Community Church",
        "description": "…",
        "scripture": "James 1:2-4",
        "series": "Faith Under Fire",
        "durationSec": 2732,
        "thumbnailUrl": "https://…",
        "playbackUrl": "https://…signed-or-cdn…",
        "mediaType": "audio",
        "category": "sermons",
        "language": "en",
        "publishedAt": "2026-07-20T10:00:00.000Z",
        "playCount": 1250,
        "processingStatus": "ready"
      }
    ],
    "total": 42,
    "page": 1,
    "limit": 20
  }
}
```

#### Rules

- Only return `visibility: published` + `processingStatus: ready` (or equivalent)
- `playbackUrl` must be playable by browser (`<audio>` / `<video>`) — signed URL OK with expiry
- Never return draft/private admin-only objects on public routes

### 2. Sermon detail

`GET /sermons/:id`

Same object as list item (plus optional longer description / transcript later).

### 3. Optional: featured

`GET /sermons/featured` → 1–3 items for the hero shelf.

### 4. Optional: topics

`GET /sermons/topics`

```json
[
  { "slug": "prayer", "label": "Prayer", "count": 12 }
]
```

Can derive from tags/series or Categories children.

---

## Admin / ingest (so content actually exists)

Either:

**A)** Admin uploads via existing Audio Library with **category = sermons**, and public list filters that category.

**B)** Dedicated admin routes:

- `POST /admin/sermons` (or upload-intent + finalize like tracks)
- `PATCH /admin/sermons/:id`
- `DELETE /admin/sermons/:id`
- List in admin console under Audio or a Sermons page later

Upload flow should mirror tracks if possible:

1. `POST …/upload-intent` → `{ sermonId, audio: { putUrl, headers }, cover? }`
2. Client `PUT` to presigned URL
3. `POST …/finalize` → publish / process

---

## Suggested schema

Option B fields; Option A can store extras in metadata.

| Field | Required | Notes |
|--------|----------|--------|
| `title` | yes | |
| `speaker` | yes | map to `artistName` if reusing tracks |
| `church` | no | |
| `description` | no | |
| `scripture` | no | free text e.g. `James 1:2-4` |
| `series` | no | |
| `category` | yes | `"sermons"` |
| `mediaType` | yes | `audio` \| `video` |
| `durationSec` | no | |
| `thumbnailUrl` | no | |
| `playbackUrl` / storage key | yes after ready | |
| `language` | no | default `en` |
| `visibility` | yes | `draft` \| `published` \| `archived` |
| `processingStatus` | yes | `pending` \| `processing` \| `ready` \| `failed` |
| `publishedAt` | when published | |
| `createdBy` | admin/creator id | |

---

## Categories

- Ensure `sermons` exists in `/admin/categories` (web already seeds defaults including `sermons`)
- Public list should key off **slug/name** consistently (`sermons`, not mixed casing)

---

## Auth & security

- Public: read published only
- Admin: create/update/delete + drafts
- Creators: only if ministers upload teaching via Creator Studio — then same moderation path as artist tracks (`pending` → admin activate/publish)
- Signed URLs preferred over open bucket listing
- Rate-limit public list/search

---

## What frontend will do once this lands

1. Add `fetchSermons()` / `fetchSermon(id)` in web services (mirror `fetchMusicTracks`)
2. Replace the marketing-only shelf on `/sermons` with real list + player
3. Keep dark/light theme tokens; no change needed on backend for theming

**Minimal contract to unblock web:**

`GET /sermons?page&limit&search` returning the `items[]` shape above with playable `playbackUrl`.

---

## Acceptance checks

- [ ] Empty DB → `{ items: [], total: 0 }` (not 500)
- [ ] Drafts never appear on public GET
- [ ] Failed processing never appear as playable
- [ ] Pagination `total` correct
- [ ] CORS OK for the Vite/prod web origin
- [ ] At least one seeded published sermon for QA

---

## Question for backend

Confirm **Option A** (filter tracks by `category=sermons`) vs **Option B** (new `/sermons` resource).

Web will adapt either way; **Option A** is faster if audio-only is enough for v1.
