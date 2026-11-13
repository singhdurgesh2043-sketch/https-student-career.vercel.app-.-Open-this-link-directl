import React from 'react';
import {
  Users,
  CalendarCheck,
  CreditCard,
  Clock,
  TrendingUp,
  UserPlus,
  Receipt,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  MessageCircle,
  ArrowRight,
  ChevronRight,
  Download,
} from 'lucide-react';
import { CentreProfile, Student, Batch, AttendanceRecord, FeePayment, ActiveScreen } from '../types';
import { generateFeeReceiptPDF } from '../lib/pdfGenerator';
import { openWhatsAppChat } from '../lib/whatsapp';

interface DashboardScreenProps {
  centre: CentreProfile;
  students: Student[];
  batches: Batch[];
  attendance: AttendanceRecord[];
  payments: FeePayment[];
  onNavigate: (screen: ActiveScreen) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  centre,
  students,
  batches,
  attendance,
  payments,
  onNavigate,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter((a) => a.date === todayStr);

  const presentCount = todayAttendance.filter((a) => a.status === 'present').length;
  const absentCount = todayAttendance.filter((a) => a.status === 'absent').length;
  const totalMarked = todayAttendance.length;
  const attendanceRate = totalMarked > 0 ? Math.round((presentCount / totalMarked) * 100) : 92;

