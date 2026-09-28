// src/app/api/notifications/attendance-alert/route.ts
import { NextResponse } from "next/server";
import { getAdminFirestore, getAdminMessaging, hasAdminCredentials } from "@/lib/firebaseAdmin";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { studentId, studentName, date, institutionCode, batchId } = body;

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

    // 1. Create notification item and persist to student's inbox
    const notifItem = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      title: "Attendance Alert",
      text: `${studentName} was marked absent on ${date}.`,
      date: new Date().toISOString(),
      createdAt: Date.now(),
      type: "alert",
    };

    const { FieldValue } = await import("firebase-admin/firestore");

    // Save to users/${studentId} in Firestore
    try {
      await db.collection("users").doc(String(studentId)).set({
        notifications: FieldValue.arrayUnion(notifItem),
        updatedAt: Date.now(),
      }, { merge: true });
    } catch (e) {
      console.warn("Could not save notification to users doc:", e);
    }

    // Save to batch student's notifications array if batch and institution are known
    if (institutionCode && batchId) {
      try {
        const batchRef = db.collection("institutions").doc(String(institutionCode)).collection("batches").doc(String(batchId));
        const batchSnap = await batchRef.get();
        if (batchSnap.exists) {
          const batchData = batchSnap.data();
          const students = batchData?.students || [];
          let modified = false;
          const updatedStudents = students.map((s: any) => {
            if (String(s.id) === String(studentId)) {
              modified = true;
              const existing = Array.isArray(s.notifications) ? s.notifications : [];
              return { ...s, notifications: [...existing, notifItem] };
            }
            return s;
          });
          if (modified) {
            await batchRef.update({ students: updatedStudents });
          }
        }
      } catch (e) {
        console.warn("Could not save notification to batch students:", e);
      }
    }

    // 2. Retrieve FCM tokens for Web Push
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

    // Check fallback students collection
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
        savedToInbox: true,
        message: "Saved to inbox. No active FCM tokens found for push.",
        sentCount: 0,
      });
    }

    // 3. Dispatch Web Push Notification
    const payload = {
      tokens,
      notification: {
        title: "Attendance Alert",
        body: `${studentName} was marked absent on ${date}.`,
      },
      data: {
        url: "/student?tab=notices",
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
    console.warn("Attendance alert notification dispatch warning:", error);
    return NextResponse.json({
      success: false,
      error: error?.message || "Internal server error",
    });
  }
}
