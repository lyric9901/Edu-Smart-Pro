// scripts/migrate-firestore-to-supabase.ts
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Load environment variables from .env.local if not already in process.env
function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    content.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx !== -1) {
          const key = trimmed.substring(0, eqIdx).trim();
          let val = trimmed.substring(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val.replace(/\\n/g, "\n");
          }
        }
      }
    });
  }
}

loadEnvLocal();

// Determine Dry Run vs Live execution
const isDryRun = process.argv.includes("--dry-run") || !process.argv.includes("--live");

console.log("=================================================================");
console.log(`🚀 EDU-SMART-PRO FIRESTORE → SUPABASE MIGRATION`);
console.log(`MODE: ${isDryRun ? "🧪 DRY-RUN (Read-only simulation + SQL Export)" : "⚡ LIVE EXECUTION (Writing to Supabase)"}`);
console.log("=================================================================\n");

// 1. Initialize Firestore Admin SDK
function initFirestore() {
  const existingApps = getApps();
  const app =
    existingApps.length > 0
      ? existingApps[0]
      : initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "tutionmanagement-1",
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
          }),
        });

  return getFirestore(app);
}

// 2. Initialize Supabase Admin Client
function initSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://khumgdlihnphdfwpodpa.supabase.co";
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    "sb_publishable_3DqdNjHjEdl3f_D2Xd_gsg_UM4YosKG";

  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function sqlEscape(val: any): string {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "number") return isNaN(val) ? "0" : String(val);
  if (typeof val === "boolean") return val ? "true" : "false";
  const s = String(val).trim();
  if (s.toLowerCase() === "default" || s.toLowerCase() === "undefined") {
    throw new Error(`CRITICAL: Placeholder value '${s}' detected in SQL generator!`);
  }
  return `'${s.replace(/'/g, "''")}'`;
}

function sqlArray(arr: any[]): string {
  if (!Array.isArray(arr) || arr.length === 0) return "'{}'::text[]";
  const escaped = arr.map((item) => `'${String(item).replace(/'/g, "''")}'`).join(", ");
  return `ARRAY[${escaped}]::text[]`;
}

interface MigrationStats {
  institutions: { scanned: number; migrated: number; skipped: number; errors: number };
  branches: { scanned: number; migrated: number; skipped: number; errors: number };
  admins: { scanned: number; migrated: number; skipped: number; errors: number };
  users: { scanned: number; migrated: number; skipped: number; errors: number };
  batches: { scanned: number; migrated: number; skipped: number; errors: number };
  teachers: { scanned: number; migrated: number; skipped: number; errors: number };
  students: { scanned: number; migrated: number; skipped: number; errors: number };
  batchStudents: { scanned: number; migrated: number; skipped: number; errors: number };
  attendance: { scanned: number; migrated: number; skipped: number; errors: number };
  fees: { scanned: number; migrated: number; skipped: number; errors: number };
  exams: { scanned: number; migrated: number; skipped: number; errors: number };
  examScores: { scanned: number; migrated: number; skipped: number; errors: number };
  assignments: { scanned: number; migrated: number; skipped: number; errors: number };
  timetableSlots: { scanned: number; migrated: number; skipped: number; errors: number };
  notices: { scanned: number; migrated: number; skipped: number; errors: number };
  notifications: { scanned: number; migrated: number; skipped: number; errors: number };
}

const stats: MigrationStats = {
  institutions: { scanned: 0, migrated: 0, skipped: 0, errors: 0 },
  branches: { scanned: 0, migrated: 0, skipped: 0, errors: 0 },
  admins: { scanned: 0, migrated: 0, skipped: 0, errors: 0 },
  users: { scanned: 0, migrated: 0, skipped: 0, errors: 0 },
  batches: { scanned: 0, migrated: 0, skipped: 0, errors: 0 },
  teachers: { scanned: 0, migrated: 0, skipped: 0, errors: 0 },
  students: { scanned: 0, migrated: 0, skipped: 0, errors: 0 },
  batchStudents: { scanned: 0, migrated: 0, skipped: 0, errors: 0 },
  attendance: { scanned: 0, migrated: 0, skipped: 0, errors: 0 },
  fees: { scanned: 0, migrated: 0, skipped: 0, errors: 0 },
  exams: { scanned: 0, migrated: 0, skipped: 0, errors: 0 },
  examScores: { scanned: 0, migrated: 0, skipped: 0, errors: 0 },
  assignments: { scanned: 0, migrated: 0, skipped: 0, errors: 0 },
  timetableSlots: { scanned: 0, migrated: 0, skipped: 0, errors: 0 },
  notices: { scanned: 0, migrated: 0, skipped: 0, errors: 0 },
  notifications: { scanned: 0, migrated: 0, skipped: 0, errors: 0 },
};

const failureLog: Array<{ entity: string; id: string; error: string; data?: any }> = [];
const unresolvedRelationships: Array<{ entity: string; id: string; reason: string }> = [];

