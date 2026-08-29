import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getStaffSession, getOwnerSession } from "@/lib/auth";
import { saveUploadedImage, UploadValidationError } from "@/lib/upload";

const VALID_CATEGORIES = new Set(["BEFORE", "DURING", "AFTER"]);

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const [staff, owner] = await Promise.all([getStaffSession(), getOwnerSession()]);
  if (!staff && !owner) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const id = Number((await ctx.params).id);

  const workOrder = await prisma.workOrder.findUnique({ where: { id } });
  if (!workOrder) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "validation" }, { status: 400 });

  const category = form.get("category");
  if (typeof category !== "string" || !VALID_CATEGORIES.has(category)) {
    return NextResponse.json({ error: "invalid_category" }, { status: 400 });
  }

  const files = form.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return NextResponse.json({ error: "no_files" }, { status: 400 });

  const photos = [];
  for (const file of files) {
    try {
      const relPath = await saveUploadedImage(file, `workorders/${id}`);
      const photo = await prisma.photo.create({
        data: {
          category: category as "BEFORE" | "DURING" | "AFTER",
          url: relPath,
          vehicleId: workOrder.vehicleId,
          workOrderId: id,
        },
      });
      photos.push(photo);
    } catch (e) {
      if (e instanceof UploadValidationError) {
        return NextResponse.json({ error: "upload_invalid", message: e.message }, { status: 400 });
      }
      throw e;
    }
  }

  return NextResponse.json({ photos }, { status: 201 });
}
