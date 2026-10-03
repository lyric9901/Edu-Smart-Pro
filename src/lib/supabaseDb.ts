// src/lib/supabaseDb.ts
import { supabase } from "./supabase";
import { hashPassword } from "./security";

export interface DBInstitution {
  id: string;
  name: string;
  owner?: string;
  phone?: string;
  plan?: string;
  createdAt?: number;
}

export interface DBBranch {
  id: string;
  institution_id: string;
  name: string;
  createdAt?: number;
}

export interface DBAdmin {
  id?: string;
  username: string;
  password: string;
  institutionCode: string;
  role: string;
}

export interface DBTimeSlot {
  id: string;
  day: string;
  subject: string;
  startTime: string;
  endTime: string;
  room?: string;
  teacher?: string;
}

export interface DBAssignment {
  id: string;
  title: string;
  description?: string;
  createdAt: string | number;
  dueDate?: string;
}

export interface DBStudent {
  id: string | number;
  name: string;
  phone?: string;
  rollNumber?: string;
  password?: string;
  performance?: number;
  performanceHistory?: { id: string | number; name: string; score: number; date?: string }[];
  attendance?: Record<string, "present" | "absent" | "late" | "not-marked" | "leave">;
  fees?: Record<string, Record<string, "paid" | "pending">>;
  notifications?: any[];
  batchId?: string;
  batchName?: string;
  institutionCode?: string;
  branchId?: string;
  batchTiming?: { start?: string; end?: string };
  timetable?: DBTimeSlot[];
}

export interface DBBatch {
  id: string;
  name: string;
  branchId?: string;
  timing?: { start: string; end: string };
  timetable?: DBTimeSlot[];
  assignments?: Record<string, DBAssignment>;
  students: DBStudent[];
}

export interface DBNotice {
  id: string;
  text: string;
  sender: string;
  type?: string;
  date?: string;
  createdAt?: number;
  institutionCode?: string;
}

// ==========================================
// INSTITUTIONS & ADMINS
// ==========================================

export async function getInstitution(code: string): Promise<DBInstitution | null> {
  const { data, error } = await supabase
    .from("institutions")
    .select("*")
    .eq("id", code)
    .single();

  if (error || !data) return null;
  return {
    id: data.id,
    name: data.name,
    owner: data.owner,
    phone: data.phone,
    plan: data.plan,
    createdAt: data.created_at ? new Date(data.created_at).getTime() : Date.now(),
  };
}

export async function createInstitution(inst: {
  id: string;
  name: string;
  owner?: string;
  phone?: string;
  plan?: string;
}): Promise<boolean> {
  const { error } = await supabase.from("institutions").upsert({
    id: inst.id,
    name: inst.name,
    owner: inst.owner || "",
    phone: inst.phone || "",
    plan: inst.plan || "premium",
  });
  if (error) {
    console.error("Error creating institution:", error);
    throw error;
  }
  return true;
}

export async function updateInstitution(
  code: string,
  updates: { name?: string; owner?: string; phone?: string; plan?: string }
): Promise<boolean> {
  const { error } = await supabase
    .from("institutions")
    .update({
      ...(updates.name !== undefined && { name: updates.name }),
      ...(updates.owner !== undefined && { owner: updates.owner }),
      ...(updates.phone !== undefined && { phone: updates.phone }),
      ...(updates.plan !== undefined && { plan: updates.plan }),
    })
    .eq("id", code);

  if (error) {
    console.error("Error updating institution:", error);
    throw error;
  }
  return true;
}

export async function deleteInstitution(code: string): Promise<boolean> {
  const { error } = await supabase.from("institutions").delete().eq("id", code);
  if (error) {
    console.error("Error deleting institution:", error);
    throw error;
  }
  return true;
}

export async function getBranches(institutionCode: string): Promise<DBBranch[]> {
  const { data, error } = await supabase
    .from("branches")
    .select("*")
    .eq("institution_id", institutionCode);

  if (error) {
    console.error("Error fetching branches:", error);
    return [];
  }
  return (data || []).map((b) => ({
    id: b.id,
    institution_id: b.institution_id,
    name: b.name,
    createdAt: b.created_at ? new Date(b.created_at).getTime() : Date.now(),
  }));
}

