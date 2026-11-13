import React, { useState } from 'react';
import {
  CreditCard,
  Receipt,
  Download,
  MessageCircle,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Filter,
  X,
  Sparkles,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { Student, FeePayment, CentreProfile, PaymentStatus } from '../types';
import { generateFeeReceiptPDF } from '../lib/pdfGenerator';
import { openWhatsAppChat } from '../lib/whatsapp';

interface FeesScreenProps {
  students: Student[];
  payments: FeePayment[];
  centre: CentreProfile;
  onRecordPayment: (payment: FeePayment) => void;
}

export const FeesScreen: React.FC<FeesScreenProps> = ({
  students,
  payments,
  centre,
  onRecordPayment,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'receipts'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  // Record payment form
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [amount, setAmount] = useState<number>(2500);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'razorpay' | 'cheque'>('upi');
  const [paymentMonth, setPaymentMonth] = useState('November 2026');
  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');
  const [isProcessingRazorpay, setIsProcessingRazorpay] = useState(false);

  // Financial Metrics
  const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);
  const totalPending = students.reduce((acc, s) => acc + (s.pending_balance || 0), 0);
  const overdueCount = students.filter((s) => s.payment_status === 'overdue').length;
  const paidCount = students.filter((s) => s.payment_status === 'paid').length;

  const openPaymentModalForStudent = (s: Student) => {
    setSelectedStudentId(s.id);
    setAmount(s.pending_balance || s.monthly_fees - s.discount);
    setTransactionId('UPI-' + Math.floor(1000000000 + Math.random() * 9000000000));
    setIsRecordModalOpen(true);
  };

  const handleRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === selectedStudentId);
    if (!student) return;

    const receiptNo = `REC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const newPayment: FeePayment = {
      id: 'pay-' + Math.random().toString(36).substring(2, 9),
      receipt_no: receiptNo,
      centre_id: centre.id,
      student_id: student.id,
      student_name: student.name,
      amount: Number(amount),
      payment_date: new Date().toISOString().split('T')[0],
      payment_month: paymentMonth,
      payment_type: Number(amount) >= (student.pending_balance || student.monthly_fees) ? 'full' : 'partial',
      payment_method: paymentMethod,
      transaction_id: transactionId.trim() || 'CASH-' + Math.floor(1000 + Math.random() * 9000),
      status: 'success',
      notes: notes.trim(),
      received_by: centre.owner_name || 'Admin',
    };

    onRecordPayment(newPayment);
    setIsRecordModalOpen(false);

    // Auto-generate receipt
    generateFeeReceiptPDF(newPayment, student, centre);
  };

  const handleSimulateRazorpay = () => {
    setIsProcessingRazorpay(true);
    setTimeout(() => {
      setIsProcessingRazorpay(false);
      setPaymentMethod('razorpay');
      setTransactionId('pay_rzp_mock_' + Math.floor(100000 + Math.random() * 900000));
      alert('Razorpay Checkout simulated in Test Mode! Transaction ID generated.');
    }, 1200);
  };

  const handleWhatsAppReminder = (s: Student) => {
    openWhatsAppChat({
      parentPhone: s.parent_whatsapp || s.parent_contact,
      studentName: s.name,
      centreName: centre.name,
      type: 'fee_reminder',
      details: {
        amount: s.pending_balance || s.monthly_fees - s.discount,
        dueDate: `${s.payment_due_date}th of this month`,
        month: paymentMonth,
      },
    });
  };

  const handleWhatsAppReceipt = (p: FeePayment) => {
    const student = students.find((s) => s.id === p.student_id);
    openWhatsAppChat({
      parentPhone: student?.parent_whatsapp || '9876543210',
      studentName: p.student_name,
      centreName: centre.name,
      type: 'payment_receipt',
      details: {
        receiptNo: p.receipt_no,
        amount: p.amount,
        method: p.payment_method.toUpperCase(),
        date: p.payment_date,
      },
    });
  };

  const filteredStudents = students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.admission_no.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === 'All' || s.payment_status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-4 pb-6">
      {/* Title & Action */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
            Fees & Billing
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Collection ledger, digital receipts, Razorpay links
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedStudentId(students[0]?.id || '');
            setAmount(2500);
            setTransactionId('UPI-' + Math.floor(1000000000 + Math.random() * 9000000000));
            setIsRecordModalOpen(true);
          }}
          className="py-2 px-3.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Record Fee</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-200/70 p-1 rounded-2xl text-xs font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-1.5 rounded-xl transition ${
            activeTab === 'overview' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600'
          }`}
        >
          Overview & Dues
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`flex-1 py-1.5 rounded-xl transition ${
            activeTab === 'students' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600'
          }`}
        >
          Student Balances ({students.length})
        </button>
        <button
          onClick={() => setActiveTab('receipts')}
          className={`flex-1 py-1.5 rounded-xl transition ${
            activeTab === 'receipts' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600'
          }`}
        >
          Receipts ({payments.length})
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* High Impact Metric Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-4 rounded-3xl shadow-sm">
              <span className="text-[10px] uppercase font-bold text-emerald-100 tracking-wider">
                Total Fees Received
              </span>
              <p className="text-2xl font-black mt-1">₹{totalRevenue.toLocaleString('en-IN')}</p>
              <p className="text-[11px] text-emerald-100 mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {paidCount} Fully cleared
              </p>
            </div>

            <div className="bg-gradient-to-br from-rose-600 to-red-700 text-white p-4 rounded-3xl shadow-sm">
              <span className="text-[10px] uppercase font-bold text-rose-100 tracking-wider">
                Pending Tuition Dues
              </span>
              <p className="text-2xl font-black mt-1">₹{totalPending.toLocaleString('en-IN')}</p>
              <p className="text-[11px] text-rose-100 mt-2 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {overdueCount} Overdue accounts
              </p>
            </div>
          </div>

          {/* Overdue Collection Priority List */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Urgent Fee Reminders
              </h3>
              <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-full">
                Action Required
              </span>
            </div>

            <div className="space-y-2.5">
              {students
                .filter((s) => s.payment_status === 'overdue' || s.payment_status === 'pending')
                .map((s) => (
                  <div
                    key={s.id}
                    className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200 flex items-center justify-between transition"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-slate-900">{s.name}</h4>
                        <span className="text-[9px] font-bold bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded">
                          {s.payment_status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Due: <span className="font-bold text-rose-700">₹{s.pending_balance}</span> • Due day: {s.payment_due_date}th
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleWhatsAppReminder(s)}
                        title="Send WhatsApp Payment Link & Reminder"
                        className="py-1 px-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 shadow-2xs transition"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Remind</span>
                      </button>
                      <button
                        onClick={() => openPaymentModalForStudent(s)}
                        className="py-1 px-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-[11px] font-bold transition"
                      >
                        Pay
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'students' && (
        <div className="space-y-3">
          {/* Search and Filters */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name or roll..."
              className="w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex gap-1.5 text-xs">
            {['All', 'paid', 'pending', 'overdue', 'partial'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition ${
                  filterStatus === st
                    ? 'bg-blue-700 text-white'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Student fee cards */}
          <div className="space-y-2.5">
            {filteredStudents.map((s) => {
              const netTotal = s.monthly_fees - s.discount;
              const paid = s.total_paid || 0;
              const pct = netTotal > 0 ? Math.min(100, Math.round((paid / netTotal) * 100)) : 100;

              return (
                <div
                  key={s.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{s.name}</h4>
                      <p className="text-[10px] text-slate-500">
                        {s.class} • Roll: {s.admission_no}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        s.payment_status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : s.payment_status === 'overdue'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {s.payment_status}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold">
                      <span className="text-slate-500">Paid: ₹{paid}</span>
                      <span className="text-slate-800">Total: ₹{netTotal}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pct === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-[11px] font-bold text-rose-600">
                      Balance: ₹{s.pending_balance || 0}
                    </span>
                    <button
                      onClick={() => openPaymentModalForStudent(s)}
                      className="py-1 px-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-xs transition"
                    >
                      Record Payment
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'receipts' && (
        <div className="space-y-3">
          {payments.map((p) => {
            const student = students.find((s) => s.id === p.student_id);
            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{p.student_name}</h4>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {p.receipt_no} • {p.payment_month}
                    </p>
                  </div>
                  <span className="text-sm font-black text-emerald-700">
                    ₹{p.amount.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span>
                    Mode: <strong className="uppercase text-slate-800">{p.payment_method}</strong> ({p.payment_date})
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleWhatsAppReceipt(p)}
                      title="Send WhatsApp Receipt"
                      className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (student) generateFeeReceiptPDF(p, student, centre);
                      }}
                      title="Download PDF"
                      className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Record Payment Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Record Fee Collection</h3>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Student</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => {
                    setSelectedStudentId(e.target.value);
                    const s = students.find((st) => st.id === e.target.value);
                    if (s) setAmount(s.pending_balance || s.monthly_fees - s.discount);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.class}) - Due: ₹{s.pending_balance || 0}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Amount Paid (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Month</label>
                  <input
                    type="text"
                    value={paymentMonth}
                    onChange={(e) => setPaymentMonth(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['cash', 'upi', 'razorpay', 'cheque'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-1.5 rounded-xl font-bold text-[11px] uppercase transition ${
                        paymentMethod === method
                          ? 'bg-blue-700 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Transaction / Reference ID
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. UPI Ref / Cash Receipt"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                />
              </div>

              {/* Razorpay Test Checkout Simulation Trigger */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-900 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Razorpay Test Gateway</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleSimulateRazorpay}
                    disabled={isProcessingRazorpay}
                    className="px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg text-[10px] transition disabled:opacity-50"
                  >
                    {isProcessingRazorpay ? 'Opening...' : 'Simulate Online Pay'}
                  </button>
                </div>
                <p className="text-[10px] text-blue-800/80 leading-relaxed">
                  Supports server-side signature verification & webhook in production. Test mode active.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Remarks</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional note"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Confirm Payment & Print Receipt</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
