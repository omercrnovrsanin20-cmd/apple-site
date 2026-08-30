import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSessionCookie } from "@/lib/auth";
import { exchangeGoogleCode, isGoogleConfigured } from "@/lib/google";

const STATE_COOKIE = "google_oauth_state";

function loginRedirect(req: NextRequest, error: string) {
  const res = NextResponse.redirect(new URL(`/customer/login?error=${error}`, req.url));
  res.cookies.delete(STATE_COOKIE);
  return res;
}

export async function GET(req: NextRequest) {
  if (!isGoogleConfigured()) {
    return loginRedirect(req, "google_not_configured");
  }

  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const expectedState = req.cookies.get(STATE_COOKIE)?.value;

  if (!code || !state || !expectedState || state !== expectedState) {
    return loginRedirect(req, "google_state_mismatch");
  }

  let profile;
  try {
    profile = await exchangeGoogleCode(code);
  } catch (err) {
    console.error("Google OAuth exchange failed:", err);
    return loginRedirect(req, "google_exchange_failed");
  }

  if (!profile.email || !profile.email_verified) {
    return loginRedirect(req, "google_email_unverified");
  }

  const email = profile.email.toLowerCase();

  let customer = await prisma.customer.findUnique({ where: { googleId: profile.sub } });
  if (!customer) {
    customer = await prisma.customer.findUnique({ where: { email } });
  }

  if (customer) {
    if (!customer.googleId) {
      customer = await prisma.customer.update({ where: { id: customer.id }, data: { googleId: profile.sub } });
    }
  } else {
    customer = await prisma.customer.create({
      data: {
        email,
        name: profile.name || email,
        googleId: profile.sub,
        passwordHash: null,
      },
    });
  }

  await createSessionCookie("customer", customer.id, customer.name, customer.email);

  const res = NextResponse.redirect(new URL("/customer/vehicles", req.url));
  res.cookies.delete(STATE_COOKIE);
  return res;
}
