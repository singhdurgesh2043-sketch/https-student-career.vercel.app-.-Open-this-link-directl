// STUDENT CAREER - Local & Cloud State Store
// Provides persistent storage, realistic school demonstration data, and offline tolerance.

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
  LICENCE: 'sc_licence_data',
  CENTRE: 'sc_centre_profile',
  STUDENTS: 'sc_students_list',
  BATCHES: 'sc_batches_list',
  TEACHERS: 'sc_teachers_list',
  ATTENDANCE: 'sc_attendance_records',
  PAYMENTS: 'sc_fee_payments',
  REPORTS: 'sc_progress_reports',
  APP_THEME: 'sc_app_theme',
};

// Initial Realistic Data for Demonstration
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
  created_at: new Date().toISOString(),
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
    subjects: ['Mathematics', 'Science'],
    assigned_batch_id: 'batch-1',
    assigned_batch_name: 'Class 10th - Boards Foundation',
    tuition_timing: '04:00 PM - 05:30 PM',
    monthly_fees: 2200,
    discount: 0,
    payment_due_date: 5,
    payment_status: 'overdue',
    is_active: true,
    total_paid: 0,
    pending_balance: 2200,
  },
  {
    id: 'std-4',
    centre_id: 'centre-sc-101',
    admission_no: 'SC-2026-004',
    name: 'Priya Mehta',
    father_name: 'Dinesh Mehta',
    parent_contact: '9871239876',
    parent_whatsapp: '9871239876',
    admission_date: '2026-01-15',
    class: 'Class 12',
    course: 'NEET Foundation',
    subjects: ['Physics', 'Chemistry'],
    assigned_batch_id: 'batch-2',
    assigned_batch_name: 'Class 12th - PCM Elite',
    tuition_timing: '05:45 PM - 07:30 PM',
    monthly_fees: 3500,
    discount: 0,
    payment_due_date: 10,
    payment_status: 'partial',
    is_active: true,
    total_paid: 2000,
    pending_balance: 1500,
  },
  {
    id: 'std-5',
    centre_id: 'centre-sc-101',
    admission_no: 'SC-2026-005',
    name: 'Kabir Singh',
    father_name: 'Harpreet Singh',
    parent_contact: '9833451290',
    parent_whatsapp: '9833451290',
    admission_date: '2026-02-01',
    class: 'Class 9',
    course: 'ICSE',
    subjects: ['Mathematics', 'Science'],
    assigned_batch_id: 'batch-3',
    assigned_batch_name: 'Class 9th - Junior Achievers',
    tuition_timing: '02:30 PM - 03:45 PM',
    monthly_fees: 2000,
    discount: 0,
    payment_due_date: 5,
    payment_status: 'paid',
    is_active: true,
    total_paid: 2000,
    pending_balance: 0,
  },
  {
    id: 'std-6',
    centre_id: 'centre-sc-101',
    admission_no: 'SC-2026-006',
    name: 'Sneha Kulkarni',
    father_name: 'Anand Kulkarni',
    parent_contact: '9822114433',
    parent_whatsapp: '9822114433',
    admission_date: '2026-02-10',
    class: 'Class 11',
    course: 'JEE Mains & Advanced',
    subjects: ['Physics', 'Chemistry', 'Mathematics'],
    assigned_batch_id: 'batch-2',
    assigned_batch_name: 'Class 12th - PCM Elite',
    tuition_timing: '05:45 PM - 07:30 PM',
    monthly_fees: 3800,
    discount: 300,
    payment_due_date: 7,
    payment_status: 'paid',
    is_active: true,
    total_paid: 3500,
    pending_balance: 0,
  },
  {
    id: 'std-7',
    centre_id: 'centre-sc-101',
    admission_no: 'SC-2026-007',
    name: 'Manav Gupta',
    father_name: 'Pankaj Gupta',
    parent_contact: '9819001122',
    parent_whatsapp: '9819001122',
    admission_date: '2026-02-15',
    class: 'Class 10',
    course: 'CBSE Regular',
    subjects: ['Mathematics', 'Science', 'English'],
    assigned_batch_id: 'batch-1',
    assigned_batch_name: 'Class 10th - Boards Foundation',
    tuition_timing: '04:00 PM - 05:30 PM',
    monthly_fees: 2500,
    discount: 0,
    payment_due_date: 5,
    payment_status: 'pending',
    is_active: true,
    total_paid: 0,
    pending_balance: 2500,
  },
  {
    id: 'std-8',
    centre_id: 'centre-sc-101',
    admission_no: 'SC-2026-008',
    name: 'Diya Reddy',
    father_name: 'Venkatesh Reddy',
    parent_contact: '9848012345',
    parent_whatsapp: '9848012345',
    admission_date: '2026-02-18',
    class: 'Class 12',
    course: 'NEET Medical Target',
    subjects: ['Physics', 'Chemistry', 'Biology'],
    assigned_batch_id: 'batch-2',
    assigned_batch_name: 'Class 12th - PCM Elite',
    tuition_timing: '05:45 PM - 07:30 PM',
    monthly_fees: 4200,
    discount: 200,
    payment_due_date: 10,
    payment_status: 'overdue',
    is_active: true,
    total_paid: 0,
    pending_balance: 4000,
  },
];

