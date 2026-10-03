// src/app/api/auth/student-change-password/route.ts
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyPassword, hashPassword, checkRateLimit } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const { allowed } = checkRateLimit(`student-pwd:${ip}`, 5, 5 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { success: false, message: "Too many password change attempts. Please wait." },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { institutionCode, studentId, currentPassword, newPassword } = body;

    if (!institutionCode || !studentId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400 }
      );
    }

    if (String(newPassword).length < 6) {
      return NextResponse.json(
        { success: false, message: "New password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const code = String(institutionCode).toUpperCase().trim();
    const sid = String(studentId).trim();
    const curPass = String(currentPassword).trim();
    const newPass = String(newPassword).trim();

    const supabaseAdmin = getSupabaseAdmin();

    const { data: student, error } = await supabaseAdmin
      .from("students")
      .select("id, password, phone")
      .eq("institution_id", code)
      .eq("id", sid)
      .maybeSingle();

    if (error || !student) {
      return NextResponse.json(
        { success: false, message: "Student record not found." },
        { status: 404 }
      );
    }

    let isValid = false;
    if (student.password) {
      isValid = await verifyPassword(curPass, student.password);
    } else {
      // First-time setup fallback to registered phone
      isValid = (student.phone === curPass);
    }

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Current password or phone number is incorrect." },
        { status: 401 }
      );
    }

    const hashed = await hashPassword(newPass);
    const { error: updateErr } = await supabaseAdmin
      .from("students")
      .update({ password: hashed })
      .eq("institution_id", code)
      .eq("id", sid);

    if (updateErr) {
      console.error("Student password update error:", updateErr);
      return NextResponse.json(
        { success: false, message: "Database error updating password." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Password updated successfully." });
  } catch (err: any) {
    console.error("Change password server error:", err);
    return NextResponse.json(
      { success: false, message: "Server error: " + (err?.message || "Unknown") },
      { status: 500 }
    );
  }
}
