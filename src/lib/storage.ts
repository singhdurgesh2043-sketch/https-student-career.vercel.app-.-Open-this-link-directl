// STUDENT CAREER - Local & Multi-Tenant State Store
// Provides persistent storage, multi-organization isolation,
// realistic school demonstration data, and offline tolerance.

import {
  Student,
  Batch,
  Teacher,
  AttendanceRecord,
  FeePayment,
  ProgressReport,
  CentreProfile,
  LicenceInfo,
} from '../types';

const STORAGE_KEYS = {
  CENTRES_REGISTRY: 'sc_centres_registry',
  ACTIVE_CENTRE_ID: 'sc_active_centre_id',
  LICENCES_REGISTRY: 'sc_licences_registry',
  STUDENTS: 'sc_students_list',
  BATCHES: 'sc_batches_list',
  TEACHERS: 'sc_teachers_list',
  ATTENDANCE: 'sc_attendance_records',
  PAYMENTS: 'sc_fee_payments',
  REPORTS: 'sc_progress_reports',
  APP_THEME: 'sc_app_theme',
};

// Initial Realistic Demonstration Data (Flagged explicitly as is_demo: true)
export const INITIAL_CENTRE: CentreProfile = {
  id: 'centre-sc-101',
  code: 'SC-APEX-01',
  name: 'APEX CAREER ACADEMY',
  tagline: 'Excellence in Science, Commerce & Foundations',
  owner_name: 'Prof. Rajesh Sharma',
  owner_phone: '9876543210',
  owner_email: 'rajesh@apexacademy.edu',
  whatsapp_number: '9876543210',
  address: 'Shop 14-16, 2nd Floor, Sai Commercial Complex, Main Road',
  city: 'Jaipur',
  state: 'Rajasthan',
  upi_id: 'rajesh.apex@okaxis',
  razorpay_key_id: 'rzp_test_school_demo',
  created_at: '2026-01-10T09:00:00Z',
  is_demo: true,
  status: 'active',
};

export const INITIAL_LICENCE: LicenceInfo = {
  id: 'lic-sc-8899',
  license_key: 'SC-2026-APEX-9921',
  activation_code: 'ACT-7842',
  centre_id: 'centre-sc-101',
  centre_name: 'APEX CAREER ACADEMY',
  owner_name: 'Prof. Rajesh Sharma',
  owner_phone: '9876543210',
  plan_type: 'LIFETIME_ONE_TIME',
  amount_paid: 14999,
  status: 'active',
  max_devices: 1,
  device_count: 1,
  activated_at: '2026-01-10T10:00:00Z',
  device_uuid: 'ANDROID-DEV-SM-A546B',
  is_demo: true,
};

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 'tch-1',
    centre_id: 'centre-sc-101',
    name: 'Prof. Rajesh Sharma',
    phone: '9876543210',
    email: 'rajesh@apexacademy.edu',
    subjects: ['Mathematics', 'Statistics'],
    qualification: 'M.Sc. Mathematics, B.Ed (15 yrs exp)',
    salary_monthly: 45000,
    is_demo: true,
  },
  {
    id: 'tch-2',
    centre_id: 'centre-sc-101',
    name: 'Dr. Sunita Verma',
    phone: '9823456781',
    email: 'sunita.v@apexacademy.edu',
    subjects: ['Physics', 'Applied Science'],
    qualification: 'Ph.D. Physics (Ex-IIT Faculty)',
    salary_monthly: 40000,
    is_demo: true,
  },
  {
    id: 'tch-3',
    centre_id: 'centre-sc-101',
    name: 'Er. Amit Kulkarni',
    phone: '9845123456',
    email: 'amit.k@apexacademy.edu',
    subjects: ['Chemistry', 'Biology'],
    qualification: 'B.Tech Chemical, M.Sc Chemistry',
    salary_monthly: 38000,
    is_demo: true,
  },
];

