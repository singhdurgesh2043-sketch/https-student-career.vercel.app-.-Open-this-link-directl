import React, { useState } from 'react';
import {
  CalendarCheck,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  AlertCircle,
  MessageCircle,
  Users,
  Check,
  Save,
  Filter,
} from 'lucide-react';
import { Student, Batch, AttendanceRecord, AttendanceStatus, CentreProfile } from '../types';
import { openWhatsAppChat } from '../lib/whatsapp';

interface AttendanceScreenProps {
  students: Student[];
  batches: Batch[];
  attendance: AttendanceRecord[];
  centre: CentreProfile;
  onSaveAttendance: (records: AttendanceRecord[]) => void;
}

export const AttendanceScreen: React.FC<AttendanceScreenProps> = ({
  students,
  batches,
  attendance,
  centre,
  onSaveAttendance,
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedBatchId, setSelectedBatchId] = useState(batches[0]?.id || 'all');
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [savedNotification, setSavedNotification] = useState(false);

  // Filter students by selected batch
  const batchStudents = students.filter(
    (s) => selectedBatchId === 'all' || s.assigned_batch_id === selectedBatchId
  );

  // Load existing attendance for selected date
  React.useEffect(() => {
    const map: Record<string, AttendanceStatus> = {};
    const remarkMap: Record<string, string> = {};

    batchStudents.forEach((s) => {
      const existing = attendance.find(
        (a) => a.student_id === s.id && a.date === selectedDate
      );
      if (existing) {
        map[s.id] = existing.status;
        if (existing.remarks) remarkMap[s.id] = existing.remarks;
      } else {
        // Default to present for quick marking
        map[s.id] = 'present';
      }
    });

    setStatuses(map);
    setRemarks(remarkMap);
    setSavedNotification(false);
  }, [selectedDate, selectedBatchId]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setStatuses((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const map: Record<string, AttendanceStatus> = {};
    batchStudents.forEach((s) => {
      map[s.id] = status;
    });
    setStatuses(map);
  };

  const handleSave = () => {
    const recordsToSave: AttendanceRecord[] = batchStudents.map((s) => {
      const currentBatch = batches.find((b) => b.id === s.assigned_batch_id);
      return {
        id: `att-${s.id}-${selectedDate}`,
        centre_id: centre.id,
        student_id: s.id,
        student_name: s.name,
        batch_id: s.assigned_batch_id,
        batch_name: currentBatch?.name || 'Standard Batch',
        date: selectedDate,
        status: statuses[s.id] || 'present',
        remarks: remarks[s.id] || '',
        marked_by: centre.owner_name || 'Admin',
      };
    });

    onSaveAttendance(recordsToSave);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  const handleSendAttendanceWhatsApp = (s: Student) => {
    const status = statuses[s.id] || 'present';
    openWhatsAppChat({
      parentPhone: s.parent_whatsapp || s.parent_contact,
      studentName: s.name,
      centreName: centre.name,
      type: 'attendance',
      details: {
        date: selectedDate,
        status: status.toUpperCase(),
      },
    });
  };

  // Calculations
  const presentCount = batchStudents.filter((s) => statuses[s.id] === 'present').length;
  const absentCount = batchStudents.filter((s) => statuses[s.id] === 'absent').length;
  const lateCount = batchStudents.filter((s) => statuses[s.id] === 'late').length;
  const leaveCount = batchStudents.filter((s) => statuses[s.id] === 'leave').length;
  const percentage =
    batchStudents.length > 0 ? Math.round((presentCount / batchStudents.length) * 100) : 0;

  return (
    <div className="space-y-4 pb-6">
      {/* Title Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
            Daily Attendance Register
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Take roll-call, prevent duplicates, notify parents
          </p>
        </div>

        <button
          onClick={handleSave}
          className="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition"
        >
          <Save className="w-4 h-4" />
          <span>Save Register</span>
        </button>
      </div>

      {savedNotification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Attendance records saved successfully! Duplicate entries prevented.</span>
        </div>
      )}

      {/* Date & Batch Selectors */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Attendance Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Select Batch
            </label>
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">All Batches</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.class})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Bulk Actions */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">Quick Bulk Actions:</span>
          <div className="flex gap-1.5">
            <button
              onClick={() => handleMarkAll('present')}
              className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold rounded-lg border border-emerald-200 transition text-[11px]"
            >
              All Present
            </button>
            <button
              onClick={() => handleMarkAll('absent')}
              className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold rounded-lg border border-rose-200 transition text-[11px]"
            >
              All Absent
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-white p-2.5 rounded-2xl border border-slate-200">
          <p className="text-[10px] text-slate-400 font-semibold">Total</p>
          <p className="text-base font-extrabold text-slate-800">{batchStudents.length}</p>
        </div>
        <div className="bg-emerald-50 p-2.5 rounded-2xl border border-emerald-200">
          <p className="text-[10px] text-emerald-700 font-semibold">Present</p>
          <p className="text-base font-extrabold text-emerald-800">{presentCount}</p>
        </div>
        <div className="bg-rose-50 p-2.5 rounded-2xl border border-rose-200">
          <p className="text-[10px] text-rose-700 font-semibold">Absent</p>
          <p className="text-base font-extrabold text-rose-800">{absentCount}</p>
        </div>
        <div className="bg-blue-50 p-2.5 rounded-2xl border border-blue-200">
          <p className="text-[10px] text-blue-700 font-semibold">Rate %</p>
          <p className="text-base font-extrabold text-blue-800">{percentage}%</p>
        </div>
      </div>

      {/* Student Attendance List */}
      <div className="space-y-2.5">
        {batchStudents.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-600">No students in this batch</p>
          </div>
        ) : (
          batchStudents.map((s) => {
            const currentStatus = statuses[s.id] || 'present';
            return (
              <div
                key={s.id}
                className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{s.name}</h3>
                    <p className="text-[10px] text-slate-500">
                      Roll: {s.admission_no} • {s.class}
                    </p>
                  </div>

                  <button
                    onClick={() => handleSendAttendanceWhatsApp(s)}
                    title="Send WhatsApp Alert to Parent"
                    className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center gap-1 text-[11px] font-semibold transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                </div>

                {/* Status Toggle Buttons */}
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(s.id, 'present')}
                    className={`py-1.5 rounded-xl font-bold text-[11px] transition ${
                      currentStatus === 'present'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Present
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(s.id, 'absent')}
                    className={`py-1.5 rounded-xl font-bold text-[11px] transition ${
                      currentStatus === 'absent'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Absent
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(s.id, 'late')}
                    className={`py-1.5 rounded-xl font-bold text-[11px] transition ${
                      currentStatus === 'late'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Late
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(s.id, 'leave')}
                    className={`py-1.5 rounded-xl font-bold text-[11px] transition ${
                      currentStatus === 'leave'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Leave
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
