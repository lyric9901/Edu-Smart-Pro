// src/emails/TrialReminderEmail.ts

export interface TrialReminderEmailProps {
  adminName: string;
  instituteName: string;
  institutionCode: string;
  daysRemaining: number;
  trialEndDate: string;
  upgradeUrl: string;
}

export function renderTrialReminderEmail(props: TrialReminderEmailProps): { subject: string; html: string; text: string } {
  const subject = "Loving the experience? Secure uninterrupted access to EduSmart Pro";

  const text = `
Hello ${props.adminName},

Your institute "${props.instituteName}" (Code: ${props.institutionCode}) has ${props.daysRemaining} days left on your 7-day free trial, expiring on ${props.trialEndDate}.

By managing your batches, attendance, and fee logs digitally on EduSmart Pro, your institute has already saved hours of manual paperwork and eliminated messy register logs.

To ensure uninterrupted parent communication and keep your student portal active, upgrade today:
- Basic Plan starts at just ₹299/month (up to 40 students)
- Growth Plan at ₹499/month (up to 150 students with WhatsApp automation)

Upgrade now to keep your data active:
${props.upgradeUrl}

Direct UPI Payment option: 7388739691@ptsbi
Need help? Message us directly on WhatsApp at +91 7388739691.

Team EduSmart Pro
  `.trim();

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
          
          <!-- HEADER -->
          <tr>
            <td style="background: linear-gradient(135deg, #4338ca 0%, #312e81 100%); padding: 32px; text-align: center;">
              <div style="display: inline-block; background: rgba(251, 191, 36, 0.2); border: 1px solid rgba(251, 191, 36, 0.4); padding: 6px 14px; border-radius: 9999px; margin-bottom: 12px;">
                <span style="color: #fef08a; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">⏳ ${props.daysRemaining} Days Left in Free Trial</span>
              </div>
              <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.02em;">Keep Your Coaching Digital & Uninterrupted</h1>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding: 36px 32px;">
              <p style="font-size: 16px; line-height: 24px; margin: 0 0 16px; color: #334155;">
                Hello <strong>${props.adminName}</strong>,
              </p>
              <p style="font-size: 15px; line-height: 24px; margin: 0 0 24px; color: #475569;">
                Your institute <strong style="color: #0f172a;">${props.instituteName}</strong> has been actively running on EduSmart Pro. Your trial is set to conclude on <strong style="color: #4338ca;">${props.trialEndDate}</strong>.
              </p>

              <!-- VALUE SUMMARY -->
              <div style="background-color: #eef2ff; border: 1px solid #c7d2fe; border-radius: 14px; padding: 20px; margin-bottom: 24px;">
                <div style="font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #3730a3; margin-bottom: 10px;">
                  What you have achieved so far:
                </div>
                <ul style="font-size: 14px; line-height: 22px; color: #312e81; padding-left: 20px; margin: 0;">
                  <li>Streamlined daily attendance with instant zero-refresh sync</li>
                  <li>Automated parent communication and absent alerts</li>
                  <li>Eliminated fee notebook confusion with digital fee logs</li>
                  <li>Delivered a dedicated student PWA experience</li>
                </ul>
              </div>

              <!-- CTA BUTTON -->
              <div style="text-align: center; margin: 28px 0;">
                <a href="${props.upgradeUrl}" style="background-color: #2563eb; color: #ffffff; display: inline-block; padding: 16px 36px; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 12px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);">
                  Upgrade Now (From ₹299/mo) →
                </a>
              </div>

              <!-- PRICING PILLS -->
              <table width="100%" cellspacing="0" cellpadding="10" style="margin-top: 10px; font-size: 13px; border-top: 1px solid #f1f5f9;">
                <tr>
                  <td width="50%" style="background-color: #f8fafc; border-radius: 10px; padding: 12px; border: 1px solid #e2e8f0;">
                    <div style="font-weight: 700; color: #0f172a;">Basic Plan</div>
                    <div style="font-size: 18px; font-weight: 800; color: #2563eb; margin: 4px 0;">₹299<span style="font-size: 11px; color: #64748b; font-weight: 400;">/month</span></div>
                    <div style="color: #64748b; font-size: 12px;">Up to 40 students, full attendance & fee tracking</div>
                  </td>
                  <td width="4%"></td>
                  <td width="50%" style="background-color: #f0fdf4; border-radius: 10px; padding: 12px; border: 1px solid #bbf7d0;">
                    <div style="font-weight: 700; color: #166534;">Growth Plan</div>
                    <div style="font-size: 18px; font-weight: 800; color: #16a34a; margin: 4px 0;">₹499<span style="font-size: 11px; color: #64748b; font-weight: 400;">/month</span></div>
                    <div style="color: #166534; font-size: 12px;">Up to 150 students + WhatsApp auto-alerts</div>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 32px; text-align: center; font-size: 12px; color: #94a3b8;">
              <p style="margin: 0 0 6px;">Institute Code: <strong>${props.institutionCode}</strong> | Need UPI activation? WhatsApp: <a href="https://wa.me/917388739691" style="color: #2563eb; text-decoration: none; font-weight: 600;">+91 7388739691</a></p>
              <p style="margin: 0;">© 2026 EduSmart Pro ERP</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return { subject, html, text };
}