export const INITIAL_BATCHES: Batch[] = [
  {
    id: 'batch-1',
    centre_id: 'centre-sc-101',
    name: 'Class 10th - Boards Foundation',
    class: 'Class 10',
    subject: 'Maths & Science',
    teacher_id: 'tch-1',
    teacher_name: 'Prof. Rajesh Sharma',
    start_time: '04:00 PM',
    end_time: '05:30 PM',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    room_number: 'Room 101',
    capacity: 35,
    student_count: 4,
    is_demo: true,
  },
  {
    id: 'batch-2',
    centre_id: 'centre-sc-101',
    name: 'Class 12th - PCM Elite',
    class: 'Class 12',
    subject: 'Physics, Chem, Maths',
    teacher_id: 'tch-2',
    teacher_name: 'Dr. Sunita Verma',
    start_time: '05:45 PM',
    end_time: '07:30 PM',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    room_number: 'Hall A',
    capacity: 40,
    student_count: 3,
    is_demo: true,
  },
  {
    id: 'batch-3',
    centre_id: 'centre-sc-101',
    name: 'Class 9th - Junior Achievers',
    class: 'Class 9',
    subject: 'Comprehensive Maths & Sci',
    teacher_id: 'tch-3',
    teacher_name: 'Er. Amit Kulkarni',
    start_time: '02:30 PM',
    end_time: '03:45 PM',
    days: ['Mon', 'Wed', 'Fri'],
    room_number: 'Room 102',
    capacity: 25,
    student_count: 2,
    is_demo: true,
  },
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'std-1',
    centre_id: 'centre-sc-101',
    admission_no: 'SC-2026-001',
    name: 'Aarav Patel',
    father_name: 'Mahesh Patel',
    parent_contact: '9820123456',
    parent_whatsapp: '9820123456',
    admission_date: '2026-01-05',
    class: 'Class 10',
    course: 'CBSE Regular',
    subjects: ['Mathematics', 'Science', 'English'],
    assigned_batch_id: 'batch-1',
    assigned_batch_name: 'Class 10th - Boards Foundation',
    tuition_timing: '04:00 PM - 05:30 PM',
    monthly_fees: 2500,
    discount: 200,
    payment_due_date: 5,
    payment_status: 'paid',
    is_active: true,
    total_paid: 2300,
    pending_balance: 0,
    is_demo: true,
  },
  {
    id: 'std-2',
    centre_id: 'centre-sc-101',
    admission_no: 'SC-2026-002',
    name: 'Ananya Sharma',
    father_name: 'Suresh Sharma',
    parent_contact: '9819876543',
    parent_whatsapp: '9819876543',
    admission_date: '2026-01-08',
    class: 'Class 12',
    course: 'JEE + Boards',
    subjects: ['Physics', 'Chemistry', 'Mathematics'],
    assigned_batch_id: 'batch-2',
    assigned_batch_name: 'Class 12th - PCM Elite',
    tuition_timing: '05:45 PM - 07:30 PM',
    monthly_fees: 4000,
    discount: 500,
    payment_due_date: 5,
    payment_status: 'pending',
    is_active: true,
    total_paid: 0,
    pending_balance: 3500,
    is_demo: true,
  },
  {
    id: 'std-3',
    centre_id: 'centre-sc-101',
    admission_no: 'SC-2026-003',
    name: 'Rohan Deshmukh',
    father_name: 'Vikas Deshmukh',
    parent_contact: '9892345678',
    parent_whatsapp: '9892345678',
    admission_date: '2026-01-12',
    class: 'Class 10',
    course: 'State Board',
    subjects: ['Mathematics', 'Science', 'Social Studies'],
    assigned_batch_id: 'batch-1',
    assigned_batch_name: 'Class 10th - Boards Foundation',
    tuition_timing: '04:00 PM - 05:30 PM',
    monthly_fees: 2200,
    discount: 0,
    payment_due_date: 10,
    payment_status: 'partial',
    is_active: true,
    total_paid: 1000,
    pending_balance: 1200,
    is_demo: true,
  },
  {
    id: 'std-4',
    centre_id: 'centre-sc-101',
    admission_no: 'SC-2026-004',
    name: 'Priya Mehta',
    father_name: 'Dinesh Mehta',
    parent_contact: '9873210987',
    parent_whatsapp: '9873210987',
    admission_date: '2026-01-15',
    class: 'Class 12',
    course: 'NEET Foundation',
    subjects: ['Physics', 'Chemistry', 'Biology'],
    assigned_batch_id: 'batch-2',
    assigned_batch_name: 'Class 12th - PCM Elite',
    tuition_timing: '05:45 PM - 07:30 PM',
    monthly_fees: 4500,
    discount: 500,
    payment_due_date: 5,
    payment_status: 'paid',
    is_active: true,
    total_paid: 4000,
    pending_balance: 0,
    is_demo: true,
  },
  {
    id: 'std-5',
    centre_id: 'centre-sc-101',
    admission_no: 'SC-2026-005',
    name: 'Kabir Singh',
    father_name: 'Jaspreet Singh',
    parent_contact: '9865432109',
    parent_whatsapp: '9865432109',
    admission_date: '2026-01-20',
    class: 'Class 9',
    course: 'ICSE Foundation',
    subjects: ['Mathematics', 'Science'],
    assigned_batch_id: 'batch-3',
    assigned_batch_name: 'Class 9th - Junior Achievers',
    tuition_timing: '02:30 PM - 03:45 PM',
    monthly_fees: 2000,
    discount: 0,
    payment_due_date: 10,
    payment_status: 'overdue',
    is_active: true,
    total_paid: 0,
    pending_balance: 2000,
    is_demo: true,
  },
];