export async function createBranch(institutionCode: string, id: string, name: string): Promise<boolean> {
  const { error } = await supabase.from("branches").upsert({
    id,
    institution_id: institutionCode,
    name,
  });
  if (error) {
    console.error("Error creating branch:", error);
    throw error;
  }
  return true;
}

export async function getAdmin(username: string): Promise<DBAdmin | null> {
  const cleanUsername = username.trim();
  const { data, error } = await supabase
    .from("admins")
    .select("*")
    .ilike("username", cleanUsername)
    .maybeSingle();

  if (error || !data) return null;
  return {
    id: data.id,
    username: data.username,
    password: data.password,
    institutionCode: data.institution_id,
    role: data.role || "admin",
  };
}

export async function createAdmin(admin: {
  username: string;
  password: string;
  institutionCode: string;
  role?: string;
}): Promise<boolean> {
  const cleanUsername = admin.username.trim();
  const hashedPassword = await hashPassword(admin.password.trim());
  const { error } = await supabase.from("admins").upsert({
    username: cleanUsername,
    password: hashedPassword,
    institution_id: admin.institutionCode.trim(),
    role: admin.role || "admin",
  });
  if (error) {
    console.error("Error creating admin:", error);
    throw error;
  }
  return true;
}

export async function updateAdminPassword(username: string, newPass: string): Promise<boolean> {
  const cleanUsername = username.trim();
  const hashedPassword = await hashPassword(newPass.trim());
  const { error } = await supabase
    .from("admins")
    .update({ password: hashedPassword })
    .ilike("username", cleanUsername);

  if (error) {
    console.error("Error updating admin password:", error);
    throw error;
  }
  return true;
}

export async function deleteAdmin(username: string): Promise<boolean> {
  const cleanUsername = username.trim();
  const { error } = await supabase
    .from("admins")
    .delete()
    .ilike("username", cleanUsername);

  if (error) {
    console.error("Error deleting admin:", error);
    throw error;
  }
  return true;
}

export async function getAllInstitutionsWithAdmins(): Promise<{
  schools: Record<string, DBInstitution>;
  admins: Record<string, DBAdmin>;
}> {
  const [instRes, admRes] = await Promise.all([
    supabase.from("institutions").select("*"),
    supabase.from("admins").select("*"),
  ]);

  const schools: Record<string, DBInstitution> = {};
  (instRes.data || []).forEach((row) => {
    schools[row.id] = {
      id: row.id,
      name: row.name,
      owner: row.owner,
      phone: row.phone,
      plan: row.plan,
      createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    };
  });

  const admins: Record<string, DBAdmin> = {};
  (admRes.data || []).forEach((row) => {
    admins[row.username] = {
      id: row.id,
      username: row.username,
      password: "••••••••",
      institutionCode: row.institution_id,
      role: row.role || "admin",
    };
  });

  return { schools, admins };
}

// ==========================================
// BATCHES & RELATIONAL AGGREGATION
// ==========================================

