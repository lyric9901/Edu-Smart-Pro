// src/app/api/notifications/send/route.ts
import { NextResponse } from "next/server";
import { getAdminMessaging, hasAdminCredentials } from "@/lib/firebaseAdmin";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { tokens, title, body: content, url = "/dashboard/attendance", type = "general" } = body;

    if (!Array.isArray(tokens) || tokens.length === 0 || !title || !content) {
      return NextResponse.json(
        { error: "tokens (array), title, and body are required." },
        { status: 400 }
      );
    }

    if (!hasAdminCredentials()) {
      return NextResponse.json({
        success: false,
        skipped: true,
        message: "Firebase Admin credentials (FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) not configured on server.",
      });
    }

    const messaging = getAdminMessaging();
    if (!messaging) {
      return NextResponse.json({
        success: false,
        skipped: true,
        message: "Firebase Admin could not be initialized.",
      });
    }

    const validTokens = Array.from(new Set(tokens.filter(Boolean)));

    if (validTokens.length === 0) {
      return NextResponse.json({ success: true, sentCount: 0 });
    }

    const payload = {
      tokens: validTokens,
      notification: {
        title,
        body: content,
      },
      data: {
        url,
        type,
      },
      webpush: {
        notification: {
          icon: "/icons/icon-192x192.png",
          badge: "/icons/icon-72x72.png",
        },
        fcmOptions: {
          link: url,
        },
      },
    };

    const response = await messaging.sendEachForMulticast(payload);

    return NextResponse.json({
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
    });
  } catch (error: any) {
    console.warn("Push notification dispatch warning:", error);
    return NextResponse.json({
      success: false,
      error: error?.message || "Internal server error",
    });
  }
}
