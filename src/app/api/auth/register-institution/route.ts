// src/app/api/auth/register-institution/route.ts
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { hashPassword, checkRateLimit } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const { allowed } = checkRateLimit(`register-inst:${ip}`, 5, 15 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { success: false, message: "Too many registration attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { name, owner, phone, username, password, branches = [] } = body;

    if (!name || !username || !password) {
      return NextResponse.json(
        { success: false, message: "Name, username, and password are required." },
        { status: 400 }
      );
    }

    const cleanName = String(name).trim();
    const cleanUsername = String(username).trim();
    const cleanPassword = String(password).trim();

    if (cleanPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters long." },
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
        { success: false, message: "Username already taken. Please choose another." },
        { status: 409 }
      );
    }

    // Generate unique institution code
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

    // 1. Create institution
    const { error: instErr } = await supabaseAdmin.from("institutions").insert({
      id: institutionCode,
      name: cleanName,
      owner: owner ? String(owner).trim() : "",
      phone: phone ? String(phone).trim() : "",
      plan: "premium",
    });

    if (instErr) {
      console.error("Error creating institution:", instErr);
      return NextResponse.json(
        { success: false, message: "Failed to create institution record." },
        { status: 500 }
      );
    }

    // 2. Hash password & create admin
    const hashedPassword = await hashPassword(cleanPassword);
    const { error: adminErr } = await supabaseAdmin.from("admins").insert({
      username: cleanUsername,
      password: hashedPassword,
      institution_id: institutionCode,
      role: "admin",
    });

    if (adminErr) {
      console.error("Error creating admin:", adminErr);
      return NextResponse.json(
        { success: false, message: "Failed to create admin credentials." },
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

    return NextResponse.json({
      success: true,
      institutionCode,
      message: "Institution registered successfully.",
    });
  } catch (err: any) {
    console.error("Institution registration server error:", err);
    return NextResponse.json(
      { success: false, message: "Server error during registration: " + (err?.message || "Unknown") },
      { status: 500 }
    );
  }
}
