// STUDENT CAREER - Core Type Definitions

export type UserRole = 'superadmin' | 'centre_owner' | 'teacher' | 'staff';

export interface CentreProfile {
  id: string;
  code: string;
  name: string;
  tagline: string;
  owner_name: string;
  owner_phone: string;
  owner_email: string;
  whatsapp_number: string;
  address: string;
  city: string;
  state: string;
  logo_url?: string;
  upi_id?: string;
  razorpay_key_id?: string;
  created_at?: string;
}

export interface LicenceInfo {
  id: string;
  license_key: string;
  activation_code: string;
  centre_id: string;
  centre_name: string;
  owner_name: string;
  owner_phone: string;
  plan_type: string;
  amount_paid: number;
  status: 'active' | 'inactive' | 'revoked';
  max_devices: number;
  device_count: number;
  activated_at?: string;
  device_uuid?: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave';

export interface AttendanceRecord {
  id: string;
  centre_id: string;
  student_id: string;
  student_name: string;
  batch_id?: string;
  batch_name?: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  remarks?: string;
  marked_by?: string;
  created_at?: string;
}

export type PaymentStatus = 'paid' | 'partial' | 'pending' | 'overdue';

export interface Student {
  id: string;
  centre_id: string;
  admission_no: string;
  name: string;
  father_name: string;
  parent_contact: string;
  parent_whatsapp: string;
  photo_url?: string;
  admission_date: string;
  class: string;
  course?: string;
  subjects: string[];
  assigned_batch_id?: string;
  assigned_batch_name?: string;
  tuition_timing?: string;
  monthly_fees: number;
  discount: number;
  payment_due_date: number; // day of month 1-31
  payment_status: PaymentStatus;
  is_active: boolean;
  total_paid?: number;
  pending_balance?: number;
}

export interface Batch {
  id: string;
  centre_id: string;
  name: string;
  class: string;
  subject?: string;
  teacher_id?: string;
  teacher_name?: string;
  start_time: string;
  end_time: string;
  days: string[];
  room_number?: string;
  capacity?: number;
  student_count?: number;
}

export interface Teacher {
  id: string;
  centre_id: string;
  name: string;
  phone: string;
  email?: string;
  subjects: string[];
  qualification?: string;
  salary_monthly?: number;
}

export interface FeePayment {
  id: string;
  receipt_no: string;
  centre_id: string;
  student_id: string;
  student_name: string;
  amount: number;
  payment_date: string;
  payment_month: string;
  payment_type: 'monthly_fee' | 'admission_fee' | 'full' | 'partial' | 'other';
  payment_method: 'cash' | 'upi' | 'razorpay' | 'cheque' | 'bank_transfer';
  transaction_id?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  status: 'success' | 'pending' | 'failed';
  notes?: string;
  received_by?: string;
}

export interface SubjectMarks {
  subject: string;
  marks: number;
  maxMarks: number;
}

export interface ProgressReport {
  id: string;
  centre_id: string;
  student_id: string;
  student_name: string;
  report_title: string;
  report_date: string;
  period_start?: string;
  period_end?: string;
  attendance_percentage: number;
  subject_marks: SubjectMarks[];
  homework_status: 'Consistent' | 'Occasional' | 'Needs Improvement';
  test_performance: 'Excellent' | 'Good' | 'Average' | 'Needs Improvement';
  teacher_comments: string;
  improvement_areas: string;
  next_week_goals: string;
  pdf_url?: string;
}

export type ActiveScreen = 
  | 'splash' 
  | 'activation' 
  | 'login' 
  | 'register' 
  | 'dashboard' 
  | 'students' 
  | 'attendance' 
  | 'fees' 
  | 'timetable' 
  | 'reports' 
  | 'settings'
  | 'superadmin';
