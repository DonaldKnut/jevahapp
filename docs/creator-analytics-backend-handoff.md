# Backend handoff — Creator Studio analytics

**Date:** 2026-08-09  
**Audience:** `jevahapp-backend`  
**Frontend:** web Creator Studio (`/creators/studio`) + mobile later  
**Status:** FE ships a soft-fail dashboard today. Catalog `playCount` is the interim source until this API exists.

---

## 0. Product intent

Creators logging into Studio need a **different dashboard** from admin:

| Question | Metric |
|----------|--------|
| How many people listened? | `totalListens`, `uniqueListeners` |
| Which songs win? | `topTracks[]` |
| Where should I focus? | `topRegions[]` + `focusHint` |
| Are people finishing tracks? | `completes`, `avgWatchPct` |

Feel: Spotify for Artists overview — sparse KPIs, region bars, top tracks. No admin chrome.

---

## 1. Endpoint (recommended)

```http
GET /api/creators/me/analytics?rangeDays=30
Authorization: Bearer <creator JWT>
```

Auth: same as `/api/creators/me`. Reject non-creators / banned with 403.

### Success

```json
{
  "success": true,
  "data": {
    "rangeDays": 30,
    "totalListens": 12840,
    "uniqueListeners": 3921,
    "completes": 5102,
    "likes": 844,
    "saves": 211,
    "avgWatchPct": 62.4,
    "topRegions": [
      {
        "region": "Lagos, NG",
        "countryCode": "NG",
        "listens": 4200,
        "sharePct": 32.7
      },
      {
        "region": "London, GB",
        "countryCode": "GB",
        "listens": 1800,
        "sharePct": 14.0
      }
    ],
    "focusHint": "Lagos drives ~33% of listens — schedule premieres for WAT evenings.",
    "topTracks": [
      {
        "trackId": "665f…",
        "title": "Christmas Celebration",
        "listens": 5200,
        "completes": 2100,
        "likes": 320,
        "saves": 90,
        "avgWatchPct": 71
      }
    ],
    "timeseries": [
      { "date": "2026-08-01", "listens": 410 },
      { "date": "2026-08-02", "listens": 388 }
    ]
  }
}
```

### Errors

| Status | When |
|--------|------|
| 401 | Missing/invalid JWT |
| 403 | Not a creator / banned |
| 404 | No artist profile yet (FE falls back) |

FE treats **404 / 501** as “API not ready” and falls back to summing catalog `playCount`.

---

## 2. Data sources (do not invent on FE)

Prefer server-owned engagement already written by:

- `POST /api/content/media/:id/view` (`counted`)
- CF like / save / share
- `POST /api/feed/events` (`watch_time`, `skip`, `impression`) when `contentType` is music and content belongs to this artist

Geo: derive region from request GeoIP **at event/view time** (store `countryCode` / coarse city on the engagement doc). Do **not** ask the FE to send lat/lng.

`focusHint` can be a simple rule string server-side, e.g. top region share ≥ 25% → “Double down on {region}”.

---

## 3. Optional follow-ups

```http
GET /api/creators/me/analytics/tracks/:trackId?rangeDays=30
```

Per-track breakdown for a future track detail sheet.

```http
GET /api/creators/me/analytics?rangeDays=7|30|90
```

FE already passes `rangeDays`; default 30.

---

## 4. Privacy / aggregation

- Return **coarse** regions only (city/country), never raw IP.
- Cap `topRegions` to ~10, `topTracks` to ~20.
- Only include the caller’s own catalog.

---

## 5. Smoke

```bash
BASE=https://api.jevahapp.com/api
TOKEN="<creator JWT>"

curl -s "$BASE/creators/me/analytics?rangeDays=30" \
  -H "Authorization: Bearer $TOKEN" | jq '.data|{totalListens,uniqueListeners,nRegions:(.topRegions|length),focusHint}'
```

---

## 6. FE already wired

- Client: `src/services/creators/analytics.ts` → `GET /creators/me/analytics`
- UI: `CreatorAnalyticsDashboard` on `/creators/studio`
- Soft-fail: catalog play counts + empty regions until this ships

Once live with non-empty `topRegions`, Studio automatically flips from “provisional” to **Live**.