export async function getBatches(institutionCode: string, branchId?: string): Promise<DBBatch[]> {
  let query = supabase
    .from("batches")
    .select("*")
    .eq("institution_id", institutionCode);

  if (branchId) {
    query = query.eq("branch_id", branchId);
  }

  const { data: batchesData, error: batchesError } = await query;
  if (batchesError || !batchesData) {
    console.error("Error fetching batches:", batchesError);
    return [];
  }

  const batchIds = batchesData.map((b) => b.id);
  if (batchIds.length === 0) return [];

  // Parallel relational fetch for all batch relations in this institution
  const [
    studentsRes,
    batchStudentsRes,
    attendanceRes,
    feesRes,
    scoresRes,
    assignmentsRes,
    timetableRes,
  ] = await Promise.all([
    supabase.from("students").select("*").eq("institution_id", institutionCode),
    supabase.from("batch_students").select("*").eq("institution_id", institutionCode).in("batch_id", batchIds),
    supabase.from("attendance").select("*").eq("institution_id", institutionCode).in("batch_id", batchIds),
    supabase.from("fee_records").select("*").eq("institution_id", institutionCode).in("batch_id", batchIds),
    supabase.from("exam_scores").select("*").eq("institution_id", institutionCode).in("batch_id", batchIds),
    supabase.from("assignments").select("*").eq("institution_id", institutionCode).in("batch_id", batchIds),
    supabase.from("timetable_slots").select("*").eq("institution_id", institutionCode).in("batch_id", batchIds),
  ]);

  // Index students
  const studentsMap = new Map<string, any>();
  (studentsRes.data || []).forEach((s) => {
    studentsMap.set(String(s.id), s);
  });

  // Map batch -> student IDs
  const batchStudentsMap = new Map<string, Set<string>>();
  batchIds.forEach((id) => batchStudentsMap.set(id, new Set()));
  (batchStudentsRes.data || []).forEach((bs) => {
    const set = batchStudentsMap.get(bs.batch_id);
    if (set) set.add(String(bs.student_id));
  });

  // Map (batchId, studentId) -> attendance dictionary { [date]: status }
  const attendanceMap = new Map<string, Record<string, "present" | "absent" | "late">>();
  (attendanceRes.data || []).forEach((att) => {
    const key = `${att.batch_id}__${att.student_id}`;
    if (!attendanceMap.has(key)) attendanceMap.set(key, {});
    attendanceMap.get(key)![att.date] = att.status;
  });

  // Map (batchId, studentId) -> fee dictionary { [year]: { [month]: status } }
  const feesMap = new Map<string, Record<string, Record<string, "paid" | "pending">>>();
  (feesRes.data || []).forEach((fee) => {
    const key = `${fee.batch_id}__${fee.student_id}`;
    if (!feesMap.has(key)) feesMap.set(key, {});
    const yearKey = String(fee.year);
    const sub = feesMap.get(key)!;
    if (!sub[yearKey]) sub[yearKey] = {};
    sub[yearKey][fee.month] = fee.status;
  });

  // Map (batchId, studentId) -> performance scores history
  const scoresMap = new Map<string, any[]>();
  (scoresRes.data || []).forEach((score) => {
    const key = `${score.batch_id}__${score.student_id}`;
    if (!scoresMap.has(key)) scoresMap.set(key, []);
    scoresMap.get(key)!.push({
      id: score.id,
      name: score.name,
      score: Number(score.score),
      date: score.date || score.created_at,
    });
  });

  // Map batch -> assignments
  const assignmentsMap = new Map<string, Record<string, DBAssignment>>();
  (assignmentsRes.data || []).forEach((asg) => {
    if (!assignmentsMap.has(asg.batch_id)) assignmentsMap.set(asg.batch_id, {});
    assignmentsMap.get(asg.batch_id)![asg.id] = {
      id: asg.id,
      title: asg.title,
      description: asg.description || "",
      dueDate: asg.due_date,
      createdAt: asg.created_at,
    };
  });

  // Map batch -> timetable slots
  const timetableMap = new Map<string, DBTimeSlot[]>();
  (timetableRes.data || []).forEach((ts) => {
    if (!timetableMap.has(ts.batch_id)) timetableMap.set(ts.batch_id, []);
    timetableMap.get(ts.batch_id)!.push({
      id: ts.id,
      day: ts.day,
      subject: ts.subject,
      startTime: ts.start_time,
      endTime: ts.end_time,
      room: ts.room || "",
      teacher: ts.teacher || "",
    });
  });

  // Build composite batches
  const batches: DBBatch[] = batchesData.map((b) => {
    const studentIdSet = batchStudentsMap.get(b.id) || new Set();
    const students: DBStudent[] = [];

    studentIdSet.forEach((sid) => {
      const sRaw = studentsMap.get(sid);
      if (sRaw) {
        const key = `${b.id}__${sid}`;
        const att = attendanceMap.get(key) || {};
        const fee = feesMap.get(key) || {};
        const history = scoresMap.get(key) || [];
        const avg =
          history.length > 0
            ? Math.round(history.reduce((acc, curr) => acc + Number(curr.score), 0) / history.length)
            : Number(sRaw.performance || 0);

        students.push({
          id: isNaN(Number(sRaw.id)) ? sRaw.id : Number(sRaw.id),
          name: sRaw.name,
          phone: sRaw.phone || "N/A",
          rollNumber: sRaw.roll_number || "",
          password: sRaw.password ? "••••••••" : "",
          performance: avg,
          performanceHistory: history,
          attendance: att,
          fees: fee,
        });
      }
    });

    return {
      id: b.id,
      name: b.name,
      branchId: b.branch_id,
      timing: {
        start: b.timing_start || "",
        end: b.timing_end || "",
      },
      timetable: timetableMap.get(b.id) || [],
      assignments: assignmentsMap.get(b.id) || {},
      students: students.sort((a, b) => a.name.localeCompare(b.name)),
    };
  });

  return batches.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" })
  );
}

