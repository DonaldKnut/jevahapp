# Creator apply — open genres + photo (backend CTO)

**Date:** 2026-09-25  
**From:** Web (`www.jevahapp.com/creators/apply`)  
**For:** Backend CTO / API owners on `jevahapp-backend`  
**Not for:** Product copy, mobile UI, or admin pixel work

This is the corroboration note. Web already ships the UI. Please confirm persistence and do **not** 422 unknown genre strings.

Related: [creator-apply-spotify-handoff.md](./creator-apply-spotify-handoff.md) (full apply form). This file is the delta you need to implement.

---

## Who needs this

| Role | Why |
|------|-----|
| **Backend CTO / API lead** | Own `POST /api/creators/apply`, artist `genres[]`, Artists queue, public profile |
| **Backend engineer on creators** | Stop treating `genres` as a closed enum |
| **Mobile later** | Same payload; do not invent a second genre list |

Frontend does not need a reply to ship the picker. We need you so custom tags are **stored and returned**, not dropped or rejected.

---

## What web sends today

```http
POST /api/creators/apply
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "displayName": "Grace Collective",
  "creatorTypes": ["artist"],
  "genres": ["gospel", "afro_gospel", "fuji_gospel"],
  "bio": "Worship from Lagos",
  "socials": {
    "instagram": "@gracecollective"
  },
  "applicationNote": "Youth nights since 2019"
}
```

`genres` is `string[]`. Suggested chips still use the old slugs. **Typed tags are extra slugs in the same array.**

### Slug rules (frontend already applies)

| Rule | Value |
|------|--------|
| Normalize | trim → lowercase → non-alphanumeric → `_` |
| Length | 2–40 chars after slugify |
| Max tags | 8 |
| Examples | `Gospel` → `gospel`; `Fuji Gospel` → `fuji_gospel`; `worship jazz` → `worship_jazz` |

Suggested catalog (unchanged, still sent when tapped):

`gospel` · `contemporary_christian` · `afro_gospel` · `hymn` · `choir` · `rap_gospel` · `highlife_gospel` · `other`

---

## What we need you to do

### 1. Persist any valid slug — do not enum-reject

**Today (likely):** `genres` must be in `TRACK_GENRES` → `422` / silent drop on `fuji_gospel`.

**Needed:**

- Store `genres` as `string[]` on the artist / application document.
- Accept any slug matching `^[a-z0-9]+(_[a-z0-9]+)*$` (2–40).
- Deduplicate case-insensitively.
- Cap at 8. Extra items: ignore or `422` with `GENRES_TOO_MANY`.
- Empty array: `422` `GENRES_REQUIRED` (web also blocks this).

Do **not** require `other` + a side field. Custom tags are first-class members of `genres[]`.

### 2. Echo them back

Same strings on:

| Route | Field |
|-------|--------|
| `GET /api/creators/me` | `artist.genres[]` |
| `PATCH /api/creators/me` | accept the same open `genres[]` |
| Admin Artists queue / applicant detail | show chips, including custom |
| Public artist profile | `artist.genres[]` |

Display: replace `_` with space, title-case if you want. Web uses `genreLabel()` the same way.

### 3. Browse / filter (optional this sprint)

Shelf filters may keep using the suggested catalog only. Custom tags can be:

- stored and shown on the profile, **or**
- also filterable later (`GET /api/music?genre=fuji_gospel`)

Do not block apply on browse support.

### 4. Track-level `genre` (separate)

Upload still sends one `genre` string per track. Prefer the same open slug (not a second enum). If track genre stays closed for now, **artist apply genres must still be open**.

---

## Profile photo (same apply submit)

Web no longer sends `avatarUrl`. After a **200/201 apply**, it runs:

1. `POST /api/creators/me/avatar/upload-intent`
2. `PUT` presigned URL
3. `POST /api/creators/me/avatar/finalize`

**Ask:** allow this for **pending** applicants, not only `status: active`. Otherwise the photo is lost and we tell them to add it in Studio.

Nice-to-have later: `POST /api/creators/apply/avatar/upload-intent` before the artist row exists.

---

## Errors we can show

| HTTP | `code` | When |
|------|--------|------|
| 422 | `GENRES_REQUIRED` | missing / empty |
| 422 | `GENRES_INVALID` | bad slug |
| 422 | `GENRES_TOO_MANY` | more than 8 |
| 422 | `GENRE_UNKNOWN` | **do not use** — this is the old closed enum |

---

## Corroborate (reply in this doc or ticket)

- [ ] `POST /api/creators/apply` stores `["gospel","fuji_gospel"]` without 422
- [ ] `GET /api/creators/me` returns those exact slugs
- [ ] `PATCH /api/creators/me` accepts custom slugs the same way
- [ ] Artists queue shows custom chips
- [ ] Pending applicant can finalize avatar after apply
- [ ] Closed `TRACK_GENRES` enum is **suggestions only**, not a write gate on apply

Web surface: https://www.jevahapp.com/creators/apply  
Questions: keep path shapes; do not add `/api/creators/genres` unless you want a shared suggestion list later.
