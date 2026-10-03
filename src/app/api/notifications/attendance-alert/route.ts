// src/app/api/notifications/attendance-alert/route.ts
import { NextResponse } from "next/server";
import { getAdminMessaging, hasAdminCredentials } from "@/lib/firebaseAdmin";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { addDirectNotification } from "@/lib/supabaseDb";
import { checkRateLimit } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const { allowed } = checkRateLimit(`att-alert:${ip}`, 60, 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many attendance alert requests. Please slow down." },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { studentId, studentName, date, institutionCode, batchId } = body;

    if (!studentId || !studentName || !date || !institutionCode) {
      return NextResponse.json(
        { error: "studentId, studentName, date, and institutionCode are required" },
        { status: 400 }
      );
    }

    const cleanInst = String(institutionCode).toUpperCase().trim();
    const sid = String(studentId).trim();
    const cleanName = String(studentName).trim().slice(0, 100);
    const cleanDate = String(date).trim().slice(0, 20);

    const supabaseAdmin = getSupabaseAdmin();

    // Verify student exists under this institution
    const { data: studentRecord } = await supabaseAdmin
      .from("students")
      .select("id")
      .eq("institution_id", cleanInst)
      .eq("id", sid)
      .maybeSingle();

    if (!studentRecord) {
      return NextResponse.json(
        { error: "Student does not exist in the specified institution." },
        { status: 404 }
      );
    }

    // 1. Create notification item and persist to student's inbox in Supabase
    try {
      await addDirectNotification(sid, {
        title: "Attendance Alert",
        text: `${cleanName} was marked absent on ${cleanDate}.`,
        type: "alert",
        date: new Date().toISOString(),
        institutionCode: cleanInst,
        batchId: batchId ? String(batchId).trim() : undefined,
      });
    } catch (e) {
      console.warn("Could not save direct notification in Supabase:", e);
    }

    // 2. Check if Firebase Admin credentials are present for FCM push
    if (!hasAdminCredentials()) {
      return NextResponse.json({
        success: true,
        savedToInbox: true,
        sentCount: 0,
        message: "Saved to inbox. Firebase push credentials not configured.",
      });
    }

    const messaging = getAdminMessaging();
    if (!messaging) {
      return NextResponse.json({
        success: true,
        savedToInbox: true,
        sentCount: 0,
        message: "Saved to inbox. FCM messaging not initialized.",
      });
    }

    // 3. Retrieve FCM tokens from Supabase users table
    let tokens: string[] = [];
    try {
      const { data: userRow } = await supabaseAdmin
        .from("users")
        .select("fcm_tokens")
        .eq("id", sid)
        .eq("institution_id", cleanInst)
        .maybeSingle();

      if (userRow && Array.isArray(userRow.fcm_tokens)) {
        tokens.push(...userRow.fcm_tokens);
      }
    } catch (e) {
      console.warn("Could not query user FCM tokens from Supabase:", e);
    }

    tokens = Array.from(new Set(tokens.filter(Boolean))).slice(0, 50);

    if (tokens.length === 0) {
      return NextResponse.json({
        success: true,
        savedToInbox: true,
        message: "Saved to inbox. No active FCM tokens found for push.",
        sentCount: 0,
      });
    }

    // 4. Dispatch Web Push Notification via FCM
    const payload = {
      tokens,
      notification: {
        title: "Attendance Alert",
        body: `${cleanName} was marked absent on ${cleanDate}.`,
      },
      data: {
        url: "/student?tab=notices",
        type: "attendance-alert",
        studentId: sid,
        date: cleanDate,
      },
      webpush: {
        notification: {
          icon: "/icons/icon-192x192.png",
          badge: "/icons/icon-72x72.png",
        },
        fcmOptions: {
          link: "/student?tab=notices",
        },
      },
    };

    const response = await messaging.sendEachForMulticast(payload);

    return NextResponse.json({
      success: true,
      savedToInbox: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
    });
  } catch (error: any) {
    console.warn("Attendance alert dispatch warning:", error);
    return NextResponse.json({
      success: false,
      error: error?.message || "Internal server error",
    });
  }
}
