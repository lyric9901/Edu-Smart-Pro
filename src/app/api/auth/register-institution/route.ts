// src/app/api/auth/register-institution/route.ts
import { NextResponse } from "next/server";
import { checkBotId } from "botid/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { hashPassword, checkRateLimit } from "@/lib/security";
import { validateEmail } from "@/lib/validateEmail";
import { sendEmail } from "@/lib/resend";
import { renderWelcomeTrialEmail } from "@/emails/WelcomeTrialEmail";

export async function POST(request: Request) {
  const verification = await checkBotId();
  if (verification.isBot) {
    return NextResponse.json({ error: "Automated request detected. Access denied." }, { status: 403 });
  }

  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const { allowed } = checkRateLimit(`register-inst:${ip}`, 8, 15 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { success: false, message: "Too many registration attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const {
      name,
      owner,
      fullName,
      phone,
      email,
      age,
      institutionType = "Coaching",
      address = "",
      category = "",
      description = "",
      username,
      password,
      branches = [],
    } = body;

    const cleanName = String(name || "").trim();
    const cleanFullName = String(fullName || owner || "").trim();
    const cleanPhone = String(phone || "").trim();
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanUsername = String(username || "").trim();
    const cleanPassword = String(password || "").trim();
    const cleanType = String(institutionType || "Coaching").trim();
    const cleanAddress = String(address || "").trim();
    const cleanCategory = String(category || "").trim();
    const cleanDescription = String(description || "").trim();

    // Required fields check
    if (!cleanName || !cleanFullName || !cleanPhone || !cleanEmail || !cleanUsername || !cleanPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Institute name, full name, phone number, work email, username, and password are required.",
        },
        { status: 400 }
      );
    }

    if (cleanPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // Email validation (format + disposable filter + database duplicate check)
    const emailValidation = await validateEmail(cleanEmail, { checkDatabase: true });
    if (!emailValidation.valid) {
      return NextResponse.json(
        { success: false, message: emailValidation.error || "Invalid or ineligible work email." },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Check if username already taken
    const { data: existingAdmin } = await supabaseAdmin
      .from("admins")
      .select("id")
      .ilike("username", cleanUsername)
      .maybeSingle();

    if (existingAdmin) {
      return NextResponse.json(
        { success: false, message: "This username is already taken. Please choose another." },
        { status: 409 }
      );
    }

    // Generate unique institution code (e.g. LPS4829)
    const prefix = cleanName.replace(/[^a-zA-Z]/g, "").substring(0, 3).toUpperCase() || "EDU";
    let institutionCode = "";
    let codeFound = false;

    for (let attempts = 0; attempts < 10; attempts++) {
      const candidateCode = `${prefix}${Math.floor(1000 + Math.random() * 9000)}`;
      const { data: existingInst } = await supabaseAdmin
        .from("institutions")
        .select("id")
        .eq("id", candidateCode)
        .maybeSingle();

      if (!existingInst) {
        institutionCode = candidateCode;
        codeFound = true;
        break;
      }
    }

    if (!codeFound) {
      institutionCode = `${prefix}${Date.now().toString().slice(-4)}`;
    }

    // 7-day trial dates
    const trialStartDate = new Date().toISOString();
    const trialEndDateObj = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const trialEndDate = trialEndDateObj.toISOString();

    // 1. Create institution with trial status
    const { error: instErr } = await supabaseAdmin.from("institutions").insert({
      id: institutionCode,
      name: cleanName,
      owner: cleanFullName,
      phone: cleanPhone,
      email: cleanEmail,
      plan: "trial",
      institution_type: cleanType,
      address: cleanAddress,
      category: cleanCategory,
      description: cleanDescription,
      trial_start_date: trialStartDate,
      trial_end_date: trialEndDate,
      plan_status: "active",
      notified_day_4: false,
      notified_expired: false,
    });

    if (instErr) {
      console.error("Error creating institution:", instErr);
      return NextResponse.json(
        { success: false, message: "Failed to initialize institution record." },
        { status: 500 }
      );
    }

    // 2. Hash password & create admin with force_password_reset = true
    const hashedPassword = await hashPassword(cleanPassword);
    const { error: adminErr } = await supabaseAdmin.from("admins").insert({
      username: cleanUsername,
      password: hashedPassword,
      institution_id: institutionCode,
      role: "admin",
      email: cleanEmail,
      phone: cleanPhone,
      full_name: cleanFullName,
      age: age ? Number(age) : null,
      force_password_reset: true,
    });

    if (adminErr) {
      console.error("Error creating admin:", adminErr);
      return NextResponse.json(
        { success: false, message: "Failed to create administrator credentials." },
        { status: 500 }
      );
    }

    // 3. Create branches
    const validBranches = Array.isArray(branches)
      ? branches.filter((b: any) => typeof b === "string" && b.trim() !== "")
      : [];

    if (validBranches.length === 0) {
      validBranches.push("Main Branch");
    }

    const branchRows = validBranches.map((bName: string) => {
      const bTrimmed = bName.trim();
      const bId = bTrimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      return {
        id: bId || "main-branch",
        institution_id: institutionCode,
        name: bTrimmed,
      };
    });

    await supabaseAdmin.from("branches").upsert(branchRows);

    // 4. Send Email 1: Welcome & Credentials via Resend (async, non-blocking)
    const formattedDate = trialEndDateObj.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://edusmartpro.in"}/login?code=${institutionCode}`;

    const emailContent = renderWelcomeTrialEmail({
      adminName: cleanFullName,
      instituteName: cleanName,
      institutionCode,
      username: cleanUsername,
      tempPassword: cleanPassword,
      loginUrl,
      trialEndDate: formattedDate,
    });

    sendEmail({
      to: cleanEmail,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    }).catch((emailErr) => {
      console.error("[Resend] Welcome email transmission error:", emailErr);
    });

    return NextResponse.json({
      success: true,
      institutionCode,
      username: cleanUsername,
      tempPassword: cleanPassword,
      trialEndDate,
      message: "7-Day Free Trial activated successfully. Confirmation email sent.",
    });
  } catch (err: any) {
    console.error("Institution registration server error:", err);
    return NextResponse.json(
      { success: false, message: "Server error during registration: " + (err?.message || "Unknown") },
      { status: 500 }
    );
  }
}
