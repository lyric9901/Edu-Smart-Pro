// src/app/api/cron/trial-monitor/route.ts
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { sendEmail } from "@/lib/resend";
import { renderTrialReminderEmail } from "@/emails/TrialReminderEmail";
import { renderTrialExpiredEmail } from "@/emails/TrialExpiredEmail";

export const dynamic = "force-dynamic";

/**
 * Validates request authorization header against CRON_SECRET
 */
function isAuthorizedCron(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;

  // In production, CRON_SECRET is strictly required
  if (!cronSecret) {
    if (process.env.NODE_ENV === "production") {
      console.error("[Cron] CRON_SECRET environment variable is not configured in production.");
      return false;
    }
    // Allow local dev testing if secret is not yet set
    return true;
  }

  const authHeader = request.headers.get("authorization");
  const directHeader = request.headers.get("x-cron-secret");

  if (directHeader === cronSecret) return true;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    return token === cronSecret;
  }

  return false;
}

export async function GET(request: Request) {
  return handleTrialMonitor(request);
}

export async function POST(request: Request) {
  return handleTrialMonitor(request);
}

async function handleTrialMonitor(request: Request) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: "Unauthorized cron execution." }, { status: 401 });
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const stats = {
      processedTotal: 0,
      day4RemindersSent: 0,
      trialsExpired: 0,
      errors: [] as string[],
    };

    // 1. Fetch all trial institutions
    const { data: trialInstitutes, error: fetchErr } = await supabaseAdmin
      .from("institutions")
      .select("id, name, owner, email, trial_start_date, trial_end_date, plan_status, notified_day_4, notified_expired")
      .eq("plan", "trial");

    if (fetchErr) {
      console.error("[Cron] Error fetching trial institutions:", fetchErr);
      return NextResponse.json({ error: "Database query failed: " + fetchErr.message }, { status: 500 });
    }

    if (!trialInstitutes || trialInstitutes.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No trial institutions currently active.",
        timestamp: now.toISOString(),
        stats,
      });
    }

    stats.processedTotal = trialInstitutes.length;

    for (const inst of trialInstitutes) {
      const trialEndDate = inst.trial_end_date ? new Date(inst.trial_end_date) : null;
      if (!trialEndDate) continue;

      const recipientEmail = inst.email ? inst.email.trim().toLowerCase() : null;
      const adminName = inst.owner || "Administrator";
      const instituteCode = inst.id;
      const instituteName = inst.name || "Your Institute";

      // -------------------------------------------------------------
      // SCENARIO A: 3 Days Before Expiry (Day 4 Reminder Email)
      // -------------------------------------------------------------
      if (
        trialEndDate <= threeDaysFromNow &&
        now < trialEndDate &&
        !inst.notified_day_4 &&
        inst.plan_status === "active"
      ) {
        const msRemaining = trialEndDate.getTime() - now.getTime();
        const daysRemaining = Math.max(1, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));

        if (recipientEmail) {
          const emailData = renderTrialReminderEmail({
            adminName,
            instituteName,
            institutionCode: instituteCode,
            daysRemaining,
            trialEndDate: trialEndDate.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
            upgradeUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://edusmartpro.in"}/pricing`,
          });

          const sendResult = await sendEmail({
            to: recipientEmail,
            subject: emailData.subject,
            html: emailData.html,
            text: emailData.text,
          });

          if (sendResult.success) {
            stats.day4RemindersSent++;
          } else {
            stats.errors.push(`Failed to send Day 4 email to ${recipientEmail}: ${JSON.stringify(sendResult.error)}`);
          }
        }

        // Mark notified_day_4 = true in database
        await supabaseAdmin
          .from("institutions")
          .update({ notified_day_4: true })
          .eq("id", instituteCode);
      }

      // -------------------------------------------------------------
      // SCENARIO B: Trial Has Expired (now >= trialEndDate)
      // -------------------------------------------------------------
      if (now >= trialEndDate) {
        const updates: any = {};

        if (inst.plan_status !== "expired") {
          updates.plan_status = "expired";
        }

        if (!inst.notified_expired) {
          updates.notified_expired = true;

          if (recipientEmail) {
            const emailData = renderTrialExpiredEmail({
              adminName,
              instituteName,
              institutionCode: instituteCode,
              upiId: "7388739691@ptsbi",
            });

            const sendResult = await sendEmail({
              to: recipientEmail,
              subject: emailData.subject,
              html: emailData.html,
              text: emailData.text,
            });

            if (sendResult.success) {
              stats.trialsExpired++;
            } else {
              stats.errors.push(`Failed to send Expired email to ${recipientEmail}: ${JSON.stringify(sendResult.error)}`);
            }
          }
        }

        if (Object.keys(updates).length > 0) {
          await supabaseAdmin
            .from("institutions")
            .update(updates)
            .eq("id", instituteCode);
        }
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      stats,
    });
  } catch (err: any) {
    console.error("[Cron] Exception during trial monitor run:", err);
    return NextResponse.json(
      { error: "Cron execution error: " + (err?.message || "Unknown") },
      { status: 500 }
    );
  }
}