export async function createBatch(
  institutionCode: string,
  id: string,
  name: string,
  branchId?: string
): Promise<boolean> {
  const { error } = await supabase.from("batches").upsert({
    id,
    institution_id: institutionCode,
    branch_id: branchId || null,
    name,
  });
  if (error) {
    console.error("Error creating batch:", error);
    throw error;
  }
  return true;
}

export async function updateBatch(
  institutionCode: string,
  batchId: string,
  updates: { name?: string; branchId?: string; timing?: { start: string; end: string } }
): Promise<boolean> {
  const payload: any = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.branchId !== undefined) payload.branch_id = updates.branchId;
  if (updates.timing !== undefined) {
    payload.timing_start = updates.timing.start;
    payload.timing_end = updates.timing.end;
  }

  const { error } = await supabase
    .from("batches")
    .update(payload)
    .eq("institution_id", institutionCode)
    .eq("id", batchId);

  if (error) {
    console.error("Error updating batch:", error);
    throw error;
  }
  return true;
}

export async function deleteBatch(institutionCode: string, batchId: string): Promise<boolean> {
  const { error } = await supabase
    .from("batches")
    .delete()
    .eq("institution_id", institutionCode)
    .eq("id", batchId);

  if (error) {
    console.error("Error deleting batch:", error);
    throw error;
  }
  return true;
}

// ==========================================
// STUDENTS & BATCH MEMBERSHIP
// ==========================================

export async function addStudent(
  institutionCode: string,
  batchId: string,
  student: {
    id?: string | number;
    name: string;
    phone?: string;
    rollNumber?: string;
    password?: string;
  }
): Promise<string> {
  const studentId = String(student.id || Date.now());
  const hashedPassword = student.password ? await hashPassword(student.password.trim()) : "";

  // 1. Upsert student in students table
  const { error: sError } = await supabase.from("students").upsert({
    id: studentId,
    institution_id: institutionCode,
    name: student.name.trim(),
    phone: student.phone ? String(student.phone).trim() : "N/A",
    roll_number: student.rollNumber ? String(student.rollNumber).trim() : "",
    password: hashedPassword,
  });

  if (sError) {
    console.error("Error adding student:", sError);
    throw sError;
  }

  // 2. Link student to batch in batch_students junction
  const { error: bsError } = await supabase.from("batch_students").upsert({
    institution_id: institutionCode,
    batch_id: batchId,
    student_id: studentId,
  });

  if (bsError) {
    console.error("Error linking student to batch:", bsError);
    throw bsError;
  }

  return studentId;
}

