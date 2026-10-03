// src/app/api/super-admin/check-session/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySuperAdminToken } from "@/lib/security";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("super_admin_session")?.value;

  if (token && verifySuperAdminToken(token)) {
    return NextResponse.json({ authenticated: true });
  }

  return NextResponse.json({ authenticated: false }, { status: 401 });
}