export const INITIAL_PAYMENTS: FeePayment[] = [
  {
    id: 'pay-001',
    receipt_no: 'REC-2026-001',
    centre_id: 'centre-sc-101',
    student_id: 'std-1',
    student_name: 'Aarav Patel',
    amount: 2300,
    payment_date: '2026-11-04',
    payment_month: 'November 2026',
    payment_type: 'monthly_fee',
    payment_method: 'upi',
    transaction_id: 'UPI-7749102941',
    status: 'success',
    notes: 'Paid via GPay',
    received_by: 'Prof. Rajesh Sharma',
  },
  {
    id: 'pay-002',
    receipt_no: 'REC-2026-002',
    centre_id: 'centre-sc-101',
    student_id: 'std-4',
    student_name: 'Priya Mehta',
    amount: 2000,
    payment_date: '2026-11-05',
    payment_month: 'November 2026',
    payment_type: 'partial',
    payment_method: 'cash',
    transaction_id: 'CASH-REC',
    status: 'success',
    notes: 'Partial payment. Balance ₹1500 to be cleared next week.',
    received_by: 'Staff counter',
  },
  {
    id: 'pay-003',
    receipt_no: 'REC-2026-003',
    centre_id: 'centre-sc-101',
    student_id: 'std-5',
    student_name: 'Kabir Singh',
    amount: 2000,
    payment_date: '2026-11-02',
    payment_month: 'November 2026',
    payment_type: 'monthly_fee',
    payment_method: 'razorpay',
    transaction_id: 'pay_P123DemoSchool',
    razorpay_payment_id: 'pay_P123DemoSchool',
    status: 'success',
    notes: 'Online fee payment through Razorpay gateway',
    received_by: 'System Online',
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
    remarks: 'On time, active participation',
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
  // Licence & Centre
  getLicence: (): LicenceInfo | null => getItem<LicenceInfo | null>(STORAGE_KEYS.LICENCE, INITIAL_LICENCE),
  setLicence: (licence: LicenceInfo | null) => setItem(STORAGE_KEYS.LICENCE, licence),

  getCentre: (): CentreProfile => getItem<CentreProfile>(STORAGE_KEYS.CENTRE, INITIAL_CENTRE),
  setCentre: (centre: CentreProfile) => setItem(STORAGE_KEYS.CENTRE, centre),

  // Students
  getStudents: (): Student[] => getItem<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS),
  saveStudents: (students: Student[]) => setItem(STORAGE_KEYS.STUDENTS, students),
  addStudent: (student: Student) => {
    const list = AppStorage.getStudents();
    const updated = [student, ...list];
    setItem(STORAGE_KEYS.STUDENTS, updated);
    return updated;
  },
  updateStudent: (student: Student) => {
    const list = AppStorage.getStudents();
    const updated = list.map((s) => (s.id === student.id ? student : s));
    setItem(STORAGE_KEYS.STUDENTS, updated);
    return updated;
  },
  deleteStudent: (studentId: string) => {
    const list = AppStorage.getStudents();
    const updated = list.filter((s) => s.id !== studentId);
    setItem(STORAGE_KEYS.STUDENTS, updated);
    return updated;
  },

  // Batches
  getBatches: (): Batch[] => getItem<Batch[]>(STORAGE_KEYS.BATCHES, INITIAL_BATCHES),
  saveBatches: (batches: Batch[]) => setItem(STORAGE_KEYS.BATCHES, batches),
  addBatch: (batch: Batch) => {
    const list = AppStorage.getBatches();
    const updated = [...list, batch];
    setItem(STORAGE_KEYS.BATCHES, updated);
    return updated;
  },

  // Teachers
  getTeachers: (): Teacher[] => getItem<Teacher[]>(STORAGE_KEYS.TEACHERS, INITIAL_TEACHERS),
  saveTeachers: (teachers: Teacher[]) => setItem(STORAGE_KEYS.TEACHERS, teachers),

  // Attendance
  getAttendance: (): AttendanceRecord[] => getItem<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE),
  saveAttendance: (records: AttendanceRecord[]) => setItem(STORAGE_KEYS.ATTENDANCE, records),
  markAttendance: (newRecords: AttendanceRecord[]) => {
    const current = AppStorage.getAttendance();
    // Prevent duplicate attendance for same student and same date
    const updated = [...current];
    newRecords.forEach((record) => {
      const existingIndex = updated.findIndex(
        (r) => r.student_id === record.student_id && r.date === record.date
      );
      if (existingIndex >= 0) {
        updated[existingIndex] = record;
      } else {
        updated.push(record);
      }
    });
    setItem(STORAGE_KEYS.ATTENDANCE, updated);
    return updated;
  },

  // Payments
  getPayments: (): FeePayment[] => getItem<FeePayment[]>(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS),
  addPayment: (payment: FeePayment) => {
    const list = AppStorage.getPayments();
    const updated = [payment, ...list];
    setItem(STORAGE_KEYS.PAYMENTS, updated);

    // Automatically update student's fee status
    const students = AppStorage.getStudents();
    const student = students.find((s) => s.id === payment.student_id);
    if (student) {
      const totalPaid = (student.total_paid || 0) + payment.amount;
      const effectiveTotal = student.monthly_fees - student.discount;
      const pendingBalance = Math.max(0, effectiveTotal - totalPaid);
      const newStatus = pendingBalance === 0 ? 'paid' : totalPaid > 0 ? 'partial' : 'pending';

      AppStorage.updateStudent({
        ...student,
        total_paid: totalPaid,
        pending_balance: pendingBalance,
        payment_status: newStatus,
      });
    }

    return updated;
  },

  // Progress Reports
  getReports: (): ProgressReport[] => getItem<ProgressReport[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS),
  addReport: (report: ProgressReport) => {
    const list = AppStorage.getReports();
    const updated = [report, ...list];
    setItem(STORAGE_KEYS.REPORTS, updated);
    return updated;
  },

  // Reset to initial demo state
  resetToDemo: () => {
    setItem(STORAGE_KEYS.CENTRE, INITIAL_CENTRE);
    setItem(STORAGE_KEYS.LICENCE, INITIAL_LICENCE);
    setItem(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    setItem(STORAGE_KEYS.BATCHES, INITIAL_BATCHES);
    setItem(STORAGE_KEYS.TEACHERS, INITIAL_TEACHERS);
    setItem(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
    setItem(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
    setItem(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
  },
};