export const INITIAL_PAYMENTS: FeePayment[] = [
  {
    id: 'pay-01',
    receipt_no: 'RCP-2026-001',
    centre_id: 'centre-sc-101',
    student_id: 'std-1',
    student_name: 'Aarav Patel',
    amount: 2300,
    payment_date: '2026-02-04',
    payment_month: 'February 2026',
    payment_type: 'monthly_fee',
    payment_method: 'upi',
    transaction_id: 'UPI982347291',
    status: 'success',
    notes: 'Paid via Google Pay by parent',
    received_by: 'Prof. Rajesh Sharma',
    is_demo: true,
  },
  {
    id: 'pay-02',
    receipt_no: 'RCP-2026-002',
    centre_id: 'centre-sc-101',
    student_id: 'std-4',
    student_name: 'Priya Mehta',
    amount: 4000,
    payment_date: '2026-02-05',
    payment_month: 'February 2026',
    payment_type: 'monthly_fee',
    payment_method: 'cash',
    status: 'success',
    notes: 'Cash received at reception',
    received_by: 'Prof. Rajesh Sharma',
    is_demo: true,
  },
  {
    id: 'pay-03',
    receipt_no: 'RCP-2026-003',
    centre_id: 'centre-sc-101',
    student_id: 'std-3',
    student_name: 'Rohan Deshmukh',
    amount: 1000,
    payment_date: '2026-02-10',
    payment_month: 'February 2026',
    payment_type: 'partial',
    payment_method: 'upi',
    transaction_id: 'UPI102938475',
    status: 'success',
    notes: 'Part payment; balance Rs 1200 due next week',
    received_by: 'Prof. Rajesh Sharma',
    is_demo: true,
  },
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-1',
    centre_id: 'centre-sc-101',
    student_id: 'std-1',
    student_name: 'Aarav Patel',
    batch_id: 'batch-1',
    batch_name: 'Class 10th - Boards Foundation',
    date: new Date().toISOString().split('T')[0],
    status: 'present',
    remarks: 'Active in class discussion',
    is_demo: true,
  },
  {
    id: 'att-2',
    centre_id: 'centre-sc-101',
    student_id: 'std-2',
    student_name: 'Ananya Sharma',
    batch_id: 'batch-2',
    batch_name: 'Class 12th - PCM Elite',
    date: new Date().toISOString().split('T')[0],
    status: 'present',
    remarks: 'Submitted chemistry assignment',
    is_demo: true,
  },
  {
    id: 'att-3',
    centre_id: 'centre-sc-101',
    student_id: 'std-3',
    student_name: 'Rohan Deshmukh',
    batch_id: 'batch-1',
    batch_name: 'Class 10th - Boards Foundation',
    date: new Date().toISOString().split('T')[0],
    status: 'absent',
    remarks: 'Fever reported by parent',
    is_demo: true,
  },
  {
    id: 'att-4',
    centre_id: 'centre-sc-101',
    student_id: 'std-4',
    student_name: 'Priya Mehta',
    batch_id: 'batch-2',
    batch_name: 'Class 12th - PCM Elite',
    date: new Date().toISOString().split('T')[0],
    status: 'late',
    remarks: '15 mins late due to traffic',
    is_demo: true,
  },
  {
    id: 'att-5',
    centre_id: 'centre-sc-101',
    student_id: 'std-5',
    student_name: 'Kabir Singh',
    batch_id: 'batch-3',
    batch_name: 'Class 9th - Junior Achievers',
    date: new Date().toISOString().split('T')[0],
    status: 'present',
    remarks: 'Completed algebra drill',
    is_demo: true,
  },
];

