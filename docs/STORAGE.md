# AkMart Reusable S3-Compatible Object Storage Architecture

Comprehensive enterprise industry standard documentation for the AkMart file upload and object storage subsystem.

---

## 1. Architecture Overview

AkMart uses a **decoupled, S3-compatible object storage architecture** that supports **MinIO** in local development and **AWS S3 / Cloudflare R2** in production without code modifications.

```mermaid
sequenceDiagram
    autonumber
    actor Client as Web / Mobile Client
    participant API as AkMart Backend (Express 5)
    participant Storage as S3 Storage (MinIO / AWS S3 / R2)
    participant DB as Postgres (Prisma)

    Note over Client, DB: Primary Flow: Direct Presigned Upload (Zero Server Disk Buffering)
    Client->>API: POST /api/v1/uploads/presign { filename, contentType, size, purpose }
    API->>API: Validate MIME, size limit (5MB), auth & generate UUID key
    API->>Storage: Generate Presigned PUT URL
    API-->>Client: { uploadUrl, key, expiresIn, publicUrl }
    Client->>Storage: PUT binary file directly to uploadUrl
    Client->>API: Submit feature data with key (e.g. PUT /api/v1/auth/me { avatarKey: key })
    API->>Storage: HeadObject(key) -> verify objectExists & ownership
    API->>DB: Save object key ONLY into database (e.g. avatar_key)
    API-->>Client: Return updated entity with dynamically resolved URL

    Note over Client, DB: Fallback Flow: Streaming Multipart
    Client->>API: POST /api/v1/uploads/direct (multipart/form-data)
    API->>API: Inspect first 16 bytes for magic byte verification
    API->>Storage: Stream directly to S3 via uploadObject (no disk buffering)
    API-->>Client: { key, url }
```

### Core Architectural Principles (Non-Negotiable)
1. **Database Stores ONLY the Object Key**: Columns like `avatar_key` store relative keys (`users/123/avatar/uuid.webp`). URLs are never hardcoded in the DB; they are resolved dynamically at read time via `resolveStorageUrl()`.
2. **Zero Disk Buffering**: Files never touch the application server disk. Direct uploads go straight from browser to S3. The fallback multipart endpoint streams chunks directly to S3 with memory thresholds.
3. **Single Reusable Storage Module**: Feature controllers never import `@aws-sdk/client-s3` directly. All operations route through `src/lib/storage` (or `src/services/storage.service`).
4. **Environment-Driven Configuration**: No secrets or hardcoded endpoints.

---

## 2. Environment Variables

All variables are configured in `.env` and `.env.example`:

| Variable | Type | Default (Dev) | Description / Production Example |
| :--- | :--- | :--- | :--- |
| `S3_ENDPOINT` | URL | `http://localhost:9000` | S3 API endpoint. For AWS S3: `https://s3.ap-south-1.amazonaws.com`. For R2: `https://<account_id>.r2.cloudflarestorage.com`. |
| `S3_REGION` | String | `us-east-1` | S3 Region. (e.g. `ap-south-1` or `auto` for Cloudflare R2). |
| `S3_ACCESS_KEY` | String | `minioadmin` | Access key ID. |
| `S3_SECRET_KEY` | String | `minioadmin` | Secret access key. |
| `S3_BUCKET` | String | `akmart-media` | Storage bucket name. |
| `S3_FORCE_PATH_STYLE` | Boolean | `true` | Required `true` for MinIO/local; set `false` for AWS S3 virtual-hosted style. |
| `S3_PUBLIC_BASE_URL` | URL (Opt) | `""` | CDN/CloudFront base URL (e.g. `https://media.akmart.com`). If empty, endpoint URL is used. |
| `S3_PRESIGN_EXPIRES_SECONDS` | Number | `300` | Presigned URL validity window in seconds (5 minutes). |
| `MAX_IMAGE_SIZE_MB` | Number | `5` | Maximum upload size threshold in megabytes. |

---

## 3. Storage Service Functions (`src/lib/storage`)

Import all functions from `src/lib/storage`:

```typescript
import {
  uploadObject,
  getPresignedUploadUrl,
  getPresignedReadUrl,
  getPublicUrl,
  resolveStorageUrl,
  streamObject,
  deleteObject,
  objectExists,
  generateKey,
} from '@/lib/storage';
```

### 3.1. `generateKey({ folder, ownerId, filename, extension })`
Generates an unguessable, traversal-safe object key with a UUID and sanitized extension.
```typescript
const key = generateKey({
  folder: 'avatar',
  ownerId: req.user.userId,
  filename: 'my_photo.png',
});
// Result: "users/053ffddb-9b27-4236-9a72-de0fb3ff13d0/avatar/e491f868-b3d2-4318-ae25-c61d5b3ef4d1.png"
```

### 3.2. `getPresignedUploadUrl(key, contentType, maxSize?)`
Returns a presigned PUT URL allowing client browsers to upload directly to S3.
```typescript
const { uploadUrl, key, expiresIn } = await getPresignedUploadUrl(
  'users/123/avatar/photo.webp',
  'image/webp'
);
```

### 3.3. `objectExists(key)`
Performs a lightweight `HEAD` request to verify the file was actually uploaded.
```typescript
const exists = await objectExists('users/123/avatar/photo.webp');
if (!exists) {
  throw new AppError('File was not uploaded to storage', 400);
}
```

### 3.4. `deleteObject(key)`
Deletes an object from S3. Used for lifecycle cleanup when replacing an old image.
```typescript
if (user.avatarKey && user.avatarKey !== newKey) {
  await deleteObject(user.avatarKey);
}
```