export async function addMultipleStudents(
  institutionCode: string,
  batchId: string,
  students: {
    id?: string | number;
    name: string;
    phone?: string;
    rollNumber?: string;
    password?: string;
  }[]
): Promise<boolean> {
  if (students.length === 0) return true;

  const studentsRows = await Promise.all(
    students.map(async (s, idx) => ({
      id: String(s.id || `student_${Date.now()}_${idx}`),
      institution_id: institutionCode,
      name: s.name.trim(),
      phone: s.phone ? String(s.phone).trim() : "N/A",
      roll_number: s.rollNumber ? String(s.rollNumber).trim() : "",
      password: s.password ? await hashPassword(s.password.trim()) : "",
    }))
  );

  const { error: sError } = await supabase.from("students").upsert(studentsRows);
  if (sError) {
    console.error("Error adding multiple students:", sError);
    throw sError;
  }

  const junctionRows = studentsRows.map((s) => ({
    institution_id: institutionCode,
    batch_id: batchId,
    student_id: s.id,
  }));

  const { error: jError } = await supabase.from("batch_students").upsert(junctionRows);
  if (jError) {
    console.error("Error linking multiple students:", jError);
    throw jError;
  }

  return true;
}

export async function removeStudentFromBatch(
  institutionCode: string,
  batchId: string,
  studentId: string | number
): Promise<boolean> {
  const sid = String(studentId);
  const { error } = await supabase
    .from("batch_students")
    .delete()
    .eq("institution_id", institutionCode)
    .eq("batch_id", batchId)
    .eq("student_id", sid);

  if (error) {
    console.error("Error removing student from batch:", error);
    throw error;
  }
  return true;
}

export async function updateStudentProfile(
  institutionCode: string,
  studentId: string | number,
  updates: { name?: string; phone?: string; rollNumber?: string; password?: string; performance?: number }
): Promise<boolean> {
  const sid = String(studentId);
  const payload: any = {};
  if (updates.name !== undefined) payload.name = updates.name.trim();
  if (updates.phone !== undefined) payload.phone = String(updates.phone).trim();
  if (updates.rollNumber !== undefined) payload.roll_number = String(updates.rollNumber).trim();
  if (updates.password !== undefined) {
    payload.password = updates.password ? await hashPassword(updates.password.trim()) : "";
  }
  if (updates.performance !== undefined) payload.performance = updates.performance;

  const { error } = await supabase
    .from("students")
    .update(payload)
    .eq("institution_id", institutionCode)
    .eq("id", sid);

  if (error) {
    console.error("Error updating student profile:", error);
    throw error;
  }
  return true;
}

// ==========================================
// ATTENDANCE & FEES
// ==========================================

export async function recordAttendance(
  institutionCode: string,
  batchId: string,
  studentId: string | number,
  date: string,
  status: "present" | "absent" | "late"
): Promise<boolean> {
  const sid = String(studentId);
  const { error } = await supabase.from("attendance").upsert({
    institution_id: institutionCode,
    batch_id: batchId,
    student_id: sid,
    date,
    status,
  });

  if (error) {
    console.error("Error recording attendance:", error);
    throw error;
  }
  return true;
}

export async function recordBulkAttendance(
  institutionCode: string,
  batchId: string,
  date: string,
  records: { studentId: string | number; status: "present" | "absent" | "late" }[]
): Promise<boolean> {
  if (records.length === 0) return true;

  const rows = records.map((r) => ({
    institution_id: institutionCode,
    batch_id: batchId,
    student_id: String(r.studentId),
    date,
    status: r.status,
  }));

  const { error } = await supabase.from("attendance").upsert(rows);
  if (error) {
    console.error("Error recording bulk attendance:", error);
    throw error;
  }
  return true;
}

export async function recordFee(
  institutionCode: string,
  batchId: string,
  studentId: string | number,
  year: number,
  month: string,
  status: "paid" | "pending",
  amount = 0
): Promise<boolean> {
  const sid = String(studentId);
  const { error } = await supabase.from("fee_records").upsert({
    institution_id: institutionCode,
    batch_id: batchId,
    student_id: sid,
    year,
    month,
    status,
    amount,
    paid_at: status === "paid" ? new Date().toISOString() : null,
  });

  if (error) {
    console.error("Error recording fee:", error);
    throw error;
  }
  return true;
}

