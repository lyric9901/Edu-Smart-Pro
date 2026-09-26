// src/lib/notifications.ts
import { app, firestore } from "./firebase";
import { getMessaging, getToken, isSupported, Messaging } from "firebase/messaging";
import { doc, setDoc, arrayUnion } from "firebase/firestore";

let messagingInstance: Messaging | null = null;

async function clearConflictingFCMIndexedDB(): Promise<void> {
  if (typeof window === "undefined" || !("indexedDB" in window)) return;
  return new Promise((resolve) => {
    try {
      const dbsToClean = ["firebase-messaging-database", "fcm_token_details_db"];
      let completed = 0;
      dbsToClean.forEach((dbName) => {
        const req = window.indexedDB.deleteDatabase(dbName);
        req.onsuccess = req.onerror = req.onblocked = () => {
          completed++;
          if (completed === dbsToClean.length) resolve();
        };
      });
      setTimeout(resolve, 600);
    } catch {
      resolve();
    }
  });
}

export async function getClientMessaging(): Promise<Messaging | null> {
  if (typeof window === "undefined") return null;

  try {
    const supported = await isSupported();
    if (!supported) {
      console.warn("FCM is not supported in this browser environment.");
      return null;
    }
    if (!messagingInstance) {
      messagingInstance = getMessaging(app);
    }
    return messagingInstance;
  } catch (err: any) {
    if (err?.name === "VersionError" || String(err?.message || "").includes("requested version")) {
      console.warn("Recovering from FCM IndexedDB version conflict...");
      await clearConflictingFCMIndexedDB();
      try {
        messagingInstance = getMessaging(app);
        return messagingInstance;
      } catch (retryErr) {
        console.warn("FCM messaging recovery retry failed:", retryErr);
        return null;
      }
    }
    console.warn("Failed to initialize Firebase Messaging:", err);
    return null;
  }
}

/**
 * Initializes and silently requests FCM Push Notification permission and registers token to Firestore.
 */
export async function initPushNotifications(userId: string): Promise<string | null> {
  if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) {
    return null;
  }

  if (!userId) return null;

  try {
    const supported = await isSupported();
    if (!supported) return null;

    if (Notification.permission === "denied") {
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return null;
    }

    const messaging = await getClientMessaging();
    if (!messaging) return null;

    const serviceWorkerRegistration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || undefined;

    let currentToken: string | null = null;
    try {
      currentToken = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration,
      });
    } catch (tokenErr: any) {
      if (tokenErr?.name === "VersionError" || String(tokenErr?.message || "").includes("requested version")) {
        console.warn("FCM IndexedDB Version conflict detected. Clearing cached DB and retrying...");
        await clearConflictingFCMIndexedDB();
        try {
          currentToken = await getToken(messaging, {
            vapidKey,
            serviceWorkerRegistration,
          });
        } catch (retryErr) {
          console.warn("FCM token retrieval retry failed:", retryErr);
          return null;
        }
      } else {
        console.warn("Unable to retrieve FCM token:", tokenErr);
        return null;
      }
    }

    if (currentToken) {
      const userDocRef = doc(firestore, "users", userId);
      await setDoc(
        userDocRef,
        {
          fcmTokens: arrayUnion(currentToken),
          updatedAt: Date.now(),
        },
        { merge: true }
      );
      return currentToken;
    }

    return null;
  } catch (error: any) {
    if (error?.name === "VersionError" || String(error?.message || "").includes("requested version")) {
      console.warn("FCM VersionError handled safely: cleaning up conflicting IndexedDB instance.");
      await clearConflictingFCMIndexedDB();
    } else {
      console.warn("Push notification setup warning:", error);
    }
    return null;
  }
}

/**
 * Alias helper function for explicit notification permission requests.
 */
export async function requestNotificationPermission(userId: string): Promise<string | null> {
  return initPushNotifications(userId);
}