### 3.5. `resolveStorageUrl(keyOrUrl)`
Universal resolver that converts stored relative keys into usable URLs. Preserves existing full external URLs (e.g. Google OAuth avatars) unchanged.
```typescript
const avatarUrl = resolveStorageUrl(user.avatarKey);
```

### 3.6. `streamObject(key)`
Fetches an object as a Node.js `Readable` stream for gateway proxying.
```typescript
const { stream, contentType, contentLength, etag } = await streamObject(key);
res.setHeader('Content-Type', contentType);
stream.pipe(res);
```

### 3.7. `uploadObject(key, body, contentType)`
Uploads buffer or stream directly from server.
```typescript
await uploadObject('reports/summary.webp', imageBuffer, 'image/webp');
```

---

## 4. Frontend Reusable Upload Integration

### 4.1. Using the `ImageUploader` UI Component
```tsx
import { ImageUploader } from '@/components/common/ImageUploader';

function ProfileEdit() {
  const [avatarKey, setAvatarKey] = useState<string | null>(null);

  return (
    <ImageUploader
      purpose="avatar"
      label="Profile Avatar"
      initialUrl={user.avatarUrl}
      maxSizeMB={5}
      onUploaded={(res) => {
        // res = { key: "users/.../avatar/....png", url: "http://..." }
        setAvatarKey(res.key);
      }}
      onCleared={() => setAvatarKey(null)}
    />
  );
}
```

### 4.2. Using the `useImageUpload` Custom Hook
```tsx
import { useImageUpload } from '@/hooks/useImageUpload';

const { status, progress, error, selectFile, startUpload, cancelUpload } = useImageUpload({
  purpose: 'review-photo',
  onSuccess: (result) => console.log('Uploaded key:', result.key),
});
```

### 4.3. Using the Direct Helper `uploadImage(file, options)`
```ts
import { uploadImage } from '@/api/storage.service';

const { key, url } = await uploadImage(file, {
  purpose: 'product-image',
  onProgress: (pct) => console.log(`Progress: ${pct}%`),
});
```

---

## 5. Adding a New Upload Type (e.g. "Invoice PDF")

Follow this 4-step blueprint to add a new upload purpose:

### Step 1: Update Allowed MIME Types & Key Generator
In `src/lib/storage/magicBytes.ts`:
```typescript
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf', // <-- Add here
] as const;
```
In `src/lib/storage/keyGenerator.ts`:
```typescript
const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf']);

// In generateKey():
if (cleanFolder === 'invoice' || cleanFolder === 'invoices') {
  return `invoices/${cleanOwnerId}/${uuid}.${ext}`;
}
```

### Step 2: Update Validator
In `src/validators/upload.validator.ts`:
```typescript
export const ALLOWED_PURPOSES = ['avatar', 'review-photo', 'product-image', 'invoice'] as const;
```

### Step 3: Update Database Schema
In `schema.prisma`:
```prisma
model Order {
  id         String  @id @default(uuid())
  invoiceKey String? @map("invoice_key") // Key only!
}
```
Run `npx prisma migrate dev --name add_order_invoice_key`.

### Step 4: Verify & Save in Controller
```typescript
// Verify invoice exists before updating order
if (body.invoiceKey) {
  const exists = await objectExists(body.invoiceKey);
  if (!exists) throw new AppError('Invoice file missing in storage', 400);
}
```

---

## 6. Switching from MinIO to AWS S3 or Cloudflare R2

Zero application code changes are required. Update environment variables in your deployment:

### 6.1. AWS S3 Production Setup
```env
S3_ENDPOINT="https://s3.ap-south-1.amazonaws.com"
S3_REGION="ap-south-1"
S3_ACCESS_KEY="AKIAIOSFODNN7EXAMPLE"
S3_SECRET_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
S3_BUCKET="akmart-production-media"
S3_FORCE_PATH_STYLE=false
S3_PUBLIC_BASE_URL="https://d111111abcdef8.cloudfront.net"
```

#### AWS S3 Bucket CORS Configuration
Apply to your S3 bucket under **Permissions > Cross-origin resource sharing (CORS)**:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedOrigins": [
      "https://akmart.com",
      "https://www.akmart.com",
      "http://localhost:5173"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### 6.2. Cloudflare R2 Production Setup
```env
S3_ENDPOINT="https://<account_id>.r2.cloudflarestorage.com"
S3_REGION="auto"
S3_ACCESS_KEY="<r2_access_key_id>"
S3_SECRET_KEY="<r2_secret_access_key>"
S3_BUCKET="akmart-media"
S3_FORCE_PATH_STYLE=true
S3_PUBLIC_BASE_URL="https://media.akmart.com"
```

---

## 7. Lifecycle & Orphan Cleanup

### 7.1. Replacement & Deletion Cleanup
When records are updated with a new key or deleted, old keys are automatically cleaned up using `deleteObject(oldKey)`.

### 7.2. Automated Orphan Upload Cleanup
If a user requests a presigned URL but abandons the upload or form submission:
1. Files uploaded with a temporary prefix (e.g. `tmp/`) can be pruned via an S3 Bucket Lifecycle Rule:
   * **Rule**: Expire objects under prefix `tmp/` after **24 hours**.
2. Or run the maintenance orphan scanner script:
```typescript
// scripts/clean-orphans.ts:
// Compares storage objects against DB keys (User.avatarKey, ReviewImage.key, ProductImage.url)
// and deletes unreferenced objects older than 48 hours.
```
