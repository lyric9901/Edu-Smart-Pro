# Implementation Plan - 7-Day Free Trial Funnel & Email Automation Engine

## Phase 1: Database Migration & Schema Extensions
- [ ] 1.1: Create migration `20261023000001_trial_funnel_and_metadata.sql` in `supabase/migrations/` adding:
  - `institutions`: `email text`, `institution_type text`, `address text`, `category text`, `description text`, `trial_start_date timestamptz`, `trial_end_date timestamptz`, `plan_status text default 'active'`, `notified_day_4 boolean default false`, `notified_expired boolean default false`.
  - `admins`: `email text`, `phone text`, `full_name text`, `age integer`, `force_password_reset boolean default false`.
  - Unique index on `institutions(email)` and `admins(email)` (case-insensitive).
- [ ] 1.2: Update `DBInstitution` and `DBAdmin` types in `src/lib/supabaseDb.ts`.

## Phase 2: Disposable Email & Duplicate Protection
- [ ] 2.1: Implement `src/lib/validateEmail.ts`:
  - RFC regex check.
  - Reject disposable / temporary domains using `disposable-email-domains` + wildcard blocklist.
  - Check database via `supabaseAdmin` to ensure email is not already registered under `institutions` or `admins`.
- [ ] 2.2: Create validation endpoint `src/app/api/auth/validate-email/route.ts` for instant client-side feedback during typing/blur.

## Phase 3: Automated Email Automation via Resend
- [ ] 3.1: Create Resend client helper `src/lib/resend.ts` with error handling, sandbox fallback, and safe HTML template builder.
- [ ] 3.2: Create Email 1 template `src/emails/WelcomeTrialEmail.ts`:
  - Subject: "Your Institute on EduSmart Pro is Active! 🎓"
  - Starter Pack perks, login URL, assigned Username, Temporary Password, urgent prompt to change password.
- [ ] 3.3: Create Email 2 template `src/emails/TrialReminderEmail.ts`:
  - Subject: "Loving the experience? Secure uninterrupted access to EduSmart Pro"
  - Day 4 value summary, time/fees saved, clear CTA to upgrade before expiration.
- [ ] 3.4: Create Email 3 template `src/emails/TrialExpiredEmail.ts`:
  - Subject: "Your 7-day trial has expired — Reactivate EduSmart Pro"
  - Urgency notice, UPI ID `7388739691@ptsbi`, step-by-step reactivation instructions.

## Phase 4: Multi-Step "Windows Setup Wizard" Onboarding Flow (`/register`)
- [ ] 4.1: Update `src/app/api/auth/register-institution/route.ts`:
  - Validate email using `validateEmail`.
  - Check username availability.
  - Calculate `trialStartDate` = now, `trialEndDate` = now + 7 days, `plan = 'trial'`, `planStatus = 'active'`.
  - Hash auto-generated or chosen password, store `force_password_reset: true`.
  - Dispatch Email 1 (Welcome & Credentials) asynchronously via Resend.
- [ ] 4.2: Build modern multi-step "Windows Setup Wizard" in `src/app/register/page.tsx`:
  - Step 1: Admin Profile (Full Name, Age, Phone, validated Work Email).
  - Step 2: Institution Setup (Name, Type ["Coaching" | "School"], Location/Address, Category, Short Description).
  - Step 3: Account Credentials & Terms (Username with live availability check, disclaimer callout, auto-generated strong temporary password with view/copy toggle).
  - Framer Motion step transitions with back/next navigation, progress bar, and completion summary screen with instant login button.

## Phase 5: In-App Expiration Banners, Paywall Modal & Forced Password Reset
- [ ] 5.1: Create `src/components/TrialBanner.tsx`:
  - If trial remaining <= 3 days: Top banner with upgrade CTA.
  - If trial expired: Hard-lock modal paywall with UPI QR / `7388739691@ptsbi` and WhatsApp instant activation button.
- [ ] 5.2: Create `src/components/ForcePasswordResetModal.tsx`:
  - Mandatory password change modal on first login if `forcePasswordReset === true`.
- [ ] 5.3: Integrate both into `src/app/dashboard/layout.tsx`.
- [ ] 5.4: Create `/api/auth/admin-change-password/route.ts` to update admin password and unset `force_password_reset`.

## Phase 6: Automated Daily Cron Job (`/api/cron/trial-monitor`)
- [ ] 6.1: Create `src/app/api/cron/trial-monitor/route.ts`:
  - Verify `Authorization: Bearer ${CRON_SECRET}` or `x-cron-secret`.
  - Query institutes with `plan == 'trial'` and `trial_end_date - now <= 3 days` and `notified_day_4 == false` -> Send Email 2, set `notified_day_4 = true`.
  - Query institutes with `now >= trial_end_date` and `plan_status == 'active'` -> set `plan_status = 'expired'`, send Email 3, set `notified_expired = true`.
- [ ] 6.2: Configure Next.js headers and export.

## Phase 7: Verification & Build
- [ ] 7.1: Build validation with `bun run build`.
- [ ] 7.2: CodeRabbit quality, security, and edge-case review.
- [ ] 7.3: Ship in Caveman Ultra mode.
