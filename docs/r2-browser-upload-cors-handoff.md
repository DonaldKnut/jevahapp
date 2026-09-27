# Backend handoff — R2 CORS for browser song uploads

**Date:** 2026-09-26  
**Audience:** `jevahapp-backend` + whoever owns the Cloudflare R2 bucket  
**Frontend:** Creator Studio upload (`PUT` to the presigned `putUrl`)  
**Live symptom:** `https://www.jevahapp.com` upload dies at ~10% with:

```
Access to XMLHttpRequest at 'https://….r2.cloudflarestorage.com/jevah/…/original.mp3?X-Amz-…'
from origin 'https://www.jevahapp.com' has been blocked by CORS policy:
Response to preflight request doesn't pass access control check:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

The OPTIONS preflight often shows **404**. The file never reaches R2. This is **not** a web-app bug. Vite can proxy localhost only. Production talks to R2 directly.

---

## 1. What the browser is doing

1. Web calls your intent API and gets a presigned PUT.
2. Browser `PUT`s the mp3 to `*.r2.cloudflarestorage.com`.
3. Cross-origin **PUT always preflights** (`OPTIONS`).
4. R2 answers OPTIONS with no `Access-Control-Allow-Origin` → Chrome blocks the PUT.

Signed URL we saw on 2026-09-26:

- Host: `870e0e55f75d0d9434531d7518f57e92.r2.cloudflarestorage.com`
- Key: `jevah/audio/artist/…/original.mp3`
- `X-Amz-SignedHeaders=content-length;host`
- Query also has `x-amz-checksum-crc32=AAAAAA==` and `x-amz-sdk-checksum-algorithm=CRC32`

That empty CRC32 will fail **after** CORS is fixed (file bytes ≠ `AAAAAA==`). Turn checksums **off** for browser presigns.

---

## 2. Fix A — R2 bucket CORS (required)

Cloudflare dashboard → R2 → the `jevah` bucket → **Settings → CORS policy**.

Use this (or merge if you already have rules):

```json
[
  {
    "AllowedOrigins": [
      "https://www.jevahapp.com",
      "https://jevahapp.com",
      "http://localhost:5173",
      "http://localhost:4173"
    ],
    "AllowedMethods": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag", "Location", "x-amz-request-id"],
    "MaxAgeSeconds": 86400
  }
]
```

`AllowedHeaders: ["*"]` is the safe choice. If you prefer an explicit list:

```
content-type
content-length
content-md5
x-amz-checksum-crc32
x-amz-sdk-checksum-algorithm
x-amz-*
```

Save, wait a minute, retry **Publish songs** on `https://www.jevahapp.com` (hard refresh).

This is **bucket CORS**, not API CORS (`Access-Control-Allow-Origin` on `api.jevahapp.com`). API CORS can be fine while R2 still blocks the file PUT.

---

## 3. Fix B — Presign without checksums (required)

AWS SDK v3 adds flexible checksums by default. For a **browser** PUT you do not have the file on the server, so do not sign CRC32.

Node example:

```js
const client = new S3Client({
  region: "auto",
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

const putUrl = await getSignedUrl(
  client,
  new PutObjectCommand({
    Bucket,
    Key,
    ContentType: contentType, // optional — if you set it, also sign content-type
    ContentLength: fileSizeBytes, // ok if FE already sent the size
  }),
  { expiresIn: 900 }
);
```

Rules:

| Do | Do not |
|----|--------|
| Sign only headers the browser will send | Attach `x-amz-checksum-crc32=AAAAAA==` |
| Either sign `content-type` **and** tell FE in `headers`, or sign neither | Sign `content-length;host` then require a CRC the browser never sends |
| `Expires` 15 minutes | 60-second URLs while the user is still picking a file |

If you sign `content-type`, return it on the intent:

```json
{
  "audio": {
    "putUrl": "https://….r2.cloudflarestorage.com/…",
    "headers": { "Content-Type": "audio/mpeg" }
  }
}
```

FE only adds `Content-Type` when you put it in `headers` or when `X-Amz-SignedHeaders` includes `content-type`.

---

## 4. Optional Fix C — API proxy (if you cannot change R2 CORS today)

Same-origin upload so the browser never talks to R2:

```
PUT /api/creators/tracks/:trackId/upload-audio
Content-Type: application/octet-stream
Authorization: Bearer <jwt>
```

Server streams the body to R2 with the secret key. Web can switch to this if you ship it. **Prefer Fix A + B.**

---

## 5. Smoke

1. Apply CORS on the bucket.  
2. Issue a new presign **without** checksum query params.  
3. From `https://www.jevahapp.com` DevTools → Network: OPTIONS to R2 is **200** with `Access-Control-Allow-Origin: https://www.jevahapp.com`.  
4. PUT is **200**.  
5. Finalize the track as today.

Until A + B land, Studio publish from production will keep failing at 10% with the CORS banner. Localhost can still work via the Vite `/__r2` proxy.
