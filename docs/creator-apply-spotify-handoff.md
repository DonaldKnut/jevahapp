# Creator apply — Spotify for Artists style handoff

**Date:** 2026-08-09  
**Surface:** [https://www.jevahapp.com/creators/apply](https://www.jevahapp.com/creators/apply)  
**Audience:** Web FE + product / backend reviewers  
**Goal:** Match the *feel* of Spotify for Artists access: fixed promo + scrollable apply form, clear required vs optional, Zod-validated payload.

---

## 1. Product analogy (Spotify → Jevah)

| Spotify for Artists | Jevah Creators |
|---------------------|----------------|
| “Get access” / claim profile | `/creators/apply` |
| Artist name | `displayName` |
| Primary role / type | `creatorTypes[]` (artist / minister / podcaster) |
| Genre tags | `genres[]` (at least one) |
| Social / streaming links | `socials.instagram \| youtube \| spotify` |
| Avatar / image (often later) | `avatarUrl` optional at apply |
| Pitch / verification notes | `applicationNote` optional |
| Review → dashboard | Artists queue → `/creators/studio` |

Spotify does **not** ask for everything up front. Name + identity signals are required; polish fields stay optional. Jevah follows that.

---

## 2. Desktop layout (shipped)

```
┌────────────────────┬──────────────────────────────┐
│  Promo panel       │  Scrollable form column      │
│  (fixed, ~40%)     │  (overflow-y: auto)          │
│  Brand + 3 steps   │  Required / Optional labels  │
│  Full-bleed image  │  Sticky submit footer        │
└────────────────────┴──────────────────────────────┘
```

- **Desktop (`lg+`):** split like login / Spotify for Artists onboarding.
- **Mobile:** promo collapses to a compact strip; form + sticky submit remain.
- **Viewport:** `h-dvh` + independent scroll on the form side only (promo stays put).

Components:

- `ApplyPromoAside` — left brand panel  
- `ApplyFormFields` — field UI + Required/Optional badges  
- `schemas/creatorApply.ts` — Zod source of truth  
- `CreatorApply` — page shell + submit

---

## 3. Field contract (required vs optional)

### Required (must pass Zod)

| Field | Rules | UI |
|-------|--------|----|
| `creatorTypes` | ≥ 1 of `artist` \| `minister` \| `podcaster` | Chip / card toggles |
| `displayName` | trim, 2–80 chars | Text input |
| `genres` | ≥ 1 from allowed enum | Chip toggles |

### Optional (empty → omitted)

| Field | Rules | UI |
|-------|--------|----|
| `bio` | ≤ 500 chars | Textarea + counter |
| `instagram` / `youtube` / `spotify` | trim, ≤ 200 | Grouped “Social proof” |
| `avatarUrl` | if set, must be `http(s)://…` | Text |
| `applicationNote` | ≤ 1000 chars | Textarea |

HTML `required` attributes are **not** the source of truth. Use `noValidate` + Zod so errors match Spotify-style inline messages.

---

## 4. API payload (Option A base includes `/api`)

```http
POST /api/creators/apply
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "displayName": "Grace Collective",
  "creatorTypes": ["artist"],
  "genres": ["gospel", "worship"],
  "bio": "Gospel worship from Lagos",
  "socials": {
    "instagram": "@gracecollective",
    "youtube": "https://youtube.com/@grace",
    "spotify": "https://open.spotify.com/artist/…"
  },
  "avatarUrl": "https://…",
  "applicationNote": "We lead youth worship…"
}
```

Omit keys that are empty. Do not send `""` for optional fields.

---

## 5. Zod (frontend)

Schema lives in `src/pages/creators/schemas/creatorApply.ts`.

```ts
creatorApplySchema.safeParse(values)
// → { success, data } | { success: false, error }
// fieldErrorsFromZod(error) → { displayName?: string, … }
```

On submit failure: highlight fields, focus messaging on the first error, keep the sticky CTA enabled until request starts.

---

## 6. UX rules (Spotify parity checklist)

- [x] Left promo tells the story; right side is the only scroll region  
- [x] Every field shows **Required** or **Optional**  
- [x] Socials are one section (“Social proof”), not three equal required columns  
- [x] Sticky bottom bar with primary CTA (like Spotify’s always-visible Continue)  
- [x] Pending banner if `capabilities.showPendingBanner`  
- [x] Redirect to Studio when already approved (`!canApply && showCreatorHub`)  
- [ ] Future: image upload instead of avatar URL (Spotify uses file picker)  
- [ ] Future: multi-step wizard (Name → Role → Genre → Socials) if form grows  

---

## 7. Backend expectations (no FE inventing)

1. Same auth gate as mobile apply (`role` / verified email as you already enforce).  
2. Persist `creatorTypes`, `genres`, `socials`, `applicationNote`.  
3. Status message for pending should surface on Studio + re-entry to apply.  
4. Admin Artists queue remains the review surface — apply page never auto-approves.

---

## 8. Definition of done

1. Desktop apply shows promo + independently scrollable form.  
2. Required fields block submit via Zod; optional fields never block when empty.  
3. Network tab shows `POST …/api/creators/apply` with trimmed body.  
4. After success → `/creators/studio` with toast.  
5. Mobile remains usable without the left panel.

Questions on path shapes: prefer existing creators session docs over inventing new routes.
