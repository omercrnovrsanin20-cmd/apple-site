import { NextRequest, NextResponse } from "next/server";
import { getCustomerSession, getStaffSession, getOwnerSession } from "@/lib/auth";
import { getSupabase, PHOTOS_BUCKET } from "@/lib/supabase";

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
  const safeSegments = segments.filter((s) => s !== ".." && s !== "." && !s.includes("\\"));
  const storagePath = safeSegments.join("/");

  const { data, error } = await getSupabase().storage.from(PHOTOS_BUCKET).download(storagePath);
  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ext = storagePath.split(".").pop()?.toLowerCase() ?? "";
  const contentType = MIME_BY_EXT[ext] ?? "application/octet-stream";
  const buffer = Buffer.from(await data.arrayBuffer());
  return new NextResponse(buffer, { headers: { "Content-Type": contentType, "Cache-Control": "private, max-age=3600" } });
}
