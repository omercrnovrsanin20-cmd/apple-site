import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { buildGoogleAuthUrl, isGoogleConfigured } from "@/lib/google";

const STATE_COOKIE = "google_oauth_state";

export async function GET(req: NextRequest) {
  if (!isGoogleConfigured()) {
    return NextResponse.redirect(new URL("/customer/login?error=google_not_configured", req.url));
  }

  const state = randomUUID();
  const res = NextResponse.redirect(buildGoogleAuthUrl(state));
  res.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10, // 10 minutes is plenty for the redirect round trip
  });
  return res;
}