export async function recordBulkFees(
  institutionCode: string,
  batchId: string,
  year: number,
  month: string,
  studentIds: (string | number)[],
  status: "paid" | "pending"
): Promise<boolean> {
  if (studentIds.length === 0) return true;

  const rows = studentIds.map((sid) => ({
    institution_id: institutionCode,
    batch_id: batchId,
    student_id: String(sid),
    year,
    month,
    status,
    paid_at: status === "paid" ? new Date().toISOString() : null,
  }));

  const { error } = await supabase.from("fee_records").upsert(rows);
  if (error) {
    console.error("Error recording bulk fees:", error);
    throw error;
  }
  return true;
}

// ==========================================
// EXAM SCORES & ASSIGNMENTS & TIMETABLE
// ==========================================

export async function saveExamScore(
  institutionCode: string,
  batchId: string,
  studentId: string | number,
  scoreData: { id?: string | number; name: string; score: number; date?: string }
): Promise<string> {
  const sid = String(studentId);
  const scoreId = String(scoreData.id || Date.now());

  const { error } = await supabase.from("exam_scores").upsert({
    id: scoreId,
    institution_id: institutionCode,
    batch_id: batchId,
    student_id: sid,
    name: scoreData.name,
    score: Number(scoreData.score),
    date: scoreData.date || new Date().toISOString(),
  });

  if (error) {
    console.error("Error saving exam score:", error);
    throw error;
  }
  return scoreId;
}

export async function deleteExamScore(institutionCode: string, scoreId: string | number): Promise<boolean> {
  const { error } = await supabase
    .from("exam_scores")
    .delete()
    .eq("institution_id", institutionCode)
    .eq("id", String(scoreId));

  if (error) {
    console.error("Error deleting exam score:", error);
    throw error;
  }
  return true;
}

export async function updateExamScore(
  institutionCode: string,
  scoreId: string | number,
  updates: { name: string; score: number }
): Promise<boolean> {
  const { error } = await supabase
    .from("exam_scores")
    .update({
      name: updates.name,
      score: Number(updates.score),
    })
    .eq("institution_id", institutionCode)
    .eq("id", String(scoreId));

  if (error) {
    console.error("Error updating exam score:", error);
    throw error;
  }
  return true;
}

export async function createAssignment(
  institutionCode: string,
  batchId: string,
  assignment: { id?: string; title: string; description?: string; dueDate?: string }
): Promise<string> {
  const asgId = assignment.id || Date.now().toString();
  const { error } = await supabase.from("assignments").upsert({
    id: asgId,
    institution_id: institutionCode,
    batch_id: batchId,
    title: assignment.title.trim(),
    description: assignment.description?.trim() || "",
    due_date: assignment.dueDate || null,
  });

  if (error) {
    console.error("Error creating assignment:", error);
    throw error;
  }
  return asgId;
}

export async function deleteAssignment(institutionCode: string, assignmentId: string): Promise<boolean> {
  const { error } = await supabase
    .from("assignments")
    .delete()
    .eq("institution_id", institutionCode)
    .eq("id", assignmentId);

  if (error) {
    console.error("Error deleting assignment:", error);
    throw error;
  }
  return true;
}

export async function saveTimetable(
  institutionCode: string,
  batchId: string,
  slots: DBTimeSlot[]
): Promise<boolean> {
  // Delete previous slots for this batch and insert new ones
  await supabase
    .from("timetable_slots")
    .delete()
    .eq("institution_id", institutionCode)
    .eq("batch_id", batchId);

  if (slots.length > 0) {
    const rows = slots.map((s, idx) => ({
      id: s.id || `slot_${Date.now()}_${idx}`,
      institution_id: institutionCode,
      batch_id: batchId,
      day: s.day,
      subject: s.subject,
      start_time: s.startTime,
      end_time: s.endTime,
      room: s.room || "",
      teacher: s.teacher || "",
    }));

    const { error } = await supabase.from("timetable_slots").insert(rows);
    if (error) {
      console.error("Error saving timetable:", error);
      throw error;
    }
  }
  return true;
}

