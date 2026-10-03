// src/app/api/super-admin/verify/route.ts
import { NextResponse } from "next/server";
import { timingSafeEqualStr, createSuperAdminToken, checkRateLimit } from "@/lib/security";

export async function POST(request: Request) {
  try {
    // 1. IP Rate Limiting (5 attempts per 15 minutes)
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown-client";
    const { allowed, remaining } = checkRateLimit(`super-admin-verify:${ip}`, 5, 15 * 60 * 1000);

    if (!allowed) {
      return NextResponse.json(
        { success: false, message: "Too many failed attempts. Try again in 15 minutes." },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { key } = body;

    // 2. Read strictly server-side secret
    const masterKey = process.env.SUPER_ADMIN_MASTER_KEY;

    if (!masterKey) {
      console.error("CRITICAL: SUPER_ADMIN_MASTER_KEY is not configured in server environment!");
      return NextResponse.json(
        { success: false, message: "Server authentication error" },
        { status: 500 }
      );
    }

    // 3. Constant-time comparison
    if (key && typeof key === "string" && timingSafeEqualStr(key.trim(), masterKey.trim())) {
      const token = createSuperAdminToken();

      const response = NextResponse.json({ success: true, message: "Authentication successful" });

      // 4. Set HttpOnly, Secure, SameSite=Strict session cookie
      response.cookies.set("super_admin_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 24 * 60 * 60, // 24 hours
      });

      return response;
    }

    return NextResponse.json(
      { success: false, message: "Invalid Master Key", remainingAttempts: remaining },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
