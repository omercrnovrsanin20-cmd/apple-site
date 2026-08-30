import { randomUUID } from "crypto";
import { getSupabase, PHOTOS_BUCKET } from "@/lib/supabase";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB

export class UploadValidationError extends Error {}

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

/**
 * Validates and persists an uploaded image to the private "photos" bucket in
 * Supabase Storage. Returns the storage path (not a public URL) -- access is
 * mediated by /api/files, which checks for an authenticated session before
 * streaming the bytes back, same as when this was a local-disk upload.
 */
export async function saveUploadedImage(file: File, subfolder: string): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new UploadValidationError(`Unsupported file type: ${file.type}`);
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new UploadValidationError("File too large (max 8MB)");
  }

  const ext = EXT_BY_TYPE[file.type] ?? "bin";
  const filename = `${randomUUID()}.${ext}`;
  const storagePath = `${subfolder}/${filename}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await getSupabase()
    .storage.from(PHOTOS_BUCKET)
    .upload(storagePath, buffer, { contentType: file.type, upsert: false });

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  return storagePath;
}
