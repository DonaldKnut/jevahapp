# Backend handoff — Creator Studio (web desk)

**Date:** 2026-08-14  
**Audience:** `jevahapp-backend`  
**Frontend:** `/creators/studio` (Desk · Catalog · Discography · Insights · Artist)  
**Status:** UI is live against existing `/creators/me`, `/creators/me/tracks`, `/creators/releases*`, and a **soft-fail** `/creators/me/analytics`. Gaps below are what the desk still fakes, hides, or cannot persist.

Related: `docs/creator-analytics-backend-handoff.md`, `docs/creator-apply-spotify-handoff.md`.

---

## Product bar

Studio should feel like an **artist desk**, not an admin table:

| Desk question | Needed from API |
|---------------|-----------------|
| Who am I to listeners? | Avatar, banner, bio, genres, socials, verified |
| How big is the room? | Monthly listeners, followers, saves |
| What did I ship? | Tracks with cover, duration, genre, release, dates, visibility, processing |
| How is it packaged? | Releases with cover, type, tracklist order, publish/schedule |
| Who is showing up? | Geo, timeseries, per-track likes/saves/completes, discovery source |
| Preview without cheating stats | Studio playback flagged `source=studio_preview` |

Auth: same JWT as `GET /api/creators/me`. 403 if not a creator / banned.

---

## 1. Already wired (keep / harden)

| Method | Path | Notes |
|--------|------|--------|
| GET | `/api/creators/me` | Include `artist.avatarUrl`, `genres[]`, `socials`, `bio`, `slug`, `isVerified` |
| PATCH | `/api/creators/me` | FE sends `displayName`, `bio`, `genres[]`, `socials{instagram,youtube,website}` |
| GET | `/api/creators/me/tracks` | Catalog. Please always return `durationSec`, `thumbnailUrl`/`artwork`, `genre`, `release`, `playCount`, `createdAt`, `visibility`, `processingStatus` |
| PATCH | `/api/creators/tracks/:id` | FE now also sends `artistName`, `genre`, `visibility`, `title` |
| DELETE | `/api/creators/tracks/:id` | |
| GET/POST/PATCH/DELETE | `/api/creators/releases…` | Create, publish, cover intent/finalize, reorder, unlink — client already exists |
| GET | `/api/creators/me/analytics?rangeDays=` | Soft-fail. FE shows catalog `playCount` until this is real |

If `PATCH /creators/me` is not implemented, FE currently falls back to `POST /creators/apply` — **stop that**. Return 200 on PATCH for active artists.

---

## 2. New / extended endpoints

### 2.1 Analytics (complete the existing contract)

```http
GET /api/creators/me/analytics?rangeDays=7|28|90
```

Please add (optional fields; FE already reads what exists):

```json
{
  "rangeDays": 28,
  "totalListens": 12840,
  "uniqueListeners": 3921,
  "monthlyListeners": 4102,
  "followers": 880,
  "completes": 5102,
  "likes": 844,
  "saves": 211,
  "avgWatchPct": 62.4,
  "topRegions": [{ "region": "Lagos, NG", "countryCode": "NG", "listens": 4200, "sharePct": 32.7 }],
  "topTracks": [{
    "trackId": "…",
    "title": "…",
    "coverUrl": "…",
    "listens": 5200,
    "completes": 2100,
    "likes": 320,
    "saves": 90,
    "avgWatchPct": 71,
    "skipRate": 0.12
  }],
  "timeseries": [{ "date": "2026-08-01", "listens": 410 }],
  "sources": [
    { "source": "artist_profile", "listens": 2100, "sharePct": 16.4 },
    { "source": "search", "listens": 1800, "sharePct": 14.0 },
    { "source": "radio_for_you", "listens": 900, "sharePct": 7.0 }
  ],
  "focusHint": "Lagos drives ~33% of listens — premiere in WAT evenings."
}
```

**Rules**

- Exclude `source=studio_preview` (and admin) from public / creator totals.
- `monthlyListeners` = unique listeners in last 28 days (even if `rangeDays` is 7 or 90).
- 404/501 is fine until ready; FE falls back.