export const INITIAL_REPORTS: ProgressReport[] = [
  {
    id: 'rep-01',
    centre_id: 'centre-sc-101',
    student_id: 'std-1',
    student_name: 'Aarav Patel',
    report_title: 'Weekly Academic Progress Report',
    report_date: new Date().toISOString().split('T')[0],
    attendance_percentage: 96,
    subject_marks: [
      { subject: 'Mathematics', marks: 46, maxMarks: 50 },
      { subject: 'Science', marks: 43, maxMarks: 50 },
      { subject: 'English', marks: 41, maxMarks: 50 },
    ],
    homework_status: 'Consistent',
    test_performance: 'Excellent',
    teacher_comments: 'Aarav consistently solves advanced trigonometry equations and demonstrates sharp problem-solving skills.',
    improvement_areas: 'Needs to work on speed during 3-mark theory answers.',
    next_week_goals: 'Finish Chapter 7 Quadratic equations and complete test series 4.',
    is_demo: true,
  },
  {
    id: 'rep-02',
    centre_id: 'centre-sc-101',
    student_id: 'std-2',
    student_name: 'Ananya Sharma',
    report_title: 'Weekly Academic Progress Report',
    report_date: new Date().toISOString().split('T')[0],
    attendance_percentage: 92,
    subject_marks: [
      { subject: 'Physics', marks: 45, maxMarks: 50 },
      { subject: 'Chemistry', marks: 47, maxMarks: 50 },
      { subject: 'Mathematics', marks: 39, maxMarks: 50 },
    ],
    homework_status: 'Consistent',
    test_performance: 'Good',
    teacher_comments: 'Outstanding in Chemistry Organic mechanisms. Requires slight practice in Calculus integration.',
    improvement_areas: 'Definite integrals and calculus word problems.',
    next_week_goals: 'Complete 30 previous year JEE problems in Integration.',
    is_demo: true,
  },
];

// Helper functions for reading & writing local state
function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (err) {
    console.error(`Error loading ${key} from storage:`, err);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
  }
}

