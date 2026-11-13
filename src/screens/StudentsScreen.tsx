import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Filter,
  Phone,
  MessageCircle,
  Edit2,
  Trash2,
  GraduationCap,
  Calendar,
  X,
  Check,
  CreditCard,
  Clock,
  Eye,
  Building,
  User,
  BookOpen,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Copy,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { Student, Batch, CentreProfile, PaymentStatus } from '../types';
import { openWhatsAppChat } from '../lib/whatsapp';

interface StudentsScreenProps {
  students: Student[];
  batches: Batch[];
  centre: CentreProfile;
  onAddStudent: (student: Student) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
}

export const StudentsScreen: React.FC<StudentsScreenProps> = ({
  students,
  batches,
  centre,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form states for Add/Edit
  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [parentContact, setParentContact] = useState('');
  const [parentWhatsApp, setParentWhatsApp] = useState('');
  const [sameAsContact, setSameAsContact] = useState(true);
  const [studentClass, setStudentClass] = useState('Class 10');
  const [course, setCourse] = useState('CBSE Regular');
  const [subjectsStr, setSubjectsStr] = useState('Mathematics, Science');
  const [assignedBatchId, setAssignedBatchId] = useState(batches[0]?.id || '');
  const [tuitionTiming, setTuitionTiming] = useState('04:00 PM - 05:30 PM');
  const [monthlyFees, setMonthlyFees] = useState(2500);
  const [discount, setDiscount] = useState(0);
  const [paymentDueDate, setPaymentDueDate] = useState(5);
  const [admissionDate, setAdmissionDate] = useState(new Date().toISOString().split('T')[0]);
  const [formError, setFormError] = useState('');

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const openAddModal = () => {
    setEditingStudent(null);
    setName('');
    setFatherName('');
    setParentContact('');
    setParentWhatsApp('');
    setSameAsContact(true);
    setStudentClass('Class 10');
    setCourse('CBSE Regular');
    setSubjectsStr('Mathematics, Science');
    const firstBatch = batches[0];
    setAssignedBatchId(firstBatch?.id || '');
    setTuitionTiming(firstBatch ? `${firstBatch.start_time} - ${firstBatch.end_time}` : '04:00 PM - 05:30 PM');
    setMonthlyFees(2500);
    setDiscount(0);
    setPaymentDueDate(5);
    setAdmissionDate(new Date().toISOString().split('T')[0]);
    setFormError('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (s: Student) => {
    setEditingStudent(s);
    setName(s.name);
    setFatherName(s.father_name);
    setParentContact(s.parent_contact);
    setParentWhatsApp(s.parent_whatsapp);
    setSameAsContact(s.parent_contact === s.parent_whatsapp);
    setStudentClass(s.class);
    setCourse(s.course || 'Regular');
    setSubjectsStr(s.subjects.join(', '));
    setAssignedBatchId(s.assigned_batch_id || '');
    setTuitionTiming(s.tuition_timing || '');
    setMonthlyFees(s.monthly_fees);
    setDiscount(s.discount);
    setPaymentDueDate(s.payment_due_date);
    setAdmissionDate(s.admission_date);
    setFormError('');
    setIsAddModalOpen(true);
    if (viewingStudent) setViewingStudent(null);
  };

  const handleBatchSelect = (batchId: string) => {
    setAssignedBatchId(batchId);
    const selected = batches.find((b) => b.id === batchId);
    if (selected && selected.start_time && selected.end_time) {
      setTuitionTiming(`${selected.start_time} - ${selected.end_time}`);
    }
  };

  const handleParentContactChange = (val: string) => {
    setParentContact(val);
    if (sameAsContact) {
      setParentWhatsApp(val);
    }
  };

  const handleSameAsContactToggle = () => {
    const nextVal = !sameAsContact;
    setSameAsContact(nextVal);
    if (nextVal) {
      setParentWhatsApp(parentContact);
    }
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Please enter student full name');
      return;
    }
    if (!fatherName.trim()) {
      setFormError("Please enter father's name");
      return;
    }
    if (!parentContact.trim() || parentContact.trim().length < 10) {
      setFormError('Please enter a valid 10-digit parent contact number');
      return;
    }

    const finalWhatsApp = parentWhatsApp.trim() || parentContact.trim();
    const batchObj = batches.find((b) => b.id === assignedBatchId);
    const subjects = subjectsStr.split(',').map((s) => s.trim()).filter(Boolean);
    const effectiveTotal = Math.max(0, Number(monthlyFees) - Number(discount));

    if (editingStudent) {
      const updated: Student = {
        ...editingStudent,
        name: name.trim(),
        father_name: fatherName.trim(),
        parent_contact: parentContact.trim(),
        parent_whatsapp: finalWhatsApp,
        class: studentClass,
        course: course.trim(),
        subjects,
        assigned_batch_id: assignedBatchId,
        assigned_batch_name: batchObj?.name || 'Standard Batch',
        tuition_timing: tuitionTiming.trim(),
        monthly_fees: Number(monthlyFees),
        discount: Number(discount),
        payment_due_date: Number(paymentDueDate),
        admission_date: admissionDate,
        pending_balance: Math.max(0, effectiveTotal - (editingStudent.total_paid || 0)),
      };
      onUpdateStudent(updated);
      showToast('success', `Student "${updated.name}" updated successfully!`);
    } else {
      const newAdmNo = `SC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
      const newStudent: Student = {
        id: 'std-' + Math.random().toString(36).substring(2, 9),
        centre_id: centre.id,
        admission_no: newAdmNo,
        name: name.trim(),
        father_name: fatherName.trim(),
        parent_contact: parentContact.trim(),
        parent_whatsapp: finalWhatsApp,
        class: studentClass,
        course: course.trim(),
        subjects,
        assigned_batch_id: assignedBatchId,
        assigned_batch_name: batchObj?.name || 'Standard Batch',
        tuition_timing: tuitionTiming.trim(),
        monthly_fees: Number(monthlyFees),
        discount: Number(discount),
        payment_due_date: Number(paymentDueDate),
        admission_date: admissionDate,
        payment_status: 'pending',
        is_active: true,
        total_paid: 0,
        pending_balance: effectiveTotal,
      };
      onAddStudent(newStudent);
      showToast('success', `Student "${newStudent.name}" enrolled successfully!`);
    }
    setIsAddModalOpen(false);
  };

  const confirmDelete = () => {
    if (studentToDelete) {
      onDeleteStudent(studentToDelete.id);
      showToast('success', `Student "${studentToDelete.name}" removed from database.`);
      setStudentToDelete(null);
      if (viewingStudent?.id === studentToDelete.id) {
        setViewingStudent(null);
      }
    }
  };

  const handleWhatsApp = (s: Student) => {
    openWhatsAppChat({
      parentPhone: s.parent_whatsapp || s.parent_contact,
      studentName: s.name,
      centreName: centre.name,
      type: 'custom',
      customText: `Dear Parent,\n\nGreetings from *${centre.name}*! 🎓\n\nThis is regarding *${s.name}* enrolled in *${s.class}* (${s.assigned_batch_name}). Please save our official number for tuition updates.\n\nWarm regards,\n*${centre.name}*`,
    });
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.father_name.toLowerCase().includes(q) ||
      s.parent_contact.includes(q) ||
      (s.admission_no && s.admission_no.toLowerCase().includes(q));

    const matchesClass = selectedClass === 'All' || s.class === selectedClass;
    const matchesStatus = selectedStatus === 'All' || s.payment_status === selectedStatus;

    return matchesSearch && matchesClass && matchesStatus;
  });

  const classList = ['All', 'Class 9', 'Class 10', 'Class 11', 'Class 12', 'NEET/JEE'];
  const statusList = ['All', 'paid', 'pending', 'overdue', 'partial'];

  // Metrics
  const activeCount = students.filter((s) => s.is_active).length;
  const overdueCount = students.filter((s) => s.payment_status === 'overdue').length;

  return (
    <div className="space-y-4 pb-6 select-none">
      {/* Toast Notification Banner */}
      {notification && (
        <div
          className={`p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-md transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-rose-600 text-white'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top Header & Enrolment Stats */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-3xl p-5 text-white shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 bg-white/10 px-2.5 py-0.5 rounded-full">
              Student Records
            </span>
            <h2 className="text-xl font-extrabold mt-1 tracking-tight">Student Directory</h2>
            <p className="text-xs text-blue-200/90 mt-0.5">
              Enrolment, guardian contact, fees & batch assignments
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="py-2.5 px-3.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs rounded-2xl shadow-lg border border-white/20 flex items-center gap-1.5 transition shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Student</span>
          </button>
        </div>

        {/* Mini stats counters */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/10 text-center text-xs">
          <div>
            <p className="text-[10px] text-blue-200">Total Enrolled</p>
            <p className="text-base font-extrabold text-white">{students.length}</p>
          </div>
          <div className="border-x border-white/10">
            <p className="text-[10px] text-blue-200">Active Students</p>
            <p className="text-base font-extrabold text-emerald-300">{activeCount}</p>
          </div>
          <div>
            <p className="text-[10px] text-blue-200">Overdue Fees</p>
            <p className="text-base font-extrabold text-rose-300">{overdueCount}</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by student name, roll no, father, phone..."
          className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs font-medium text-slate-900"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Class Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
          <Filter className="w-3 h-3" /> Class:
        </span>
        {classList.map((cls) => (
          <button
            key={cls}
            onClick={() => setSelectedClass(cls)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedClass === cls
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cls}
          </button>
        ))}
      </div>

      {/* Payment Status Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
          Status:
        </span>
        {statusList.map((st) => (
          <button
            key={st}
            onClick={() => setSelectedStatus(st)}
            className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold capitalize whitespace-nowrap transition ${
              selectedStatus === st
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Student List Cards */}
      <div className="space-y-3">
        {filteredStudents.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-sm space-y-2">
            <Users className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No students match your criteria</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Try adjusting your search query, class filter, or click "Add Student" to register a new student.
            </p>
            <button
              onClick={openAddModal}
              className="mt-2 py-2 px-4 bg-blue-700 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 shadow"
            >
              <Plus className="w-3.5 h-3.5" /> Enrol Student Now
            </button>
          </div>
        ) : (
          filteredStudents.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs hover:border-blue-300 transition"
            >
              {/* Header row */}
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center font-black text-base shadow-sm shrink-0">
                    {s.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">{s.name}</h3>
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        {s.class}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Father: <span className="font-medium text-slate-700">{s.father_name}</span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[200px]">{s.assigned_batch_name || 'Standard Batch'}</span>
                    </p>
                  </div>
                </div>

                {/* Status Pill */}
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
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

              {/* Fee & Contact row */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800">
                    ₹{s.monthly_fees - s.discount}/mo
                  </span>
                  {s.pending_balance && s.pending_balance > 0 ? (
                    <span className="ml-2 text-[11px] font-bold text-rose-600">
                      (Due: ₹{s.pending_balance})
                    </span>
                  ) : null}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleWhatsApp(s)}
                    title="Send WhatsApp Message"
                    className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 active:scale-90 transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>

                  <a
                    href={`tel:${s.parent_contact}`}
                    title="Call Parent"
                    className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-90 transition"
                  >
                    <Phone className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => setViewingStudent(s)}
                    title="View Full Profile"
                    className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 active:scale-90 transition"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => openEditModal(s)}
                    title="Edit Student"
                    className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-90 transition"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setStudentToDelete(s)}
                    title="Delete Student"
                    className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 active:scale-90 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ADD / EDIT STUDENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[92vh] overflow-y-auto p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {editingStudent ? 'Edit Student Details' : 'Register New Student'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {editingStudent ? 'Update student information and fees' : 'Add new student to coaching database'}
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveStudent} className="space-y-3.5 text-xs">
              {/* Section 1: Student & Guardian */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-2.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  1. Student & Guardian Information
                </span>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Student Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Aarav Patel"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 text-xs font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Father's Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={fatherName}
                      onChange={(e) => setFatherName(e.target.value)}
                      placeholder="e.g. Mahesh Patel"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 text-xs font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Parent Mobile No. <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={parentContact}
                      onChange={(e) => handleParentContactChange(e.target.value)}
                      placeholder="9820123456"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 text-xs font-mono"
                      required
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-slate-700">
                        WhatsApp No. <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleSameAsContactToggle}
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded transition ${
                          sameAsContact
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {sameAsContact ? '✓ Same' : 'Separate'}
                      </button>
                    </div>
                    <input
                      type="tel"
                      value={parentWhatsApp}
                      onChange={(e) => {
                        setParentWhatsApp(e.target.value);
                        setSameAsContact(false);
                      }}
                      placeholder="9820123456"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 text-xs font-mono"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Academic Program */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-2.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  2. Academic Enrolment & Batch
                </span>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Class</label>
                    <select
                      value={studentClass}
                      onChange={(e) => setStudentClass(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium"
                    >
                      <option value="Class 8">Class 8</option>
                      <option value="Class 9">Class 9</option>
                      <option value="Class 10">Class 10</option>
                      <option value="Class 11">Class 11</option>
                      <option value="Class 12">Class 12</option>
                      <option value="NEET/JEE">NEET / JEE Target</option>
                      <option value="Foundation">Foundation Course</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Course / Board</label>
                    <input
                      type="text"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      placeholder="CBSE / State Board"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Subjects (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={subjectsStr}
                    onChange={(e) => setSubjectsStr(e.target.value)}
                    placeholder="Mathematics, Physics, Chemistry"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Assigned Batch</label>
                    <select
                      value={assignedBatchId}
                      onChange={(e) => handleBatchSelect(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    >
                      {batches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.class})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tuition Timing</label>
                    <input
                      type="text"
                      value={tuitionTiming}
                      onChange={(e) => setTuitionTiming(e.target.value)}
                      placeholder="04:00 PM - 05:30 PM"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Fees & Billing */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-2.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  3. Fees Structure & Schedule
                </span>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Monthly Fee (₹)</label>
                    <input
                      type="number"
                      value={monthlyFees}
                      onChange={(e) => setMonthlyFees(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Discount (₹)</label>
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Due Day</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={paymentDueDate}
                      onChange={(e) => setPaymentDueDate(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center text-[11px] bg-blue-50/70 p-2 rounded-xl text-blue-900">
                  <span>Net Payable Every Month:</span>
                  <strong className="text-sm font-black">₹{Math.max(0, monthlyFees - discount)}</strong>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Admission Date</label>
                  <input
                    type="date"
                    value={admissionDate}
                    onChange={(e) => setAdmissionDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 text-xs"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-700 hover:bg-blue-800 active:scale-[0.98] text-white font-bold rounded-xl shadow-md text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{editingStudent ? 'Save Student Changes' : 'Confirm Registration'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW COMPLETE STUDENT PROFILE MODAL */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[88vh] overflow-y-auto p-5 shadow-2xl space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md">
                  {viewingStudent.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                      {viewingStudent.name}
                    </h3>
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      {viewingStudent.class}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Roll: {viewingStudent.admission_no} • Adm: {viewingStudent.admission_date}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingStudent(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Contact Action Bar */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <a
                href={`tel:${viewingStudent.parent_contact}`}
                className="py-2.5 px-3 bg-blue-50 text-blue-800 hover:bg-blue-100 font-bold rounded-xl border border-blue-200 flex items-center justify-center gap-1.5 transition"
              >
                <Phone className="w-4 h-4 text-blue-700" />
                <span>Call Parent</span>
              </a>
              <button
                onClick={() => handleWhatsApp(viewingStudent)}
                className="py-2.5 px-3 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold rounded-xl border border-emerald-200 flex items-center justify-center gap-1.5 transition"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp Parent</span>
              </button>
            </div>

            {/* Academic & Batch Summary */}
            <div className="bg-slate-50 p-3.5 rounded-2xl space-y-2 border border-slate-200/80 text-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Academic Details
              </span>
              <div className="flex justify-between">
                <span className="text-slate-500">Father's Name:</span>
                <span className="font-semibold text-slate-900">{viewingStudent.father_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Course / Board:</span>
                <span className="font-semibold text-slate-900">
                  {viewingStudent.course || 'CBSE Regular'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Assigned Batch:</span>
                <span className="font-semibold text-blue-800">
                  {viewingStudent.assigned_batch_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tuition Timing:</span>
                <span className="font-mono font-semibold text-slate-900">
                  {viewingStudent.tuition_timing}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Subjects:</span>
                <span className="font-medium text-slate-700 text-right">
                  {viewingStudent.subjects.join(', ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Parent Mobile:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {viewingStudent.parent_contact}
                </span>
              </div>
            </div>

            {/* Financial Ledger */}
            <div className="bg-blue-50/70 p-3.5 rounded-2xl border border-blue-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-950 uppercase tracking-wider text-[10px]">
                  Fee Ledger
                </span>
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    viewingStudent.payment_status === 'paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : viewingStudent.payment_status === 'overdue'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {viewingStudent.payment_status}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Monthly Fee:</span>
                <span>₹{viewingStudent.monthly_fees}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Scholarship Discount:</span>
                <span>-₹{viewingStudent.discount}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-blue-200/60 font-bold text-slate-900">
                <span>Net Payable / Month:</span>
                <span>₹{viewingStudent.monthly_fees - viewingStudent.discount}</span>
              </div>
              <div className="flex justify-between text-rose-700 font-bold">
                <span>Pending Balance:</span>
                <span>₹{viewingStudent.pending_balance || 0}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                <span>Due Date:</span>
                <span>{viewingStudent.payment_due_date}th of every month</span>
              </div>
            </div>

            {/* In-Profile Actions */}
            <div className="flex gap-2 pt-1 border-t border-slate-100 text-xs">
              <button
                onClick={() => openEditModal(viewingStudent)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>

              <button
                onClick={() => setStudentToDelete(viewingStudent)}
                className="py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM IN-APP DELETE CONFIRMATION MODAL */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-base font-extrabold text-slate-900">Delete Student Record?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete <strong>{studentToDelete.name}</strong> (Roll: {studentToDelete.admission_no})? This will remove all their records from this coaching centre.
            </p>

            <div className="flex gap-2 pt-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow transition"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
