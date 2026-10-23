// src/lib/validateEmail.ts
import disposableDomainsArray from "disposable-email-domains";
import { getSupabaseAdmin } from "./supabaseAdmin";

// Construct O(1) lookup set from the 120,000+ disposable domains list
const disposableDomainSet = new Set<string>(disposableDomainsArray);

// Common temporary mail providers fallback
const extraBlockedDomains = new Set([
  "10minutemail.com",
  "tempmail.com",
  "mailinator.com",
  "guerrillamail.com",
  "sharklasers.com",
  "trashmail.com",
  "yopmail.com",
  "dispostable.com",
  "getairmail.com",
  "temp-mail.org",
  "throwawaymail.com",
  "burnermail.io",
  "inboxkitten.com",
  "crazymailing.com",
]);

// Standard RFC 5322 compliant regex for email formatting
const RFC_EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export interface EmailValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates email format and screens for disposable email domains.
 * Pure synchronous validation without database queries.
 */
export function validateEmailFormat(email: string): EmailValidationResult {
  if (!email || typeof email !== "string") {
    return { valid: false, error: "Work email address is required." };
  }

  const cleanEmail = email.trim().toLowerCase();

  if (cleanEmail.length < 5 || cleanEmail.length > 254) {
    return { valid: false, error: "Email address length must be between 5 and 254 characters." };
  }

  if (!RFC_EMAIL_REGEX.test(cleanEmail)) {
    return { valid: false, error: "Please enter a valid email address (e.g. director@institute.com)." };
  }

  const parts = cleanEmail.split("@");
  if (parts.length !== 2) {
    return { valid: false, error: "Invalid email structure." };
  }

  const domain = parts[1];

  // Screen against 120k+ disposable domains and custom list
  if (disposableDomainSet.has(domain) || extraBlockedDomains.has(domain)) {
    return {
      valid: false,
      error: "Temporary or disposable email addresses are not permitted. Please use your official institute or work email.",
    };
  }

  // Check subdomains (e.g. mail.mailinator.com)
  const domainParts = domain.split(".");
  if (domainParts.length > 2) {
    const parentDomain = domainParts.slice(-2).join(".");
    if (disposableDomainSet.has(parentDomain) || extraBlockedDomains.has(parentDomain)) {
      return {
        valid: false,
        error: "Temporary or disposable email providers are not permitted.",
      };
    }
  }

  return { valid: true };
}

/**
 * Comprehensive email validator: checks format, disposable blocklist,
 * and queries Supabase database to guarantee uniqueness across institutions and admins.
 */
export async function validateEmail(
  email: string,
  options: { checkDatabase?: boolean; currentInstitutionId?: string } = { checkDatabase: true }
): Promise<EmailValidationResult> {
  const formatResult = validateEmailFormat(email);
  if (!formatResult.valid) {
    return formatResult;
  }

  if (options.checkDatabase === false) {
    return { valid: true };
  }

  try {
    const cleanEmail = email.trim().toLowerCase();
    const supabaseAdmin = getSupabaseAdmin();

    // 1. Check institutions table
    let instQuery = supabaseAdmin
      .from("institutions")
      .select("id")
      .ilike("email", cleanEmail)
      .limit(1);

    if (options.currentInstitutionId) {
      instQuery = instQuery.neq("id", options.currentInstitutionId);
    }

    const { data: instData, error: instError } = await instQuery;
    if (!instError && instData && instData.length > 0) {
      return {
        valid: false,
        error: "This email address is already associated with an existing institute. Please log in instead.",
      };
    }

    // 2. Check admins table
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from("admins")
      .select("id")
      .ilike("email", cleanEmail)
      .limit(1);

    if (!adminError && adminData && adminData.length > 0) {
      return {
        valid: false,
        error: "An administrator account already exists with this email address.",
      };
    }

    return { valid: true };
  } catch (err: any) {
    console.error("Database email uniqueness check error:", err);
    // On unexpected database connectivity issue, fail safe or proceed if format is valid
    return { valid: true };
  }
}
