// src/app/api/auth/admin-login/route.ts
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyPassword, hashPassword, checkRateLimit } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const { allowed } = checkRateLimit(`admin-login:${ip}`, 8, 5 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { success: false, message: "Too many login attempts. Please wait a few minutes." },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { username, password, institutionCode } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Username and password are required." },
        { status: 400 }
      );
    }

    const cleanUsername = String(username).trim();
    const cleanPass = String(password).trim();
    const cleanInst = institutionCode ? String(institutionCode).trim().toUpperCase() : undefined;

    const supabaseAdmin = getSupabaseAdmin();

    const { data: admin, error } = await supabaseAdmin
      .from("admins")
      .select("id, username, password, institution_id, role")
      .ilike("username", cleanUsername)
      .maybeSingle();

    if (error || !admin) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials." },
        { status: 401 }
      );
    }

    // Verify institution match if institution was specified
    if (cleanInst && admin.institution_id && admin.institution_id.toUpperCase() !== cleanInst) {
      return NextResponse.json(
        { success: false, message: "This admin does not belong to this institution code." },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(cleanPass, admin.password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials." },
        { status: 401 }
      );
    }

    // Auto-upgrade legacy plaintext password to bcrypt hash
    if (!admin.password.startsWith("$2a$") && !admin.password.startsWith("$2b$")) {
      const hashed = await hashPassword(cleanPass);
      supabaseAdmin
        .from("admins")
        .update({ password: hashed })
        .eq("id", admin.id)
        .then(() => {});
    }

    return NextResponse.json({
      success: true,
      user: {
        username: admin.username,
        institutionCode: admin.institution_id,
        role: admin.role || "admin",
      },
    });
  } catch (err: any) {
    console.error("Admin login server error:", err);
    return NextResponse.json(
      { success: false, message: "Authentication service error: " + (err?.message || "Unknown") },
      { status: 500 }
    );
  }
}
