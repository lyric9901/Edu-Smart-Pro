// src/emails/TrialExpiredEmail.ts

export interface TrialExpiredEmailProps {
  adminName: string;
  instituteName: string;
  institutionCode: string;
  upiId: string;
}

export function renderTrialExpiredEmail(props: TrialExpiredEmailProps): { subject: string; html: string; text: string } {
  const subject = "Your 7-day trial has expired — Reactivate EduSmart Pro";

  const text = `
Hello ${props.adminName},

Your 7-day free trial for "${props.instituteName}" (Institute Code: ${props.institutionCode}) has expired.

To protect your institute's data, administrative actions, student portal access, and automated parent notices are currently paused. All your students, attendance history, and fee records remain safely archived and will instantly restore upon reactivation.

REACTIVATE YOUR ACCOUNT IN 2 MINUTES:
1. Pay via UPI:
   - UPI ID: ${props.upiId}
   - Basic Plan: ₹299 (1 Month)
   - Growth Plan: ₹499 (1 Month)
2. Send your payment screenshot / UTR with Institute Code "${props.institutionCode}" via WhatsApp to +91 7388739691.
3. Your account will be activated within 5 minutes.

Instant WhatsApp activation link: https://wa.me/917388739691?text=Hi%20Shah,%20I%20have%20paid%20for%20institute%20${props.institutionCode}

Team EduSmart Pro
Lucknow, Uttar Pradesh, India
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
            <td style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 32px; text-align: center;">
              <div style="display: inline-block; background: rgba(255, 255, 255, 0.2); border: 1px solid rgba(255, 255, 255, 0.3); padding: 6px 14px; border-radius: 9999px; margin-bottom: 12px;">
                <span style="color: #ffffff; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">Action Required</span>
              </div>
              <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.02em;">Your 7-Day Trial Has Expired</h1>
              <p style="color: #fecaca; font-size: 14px; margin: 8px 0 0;">Reactivate your institute now for uninterrupted coaching operations</p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding: 36px 32px;">
              <p style="font-size: 16px; line-height: 24px; margin: 0 0 16px; color: #334155;">
                Hello <strong>${props.adminName}</strong>,
              </p>
              <p style="font-size: 15px; line-height: 24px; margin: 0 0 20px; color: #475569;">
                The 7-day free trial period for <strong style="color: #0f172a;">${props.instituteName}</strong> (Code: <code style="background-color: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${props.institutionCode}</code>) has concluded.
              </p>

              <!-- STATUS WARNING -->
              <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 18px; margin-bottom: 26px;">
                <div style="font-size: 14px; font-weight: 700; color: #991b1b; margin-bottom: 6px;">Your data is completely safe and preserved:</div>
                <p style="font-size: 13px; line-height: 20px; color: #b91c1c; margin: 0;">
                  Student directories, attendance records, and fee logs remain intact. However, dashboard features and parent notifications are paused until your plan is reactivated.
                </p>
              </div>

              <!-- UPI PAYMENT DETAILS -->
              <div style="background-color: #f8fafc; border: 2px dashed #94a3b8; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 28px;">
                <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin-bottom: 8px;">Direct UPI Payment</div>
                <div style="font-size: 22px; font-weight: 900; color: #0f172a; font-family: monospace; background-color: #ffffff; padding: 12px 18px; border-radius: 10px; display: inline-block; border: 1px solid #cbd5e1; margin-bottom: 14px;">
                  ${props.upiId}
                </div>
                <div style="font-size: 13px; color: #475569; font-weight: 600;">
                  Basic Plan: <span style="color: #16a34a; font-weight: 800;">₹299/mo</span> | Growth Plan: <span style="color: #16a34a; font-weight: 800;">₹499/mo</span>
                </div>
                <div style="font-size: 12px; color: #64748b; margin-top: 6px;">Works on Google Pay, PhonePe, Paytm, BHIM, or any banking app.</div>
              </div>

              <!-- 2 STEP ACTIVATION -->
              <div style="margin-bottom: 30px;">
                <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">Instant 2-Step Reactivation:</div>
                <ol style="font-size: 14px; line-height: 24px; color: #475569; padding-left: 20px; margin: 0;">
                  <li>Pay the subscription amount using UPI ID: <strong>${props.upiId}</strong>.</li>
                  <li>Click below to send your payment screenshot with code <strong>${props.institutionCode}</strong> on WhatsApp.</li>
                </ol>
              </div>

              <!-- WHATSAPP CTA BUTTON -->
              <div style="text-align: center; margin-bottom: 24px;">
                <a href="https://wa.me/917388739691?text=Hi%20Shah,%20I%20have%20paid%20for%20institute%20${props.institutionCode}" style="background-color: #16a34a; color: #ffffff; display: inline-block; padding: 16px 36px; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 12px; box-shadow: 0 4px 14px rgba(22, 163, 74, 0.3);">
                  Verify on WhatsApp (+91 7388739691) →
                </a>
              </div>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 32px; text-align: center; font-size: 12px; color: #94a3b8;">
              <p style="margin: 0 0 6px;">Institute: <strong>${props.instituteName}</strong> (${props.institutionCode})</p>
              <p style="margin: 0;">© 2026 EduSmart Pro ERP. Lucknow, India.</p>
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
