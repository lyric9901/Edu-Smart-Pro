// src/lib/security.ts
import bcrypt from "bcryptjs";
import crypto from "crypto";

const BCRYPT_SALT_ROUNDS = 12;

/**
 * Hash a password using bcrypt (12 rounds)
 */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_SALT_ROUNDS);
}

/**
 * Verify password against stored hash or fallback to plaintext (auto-upgrade supported)
 */
export async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  if (!plain || !stored) return false;
  if (stored.startsWith("$2a$") || stored.startsWith("$2b$") || stored.startsWith("$2y$")) {
    return bcrypt.compare(plain, stored);
  }
  // Constant time comparison for plaintext fallback
  return timingSafeEqualStr(plain, stored);
}

/**
 * Compare two strings in constant time to prevent timing attacks
 */
export function timingSafeEqualStr(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const bufA = Buffer.from(a, "utf-8");
  const bufB = Buffer.from(b, "utf-8");
  if (bufA.length !== bufB.length) {
    // Prevent short-circuiting on length to mitigate timing leaks
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Super Admin Session Token creation and validation using HMAC-SHA256
 */
function getSigningSecret(): string {
  return process.env.SUPER_ADMIN_MASTER_KEY || "edusmart-super-admin-internal-salt";
}

export interface SuperAdminSession {
  role: "super-admin";
  iat: number;
  exp: number;
}

export function createSuperAdminToken(): string {
  const payload: SuperAdminSession = {
    role: "super-admin",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", getSigningSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifySuperAdminToken(token: string): SuperAdminSession | null {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  const expectedSig = crypto.createHmac("sha256", getSigningSecret()).update(body).digest("base64url");
  if (!timingSafeEqualStr(sig, expectedSig)) return null;

  try {
    const payload: SuperAdminSession = JSON.parse(Buffer.from(body, "base64url").toString("utf-8"));
    if (payload.role !== "super-admin") return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * In-memory IP rate limiter for authentication endpoints
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, maxAttempts = 5, windowMs = 15 * 60 * 1000): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  if (entry.count >= maxAttempts) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: maxAttempts - entry.count };
}