export const AppStorage = {
  // ==========================================
  // MULTI-TENANT ORGANISATION REGISTRY
  // ==========================================

  getAllCentres(): CentreProfile[] {
    const registry = getItem<CentreProfile[]>(STORAGE_KEYS.CENTRES_REGISTRY, []);
    if (!registry || registry.length === 0) {
      const initial = [{ ...INITIAL_CENTRE, is_demo: true, status: 'active' as const }];
      setItem(STORAGE_KEYS.CENTRES_REGISTRY, initial);
      return initial;
    }
    return registry;
  },

  getActiveCentreId(): string {
    const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_CENTRE_ID);
    if (activeId) return activeId;
    return INITIAL_CENTRE.id;
  },

  setActiveCentreId(centreId: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CENTRE_ID, centreId);
  },

  switchCentre(centreId: string): void {
    this.setActiveCentreId(centreId);
  },

  getCentre(centreId?: string): CentreProfile {
    const targetId = centreId || this.getActiveCentreId();
    const all = this.getAllCentres();
    const matched = all.find((c) => c.id === targetId);
    if (matched) return matched;
    return all[0] || INITIAL_CENTRE;
  },

  setCentre(centre: CentreProfile): void {
    this.setActiveCentreId(centre.id);
    const all = this.getAllCentres();
    const existingIndex = all.findIndex((c) => c.id === centre.id);
    let updated: CentreProfile[];
    if (existingIndex >= 0) {
      updated = [...all];
      updated[existingIndex] = centre;
    } else {
      updated = [centre, ...all];
    }
    setItem(STORAGE_KEYS.CENTRES_REGISTRY, updated);
  },

  /**
   * Registers a completely new organization account.
   * Creates an isolated profile without copying or pre-filling any other account's data.
   */
  registerNewCentre(
    centreData: Omit<CentreProfile, 'id' | 'is_demo' | 'created_at' | 'status'>
  ): CentreProfile {
    const newId = `centre-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newCentre: CentreProfile = {
      ...centreData,
      id: newId,
      is_demo: false,
      status: 'active',
      created_at: new Date().toISOString(),
    };

    // Create unique license for this organization
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const nameCode = newCentre.name.substring(0, 4).toUpperCase().replace(/\s+/g, '') || 'CENT';
    const newLicence: LicenceInfo = {
      id: `lic-${newId}`,
      license_key: `SC-2026-${nameCode}-${randomDigits}`,
      activation_code: `ACT-${Math.floor(1000 + Math.random() * 9000)}`,
      centre_id: newId,
      centre_name: newCentre.name,
      owner_name: newCentre.owner_name,
      owner_phone: newCentre.owner_phone,
      plan_type: 'LIFETIME_ONE_TIME',
      amount_paid: 14999,
      status: 'active',
      max_devices: 1,
      device_count: 1,
      activated_at: new Date().toISOString(),
      device_uuid: `ANDROID-DEV-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      is_demo: false,
    };

    // Save centre to registry & set as active
    this.setCentre(newCentre);

    // Save licence
    const licences = this.getAllLicences();
    setItem(STORAGE_KEYS.LICENCES_REGISTRY, [newLicence, ...licences]);

    return newCentre;
  },

  updateCentreStatus(centreId: string, status: 'active' | 'inactive'): void {
    const all = this.getAllCentres();
    const updated = all.map((c) => (c.id === centreId ? { ...c, status } : c));
    setItem(STORAGE_KEYS.CENTRES_REGISTRY, updated);

    // Update matching licence
    const licences = this.getAllLicences();
    const updatedLicences = licences.map((l) =>
      l.centre_id === centreId ? { ...l, status } : l
    );
    setItem(STORAGE_KEYS.LICENCES_REGISTRY, updatedLicences);
  },

  // ==========================================
  // LICENCES REGISTRY
  // ==========================================

  getAllLicences(): LicenceInfo[] {
    const licences = getItem<LicenceInfo[]>(STORAGE_KEYS.LICENCES_REGISTRY, []);
    if (!licences || licences.length === 0) {
      const initial = [{ ...INITIAL_LICENCE, is_demo: true, status: 'active' as const }];
      setItem(STORAGE_KEYS.LICENCES_REGISTRY, initial);
      return initial;
    }
    return licences;
  },

  getLicence(centreId?: string): LicenceInfo | null {
    const targetId = centreId || this.getActiveCentreId();
    const all = this.getAllLicences();
    return all.find((l) => l.centre_id === targetId) || null;
  },

  setLicence(licence: LicenceInfo | null): void {
    if (!licence) return;
    const all = this.getAllLicences();
    const existingIdx = all.findIndex((l) => l.id === licence.id);
    let updated: LicenceInfo[];
    if (existingIdx >= 0) {
      updated = [...all];
      updated[existingIdx] = licence;
    } else {
      updated = [licence, ...all];
    }
    setItem(STORAGE_KEYS.LICENCES_REGISTRY, updated);
  },

  // ==========================================
  // ISOLATED STUDENTS MANAGEMENT
  // ==========================================

  getAllRawStudents(): Student[] {
    return getItem<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  },

  getStudents(centreId?: string): Student[] {
    const targetId = centreId || this.getActiveCentreId();
    const all = this.getAllRawStudents();

    // If querying demo centre and no items, return INITIAL_STUDENTS
    if (targetId === INITIAL_CENTRE.id) {
      const demoList = all.filter((s) => s.centre_id === INITIAL_CENTRE.id);
      return demoList.length > 0 ? demoList : INITIAL_STUDENTS;
    }

    // STRICT ISOLATION: Real newly registered accounts return ONLY their own students!
    return all.filter((s) => s.centre_id === targetId);
  },

  addStudent(student: Student, centreId?: string): Student[] {
    const targetId = centreId || student.centre_id || this.getActiveCentreId();
    const targetCentre = this.getCentre(targetId);

    const fullStudent: Student = {
      ...student,
      centre_id: targetId,
      is_demo: targetCentre.is_demo || false,
    };

    const all = this.getAllRawStudents();
    const updated = [fullStudent, ...all];
    setItem(STORAGE_KEYS.STUDENTS, updated);
    return this.getStudents(targetId);
  },

  updateStudent(student: Student, centreId?: string): Student[] {
    const targetId = centreId || student.centre_id || this.getActiveCentreId();
    const all = this.getAllRawStudents();
    const updated = all.map((s) => (s.id === student.id ? student : s));
    setItem(STORAGE_KEYS.STUDENTS, updated);
    return this.getStudents(targetId);
  },

  deleteStudent(studentId: string, centreId?: string): Student[] {
    const targetId = centreId || this.getActiveCentreId();
    const all = this.getAllRawStudents();
    const updated = all.filter((s) => s.id !== studentId);
    setItem(STORAGE_KEYS.STUDENTS, updated);
    return this.getStudents(targetId);
  },

  // ==========================================
  // ISOLATED BATCHES MANAGEMENT
  // ==========================================

  getAllRawBatches(): Batch[] {
    return getItem<Batch[]>(STORAGE_KEYS.BATCHES, INITIAL_BATCHES);
  },

  getBatches(centreId?: string): Batch[] {
    const targetId = centreId || this.getActiveCentreId();
    const all = this.getAllRawBatches();
    if (targetId === INITIAL_CENTRE.id) {
      const demoList = all.filter((b) => b.centre_id === INITIAL_CENTRE.id);
      return demoList.length > 0 ? demoList : INITIAL_BATCHES;
    }
    return all.filter((b) => b.centre_id === targetId);
  },

  addBatch(batch: Batch, centreId?: string): Batch[] {
    const targetId = centreId || batch.centre_id || this.getActiveCentreId();
    const targetCentre = this.getCentre(targetId);
    const fullBatch: Batch = {
      ...batch,
      centre_id: targetId,
      is_demo: targetCentre.is_demo || false,
    };
    const all = this.getAllRawBatches();
    const updated = [...all, fullBatch];
    setItem(STORAGE_KEYS.BATCHES, updated);
    return this.getBatches(targetId);
  },

  // ==========================================
  // ISOLATED TEACHERS MANAGEMENT
  // ==========================================

  getAllRawTeachers(): Teacher[] {
    return getItem<Teacher[]>(STORAGE_KEYS.TEACHERS, INITIAL_TEACHERS);
  },

  getTeachers(centreId?: string): Teacher[] {
    const targetId = centreId || this.getActiveCentreId();
    const all = this.getAllRawTeachers();
    if (targetId === INITIAL_CENTRE.id) {
      const demoList = all.filter((t) => t.centre_id === INITIAL_CENTRE.id);
      return demoList.length > 0 ? demoList : INITIAL_TEACHERS;
    }
    return all.filter((t) => t.centre_id === targetId);
  },

  saveTeachers(teachers: Teacher[], centreId?: string): Teacher[] {
    const targetId = centreId || this.getActiveCentreId();
    const all = this.getAllRawTeachers();
    const otherCentres = all.filter((t) => t.centre_id !== targetId);
    const updated = [...otherCentres, ...teachers];
    setItem(STORAGE_KEYS.TEACHERS, updated);
    return teachers;
  },

  // ==========================================
  // ISOLATED ATTENDANCE MANAGEMENT
  // ==========================================

  getAllRawAttendance(): AttendanceRecord[] {
    return getItem<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
  },

  getAttendance(centreId?: string): AttendanceRecord[] {
    const targetId = centreId || this.getActiveCentreId();
    const all = this.getAllRawAttendance();
    if (targetId === INITIAL_CENTRE.id) {
      const demoList = all.filter((a) => a.centre_id === INITIAL_CENTRE.id);
      return demoList.length > 0 ? demoList : INITIAL_ATTENDANCE;
    }
    return all.filter((a) => a.centre_id === targetId);
  },

  markAttendance(newRecords: AttendanceRecord[], centreId?: string): AttendanceRecord[] {
    const targetId = centreId || this.getActiveCentreId();
    const all = this.getAllRawAttendance();
    const targetCentre = this.getCentre(targetId);

    const taggedRecords = newRecords.map((r) => ({
      ...r,
      centre_id: targetId,
      is_demo: targetCentre.is_demo || false,
    }));

    const updated = [...all];
    taggedRecords.forEach((record) => {
      const existingIdx = updated.findIndex(
        (r) =>
          r.centre_id === targetId &&
          r.student_id === record.student_id &&
          r.date === record.date
      );
      if (existingIdx >= 0) {
        updated[existingIdx] = record;
      } else {
        updated.push(record);
      }
    });

    setItem(STORAGE_KEYS.ATTENDANCE, updated);
    return this.getAttendance(targetId);
  },

  // ==========================================
  // ISOLATED FEES & PAYMENTS MANAGEMENT
  // ==========================================

  getAllRawPayments(): FeePayment[] {
    return getItem<FeePayment[]>(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
  },

  getPayments(centreId?: string): FeePayment[] {
    const targetId = centreId || this.getActiveCentreId();
    const all = this.getAllRawPayments();
    if (targetId === INITIAL_CENTRE.id) {
      const demoList = all.filter((p) => p.centre_id === INITIAL_CENTRE.id);
      return demoList.length > 0 ? demoList : INITIAL_PAYMENTS;
    }
    return all.filter((p) => p.centre_id === targetId);
  },

  addPayment(payment: FeePayment, centreId?: string): FeePayment[] {
    const targetId = centreId || payment.centre_id || this.getActiveCentreId();
    const targetCentre = this.getCentre(targetId);

    const fullPayment: FeePayment = {
      ...payment,
      centre_id: targetId,
      is_demo: targetCentre.is_demo || false,
    };

    const all = this.getAllRawPayments();
    const updated = [fullPayment, ...all];
    setItem(STORAGE_KEYS.PAYMENTS, updated);

    // Update corresponding student balance
    const students = this.getStudents(targetId);
    const student = students.find((s) => s.id === payment.student_id);
    if (student) {
      const totalPaid = (student.total_paid || 0) + payment.amount;
      const effectiveTotal = student.monthly_fees - student.discount;
      const pendingBalance = Math.max(0, effectiveTotal - totalPaid);
      const newStatus = pendingBalance === 0 ? 'paid' : totalPaid > 0 ? 'partial' : 'pending';

      this.updateStudent(
        {
          ...student,
          total_paid: totalPaid,
          pending_balance: pendingBalance,
          payment_status: newStatus,
        },
        targetId
      );
    }

    return this.getPayments(targetId);
  },

  // ==========================================
  // ISOLATED PROGRESS REPORTS
  // ==========================================

  getAllRawReports(): ProgressReport[] {
    return getItem<ProgressReport[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
  },

  getReports(centreId?: string): ProgressReport[] {
    const targetId = centreId || this.getActiveCentreId();
    const all = this.getAllRawReports();
    if (targetId === INITIAL_CENTRE.id) {
      const demoList = all.filter((r) => r.centre_id === INITIAL_CENTRE.id);
      return demoList.length > 0 ? demoList : INITIAL_REPORTS;
    }
    return all.filter((r) => r.centre_id === targetId);
  },

  addReport(report: ProgressReport, centreId?: string): ProgressReport[] {
    const targetId = centreId || report.centre_id || this.getActiveCentreId();
    const targetCentre = this.getCentre(targetId);
    const fullReport: ProgressReport = {
      ...report,
      centre_id: targetId,
      is_demo: targetCentre.is_demo || false,
    };
    const all = this.getAllRawReports();
    const updated = [fullReport, ...all];
    setItem(STORAGE_KEYS.REPORTS, updated);
    return this.getReports(targetId);
  },

  // ==========================================
  // SUPER ADMIN AGGREGATIONS & REAL STATS
  // ==========================================

  getSuperAdminStats() {
    const allCentres = this.getAllCentres();
    const realCentres = allCentres.filter((c) => !c.is_demo);
    const demoCentres = allCentres.filter((c) => c.is_demo);

    const allLicences = this.getAllLicences();
    const activeLicences = allLicences.filter((l) => l.status === 'active');
    const inactiveLicences = allLicences.filter((l) => l.status === 'inactive');
    const totalSales = allLicences.reduce((acc, l) => acc + (l.amount_paid || 0), 0);

    const allStudents = this.getAllRawStudents();
    const realStudents = allStudents.filter((s) => !s.is_demo);

    const allTeachers = this.getAllRawTeachers();
    const realTeachers = allTeachers.filter((t) => !t.is_demo);

    const allPayments = this.getAllRawPayments();
    const realPayments = allPayments.filter((p) => !p.is_demo);

    const realRevenue = realPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const demoRevenue = allPayments
      .filter((p) => p.is_demo)
      .reduce((acc, p) => acc + (p.amount || 0), 0);

    return {
      totalOrganizations: allCentres.length,
      realCentresCount: realCentres.length,
      demoCentresCount: demoCentres.length,
      realOrganizationsCount: realCentres.length,
      demoOrganizationsCount: demoCentres.length,
      activeRealCount: realCentres.filter((c) => c.status === 'active').length,
      inactiveRealCount: realCentres.filter((c) => c.status === 'inactive').length,
      activeLicencesCount: activeLicences.length,
      inactiveLicencesCount: inactiveLicences.length,
      totalSalesRevenue: totalSales,
      realStudentsCount: realStudents.length,
      realTeachersCount: realTeachers.length,
      realRevenueTotal: realRevenue,
      demoRevenueTotal: demoRevenue,
      realCentresList: realCentres,
      demoCentresList: demoCentres,
    };
  },

  /**
   * Resets demo data while preserving legitimate real accounts
   */
  resetToDemo(): void {
    // Keep real registered centres
    const allCentres = this.getAllCentres();
    const realCentres = allCentres.filter((c) => !c.is_demo);
    setItem(STORAGE_KEYS.CENTRES_REGISTRY, [
      { ...INITIAL_CENTRE, is_demo: true, status: 'active' },
      ...realCentres,
    ]);

    // Keep real students, replace demo students with initial
    const allStudents = this.getAllRawStudents();
    const realStudents = allStudents.filter((s) => !s.is_demo);
    setItem(STORAGE_KEYS.STUDENTS, [...realStudents, ...INITIAL_STUDENTS]);

    // Keep real payments
    const allPayments = this.getAllRawPayments();
    const realPayments = allPayments.filter((p) => !p.is_demo);
    setItem(STORAGE_KEYS.PAYMENTS, [...realPayments, ...INITIAL_PAYMENTS]);

    // Reset active centre to Demo Centre
    this.setActiveCentreId(INITIAL_CENTRE.id);
  },
};
