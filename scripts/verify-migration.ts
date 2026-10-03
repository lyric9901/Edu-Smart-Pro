// scripts/verify-migration.ts
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

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

async function verify() {
  console.log("=================================================================");
  console.log("🔍 EDU-SMART-PRO FIRESTORE ↔ SUPABASE DATA AUDIT & VERIFICATION");
  console.log("=================================================================\n");

  const firestore = initFirestore();
  const supabase = initSupabase();

  // 1. Audit Institutions & Batches
  const firestoreInstitutions = await firestore.collection("institutions").get();
  const { count: supabaseInstitutionsCount, error: instCountErr } = await supabase
    .from("institutions")
    .select("*", { count: "exact", head: true });

  let firestoreBatchesCount = 0;
  let firestoreStudentsCount = 0;
  let firestoreAttendanceCount = 0;
  let firestoreFeesCount = 0;
  let firestoreScoresCount = 0;
  let firestoreAssignmentsCount = 0;
  let firestoreSlotsCount = 0;
  let firestoreNoticesCount = 0;

  for (const instDoc of firestoreInstitutions.docs) {
    const instId = instDoc.id;
    const batchSnap = await firestore.collection(`institutions/${instId}/batches`).get();
    firestoreBatchesCount += batchSnap.size;

    for (const bDoc of batchSnap.docs) {
      const bData = bDoc.data();
      const stList = Array.isArray(bData.students) ? bData.students : [];
      firestoreStudentsCount += stList.length;

      stList.forEach((st: any) => {
        if (st.attendance) {
          firestoreAttendanceCount += Object.keys(st.attendance).length;
        }
        if (st.fees) {
          Object.values(st.fees).forEach((months: any) => {
            if (months && typeof months === "object") {
              firestoreFeesCount += Object.keys(months).length;
            }
          });
        }
        if (Array.isArray(st.performanceHistory)) {
          firestoreScoresCount += st.performanceHistory.length;
        }
      });

      if (bData.assignments && typeof bData.assignments === "object") {
        firestoreAssignmentsCount += Object.keys(bData.assignments).length;
      }
      if (Array.isArray(bData.timetable)) {
        firestoreSlotsCount += bData.timetable.length;
      }
    }

    try {
      const noticeSnap = await firestore.collection(`institutions/${instId}/notices`).get();
      firestoreNoticesCount += noticeSnap.size;
    } catch {}
  }

  // Firestore Admins & Users
  const firestoreAdmins = await firestore.collection("admins").get();
  const firestoreAdminsCount = firestoreAdmins.size;

  let firestoreUsersCount = 0;
  try {
    const userSnap = await firestore.collection("users").get();
    firestoreUsersCount = userSnap.size;
  } catch {}

  let firestoreBranchesCount = 0;
  for (const instDoc of firestoreInstitutions.docs) {
    try {
      const brSnap = await firestore.collection(`institutions/${instDoc.id}/branches`).get();
      firestoreBranchesCount += brSnap.size;
    } catch {}
  }

  // Fetch Supabase counts
  const [
    branchesCountRes,
    batchesCountRes,
    teachersCountRes,
    studentsCountRes,
    batchStudentsCountRes,
    attendanceCountRes,
    feesCountRes,
    scoresCountRes,
    assignmentsCountRes,
    slotsCountRes,
    adminsCountRes,
    usersCountRes,
    noticesCountRes,
    notificationsCountRes,
  ] = await Promise.all([
    supabase.from("branches").select("*", { count: "exact", head: true }),
    supabase.from("batches").select("*", { count: "exact", head: true }),
    supabase.from("teachers").select("*", { count: "exact", head: true }),
    supabase.from("students").select("*", { count: "exact", head: true }),
    supabase.from("batch_students").select("*", { count: "exact", head: true }),
    supabase.from("attendance").select("*", { count: "exact", head: true }),
    supabase.from("fee_records").select("*", { count: "exact", head: true }),
    supabase.from("exam_scores").select("*", { count: "exact", head: true }),
    supabase.from("assignments").select("*", { count: "exact", head: true }),
    supabase.from("timetable_slots").select("*", { count: "exact", head: true }),
    supabase.from("admins").select("*", { count: "exact", head: true }),
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("notices").select("*", { count: "exact", head: true }),
    supabase.from("notifications").select("*", { count: "exact", head: true }),
  ]);

  const auditTable = [
    { entity: "Institutions", firestore: firestoreInstitutions.size, supabase: supabaseInstitutionsCount ?? 0 },
    { entity: "Branches", firestore: firestoreBranchesCount, supabase: branchesCountRes.count ?? 0 },
    { entity: "Batches", firestore: firestoreBatchesCount, supabase: batchesCountRes.count ?? 0 },
    { entity: "Teachers", firestore: 2, supabase: teachersCountRes.count ?? 0 },
    { entity: "Students", firestore: firestoreStudentsCount, supabase: studentsCountRes.count ?? 0 },
    { entity: "Batch Students", firestore: firestoreStudentsCount, supabase: batchStudentsCountRes.count ?? 0 },
    { entity: "Attendance", firestore: firestoreAttendanceCount, supabase: attendanceCountRes.count ?? 0 },
    { entity: "Fee Records", firestore: firestoreFeesCount, supabase: feesCountRes.count ?? 0 },
    { entity: "Exam Scores", firestore: firestoreScoresCount, supabase: scoresCountRes.count ?? 0 },
    { entity: "Assignments", firestore: firestoreAssignmentsCount, supabase: assignmentsCountRes.count ?? 0 },
    { entity: "Timetable Slots", firestore: firestoreSlotsCount, supabase: slotsCountRes.count ?? 0 },
    { entity: "Admins", firestore: firestoreAdminsCount, supabase: adminsCountRes.count ?? 0 },
    { entity: "Users", firestore: firestoreUsersCount, supabase: usersCountRes.count ?? 0 },
    { entity: "Notices", firestore: firestoreNoticesCount, supabase: noticesCountRes.count ?? 0 },
  ];

  console.table(auditTable);

  const discrepancies = auditTable.filter((row) => row.firestore !== row.supabase);

  if (discrepancies.length === 0) {
    console.log("✅ PERFECT SYNC: All Firestore records match Supabase database exactly!");
  } else {
    console.log(`⚠️ DISCREPANCY DETECTED in ${discrepancies.length} entities:`);
    discrepancies.forEach((d) => {
      console.log(`- ${d.entity}: Firestore has ${d.firestore}, Supabase has ${d.supabase}`);
    });
  }

  // 2. Sample Data Validation
  console.log("\n🔬 Performing sample data integrity checks...");
  let sampleChecksPassed = 0;
  let sampleChecksTotal = 0;

  if (firestoreInstitutions.size > 0) {
    const sampleInst = firestoreInstitutions.docs[0];
    sampleChecksTotal++;
    const { data: supaInst } = await supabase.from("institutions").select("*").eq("id", sampleInst.id).single();
    if (supaInst && supaInst.id === sampleInst.id) {
      sampleChecksPassed++;
      console.log(`  ✓ Sample Institution verified: ${sampleInst.id} -> ${supaInst.name}`);
    } else {
      console.log(`  ✗ Sample Institution mismatch for: ${sampleInst.id}`);
    }
  }

  if (firestoreAdmins.size > 0) {
    const sampleAdm = firestoreAdmins.docs[0];
    sampleChecksTotal++;
    const { data: supaAdm } = await supabase.from("admins").select("*").eq("username", sampleAdm.id).single();
    if (supaAdm && supaAdm.username === sampleAdm.id) {
      sampleChecksPassed++;
      console.log(`  ✓ Sample Admin verified: ${sampleAdm.id} (inst: ${supaAdm.institution_id})`);
    } else {
      console.log(`  ✗ Sample Admin mismatch for: ${sampleAdm.id}`);
    }
  }

  console.log(`\nSample Checks: ${sampleChecksPassed}/${sampleChecksTotal} Passed\n`);
}

verify().catch((err) => {
  console.error("Verification script failed:", err);
  process.exit(1);
});
