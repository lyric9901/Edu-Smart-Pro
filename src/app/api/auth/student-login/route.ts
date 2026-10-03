// src/app/api/auth/student-login/route.ts
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyPassword, hashPassword, checkRateLimit } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const { allowed } = checkRateLimit(`student-login:${ip}`, 10, 5 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { success: false, message: "Too many login attempts. Please wait a few minutes." },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { institutionCode, branchId, name, password } = body;

    if (!institutionCode || !name || password === undefined) {
      return NextResponse.json(
        { success: false, message: "Institution code, student name, and password/phone are required." },
        { status: 400 }
      );
    }

    const code = String(institutionCode).toUpperCase().trim();
    const inputName = String(name).trim().toLowerCase();
    const inputPass = String(password).trim();

    const supabaseAdmin = getSupabaseAdmin();

    // 1. Find student by institution and name (case-insensitive)
    const { data: students, error: studentErr } = await supabaseAdmin
      .from("students")
      .select("id, name, phone, roll_number, password, performance")
      .eq("institution_id", code)
      .ilike("name", inputName);

    if (studentErr || !students || students.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials. Please check Name and Password/Phone." },
        { status: 401 }
      );
    }

    let authenticatedStudent: any = null;

    for (const student of students) {
      const storedPass = student.password || "";
      const storedPhone = student.phone || "";

      let isValid = false;
      if (storedPass) {
        isValid = await verifyPassword(inputPass, storedPass);
      } else {
        // Fallback to phone number if student has not set a password
        isValid = (storedPhone === inputPass);
      }

      if (isValid) {
        // Auto-upgrade plaintext password to bcrypt hash in background
        if (storedPass && !storedPass.startsWith("$2a$") && !storedPass.startsWith("$2b$")) {
          const hashed = await hashPassword(storedPass);
          supabaseAdmin
            .from("students")
            .update({ password: hashed })
            .eq("institution_id", code)
            .eq("id", student.id)
            .then(() => {});
        }

        authenticatedStudent = student;
        break;
      }
    }

    if (!authenticatedStudent) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials. Please check Name and Password/Phone." },
        { status: 401 }
      );
    }

    // 2. Fetch the batch and timing for this student
    const { data: bsData } = await supabaseAdmin
      .from("batch_students")
      .select("batch_id")
      .eq("institution_id", code)
      .eq("student_id", authenticatedStudent.id)
      .limit(1);

    let batchInfo: any = null;
    if (bsData && bsData.length > 0) {
      const { data: bData } = await supabaseAdmin
        .from("batches")
        .select("id, name, branch_id, timing_start, timing_end")
        .eq("institution_id", code)
        .eq("id", bsData[0].batch_id)
        .single();
      batchInfo = bData;
    }

    const payload = {
      id: authenticatedStudent.id,
      name: authenticatedStudent.name,
      phone: authenticatedStudent.phone,
      rollNumber: authenticatedStudent.roll_number,
      performance: authenticatedStudent.performance,
      batchId: batchInfo?.id || "",
      batchName: batchInfo?.name || "",
      institutionCode: code,
      branchId: branchId || batchInfo?.branch_id || "main-branch",
      batchTiming: {
        start: batchInfo?.timing_start || "",
        end: batchInfo?.timing_end || "",
      },
      hasPassword: Boolean(authenticatedStudent.password),
    };

    return NextResponse.json({ success: true, student: payload });
  } catch (err: any) {
    console.error("Student login server error:", err);
    return NextResponse.json(
      { success: false, message: "Authentication service error: " + (err?.message || "Unknown") },
      { status: 500 }
    );
  }
}
