import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const UPLOAD_ROOT = path.join(process.cwd(), "uploads");
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
 * Validates and persists an uploaded image to local disk (outside /public so
 * access is mediated by /api/files, which checks for an authenticated
 * session before streaming bytes back).
 */
export async function saveUploadedImage(file: File, subfolder: string): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new UploadValidationError(`Unsupported file type: ${file.type}`);
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new UploadValidationError("File too large (max 8MB)");
  }

  const dir = path.join(UPLOAD_ROOT, subfolder);
  await mkdir(dir, { recursive: true });

  const ext = EXT_BY_TYPE[file.type] ?? "bin";
  const filename = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  return `${subfolder}/${filename}`;
}
