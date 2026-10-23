// src/emails/WelcomeTrialEmail.ts

export interface WelcomeTrialEmailProps {
  adminName: string;
  instituteName: string;
  institutionCode: string;
  username: string;
  tempPassword: string;
  loginUrl: string;
  trialEndDate: string;
}

export function renderWelcomeTrialEmail(props: WelcomeTrialEmailProps): { subject: string; html: string; text: string } {
  const subject = "Your Institute on EduSmart Pro is Active! 🎓";

  const text = `
Welcome to EduSmart Pro, ${props.adminName}!

Congratulations! Your institute "${props.instituteName}" is now registered with a 7-day full access Free Trial.

LOGIN CREDENTIALS:
- Institute Code: ${props.institutionCode}
- Username: ${props.username}
- Temporary Password: ${props.tempPassword}
- Login URL: ${props.loginUrl}

IMPORTANT SECURITY NOTICE:
Your temporary password must be changed immediately upon your first login.

STARTER PACK PERKS INCLUDED IN YOUR TRIAL:
- 1-Click WhatsApp attendance & absentee notices to parents
- Automated fee records, dues tracking & printable digital receipts
- Timetable & homework tracking
- Installable Student & Parent Mobile App (Android PWA)
- Full trial access until: ${props.trialEndDate}

Log in now: ${props.loginUrl}

Need support? WhatsApp us anytime at +91 7388739691.
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
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01); border: 1px solid #e2e8f0;">
          
          <!-- HEADER -->
          <tr>
            <td style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 36px 32px; text-align: center;">
              <div style="display: inline-block; background: rgba(255, 255, 255, 0.2); padding: 8px 16px; border-radius: 9999px; margin-bottom: 12px;">
                <span style="color: #ffffff; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">7-Day Full Access Trial Activated</span>
              </div>
              <h1 style="color: #ffffff; font-size: 26px; font-weight: 800; margin: 0; letter-spacing: -0.02em;">Welcome to EduSmart Pro!</h1>
              <p style="color: #bfdbfe; font-size: 15px; margin: 8px 0 0; font-weight: 500;">Modern School & Coaching Management ERP</p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding: 36px 32px;">
              <p style="font-size: 16px; line-height: 24px; margin: 0 0 16px; color: #334155;">
                Hello <strong>${props.adminName}</strong>,
              </p>
              <p style="font-size: 15px; line-height: 24px; margin: 0 0 24px; color: #475569;">
                Congratulations! Your institute <strong style="color: #0f172a;">${props.instituteName}</strong> is officially set up and live on EduSmart Pro. Your 7-day risk-free trial is now active through <strong style="color: #2563eb;">${props.trialEndDate}</strong>.
              </p>

              <!-- CREDENTIALS BOX -->
              <div style="background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 14px; padding: 22px; margin-bottom: 24px;">
                <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: #64748b; margin-bottom: 14px;">
                  Your Admin Login Credentials
                </div>
                <table width="100%" cellspacing="0" cellpadding="6" style="font-size: 14px;">
                  <tr>
                    <td width="38%" style="color: #64748b; font-weight: 600;">Institute Code:</td>
                    <td style="color: #0f172a; font-family: monospace; font-weight: 700; font-size: 15px;">${props.institutionCode}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748b; font-weight: 600;">Username:</td>
                    <td style="color: #0f172a; font-family: monospace; font-weight: 700; font-size: 15px;">${props.username}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748b; font-weight: 600;">Temporary Password:</td>
                    <td style="color: #2563eb; font-family: monospace; font-weight: 700; font-size: 16px; background-color: #e2e8f0; padding: 4px 8px; border-radius: 6px; display: inline-block;">${props.tempPassword}</td>
                  </tr>
                </table>
              </div>

              <!-- SECURITY WARNING -->
              <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 14px 16px; border-radius: 8px; margin-bottom: 28px;">
                <p style="font-size: 13px; line-height: 19px; color: #92400e; margin: 0; font-weight: 600;">
                  ⚠️ Mandatory First Step: For data security, you will be prompted to reset this temporary password immediately upon your first dashboard login.
                </p>
              </div>

              <!-- CTA BUTTON -->
              <div style="text-align: center; margin-bottom: 32px;">
                <a href="${props.loginUrl}" style="background-color: #0f172a; color: #ffffff; display: inline-block; padding: 16px 36px; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 12px; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);">
                  Sign In to Dashboard →
                </a>
              </div>

              <!-- STARTER PERKS -->
              <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; margin-bottom: 20px;">
                <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">What's ready inside your portal:</div>
                <ul style="font-size: 13px; line-height: 22px; color: #475569; padding-left: 20px; margin: 0;">
                  <li><strong>Real-Time Attendance:</strong> Instant student sync with zero page refreshes.</li>
                  <li><strong>Instant WhatsApp Absentee Alerts:</strong> Notify parents in 1-click.</li>
                  <li><strong>Digital Fee Tracking:</strong> Log payments and generate receipts instantly.</li>
                  <li><strong>Student PWA App:</strong> Send your students their unique code for homework & timetable.</li>
                </ul>
              </div>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 32px; text-align: center; font-size: 12px; color: #94a3b8; line-height: 18px;">
              <p style="margin: 0 0 6px;">Questions or setup help? WhatsApp Support: <a href="https://wa.me/917388739691" style="color: #2563eb; text-decoration: none; font-weight: 600;">+91 7388739691</a></p>
              <p style="margin: 0;">© 2026 EduSmart Pro ERP. Lucknow, Uttar Pradesh, India.</p>
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