  // Fee metrics
  const totalFeesExpected = students.reduce((acc, s) => acc + (s.monthly_fees - s.discount), 0);
  const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0);
  const totalPending = students.reduce((acc, s) => acc + (s.pending_balance || 0), 0);
  const overdueCount = students.filter((s) => s.payment_status === 'overdue').length;

  const handleDownloadReceipt = (payment: FeePayment) => {
    const student = students.find((s) => s.id === payment.student_id) || {
      id: payment.student_id,
      centre_id: centre.id,
      admission_no: 'N/A',
      name: payment.student_name,
      father_name: 'Parent',
      parent_contact: '9876543210',
      parent_whatsapp: '9876543210',
      admission_date: todayStr,
      class: 'Class 10',
      subjects: ['All'],
      monthly_fees: payment.amount,
      discount: 0,
      payment_due_date: 5,
      payment_status: 'paid',
      is_active: true,
    };
    generateFeeReceiptPDF(payment, student, centre);
  };

  const handleWhatsAppAlert = (student: Student) => {
    openWhatsAppChat({
      parentPhone: student.parent_whatsapp,
      studentName: student.name,
      centreName: centre.name,
      type: 'fee_reminder',
      details: {
        amount: student.pending_balance || student.monthly_fees,
        dueDate: `${student.payment_due_date}th of this month`,
        month: 'November 2026',
      },
    });
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Centre Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-3xl p-5 text-white shadow-lg shadow-blue-900/10">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-blue-200 uppercase tracking-wider bg-white/10 px-2.5 py-0.5 rounded-full">
              Session 2026-2027
            </span>
            <h2 className="text-xl font-extrabold mt-1 tracking-tight">
              {centre.name}
            </h2>
            <p className="text-xs text-blue-200 mt-0.5 max-w-xs">
              {centre.tagline || 'Leading Coaching Centre for Science & Maths'}
            </p>
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
          </div>
        </div>

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/10 text-center">
          <div>
            <p className="text-[10px] text-blue-200 font-medium">Students</p>
            <p className="text-sm font-bold text-white">{students.length} Enrolled</p>
          </div>
          <div className="border-x border-white/10">
            <p className="text-[10px] text-blue-200 font-medium">Batches</p>
            <p className="text-sm font-bold text-white">{batches.length} Active</p>
          </div>
          <div>
            <p className="text-[10px] text-blue-200 font-medium">Due Accounts</p>
            <p className="text-sm font-bold text-amber-300">{overdueCount} Pending</p>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 gap-3">
        {/* Attendance Card */}
        <div
          onClick={() => onNavigate('attendance')}
          className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm active:scale-[0.98] transition cursor-pointer relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Today
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500">Attendance Rate</p>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-2xl font-black text-slate-900">{attendanceRate}%</span>
          </div>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-600">
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <CheckCircle className="w-3 h-3 text-emerald-600" /> {presentCount} Present
            </span>
            <span className="flex items-center gap-1 text-rose-700 font-medium">
              <AlertCircle className="w-3 h-3 text-rose-500" /> {absentCount} Absent
            </span>
          </div>
        </div>

        {/* Fees Collection Card */}
        <div
          onClick={() => onNavigate('fees')}
          className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm active:scale-[0.98] transition cursor-pointer relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
              Collected
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500">Fee Received</p>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-2xl font-black text-slate-900">
              ₹{totalCollected.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="mt-2 text-[10px] text-amber-700 font-medium truncate">
            Due Balance: ₹{totalPending.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Quick Action Matrix */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Quick Actions
          </h3>
          <span className="text-[10px] font-semibold text-blue-700">Daily Operations</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => onNavigate('attendance')}
            className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 active:scale-95 transition"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-1.5">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold text-slate-800 text-center leading-tight">
              Mark Attendance
            </span>
          </button>

          <button
            onClick={() => onNavigate('fees')}
            className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 active:scale-95 transition"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-1.5">
              <Receipt className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold text-slate-800 text-center leading-tight">
              Collect Fees
            </span>
          </button>

          <button
            onClick={() => onNavigate('students')}
            className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 active:scale-95 transition"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-1.5">
              <UserPlus className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold text-slate-800 text-center leading-tight">
              Add Student
            </span>
          </button>

          <button
            onClick={() => onNavigate('reports')}
            className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 active:scale-95 transition"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-1.5">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold text-slate-800 text-center leading-tight">
              Report Card
            </span>
          </button>
        </div>
      </div>

      {/* Today's Batch Schedule */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-700" />
            <h3 className="text-sm font-bold text-slate-900">Today's Batches</h3>
          </div>
          <button
            onClick={() => onNavigate('timetable')}
            className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-0.5"
          >
            View All <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {batches.map((batch) => (
            <div
              key={batch.id}
              className="p-3 bg-slate-50 hover:bg-blue-50/50 rounded-2xl border border-slate-200/80 flex items-center justify-between transition"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">{batch.name}</span>
                  <span className="text-[9px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                    {batch.class}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  👨‍🏫 {batch.teacher_name} • {batch.room_number || 'Room 101'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-blue-800 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs">
                  {batch.start_time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Fees Alert Section */}
      {overdueCount > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Pending Tuition Fee Follow-ups ({overdueCount})</span>
            </div>
            <button
              onClick={() => onNavigate('fees')}
              className="text-[11px] font-semibold text-rose-700 underline"
            >
              View dues
            </button>
          </div>

          <div className="space-y-2 mt-3">
            {students
              .filter((s) => s.payment_status === 'overdue' || s.payment_status === 'pending')
              .slice(0, 2)
              .map((s) => (
                <div
                  key={s.id}
                  className="bg-white p-2.5 rounded-xl border border-rose-100 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900">{s.name}</p>
                    <p className="text-[10px] text-slate-500">
                      Balance: <span className="font-bold text-rose-700">₹{s.pending_balance}</span> • Due on {s.payment_due_date}th
                    </p>
                  </div>
                  <button
                    onClick={() => handleWhatsAppAlert(s)}
                    className="p-1.5 bg-emerald-500 text-white rounded-lg flex items-center gap-1 text-[11px] font-semibold shadow-xs hover:bg-emerald-600 transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Recent Fee Payments & Receipts */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900">Recent Receipts</h3>
          </div>
          <button
            onClick={() => onNavigate('fees')}
            className="text-xs font-semibold text-blue-700 hover:text-blue-800"
          >
            All Receipts
          </button>
        </div>

        <div className="space-y-2">
          {payments.slice(0, 3).map((payment) => (
            <div
              key={payment.id}
              className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-slate-900">{payment.student_name}</p>
                <p className="text-[10px] text-slate-500">
                  {payment.receipt_no} • {payment.payment_method.toUpperCase()} • {payment.payment_date}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-emerald-700">
                  +₹{payment.amount.toLocaleString('en-IN')}
                </span>
                <button
                  onClick={() => handleDownloadReceipt(payment)}
                  title="Download PDF Receipt"
                  className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-blue-700 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
