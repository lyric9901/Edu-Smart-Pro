import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { key } = body;

    const masterKey = process.env.SUPER_ADMIN_MASTER_KEY || process.env.NEXT_PUBLIC_SUPER_ADMIN_KEY;

    if (key && key === masterKey) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, message: "Invalid Master Key" },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
