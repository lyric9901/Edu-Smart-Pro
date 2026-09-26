// src/app/api/notifications/attendance-alert/route.ts
import { NextResponse } from "next/server";
import { getAdminFirestore, getAdminMessaging, hasAdminCredentials } from "@/lib/firebaseAdmin";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { studentId, studentName, date } = body;

    if (!studentId || !studentName || !date) {
      return NextResponse.json(
        { error: "studentId, studentName, and date are required" },
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

    const db = getAdminFirestore();
    const messaging = getAdminMessaging();

    if (!db || !messaging) {
      return NextResponse.json({
        success: false,
        skipped: true,
        message: "Firebase Admin could not be initialized.",
      });
    }

    // 1. Retrieve FCM tokens for the student / parent
    let tokens: string[] = [];

    // Check direct user doc
    try {
      const userDoc = await db.collection("users").doc(String(studentId)).get();
      if (userDoc.exists) {
        const data = userDoc.data();
        if (Array.isArray(data?.fcmTokens)) {
          tokens.push(...data.fcmTokens);
        }
      }
    } catch (e) {
      console.warn("Could not query users collection:", e);
    }

    // Check if student doc exists in students collection as fallback
    if (tokens.length === 0) {
      try {
        const studentDoc = await db.collection("students").doc(String(studentId)).get();
        if (studentDoc.exists) {
          const data = studentDoc.data();
          if (Array.isArray(data?.fcmTokens)) {
            tokens.push(...data.fcmTokens);
          }
        }
      } catch (e) {
        console.warn("Could not query students collection:", e);
      }
    }

    // Deduplicate tokens
    tokens = Array.from(new Set(tokens.filter(Boolean)));

    if (tokens.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No active FCM tokens found for this student/parent.",
        sentCount: 0,
      });
    }

    // 2. Dispatch Multicast Push Notification
    const payload = {
      tokens,
      notification: {
        title: "Attendance Alert",
        body: `${studentName} was marked absent on ${date}.`,
      },
      data: {
        url: "/dashboard/attendance",
        type: "attendance-alert",
        studentId: String(studentId),
        date: String(date),
      },
      webpush: {
        notification: {
          icon: "/icons/icon-192x192.png",
          badge: "/icons/icon-72x72.png",
        },
        fcmOptions: {
          link: "/dashboard/attendance",
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
    console.warn("Attendance alert notification dispatch warning:", error);
    return NextResponse.json({
      success: false,
      error: error?.message || "Internal server error",
    });
  }
}
