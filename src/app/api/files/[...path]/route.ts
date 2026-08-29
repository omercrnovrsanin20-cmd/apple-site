import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { getCustomerSession, getStaffSession, getOwnerSession } from "@/lib/auth";

const UPLOAD_ROOT = path.join(process.cwd(), "uploads");

const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

// Any authenticated session (customer, staff or owner) may read an uploaded
// photo. This keeps unauthenticated internet users out, while still keeping
// the demo simple -- see README limitations for finer-grained ACL notes.
export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const [customer, staff, owner] = await Promise.all([getCustomerSession(), getStaffSession(), getOwnerSession()]);
  if (!customer && !staff && !owner) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { path: segments } = await ctx.params;
  const safeSegments = segments.filter((s) => s !== ".." && s !== "." && !s.includes("/"));
  const filePath = path.join(UPLOAD_ROOT, ...safeSegments);
  if (!filePath.startsWith(UPLOAD_ROOT)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  try {
    const buffer = await readFile(filePath);
    const ext = filePath.split(".").pop()?.toLowerCase() ?? "";
    const contentType = MIME_BY_EXT[ext] ?? "application/octet-stream";
    return new NextResponse(buffer, { headers: { "Content-Type": contentType, "Cache-Control": "private, max-age=3600" } });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
