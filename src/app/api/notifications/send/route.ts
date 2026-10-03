// src/app/api/notifications/send/route.ts
import { NextResponse } from "next/server";
import { getAdminMessaging, hasAdminCredentials } from "@/lib/firebaseAdmin";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { addDirectNotification } from "@/lib/supabaseDb";
import { checkRateLimit } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const { allowed } = checkRateLimit(`notif-send:${ip}`, 30, 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many notification requests. Please slow down." },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const {
      tokens = [],
      title,
      body: content,
      url = "/student?tab=notices",
      type = "notice",
      studentId,
      userId,
      institutionCode,
      batchId,
    } = body;

    if (!institutionCode) {
      return NextResponse.json(
        { error: "institutionCode is required." },
        { status: 400 }
      );
    }

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "Valid title is required." },
        { status: 400 }
      );
    }

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { error: "Valid notification body is required." },
        { status: 400 }
      );
    }

    const cleanInst = String(institutionCode).toUpperCase().trim();
    const cleanTitle = title.trim().slice(0, 150);
    const cleanBody = content.trim().slice(0, 1000);
    const cleanType = String(type).slice(0, 30).replace(/[^a-zA-Z0-9_-]/g, "");

    // Sanitize URL: must start with single '/', no protocol/domain allowed
    const cleanUrl =
      typeof url === "string" && url.startsWith("/") && !url.startsWith("//")
        ? url.slice(0, 200)
        : "/student?tab=notices";

    const supabaseAdmin = getSupabaseAdmin();

    // Verify institution exists
    const { data: instExists } = await supabaseAdmin
      .from("institutions")
      .select("id")
      .eq("id", cleanInst)
      .maybeSingle();

    if (!instExists) {
      return NextResponse.json(
        { error: "Invalid institution." },
        { status: 403 }
      );
    }

    const targetId = studentId || userId;
    const cleanTargetId = targetId ? String(targetId).trim() : null;

    // 1. Save to individual user/student inbox in Supabase if target specified
    if (cleanTargetId) {
      try {
        await addDirectNotification(cleanTargetId, {
          title: cleanTitle,
          text: cleanBody,
          type: cleanType,
          date: new Date().toISOString(),
          institutionCode: cleanInst,
          batchId: batchId ? String(batchId).trim() : undefined,
        });
      } catch (e) {
        console.warn("Could not save direct notification in Supabase:", e);
      }
    }

    // 2. Resolve FCM tokens
    let pushTokens: string[] = Array.isArray(tokens) ? tokens.slice(0, 200) : [];

    // If specific user target provided and tokens array empty, fetch user tokens from Supabase
    if (cleanTargetId && pushTokens.length === 0) {
      try {
        const { data: userRow } = await supabaseAdmin
          .from("users")
          .select("fcm_tokens")
          .eq("id", cleanTargetId)
          .eq("institution_id", cleanInst)
          .single();

        if (userRow && Array.isArray(userRow.fcm_tokens)) {
          pushTokens.push(...userRow.fcm_tokens);
        }
      } catch (e) {
        console.warn("Error fetching target user tokens from Supabase:", e);
      }
    }

    // If institutionCode provided and tokens still empty, broadcast to all institution users
    if (cleanInst && pushTokens.length === 0 && !cleanTargetId) {
      try {
        const { data: usersRows } = await supabaseAdmin
          .from("users")
          .select("fcm_tokens")
          .eq("institution_id", cleanInst)
          .limit(200);

        (usersRows || []).forEach((u) => {
          if (Array.isArray(u.fcm_tokens)) {
            pushTokens.push(...u.fcm_tokens);
          }
        });
      } catch (e) {
        console.warn("Error broadcasting institution tokens from Supabase:", e);
      }
    }

    const validTokens = Array.from(new Set(pushTokens.filter(Boolean))).slice(0, 500);

    if (!hasAdminCredentials()) {
      return NextResponse.json({
        success: true,
        savedToInbox: !!cleanTargetId,
        sentCount: 0,
        message: "Notification saved to inbox. Firebase push credentials not configured.",
      });
    }

    const messaging = getAdminMessaging();
    if (!messaging || validTokens.length === 0) {
      return NextResponse.json({
        success: true,
        savedToInbox: !!cleanTargetId,
        sentCount: 0,
        message: "Notification saved. No active push tokens found to deliver on web.",
      });
    }

    const payload = {
      tokens: validTokens,
      notification: {
        title: cleanTitle,
        body: cleanBody,
      },
      data: {
        url: cleanUrl,
        type: cleanType,
      },
      webpush: {
        notification: {
          icon: "/icons/icon-192x192.png",
          badge: "/icons/icon-72x72.png",
        },
        fcmOptions: {
          link: cleanUrl,
        },
      },
    };

    const response = await messaging.sendEachForMulticast(payload);

    return NextResponse.json({
      success: true,
      savedToInbox: !!cleanTargetId,
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