### 2.2 Catalog query

```http
GET /api/creators/me/tracks?q=&visibility=&sort=recent|plays|title|duration&page=1&limit=50
```

Response item extras (safe to add):

```json
{
  "id": "…",
  "title": "…",
  "artistName": "…",
  "genre": "gospel",
  "language": "en",
  "durationSec": 214,
  "playCount": 1204,
  "uniqueListeners": 880,
  "likes": 40,
  "saves": 12,
  "visibility": "published",
  "processingStatus": "ready",
  "thumbnailUrl": "https://…",
  "createdAt": "2026-08-01T12:00:00.000Z",
  "isrc": null,
  "explicit": false,
  "release": { "id": "…", "title": "…", "coverUrl": "…", "type": "single" }
}
```

### 2.3 Studio preview plays (do not inflate stats)

```http
POST /api/music/plays
{
  "trackId": "…",
  "source": "studio_preview",
  "positionSec": 12,
  "completed": false
}
```

If this body is ignored today, document it. Studio must never boost public `playCount`.

### 2.4 Artist imagery

```http
POST /api/creators/me/avatar/upload-intent
POST /api/creators/me/avatar/finalize
POST /api/creators/me/banner/upload-intent
POST /api/creators/me/banner/finalize
```

Same presign pattern as track cover. Then `artist.avatarUrl` + `artist.bannerUrl` on `GET /me`.

### 2.5 Profile extras (PATCH `/api/creators/me`)

Accept and echo:

| Field | Type | Notes |
|-------|------|--------|
| `location` | string | City / country, public |
| `bannerUrl` | string | After finalize |
| `socials.tiktok` | string | Optional |
| `monthlyListeners` | number | Server-computed; ignore on PATCH |

### 2.6 Followers (public + studio)

```http
GET /api/creators/me/audience?rangeDays=28
```

```json
{
  "followers": 880,
  "followersDelta": 42,
  "monthlyListeners": 4102,
  "playlistAdds": 19
}
```

Public: `GET /api/artists/:slug` already used for the public page — include `followers` + `monthlyListeners` when ready.

### 2.7 Release editor (client functions exist, need BE)

| Method | Path | Why |
|--------|------|-----|
| POST | `/api/creators/releases/:id/cover/upload-intent` | Discography cards look empty without art |
| POST | `/api/creators/releases/:id/cover/finalize` | |
| POST | `/api/creators/releases/:id/tracks/reorder` | `{ orderedTrackIds: [] }` |
| DELETE | `/api/creators/releases/:id/tracks/:trackId` | Unlink; `?deleteTrack=true` optional |
| POST | `/api/creators/releases/:id/publish` | `{ scheduledAt?: ISO, skipTypeHints?: boolean }` |

### 2.8 Track metadata (later, not blocking UI)

`PATCH /api/creators/tracks/:id` extras: `isrc`, `lyrics`, `explicit`, `language`, `trackNumber`.

---

## 3. Event hygiene

| Event | Count toward artist stats? |
|-------|----------------------------|
| Listener play on Music / artist page | Yes |
| Creator play in Studio (`studio_preview`) | **No** |
| Admin inspect | **No** |
| Like / save / complete | Yes (dedupe per user) |

---

## 4. FE fallbacks until you ship

- Monthly listeners → `uniqueListeners` or sum of catalog `playCount`
- Insights regions / likes / saves / sparkline → empty with hint copy
- Avatar → initials tile
- Duration → `—` if `durationSec` missing
- Release cover → first track art, else note glyph

Ship **analytics + duration + covers + PATCH /me** first. Imagery and followers next. ISRC/lyrics last.

---

## 5. Error shapes

Use existing `{ success, error: { code, message } }`. Useful codes:

- `NOT_A_CREATOR`
- `TRACK_NOT_READY`
- `TYPE_HINT_MISMATCH` (publish; FE already offers “publish anyway”)
- `COVER_REQUIRED` (optional policy)
