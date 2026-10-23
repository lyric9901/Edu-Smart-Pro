// src/app/api/auth/admin-change-password/route.ts
import { NextResponse } from "next/server";
import { checkBotId } from "botid/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyPassword, hashPassword, checkRateLimit } from "@/lib/security";

export async function POST(request: Request) {
  const verification = await checkBotId();
  if (verification.isBot) {
    return NextResponse.json({ error: "Automated request detected. Access denied." }, { status: 403 });
  }

  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const { allowed } = checkRateLimit(`admin-pwd-reset:${ip}`, 5, 5 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { success: false, message: "Too many password reset attempts. Please wait 5 minutes." },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { username, institutionCode, currentPassword, newPassword } = body;

    if (!username || !currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Username, current password, and new password are required." },
        { status: 400 }
      );
    }

    const cleanUsername = String(username).trim();
    const cleanCurrent = String(currentPassword).trim();
    const cleanNew = String(newPassword).trim();
    const cleanInst = institutionCode ? String(institutionCode).trim().toUpperCase() : null;

    if (cleanNew.length < 8) {
      return NextResponse.json(
        { success: false, message: "New password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    let query = supabaseAdmin
      .from("admins")
      .select("id, username, password, institution_id")
      .ilike("username", cleanUsername);

    if (cleanInst) {
      query = query.eq("institution_id", cleanInst);
    }

    const { data: admin, error } = await query.maybeSingle();

    if (error || !admin) {
      return NextResponse.json(
        { success: false, message: "Administrator account not found." },
        { status: 404 }
      );
    }

    const isValid = await verifyPassword(cleanCurrent, admin.password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Current temporary password is incorrect." },
        { status: 401 }
      );
    }

    const hashed = await hashPassword(cleanNew);

    const { error: updateError } = await supabaseAdmin
      .from("admins")
      .update({
        password: hashed,
        force_password_reset: false,
      })
      .eq("id", admin.id);

    if (updateError) {
      console.error("Error updating admin password:", updateError);
      return NextResponse.json(
        { success: false, message: "Database error while updating password." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password updated successfully. You now have full access to your dashboard.",
    });
  } catch (err: any) {
    console.error("Admin change password server exception:", err);
    return NextResponse.json(
      { success: false, message: "Server error: " + (err?.message || "Unknown") },
      { status: 500 }
    );
  }
}
