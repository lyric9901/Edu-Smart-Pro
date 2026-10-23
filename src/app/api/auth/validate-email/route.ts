// src/app/api/auth/validate-email/route.ts
import { NextResponse } from "next/server";
import { validateEmail } from "@/lib/validateEmail";
import { checkRateLimit } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const { allowed } = checkRateLimit(`email-val:${ip}`, 30, 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { valid: false, error: "Too many email checks. Please wait a moment." },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { email } = body;

    const result = await validateEmail(email, { checkDatabase: true });
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { valid: false, error: "Validation server error: " + (err?.message || "Unknown") },
      { status: 500 }
    );
  }
}