export async function saveBatchTiming(
  institutionCode: string,
  batchId: string,
  timing: { start: string; end: string }
): Promise<boolean> {
  const { error } = await supabase
    .from("batches")
    .update({
      timing_start: timing.start,
      timing_end: timing.end,
    })
    .eq("institution_id", institutionCode)
    .eq("id", batchId);

  if (error) {
    console.error("Error updating timing:", error);
    throw error;
  }
  return true;
}

// ==========================================
// NOTICES & REALTIME INBOX
// ==========================================

export async function getNotices(institutionCode: string): Promise<DBNotice[]> {
  const { data, error } = await supabase
    .from("notices")
    .select("*")
    .eq("institution_id", institutionCode)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching notices:", error);
    return [];
  }
  return (data || []).map((n) => ({
    id: n.id,
    text: n.text,
    sender: n.sender,
    type: n.type || "notice",
    date: n.date || n.created_at,
    createdAt: n.created_at ? new Date(n.created_at).getTime() : Date.now(),
    institutionCode: n.institution_id,
  }));
}

export async function createNotice(
  institutionCode: string,
  notice: { id?: string; text: string; sender: string; type?: string; date?: string }
): Promise<string> {
  const id = notice.id || `notice_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const { error } = await supabase.from("notices").upsert({
    id,
    institution_id: institutionCode,
    text: notice.text,
    sender: notice.sender || "Admin",
    type: notice.type || "notice",
    date: notice.date || new Date().toISOString(),
  });

  if (error) {
    console.error("Error creating notice:", error);
    throw error;
  }
  return id;
}

export async function deleteNotice(institutionCode: string, noticeId: string): Promise<boolean> {
  const { error } = await supabase
    .from("notices")
    .delete()
    .eq("institution_id", institutionCode)
    .eq("id", noticeId);

  if (error) {
    console.error("Error deleting notice:", error);
    throw error;
  }
  return true;
}

// ==========================================
// USER PROFILES & DIRECT NOTIFICATIONS
// ==========================================

export async function getUserProfile(userId: string): Promise<{
  id: string;
  institutionId?: string;
  fcmTokens: string[];
  dismissedNotices: string[];
  notifications: any[];
} | null> {
  const [uRes, nRes] = await Promise.all([
    supabase.from("users").select("*").eq("id", userId).single(),
    supabase.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
  ]);

  if (uRes.error && !uRes.data) {
    return {
      id: userId,
      fcmTokens: [],
      dismissedNotices: [],
      notifications: (nRes.data || []).map((n) => ({
        id: n.id,
        title: n.title,
        text: n.text,
        type: n.type,
        date: n.date || n.created_at,
        createdAt: n.created_at ? new Date(n.created_at).getTime() : Date.now(),
      })),
    };
  }

  return {
    id: uRes.data.id,
    institutionId: uRes.data.institution_id,
    fcmTokens: uRes.data.fcm_tokens || [],
    dismissedNotices: uRes.data.dismissed_notices || [],
    notifications: (nRes.data || []).map((n) => ({
      id: n.id,
      title: n.title,
      text: n.text,
      type: n.type,
      date: n.date || n.created_at,
      createdAt: n.created_at ? new Date(n.created_at).getTime() : Date.now(),
    })),
  };
}

export async function saveFCMToken(userId: string, token: string, institutionCode?: string): Promise<boolean> {
  const current = await getUserProfile(userId);
  const currentTokens = current?.fcmTokens || [];
  const updatedTokens = Array.from(new Set([...currentTokens, token]));

  const { error } = await supabase.from("users").upsert({
    id: userId,
    ...(institutionCode && { institution_id: institutionCode }),
    fcm_tokens: updatedTokens,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.warn("Error saving FCM token to Supabase:", error);
    return false;
  }
  return true;
}

export async function dismissNotices(userId: string, noticeIds: string[]): Promise<boolean> {
  const current = await getUserProfile(userId);
  const existingDismissed = current?.dismissedNotices || [];
  const updatedDismissed = Array.from(new Set([...existingDismissed, ...noticeIds]));

  const { error } = await supabase.from("users").upsert({
    id: userId,
    dismissed_notices: updatedDismissed,
    updated_at: new Date().toISOString(),
  });

  // Also delete from direct notifications table if present
  if (noticeIds.length > 0) {
    await supabase.from("notifications").delete().eq("user_id", userId).in("id", noticeIds);
  }

  return !error;
}

export async function addDirectNotification(
  userId: string,
  notif: {
    id?: string;
    title: string;
    text: string;
    type?: string;
    date?: string;
    institutionCode?: string;
    batchId?: string;
  }
): Promise<string> {
  const id = notif.id || `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // Ensure user exists
  await supabase.from("users").upsert({
    id: userId,
    ...(notif.institutionCode && { institution_id: notif.institutionCode }),
    updated_at: new Date().toISOString(),
  });

  const { error } = await supabase.from("notifications").upsert({
    id,
    user_id: userId,
    institution_id: notif.institutionCode || null,
    batch_id: notif.batchId || null,
    title: notif.title,
    text: notif.text,
    type: notif.type || "alert",
    date: notif.date || new Date().toISOString(),
  });

  if (error) {
    console.error("Error adding direct notification:", error);
    throw error;
  }
  return id;
}

