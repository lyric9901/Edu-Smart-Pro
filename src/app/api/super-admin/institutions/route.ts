// src/app/api/super-admin/institutions/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySuperAdminToken, hashPassword } from "@/lib/security";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

async function isAuthorized(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("super_admin_session")?.value;
  if (!token) return false;
  return verifySuperAdminToken(token);
}

export async function GET() {
  try {
    const authorized = await isAuthorized();
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const [instRes, admRes] = await Promise.all([
      supabaseAdmin.from("institutions").select("*"),
      supabaseAdmin.from("admins").select("id, username, institution_id, role"),
    ]);

    const schools: Record<string, any> = {};
    (instRes.data || []).forEach((row) => {
      schools[row.id] = {
        id: row.id,
        name: row.name,
        owner: row.owner,
        phone: row.phone,
        plan: row.plan,
        createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
      };
    });

    const admins: Record<string, any> = {};
    (admRes.data || []).forEach((row) => {
      admins[row.username] = {
        id: row.id,
        username: row.username,
        password: "••••••••",
        institutionCode: row.institution_id,
        role: row.role || "admin",
      };
    });

    return NextResponse.json({ success: true, schools, admins });
  } catch (err: any) {
    console.error("Super admin data fetch error:", err);
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authorized = await isAuthorized();
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { action } = body;
    const supabaseAdmin = getSupabaseAdmin();

    if (action === "delete_institution") {
      const { institutionId, username } = body;
      if (!institutionId) {
        return NextResponse.json({ error: "institutionId is required" }, { status: 400 });
      }

      await supabaseAdmin.from("institutions").delete().eq("id", String(institutionId));
      if (username) {
        await supabaseAdmin.from("admins").delete().ilike("username", String(username).trim());
      }
      return NextResponse.json({ success: true, message: "Institution deleted." });
    }

    if (action === "update_institution") {
      const { institutionId, updates } = body;
      if (!institutionId || !updates) {
        return NextResponse.json({ error: "institutionId and updates required" }, { status: 400 });
      }

      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.owner !== undefined) payload.owner = updates.owner;
      if (updates.phone !== undefined) payload.phone = updates.phone;

      const { error } = await supabaseAdmin
        .from("institutions")
        .update(payload)
        .eq("id", String(institutionId));

      if (error) throw error;
      return NextResponse.json({ success: true, message: "Institution updated." });
    }

    if (action === "update_password") {
      const { username, newPassword } = body;
      if (!username || !newPassword) {
        return NextResponse.json({ error: "username and newPassword required" }, { status: 400 });
      }

      const cleanUser = String(username).trim();
      const hashed = await hashPassword(String(newPassword).trim());

      const { error } = await supabaseAdmin
        .from("admins")
        .update({ password: hashed })
        .ilike("username", cleanUser);

      if (error) throw error;
      return NextResponse.json({ success: true, message: "Password updated." });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("Super admin manage error:", err);
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}
