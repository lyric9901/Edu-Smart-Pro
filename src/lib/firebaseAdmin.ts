// src/lib/firebaseAdmin.ts
import { getApps, initializeApp, cert } from "firebase-admin/app";
import type { App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import type { Firestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";
import type { Messaging } from "firebase-admin/messaging";

function formatPrivateKey(key: string | undefined): string | undefined {
  if (!key) return undefined;
  let formatted = key.trim();
  if (
    (formatted.startsWith('"') && formatted.endsWith('"')) ||
    (formatted.startsWith("'") && formatted.endsWith("'"))
  ) {
    formatted = formatted.slice(1, -1);
  }
  return formatted.replace(/\\n/g, "\n");
}

let app: App | undefined;

export function hasAdminCredentials(): boolean {
  return !!(
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  );
}

export function getFirebaseAdminApp(): App | null {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0]!;
  }

  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    "tutionmanagement-1";
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  if (clientEmail && privateKey) {
    try {
      app = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      return app;
    } catch (err) {
      console.warn("Firebase Admin initializeApp failed:", err);
      return null;
    }
  }

  return null;
}

export function getAdminFirestore(): Firestore | null {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) return null;
  return getFirestore(adminApp);
}

export function getAdminMessaging(): Messaging | null {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) return null;
  return getMessaging(adminApp);
}