// ==========================================
// REALTIME SUBSCRIPTIONS
// ==========================================

export function subscribeToBatches(
  institutionCode: string,
  onChange: (batches: DBBatch[]) => void
): () => void {
  // Initial fetch
  getBatches(institutionCode).then((batches) => onChange(batches));

  const channel = supabase
    .channel(`batches_realtime_${institutionCode}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "batches", filter: `institution_id=eq.${institutionCode}` },
      () => getBatches(institutionCode).then((b) => onChange(b))
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "students", filter: `institution_id=eq.${institutionCode}` },
      () => getBatches(institutionCode).then((b) => onChange(b))
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "batch_students", filter: `institution_id=eq.${institutionCode}` },
      () => getBatches(institutionCode).then((b) => onChange(b))
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "attendance", filter: `institution_id=eq.${institutionCode}` },
      () => getBatches(institutionCode).then((b) => onChange(b))
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "fee_records", filter: `institution_id=eq.${institutionCode}` },
      () => getBatches(institutionCode).then((b) => onChange(b))
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "exam_scores", filter: `institution_id=eq.${institutionCode}` },
      () => getBatches(institutionCode).then((b) => onChange(b))
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "assignments", filter: `institution_id=eq.${institutionCode}` },
      () => getBatches(institutionCode).then((b) => onChange(b))
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "timetable_slots", filter: `institution_id=eq.${institutionCode}` },
      () => getBatches(institutionCode).then((b) => onChange(b))
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToNotices(
  institutionCode: string,
  onChange: (notices: DBNotice[]) => void
): () => void {
  getNotices(institutionCode).then((notices) => onChange(notices));

  const channel = supabase
    .channel(`notices_realtime_${institutionCode}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "notices", filter: `institution_id=eq.${institutionCode}` },
      () => getNotices(institutionCode).then((n) => onChange(n))
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToUser(
  userId: string,
  onChange: (profile: { dismissedNotices: string[]; notifications: any[] }) => void
): () => void {
  getUserProfile(userId).then((profile) => {
    if (profile) onChange(profile);
  });

  const channel = supabase
    .channel(`user_realtime_${userId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
      () => getUserProfile(userId).then((p) => p && onChange(p))
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "users", filter: `id=eq.${userId}` },
      () => getUserProfile(userId).then((p) => p && onChange(p))
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToSuperAdminData(
  onChange: (data: { schools: Record<string, DBInstitution>; admins: Record<string, DBAdmin> }) => void
): () => void {
  getAllInstitutionsWithAdmins().then((d) => onChange(d));

  const channel = supabase
    .channel("super_admin_realtime")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "institutions" },
      () => getAllInstitutionsWithAdmins().then((d) => onChange(d))
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "admins" },
      () => getAllInstitutionsWithAdmins().then((d) => onChange(d))
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

