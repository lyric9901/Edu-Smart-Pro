// src/app/api/notifications/send/route.ts
import { NextResponse } from "next/server";
import { getAdminMessaging, getAdminFirestore, hasAdminCredentials } from "@/lib/firebaseAdmin";

export async function POST(request: Request) {
  try {
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

    if (!title || !content) {
      return NextResponse.json(
        { error: "title and body are required." },
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
    const db = getAdminFirestore();

    if (!messaging || !db) {
      return NextResponse.json({
        success: false,
        skipped: true,
        message: "Firebase Admin could not be initialized.",
      });
    }

    const targetId = studentId || userId;
    const notifItem = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      title,
      text: content,
      date: new Date().toISOString(),
      createdAt: Date.now(),
      type,
    };

    const { FieldValue } = await import("firebase-admin/firestore");

    // 1. Save to individual user/student inbox if target specified
    if (targetId) {
      try {
        await db.collection("users").doc(String(targetId)).set({
          notifications: FieldValue.arrayUnion(notifItem),
          updatedAt: Date.now(),
        }, { merge: true });
      } catch (e) {
        console.warn("Could not save to users doc:", e);
      }

      if (institutionCode && batchId) {
        try {
          const batchRef = db.collection("institutions").doc(String(institutionCode)).collection("batches").doc(String(batchId));
          const batchSnap = await batchRef.get();
          if (batchSnap.exists) {
            const batchData = batchSnap.data();
            const students = batchData?.students || [];
            let modified = false;
            const updatedStudents = students.map((s: any) => {
              if (String(s.id) === String(targetId)) {
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
          console.warn("Could not update batch student notifications:", e);
        }
      }
    }

    // 2. Resolve FCM tokens
    let pushTokens: string[] = Array.isArray(tokens) ? [...tokens] : [];

    // If specific user target provided and tokens array empty, fetch user tokens
    if (targetId && pushTokens.length === 0) {
      try {
        const userDoc = await db.collection("users").doc(String(targetId)).get();
        if (userDoc.exists && Array.isArray(userDoc.data()?.fcmTokens)) {
          pushTokens.push(...userDoc.data()!.fcmTokens);
        }
      } catch (e) {
        console.warn("Error fetching target user tokens:", e);
      }
    }

    // If institutionCode provided and tokens still empty, broadcast to all institution students
    if (institutionCode && pushTokens.length === 0) {
      try {
        const batchesSnap = await db.collection("institutions").doc(String(institutionCode)).collection("batches").get();
        const studentIds: string[] = [];
        batchesSnap.forEach((batchDoc) => {
          const students = batchDoc.data()?.students || [];
          students.forEach((s: any) => {
            const sid = s.id || s.phone || s.name;
            if (sid) studentIds.push(String(sid));
          });
        });

        const uniqueStudentIds = Array.from(new Set(studentIds)).slice(0, 100);
        for (const sid of uniqueStudentIds) {
          const uDoc = await db.collection("users").doc(sid).get();
          if (uDoc.exists && Array.isArray(uDoc.data()?.fcmTokens)) {
            pushTokens.push(...uDoc.data()!.fcmTokens);
          }
        }
      } catch (e) {
        console.warn("Error broadcasting institution tokens:", e);
      }
    }

    const validTokens = Array.from(new Set(pushTokens.filter(Boolean)));

    if (validTokens.length === 0) {
      return NextResponse.json({
        success: true,
        savedToInbox: !!targetId,
        sentCount: 0,
        message: "Notification saved. No active push tokens found to deliver on web.",
      });
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
      savedToInbox: !!targetId,
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
