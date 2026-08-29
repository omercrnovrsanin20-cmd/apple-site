import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAMES, verifySession } from "@/lib/auth";

// First line of defense for page routes. This alone is NOT the security
// boundary -- every API route re-checks the session server-side as well,
// since middleware can be bypassed by calling APIs directly and the task
// requires server-side authorization regardless of the UI.

const PUBLIC_STAFF_PATHS = ["/staff/login"];
const PUBLIC_OWNER_PATHS = ["/owner/login"];
const PUBLIC_CUSTOMER_PATHS = ["/customer/login", "/customer/register"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/staff") && !PUBLIC_STAFF_PATHS.includes(pathname)) {
    const token = req.cookies.get(COOKIE_NAMES.staff)?.value;
    const session = await verifySession(token);
    if (!session || session.role !== "staff") {
      return NextResponse.redirect(new URL("/staff/login", req.url));
    }
  }

  if (pathname.startsWith("/owner") && !PUBLIC_OWNER_PATHS.includes(pathname)) {
    const token = req.cookies.get(COOKIE_NAMES.owner)?.value;
    const session = await verifySession(token);
    if (!session || session.role !== "owner") {
      return NextResponse.redirect(new URL("/owner/login", req.url));
    }
  }

  const protectedCustomerPrefixes = [
    "/customer/vehicles",
    "/customer/requests",
    "/customer/appointments",
    "/customer/history",
    "/customer/notifications",
    "/customer/account",
  ];
  if (
    protectedCustomerPrefixes.some((p) => pathname.startsWith(p)) &&
    !PUBLIC_CUSTOMER_PATHS.includes(pathname)
  ) {
    const token = req.cookies.get(COOKIE_NAMES.customer)?.value;
    const session = await verifySession(token);
    if (!session || session.role !== "customer") {
      return NextResponse.redirect(new URL("/customer/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/staff/:path*", "/owner/:path*", "/customer/:path*"],
};