async function main() {
  const startTime = Date.now();
  const firestore = initFirestore();
  const supabase = initSupabase();

  // Mapping structures for foreign-key resolution
  const knownInstitutions = new Map<string, string>(); // lowercase -> canonical
  const studentToInstitution = new Map<string, string>();
  const adminToInstitution = new Map<string, string>();

  // Intermediate row collections for strict parent-to-child ordered insertion
  const institutionsRows: any[] = [];
  const branchesRows: any[] = [];
  const usersRows: any[] = [];
  const adminsRows: any[] = [];
  const batchesRows: any[] = [];
  const teachersRows: any[] = [];
  const timetableRows: any[] = [];
  const studentsRows: any[] = [];
  const batchStudentsRows: any[] = [];
  const attendanceRows: any[] = [];
  const feesRows: any[] = [];
  const examScoresRows: any[] = [];
  const assignmentsRows: any[] = [];
  const noticesRows: any[] = [];
  const notificationsRows: any[] = [];

  // =========================================================================
  // PASS 1: SCAN INSTITUTIONS
  // =========================================================================
  console.log("📥 Phase 1: Scanning Institutions...");
  const instSnap = await firestore.collection("institutions").get();
  stats.institutions.scanned = instSnap.size;

  for (const instDoc of instSnap.docs) {
    const instId = instDoc.id.trim();
    knownInstitutions.set(instId.toLowerCase(), instId);
    const instData = instDoc.data();

    institutionsRows.push({
      id: instId,
      name: instData.name || instId,
      owner: instData.owner || "",
      phone: instData.phone || "",
      plan: instData.plan || "premium",
      created_at: instData.createdAt
        ? typeof instData.createdAt === "number"
          ? new Date(instData.createdAt).toISOString()
          : new Date(instData.createdAt).toISOString()
        : new Date().toISOString(),
    });

    // Scan branches
    try {
      const branchSnap = await firestore.collection(`institutions/${instId}/branches`).get();
      stats.branches.scanned += branchSnap.size;
      for (const bDoc of branchSnap.docs) {
        const bData = bDoc.data();
        branchesRows.push({
          id: bDoc.id.trim(),
          institution_id: instId,
          name: bData.name || bDoc.id,
          created_at: bData.createdAt ? new Date(bData.createdAt).toISOString() : new Date().toISOString(),
        });
      }
    } catch {
      // Subcollection might not exist
    }

    // Scan notices
    try {
      const noticeSnap = await firestore.collection(`institutions/${instId}/notices`).get();
      stats.notices.scanned += noticeSnap.size;
      for (const nDoc of noticeSnap.docs) {
        const nData = nDoc.data();
        noticesRows.push({
          id: nDoc.id.trim(),
          institution_id: instId,
          text: nData.text || "",
          sender: nData.sender || "Admin",
          type: nData.type || "notice",
          date: nData.date ? new Date(nData.date).toISOString() : new Date().toISOString(),
          created_at: nData.createdAt ? new Date(nData.createdAt).toISOString() : new Date().toISOString(),
        });
      }
    } catch {
      // Ignore
    }
  }

  // =========================================================================
  // PASS 2: SCAN BATCHES & EMBEDDED STUDENTS (Build Maps)
  // =========================================================================
  console.log("📦 Phase 2: Scanning Batches and Embedded Relations...");
  for (const instRow of institutionsRows) {
    const instId = instRow.id;
    const batchSnap = await firestore.collection(`institutions/${instId}/batches`).get();
    stats.batches.scanned += batchSnap.size;

    for (const bDoc of batchSnap.docs) {
      const batchId = bDoc.id.trim();
      const bData = bDoc.data();

      // Ensure branch exists if referenced
      if (bData.branchId) {
        const branchId = String(bData.branchId).trim();
        if (!branchesRows.some((b) => b.id === branchId && b.institution_id === instId)) {
          branchesRows.push({
            id: branchId,
            institution_id: instId,
            name: bData.branchName || branchId,
            created_at: new Date().toISOString(),
          });
        }
      }

      batchesRows.push({
        id: batchId,
        institution_id: instId,
        branch_id: bData.branchId ? String(bData.branchId).trim() : null,
        name: bData.name || batchId,
        timing_start: bData.timing?.start || bData.timingStart || null,
        timing_end: bData.timing?.end || bData.timingEnd || null,
        created_at: bData.createdAt ? new Date(bData.createdAt).toISOString() : new Date().toISOString(),
      });

      // Assignments
      if (bData.assignments && typeof bData.assignments === "object") {
        for (const [asgId, asg] of Object.entries(bData.assignments as Record<string, any>)) {
          stats.assignments.scanned++;
          assignmentsRows.push({
            id: asg.id ? String(asg.id).trim() : asgId.trim(),
            batch_id: batchId,
            institution_id: instId,
            title: asg.title || "Untitled Assignment",
            description: asg.description || "",
            due_date: asg.dueDate ? new Date(asg.dueDate).toISOString() : null,
            created_at: asg.createdAt ? new Date(asg.createdAt).toISOString() : new Date().toISOString(),
          });
        }
      }

      // Timetable & Teachers
      if (Array.isArray(bData.timetable)) {
        for (let idx = 0; idx < bData.timetable.length; idx++) {
          const slot = bData.timetable[idx];
          stats.timetableSlots.scanned++;
          const slotId = slot.id ? String(slot.id).trim() : `slot_${batchId}_${idx}`;

          if (slot.teacher && String(slot.teacher).trim().length > 0) {
            const teacherName = String(slot.teacher).trim();
            const teacherId = `teacher_${instId}_${teacherName.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
            if (!teachersRows.some((t) => t.id === teacherId && t.institution_id === instId)) {
              stats.teachers.scanned++;
              teachersRows.push({
                id: teacherId,
                institution_id: instId,
                name: teacherName,
                subject: slot.subject || null,
              });
            }
          }

          timetableRows.push({
            id: slotId,
            batch_id: batchId,
            institution_id: instId,
            teacher: slot.teacher || "",
            day: slot.day || "Monday",
            subject: slot.subject || "General",
            start_time: slot.startTime || "09:00",
            end_time: slot.endTime || "10:00",
            room: slot.room || "",
          });
        }
      }

      // Students
      const studentsArray = Array.isArray(bData.students) ? bData.students : [];
      for (const st of studentsArray) {
        stats.students.scanned++;
        const studentId = String(st.id || "").trim();
        if (!studentId) {
          unresolvedRelationships.push({
            entity: "student",
            id: "missing_id",
            reason: `Batch ${batchId} in ${instId} contains student record with missing ID`,
          });
          continue;
        }

        studentToInstitution.set(studentId, instId);

        studentsRows.push({
          id: studentId,
          institution_id: instId,
          name: st.name || "Unknown Student",
          phone: st.phone ? String(st.phone).trim() : "",
          roll_number: st.rollNumber || st.rollNo || "",
          password: st.password || "",
          performance: typeof st.performance === "number" ? st.performance : 0,
          created_at: st.createdAt ? new Date(st.createdAt).toISOString() : new Date().toISOString(),
        });

        batchStudentsRows.push({
          batch_id: batchId,
          student_id: studentId,
          institution_id: instId,
        });

        // Attendance
        if (st.attendance && typeof st.attendance === "object") {
          for (const [date, rawStatus] of Object.entries(st.attendance as Record<string, string>)) {
            stats.attendance.scanned++;
            const status = String(rawStatus).toLowerCase().trim();
            const allowedStatuses = ["present", "absent", "late", "not-marked", "leave"];
            const validStatus = allowedStatuses.includes(status) ? status : "present";
            attendanceRows.push({
              batch_id: batchId,
              student_id: studentId,
              institution_id: instId,
              date: date.trim(),
              status: validStatus,
            });
          }
        }

        // Fees
        if (st.fees && typeof st.fees === "object") {
          for (const [yearStr, monthsObj] of Object.entries(st.fees as Record<string, any>)) {
            const yearNum = parseInt(yearStr, 10) || new Date().getFullYear();
            if (monthsObj && typeof monthsObj === "object") {
              for (const [month, rawStatus] of Object.entries(monthsObj as Record<string, string>)) {
                stats.fees.scanned++;
                const status = String(rawStatus).toLowerCase().trim();
                const allowedFeeStatuses = ["paid", "pending", "partial", "unpaid"];
                const validStatus = allowedFeeStatuses.includes(status) ? status : "pending";
                feesRows.push({
                  batch_id: batchId,
                  student_id: studentId,
                  institution_id: instId,
                  year: yearNum,
                  month: month.toLowerCase().trim(),
                  status: validStatus,
                  amount: st.monthlyFee || 0,
                  paid_at: validStatus === "paid" ? new Date().toISOString() : null,
                });
              }
            }
          }
        }

        // Exams
        if (Array.isArray(st.performanceHistory)) {
          for (let sIdx = 0; sIdx < st.performanceHistory.length; sIdx++) {
            const sc = st.performanceHistory[sIdx];
            stats.examScores.scanned++;
            const scoreId = sc.id ? String(sc.id).trim() : `score_${studentId}_${sIdx}_${Date.now()}`;
            examScoresRows.push({
              id: scoreId,
              batch_id: batchId,
              student_id: studentId,
              institution_id: instId,
              name: sc.name || "Test",
              score: Number(sc.score || 0),
              date: sc.date ? new Date(sc.date).toISOString() : new Date().toISOString(),
            });
          }
        }

        // Student Notifications
        if (Array.isArray(st.notifications)) {
          for (const notif of st.notifications) {
            stats.notifications.scanned++;
            const notifId = notif.id ? String(notif.id).trim() : `notif_${studentId}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
            notificationsRows.push({
              id: notifId,
              user_id: studentId,
              institution_id: instId,
              batch_id: batchId,
              title: notif.title || "Notification",
              text: notif.text || "",
              type: notif.type || "notice",
              date: notif.date ? new Date(notif.date).toISOString() : new Date().toISOString(),
            });
          }
        }
      }
    }
  }

  // =========================================================================
  // PASS 3: SCAN ADMINS
  // =========================================================================
  console.log("🔑 Phase 3: Scanning Admins...");
  const adminSnap = await firestore.collection("admins").get();
  stats.admins.scanned = adminSnap.size;

  for (const admDoc of adminSnap.docs) {
    const username = admDoc.id.trim();
    const admData = admDoc.data();

    // Check all case variations for institution code
    const rawInst =
      admData.institutionCode ||
      admData.institutioncode ||
      admData.institutionId ||
      admData.institution_id ||
      admData.institution;

    let resolvedInstId: string | null = null;
    if (rawInst) {
      const normalized = String(rawInst).trim().toLowerCase();
      resolvedInstId = knownInstitutions.get(normalized) || null;
    }

    if (!resolvedInstId) {
      unresolvedRelationships.push({
        entity: "admin",
        id: username,
        reason: `Admin has no valid institution association in Firestore (raw: '${rawInst}'). Stored with institution_id = NULL.`,
      });
    } else {
      adminToInstitution.set(username, resolvedInstId);
    }

    adminsRows.push({
      username,
      password: admData.password || "",
      institution_id: resolvedInstId,
      branch_id: admData.branchId || null,
      role: admData.role || "admin",
      created_at: admData.createdAt ? new Date(admData.createdAt).toISOString() : new Date().toISOString(),
    });
  }

  // =========================================================================
  // PASS 4: SCAN USERS (FCM tokens & Profiles)
  // =========================================================================
  console.log("👤 Phase 4: Scanning Users...");
  try {
    const userSnap = await firestore.collection("users").get();
    stats.users.scanned = userSnap.size;

    for (const uDoc of userSnap.docs) {
      const userId = uDoc.id.trim();
      const uData = uDoc.data();

      // Resolve institution: explicit field -> student ID lookup -> admin username lookup
      const rawInst =
        uData.institutionCode ||
        uData.institutioncode ||
        uData.institutionId ||
        uData.institution_id;

      let resolvedInstId: string | null = null;
      if (rawInst) {
        resolvedInstId = knownInstitutions.get(String(rawInst).trim().toLowerCase()) || null;
      }

      if (!resolvedInstId && studentToInstitution.has(userId)) {
        resolvedInstId = studentToInstitution.get(userId)!;
      }

      if (!resolvedInstId && adminToInstitution.has(userId)) {
        resolvedInstId = adminToInstitution.get(userId)!;
      }

      if (!resolvedInstId) {
        unresolvedRelationships.push({
          entity: "user",
          id: userId,
          reason: `User is a standalone device/guest FCM registration with no associated institution in Firestore. Stored with institution_id = NULL.`,
        });
      }

      usersRows.push({
        id: userId,
        institution_id: resolvedInstId,
        fcm_tokens: Array.isArray(uData.fcmTokens) ? uData.fcmTokens : [],
        dismissed_notices: Array.isArray(uData.dismissedNotices) ? uData.dismissedNotices : [],
        updated_at: uData.updatedAt ? new Date(uData.updatedAt).toISOString() : new Date().toISOString(),
      });

      // Extract notifications array inside user doc
      if (Array.isArray(uData.notifications)) {
        for (const n of uData.notifications) {
          stats.notifications.scanned++;
          const notifId = n.id ? String(n.id).trim() : `notif_${userId}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          if (!notificationsRows.some((nr) => nr.id === notifId)) {
            notificationsRows.push({
              id: notifId,
              user_id: userId,
              institution_id: resolvedInstId,
              batch_id: null,
              title: n.title || "Notification",
              text: n.text || "",
              type: n.type || "notice",
              date: n.date ? new Date(n.date).toISOString() : new Date().toISOString(),
            });
          }
        }
      }
    }
  } catch (err: any) {
    console.warn("Could not scan users collection:", err?.message);
  }

  // Ensure all notification user_ids exist in usersRows
  for (const notif of notificationsRows) {
    if (!usersRows.some((u) => u.id === notif.user_id)) {
      usersRows.push({
        id: notif.user_id,
        institution_id: notif.institution_id || null,
        fcm_tokens: [],
        dismissed_notices: [],
        updated_at: new Date().toISOString(),
      });
    }
  }

  // =========================================================================
  // PASS 5: VALIDATE FK INTEGRITY & PLACEHOLDERS
  // =========================================================================
  console.log("🛡️ Phase 5: Validating Foreign-Key Integrity and Placeholder IDs...");
  const validInstIds = new Set(institutionsRows.map((i) => i.id));
  const validUserIds = new Set(usersRows.map((u) => u.id));
  const validBatchIds = new Set(batchesRows.map((b) => `${b.institution_id}:${b.id}`));
  const validStudentIds = new Set(studentsRows.map((s) => `${s.institution_id}:${s.id}`));

  // Check admins
  for (const adm of adminsRows) {
    if (adm.institution_id && !validInstIds.has(adm.institution_id)) {
      throw new Error(`Integrity Violation: Admin ${adm.username} references invalid institution: ${adm.institution_id}`);
    }
  }

  // Check users
  for (const u of usersRows) {
    if (u.institution_id && !validInstIds.has(u.institution_id)) {
      throw new Error(`Integrity Violation: User ${u.id} references invalid institution: ${u.institution_id}`);
    }
  }

  // Check batches
  for (const b of batchesRows) {
    if (!validInstIds.has(b.institution_id)) {
      throw new Error(`Integrity Violation: Batch ${b.id} references invalid institution: ${b.institution_id}`);
    }
  }

  // Check students & batch_students
  for (const bs of batchStudentsRows) {
    if (!validBatchIds.has(`${bs.institution_id}:${bs.batch_id}`)) {
      throw new Error(`Integrity Violation: BatchStudent references invalid batch: ${bs.batch_id}`);
    }
    if (!validStudentIds.has(`${bs.institution_id}:${bs.student_id}`)) {
      throw new Error(`Integrity Violation: BatchStudent references invalid student: ${bs.student_id}`);
    }
  }

  // Check attendance
  for (const a of attendanceRows) {
    if (!validBatchIds.has(`${a.institution_id}:${a.batch_id}`)) {
      throw new Error(`Integrity Violation: Attendance references invalid batch: ${a.batch_id}`);
    }
    if (!validStudentIds.has(`${a.institution_id}:${a.student_id}`)) {
      throw new Error(`Integrity Violation: Attendance references invalid student: ${a.student_id}`);
    }
  }

  // Check fee records
  for (const f of feesRows) {
    if (!validBatchIds.has(`${f.institution_id}:${f.batch_id}`)) {
      throw new Error(`Integrity Violation: FeeRecord references invalid batch: ${f.batch_id}`);
    }
    if (!validStudentIds.has(`${f.institution_id}:${f.student_id}`)) {
      throw new Error(`Integrity Violation: FeeRecord references invalid student: ${f.student_id}`);
    }
  }

  // Check notifications
  for (const notif of notificationsRows) {
    if (!validUserIds.has(notif.user_id)) {
      throw new Error(`Integrity Violation: Notification ${notif.id} references invalid user: ${notif.user_id}`);
    }
    if (notif.institution_id && !validInstIds.has(notif.institution_id)) {
      throw new Error(`Integrity Violation: Notification ${notif.id} references invalid institution: ${notif.institution_id}`);
    }
  }

  console.log("  ✓ All Foreign-Key dependencies and Placeholder validations passed!\n");

  // =========================================================================
  // PASS 6: GENERATE ORDERED SQL STATEMENTS
  // =========================================================================
  const sqlStatements: string[] = [];
  sqlStatements.push("-- =====================================================");
  sqlStatements.push("-- EduSmartPro Firestore Migrated Seed Data");
  sqlStatements.push(`-- Generated: ${new Date().toISOString()}`);
  sqlStatements.push("-- =====================================================\n");

  // 1. Institutions
  sqlStatements.push("-- 1. Institutions");
  institutionsRows.forEach((r) => {
    sqlStatements.push(
      `INSERT INTO public.institutions (id, name, owner, phone, plan, created_at) VALUES (${sqlEscape(r.id)}, ${sqlEscape(r.name)}, ${sqlEscape(r.owner)}, ${sqlEscape(r.phone)}, ${sqlEscape(r.plan)}, ${sqlEscape(r.created_at)}) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, owner = EXCLUDED.owner, phone = EXCLUDED.phone;`
    );
  });

  // 2. Branches
  sqlStatements.push("\n-- 2. Branches");
  branchesRows.forEach((r) => {
    sqlStatements.push(
      `INSERT INTO public.branches (id, institution_id, name, created_at) VALUES (${sqlEscape(r.id)}, ${sqlEscape(r.institution_id)}, ${sqlEscape(r.name)}, ${sqlEscape(r.created_at)}) ON CONFLICT (institution_id, id) DO NOTHING;`
    );
  });

  // 3. Users (inserted BEFORE notifications and admins)
  sqlStatements.push("\n-- 3. Users");
  usersRows.forEach((r) => {
    sqlStatements.push(
      `INSERT INTO public.users (id, institution_id, fcm_tokens, dismissed_notices, updated_at) VALUES (${sqlEscape(r.id)}, ${sqlEscape(r.institution_id)}, ${sqlArray(r.fcm_tokens)}, ${sqlArray(r.dismissed_notices)}, ${sqlEscape(r.updated_at)}) ON CONFLICT (id) DO UPDATE SET institution_id = coalesce(EXCLUDED.institution_id, users.institution_id), fcm_tokens = EXCLUDED.fcm_tokens, dismissed_notices = EXCLUDED.dismissed_notices;`
    );
  });

  // 4. Admins
  sqlStatements.push("\n-- 4. Admins");
  adminsRows.forEach((r) => {
    sqlStatements.push(
      `INSERT INTO public.admins (username, password, institution_id, branch_id, role, created_at) VALUES (${sqlEscape(r.username)}, ${sqlEscape(r.password)}, ${sqlEscape(r.institution_id)}, ${sqlEscape(r.branch_id)}, ${sqlEscape(r.role)}, ${sqlEscape(r.created_at)}) ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password, institution_id = EXCLUDED.institution_id;`
    );
  });

  // 5. Batches
  sqlStatements.push("\n-- 5. Batches");
  batchesRows.forEach((r) => {
    sqlStatements.push(
      `INSERT INTO public.batches (id, institution_id, branch_id, name, timing_start, timing_end, created_at) VALUES (${sqlEscape(r.id)}, ${sqlEscape(r.institution_id)}, ${sqlEscape(r.branch_id)}, ${sqlEscape(r.name)}, ${sqlEscape(r.timing_start)}, ${sqlEscape(r.timing_end)}, ${sqlEscape(r.created_at)}) ON CONFLICT (institution_id, id) DO UPDATE SET name = EXCLUDED.name, timing_start = EXCLUDED.timing_start, timing_end = EXCLUDED.timing_end;`
    );
  });

  // 6. Teachers
  sqlStatements.push("\n-- 6. Teachers");
  teachersRows.forEach((r) => {
    sqlStatements.push(
      `INSERT INTO public.teachers (id, institution_id, name, subject) VALUES (${sqlEscape(r.id)}, ${sqlEscape(r.institution_id)}, ${sqlEscape(r.name)}, ${sqlEscape(r.subject)}) ON CONFLICT (institution_id, id) DO NOTHING;`
    );
  });

  // 7. Timetable Slots
  sqlStatements.push("\n-- 7. Timetable Slots");
  timetableRows.forEach((r) => {
    sqlStatements.push(
      `INSERT INTO public.timetable_slots (id, institution_id, batch_id, day, subject, start_time, end_time, room, teacher) VALUES (${sqlEscape(r.id)}, ${sqlEscape(r.institution_id)}, ${sqlEscape(r.batch_id)}, ${sqlEscape(r.day)}, ${sqlEscape(r.subject)}, ${sqlEscape(r.start_time)}, ${sqlEscape(r.end_time)}, ${sqlEscape(r.room)}, ${sqlEscape(r.teacher)}) ON CONFLICT (institution_id, id) DO NOTHING;`
    );
  });

  // 8. Students
  sqlStatements.push("\n-- 8. Students");
  studentsRows.forEach((r) => {
    sqlStatements.push(
      `INSERT INTO public.students (id, institution_id, name, phone, roll_number, password, performance, created_at) VALUES (${sqlEscape(r.id)}, ${sqlEscape(r.institution_id)}, ${sqlEscape(r.name)}, ${sqlEscape(r.phone)}, ${sqlEscape(r.roll_number)}, ${sqlEscape(r.password)}, ${sqlEscape(r.performance)}, ${sqlEscape(r.created_at)}) ON CONFLICT (institution_id, id) DO UPDATE SET name = EXCLUDED.name, phone = EXCLUDED.phone, roll_number = EXCLUDED.roll_number;`
    );
  });

  // 9. Batch Students Junction
  sqlStatements.push("\n-- 9. Batch Students");
  batchStudentsRows.forEach((r) => {
    sqlStatements.push(
      `INSERT INTO public.batch_students (batch_id, student_id, institution_id) VALUES (${sqlEscape(r.batch_id)}, ${sqlEscape(r.student_id)}, ${sqlEscape(r.institution_id)}) ON CONFLICT (institution_id, batch_id, student_id) DO NOTHING;`
    );
  });

  // 10. Attendance
  sqlStatements.push("\n-- 10. Attendance");
  attendanceRows.forEach((r) => {
    sqlStatements.push(
      `INSERT INTO public.attendance (batch_id, student_id, institution_id, date, status) VALUES (${sqlEscape(r.batch_id)}, ${sqlEscape(r.student_id)}, ${sqlEscape(r.institution_id)}, ${sqlEscape(r.date)}, ${sqlEscape(r.status)}) ON CONFLICT (institution_id, batch_id, student_id, date) DO UPDATE SET status = EXCLUDED.status;`
    );
  });

  // 11. Fee Records
  sqlStatements.push("\n-- 11. Fee Records");
  feesRows.forEach((r) => {
    sqlStatements.push(
      `INSERT INTO public.fee_records (batch_id, student_id, institution_id, year, month, status, amount, paid_at) VALUES (${sqlEscape(r.batch_id)}, ${sqlEscape(r.student_id)}, ${sqlEscape(r.institution_id)}, ${sqlEscape(r.year)}, ${sqlEscape(r.month)}, ${sqlEscape(r.status)}, ${sqlEscape(r.amount)}, ${sqlEscape(r.paid_at)}) ON CONFLICT (institution_id, batch_id, student_id, year, month) DO UPDATE SET status = EXCLUDED.status, amount = EXCLUDED.amount, paid_at = EXCLUDED.paid_at;`
    );
  });

  // 12. Exam Scores
  sqlStatements.push("\n-- 12. Exam Scores");
  examScoresRows.forEach((r) => {
    sqlStatements.push(
      `INSERT INTO public.exam_scores (id, institution_id, batch_id, student_id, name, score, date) VALUES (${sqlEscape(r.id)}, ${sqlEscape(r.institution_id)}, ${sqlEscape(r.batch_id)}, ${sqlEscape(r.student_id)}, ${sqlEscape(r.name)}, ${sqlEscape(r.score)}, ${sqlEscape(r.date)}) ON CONFLICT (institution_id, id) DO NOTHING;`
    );
  });

  // 13. Assignments
  sqlStatements.push("\n-- 13. Assignments");
  assignmentsRows.forEach((r) => {
    sqlStatements.push(
      `INSERT INTO public.assignments (id, institution_id, batch_id, title, description, due_date, created_at) VALUES (${sqlEscape(r.id)}, ${sqlEscape(r.institution_id)}, ${sqlEscape(r.batch_id)}, ${sqlEscape(r.title)}, ${sqlEscape(r.description)}, ${sqlEscape(r.due_date)}, ${sqlEscape(r.created_at)}) ON CONFLICT (institution_id, id) DO NOTHING;`
    );
  });

  // 14. Notices
  sqlStatements.push("\n-- 14. Notices");
  noticesRows.forEach((r) => {
    sqlStatements.push(
      `INSERT INTO public.notices (id, institution_id, text, sender, type, date, created_at) VALUES (${sqlEscape(r.id)}, ${sqlEscape(r.institution_id)}, ${sqlEscape(r.text)}, ${sqlEscape(r.sender)}, ${sqlEscape(r.type)}, ${sqlEscape(r.date)}, ${sqlEscape(r.created_at)}) ON CONFLICT (institution_id, id) DO NOTHING;`
    );
  });

  // 15. Notifications
  sqlStatements.push("\n-- 15. Notifications");
  notificationsRows.forEach((r) => {
    sqlStatements.push(
      `INSERT INTO public.notifications (id, user_id, institution_id, batch_id, title, text, type, date) VALUES (${sqlEscape(r.id)}, ${sqlEscape(r.user_id)}, ${sqlEscape(r.institution_id)}, ${sqlEscape(r.batch_id)}, ${sqlEscape(r.title)}, ${sqlEscape(r.text)}, ${sqlEscape(r.type)}, ${sqlEscape(r.date)}) ON CONFLICT (id) DO NOTHING;`
    );
  });

  // Write files
  const seedSqlPath = path.resolve(process.cwd(), "supabase", "seed_firestore_data.sql");
  fs.writeFileSync(seedSqlPath, sqlStatements.join("\n"));

  // Also build complete_setup_and_migrate.sql
  const schemaPath = path.resolve(process.cwd(), "supabase", "migrations", "20261003000000_init_edusmart_schema.sql");
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, "utf-8");
    const completeSqlPath = path.resolve(process.cwd(), "supabase", "complete_setup_and_migrate.sql");
    fs.writeFileSync(completeSqlPath, `${schemaSql}\n\n${sqlStatements.join("\n")}`);
  }

  // Update stats counters
  stats.institutions.migrated = institutionsRows.length;
  stats.branches.migrated = branchesRows.length;
  stats.users.migrated = usersRows.length;
  stats.admins.migrated = adminsRows.length;
  stats.batches.migrated = batchesRows.length;
  stats.teachers.migrated = teachersRows.length;
  stats.timetableSlots.migrated = timetableRows.length;
  stats.students.migrated = studentsRows.length;
  stats.batchStudents.migrated = batchStudentsRows.length;
  stats.attendance.migrated = attendanceRows.length;
  stats.fees.migrated = feesRows.length;
  stats.examScores.migrated = examScoresRows.length;
  stats.assignments.migrated = assignmentsRows.length;
  stats.notices.migrated = noticesRows.length;
  stats.notifications.migrated = notificationsRows.length;

  // Execute in Supabase if --live
  if (!isDryRun) {
    console.log("⚡ Executing Live Inserts to Supabase REST endpoint...");
    for (const inst of institutionsRows) {
      const { error } = await supabase.from("institutions").upsert(inst, { onConflict: "id" });
      if (error) failureLog.push({ entity: "institution", id: inst.id, error: error.message });
    }
    for (const b of branchesRows) {
      const { error } = await supabase.from("branches").upsert(b, { onConflict: "institution_id,id" });
      if (error) failureLog.push({ entity: "branch", id: b.id, error: error.message });
    }
    for (const u of usersRows) {
      const { error } = await supabase.from("users").upsert(u, { onConflict: "id" });
      if (error) failureLog.push({ entity: "user", id: u.id, error: error.message });
    }
    for (const adm of adminsRows) {
      const { error } = await supabase.from("admins").upsert(adm, { onConflict: "username" });
      if (error) failureLog.push({ entity: "admin", id: adm.username, error: error.message });
    }
    for (const b of batchesRows) {
      const { error } = await supabase.from("batches").upsert(b, { onConflict: "institution_id,id" });
      if (error) failureLog.push({ entity: "batch", id: b.id, error: error.message });
    }
    for (const t of teachersRows) {
      const { error } = await supabase.from("teachers").upsert(t, { onConflict: "institution_id,id" });
      if (error) failureLog.push({ entity: "teacher", id: t.id, error: error.message });
    }
    for (const tt of timetableRows) {
      const { error } = await supabase.from("timetable_slots").upsert(tt, { onConflict: "institution_id,id" });
      if (error) failureLog.push({ entity: "timetable_slot", id: tt.id, error: error.message });
    }
    for (const s of studentsRows) {
      const { error } = await supabase.from("students").upsert(s, { onConflict: "institution_id,id" });
      if (error) failureLog.push({ entity: "student", id: s.id, error: error.message });
    }
    for (const bs of batchStudentsRows) {
      const { error } = await supabase.from("batch_students").upsert(bs, { onConflict: "institution_id,batch_id,student_id" });
      if (error) failureLog.push({ entity: "batch_student", id: `${bs.batch_id}-${bs.student_id}`, error: error.message });
    }
    for (const a of attendanceRows) {
      const { error } = await supabase.from("attendance").upsert(a, { onConflict: "institution_id,batch_id,student_id,date" });
      if (error) failureLog.push({ entity: "attendance", id: `${a.batch_id}-${a.student_id}-${a.date}`, error: error.message });
    }
    for (const f of feesRows) {
      const { error } = await supabase.from("fee_records").upsert(f, { onConflict: "institution_id,batch_id,student_id,year,month" });
      if (error) failureLog.push({ entity: "fee_record", id: `${f.batch_id}-${f.student_id}-${f.year}-${f.month}`, error: error.message });
    }
    for (const es of examScoresRows) {
      const { error } = await supabase.from("exam_scores").upsert(es, { onConflict: "institution_id,id" });
      if (error) failureLog.push({ entity: "exam_score", id: es.id, error: error.message });
    }
    for (const asg of assignmentsRows) {
      const { error } = await supabase.from("assignments").upsert(asg, { onConflict: "institution_id,id" });
      if (error) failureLog.push({ entity: "assignment", id: asg.id, error: error.message });
    }
    for (const n of noticesRows) {
      const { error } = await supabase.from("notices").upsert(n, { onConflict: "institution_id,id" });
      if (error) failureLog.push({ entity: "notice", id: n.id, error: error.message });
    }
    for (const notif of notificationsRows) {
      const { error } = await supabase.from("notifications").upsert(notif, { onConflict: "id" });
      if (error) failureLog.push({ entity: "notification", id: notif.id, error: error.message });
    }
  }

  const durationMs = Date.now() - startTime;

  // Write JSON and Markdown reports
  const report = {
    timestamp: new Date().toISOString(),
    mode: isDryRun ? "DRY_RUN" : "LIVE",
    durationMs,
    stats,
    failureCount: failureLog.length,
    failures: failureLog,
    unresolvedRelationships,
  };

  const logsDir = path.resolve(process.cwd(), "logs");
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
  fs.writeFileSync(path.join(logsDir, "migration-report.json"), JSON.stringify(report, null, 2));

  const mdReport = `# EduSmartPro Firestore → Supabase Migration Report

**Date**: ${new Date().toISOString()}  
**Mode**: ${isDryRun ? "🧪 DRY RUN (Simulation + SQL export)" : "⚡ LIVE RUN"}  
**Duration**: ${durationMs}ms  

## Summary of Entities

| Entity | Scanned | Migrated | Skipped | Errors |
| :--- | :--- | :--- | :--- | :--- |
| **Institutions** | ${stats.institutions.scanned} | ${stats.institutions.migrated} | ${stats.institutions.skipped} | ${stats.institutions.errors} |
| **Branches** | ${stats.branches.scanned} | ${stats.branches.migrated} | ${stats.branches.skipped} | ${stats.branches.errors} |
| **Users** | ${stats.users.scanned} | ${stats.users.migrated} | ${stats.users.skipped} | ${stats.users.errors} |
| **Admins** | ${stats.admins.scanned} | ${stats.admins.migrated} | ${stats.admins.skipped} | ${stats.admins.errors} |
| **Batches** | ${stats.batches.scanned} | ${stats.batches.migrated} | ${stats.batches.skipped} | ${stats.batches.errors} |
| **Teachers** | ${stats.teachers.scanned} | ${stats.teachers.migrated} | ${stats.teachers.skipped} | ${stats.teachers.errors} |
| **Timetable Slots** | ${stats.timetableSlots.scanned} | ${stats.timetableSlots.migrated} | ${stats.timetableSlots.skipped} | ${stats.timetableSlots.errors} |
| **Students** | ${stats.students.scanned} | ${stats.students.migrated} | ${stats.students.skipped} | ${stats.students.errors} |
| **Batch Students** | ${stats.batchStudents.scanned} | ${stats.batchStudents.migrated} | ${stats.batchStudents.skipped} | ${stats.batchStudents.errors} |
| **Attendance** | ${stats.attendance.scanned} | ${stats.attendance.migrated} | ${stats.attendance.skipped} | ${stats.attendance.errors} |
| **Fee Ledgers** | ${stats.fees.scanned} | ${stats.fees.migrated} | ${stats.fees.skipped} | ${stats.fees.errors} |
| **Exam Scores** | ${stats.examScores.scanned} | ${stats.examScores.migrated} | ${stats.examScores.skipped} | ${stats.examScores.errors} |
| **Assignments** | ${stats.assignments.scanned} | ${stats.assignments.migrated} | ${stats.assignments.skipped} | ${stats.assignments.errors} |
| **Notices** | ${stats.notices.scanned} | ${stats.notices.migrated} | ${stats.notices.skipped} | ${stats.notices.errors} |
| **Notifications** | ${stats.notifications.scanned} | ${stats.notifications.migrated} | ${stats.notifications.skipped} | ${stats.notifications.errors} |

## Unresolved Relationships & Representation
${
  unresolvedRelationships.length === 0
    ? "✅ Zero unresolved relationships."
    : unresolvedRelationships.map((u) => `- **${u.entity}** (\`${u.id}\`): ${u.reason}`).join("\n")
}

## Failures
${
  failureLog.length === 0
    ? "✅ Zero failures encountered."
    : failureLog.map((f) => `- **${f.entity}** (\`${f.id}\`): ${f.error}`).join("\n")
}
`;

  fs.writeFileSync(path.join(logsDir, "migration-report.md"), mdReport);

  console.log("=================================================================");
  console.log("📊 MIGRATION SUMMARY");
  console.log("=================================================================");
  console.log(`Institutions:    ${stats.institutions.migrated}/${stats.institutions.scanned}`);
  console.log(`Branches:        ${stats.branches.migrated}/${stats.branches.scanned}`);
  console.log(`Users:           ${stats.users.migrated}/${stats.users.scanned}`);
  console.log(`Admins:          ${stats.admins.migrated}/${stats.admins.scanned}`);
  console.log(`Batches:         ${stats.batches.migrated}/${stats.batches.scanned}`);
  console.log(`Teachers:        ${stats.teachers.migrated}/${stats.teachers.scanned}`);
  console.log(`Timetable Slots: ${stats.timetableSlots.migrated}/${stats.timetableSlots.scanned}`);
  console.log(`Students:        ${stats.students.migrated}/${stats.students.scanned}`);
  console.log(`Batch Students:  ${stats.batchStudents.migrated}/${stats.batchStudents.scanned}`);
  console.log(`Attendance:      ${stats.attendance.migrated}/${stats.attendance.scanned}`);
  console.log(`Fees:            ${stats.fees.migrated}/${stats.fees.scanned}`);
  console.log(`Exam Scores:     ${stats.examScores.migrated}/${stats.examScores.scanned}`);
  console.log(`Assignments:     ${stats.assignments.migrated}/${stats.assignments.scanned}`);
  console.log(`Notices:         ${stats.notices.migrated}/${stats.notices.scanned}`);
  console.log(`Notifications:   ${stats.notifications.migrated}/${stats.notifications.scanned}`);
  console.log(`Failures:        ${failureLog.length}`);
  console.log(`Generated SQL:   supabase/seed_firestore_data.sql`);
  console.log(`Complete SQL:    supabase/complete_setup_and_migrate.sql`);
  console.log(`Report:          logs/migration-report.md`);
  console.log("=================================================================\n");
}

main().catch((err) => {
  console.error("Migration execution failed:", err);
  process.exit(1);
});
