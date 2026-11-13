import React, { useState } from 'react';
import {
  FileText,
  Download,
  MessageCircle,
  Plus,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  TrendingUp,
  X,
} from 'lucide-react';
import { Student, ProgressReport, CentreProfile, SubjectMarks } from '../types';
import { generateProgressReportPDF } from '../lib/pdfGenerator';
import { openWhatsAppChat } from '../lib/whatsapp';

interface ReportsScreenProps {
  students: Student[];
  reports: ProgressReport[];
  centre: CentreProfile;
  onAddReport: (report: ProgressReport) => void;
}

export const ReportsScreen: React.FC<ReportsScreenProps> = ({
  students,
  reports,
  centre,
  onAddReport,
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [reportTitle, setReportTitle] = useState('Weekly Academic Progress Report');
  const [attendancePct, setAttendancePct] = useState(95);
  const [homeworkStatus, setHomeworkStatus] = useState<'Consistent' | 'Occasional' | 'Needs Improvement'>('Consistent');
  const [testPerformance, setTestPerformance] = useState<'Excellent' | 'Good' | 'Average' | 'Needs Improvement'>('Excellent');
  const [teacherComments, setTeacherComments] = useState('Regular in class and solves tricky problems confidently.');
  const [improvementAreas, setImprovementAreas] = useState('Speed in long-answer calculations.');
  const [nextWeekGoals, setNextWeekGoals] = useState('Complete chapter mock tests.');

  // Subject marks
  const [marksList, setMarksList] = useState<SubjectMarks[]>([
    { subject: 'Mathematics', marks: 45, maxMarks: 50 },
    { subject: 'Science', marks: 42, maxMarks: 50 },
    { subject: 'English', marks: 40, maxMarks: 50 },
  ]);

  const handleUpdateMarks = (index: number, marks: number) => {
    const copy = [...marksList];
    copy[index].marks = marks;
    setMarksList(copy);
  };

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === selectedStudentId);
    if (!student) return;

    const newReport: ProgressReport = {
      id: 'rep-' + Math.random().toString(36).substring(2, 9),
      centre_id: centre.id,
      student_id: student.id,
      student_name: student.name,
      report_title: reportTitle,
      report_date: new Date().toISOString().split('T')[0],
      attendance_percentage: Number(attendancePct),
      subject_marks: marksList,
      homework_status: homeworkStatus,
      test_performance: testPerformance,
      teacher_comments: teacherComments,
      improvement_areas: improvementAreas,
      next_week_goals: nextWeekGoals,
    };

    onAddReport(newReport);
    setIsCreateOpen(false);

    // Auto-generate PDF
    generateProgressReportPDF(newReport, student, centre);
  };

  const handleDownloadPDF = (rep: ProgressReport) => {
    const student = students.find((s) => s.id === rep.student_id) || {
      id: rep.student_id,
      centre_id: centre.id,
      admission_no: 'N/A',
      name: rep.student_name,
      father_name: 'Parent',
      parent_contact: '9876543210',
      parent_whatsapp: '9876543210',
      admission_date: '2026-01-01',
      class: 'Class 10',
      subjects: ['All'],
      monthly_fees: 2500,
      discount: 0,
      payment_due_date: 5,
      payment_status: 'paid',
      is_active: true,
    };
    generateProgressReportPDF(rep, student, centre);
  };

  const handleWhatsAppShare = (rep: ProgressReport) => {
    const student = students.find((s) => s.id === rep.student_id);
    openWhatsAppChat({
      parentPhone: student?.parent_whatsapp || '9876543210',
      studentName: rep.student_name,
      centreName: centre.name,
      type: 'progress_report',
      details: {
        attendance: `${rep.attendance_percentage}%`,
        performance: rep.test_performance,
        comments: rep.teacher_comments,
      },
    });
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
            Progress Reports
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Academic evaluations, marks cards, parent reports
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="py-2 px-3.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Report</span>
        </button>
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {reports.map((rep) => (
          <div
            key={rep.id}
            className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3.5"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {rep.report_date}
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 mt-1">
                  {rep.student_name}
                </h3>
                <p className="text-xs text-slate-500 font-medium">{rep.report_title}</p>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg">
                  {rep.test_performance}
                </span>
              </div>
            </div>

            {/* Performance Strip */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-center">
              <div>
                <p className="text-[10px] text-slate-500 font-medium">Attendance</p>
                <p className="text-xs font-bold text-slate-900">{rep.attendance_percentage}%</p>
              </div>
              <div className="border-x border-slate-200">
                <p className="text-[10px] text-slate-500 font-medium">Homework</p>
                <p className="text-xs font-bold text-slate-900">{rep.homework_status}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-medium">Average</p>
                <p className="text-xs font-bold text-blue-700">88%</p>
              </div>
            </div>

            {/* Marks Mini Table */}
            <div className="space-y-1 text-xs">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Subject Scores:
              </p>
              <div className="grid grid-cols-3 gap-2">
                {rep.subject_marks.map((sm) => (
                  <div key={sm.subject} className="bg-slate-100/60 p-2 rounded-xl text-center">
                    <p className="text-[10px] text-slate-600 truncate">{sm.subject}</p>
                    <p className="font-extrabold text-slate-900">
                      {sm.marks}/{sm.maxMarks}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Teacher comment */}
            <div className="text-xs bg-blue-50/50 p-3 rounded-2xl border border-blue-100">
              <p className="font-semibold text-blue-900 mb-0.5">Faculty Feedback:</p>
              <p className="text-slate-600 text-[11px] leading-relaxed">{rep.teacher_comments}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1 border-t border-slate-100">
              <button
                onClick={() => handleDownloadPDF(rep)}
                className="flex-1 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>

              <button
                onClick={() => handleWhatsAppShare(rep)}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-2xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Report</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Report Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[85vh] overflow-y-auto p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Generate Progress Report</h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Student</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.class})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Attendance %</label>
                  <input
                    type="number"
                    value={attendancePct}
                    onChange={(e) => setAttendancePct(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Homework Status</label>
                  <select
                    value={homeworkStatus}
                    onChange={(e) =>
                      setHomeworkStatus(e.target.value as 'Consistent' | 'Occasional' | 'Needs Improvement')
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Consistent">Consistent</option>
                    <option value="Occasional">Occasional</option>
                    <option value="Needs Improvement">Needs Improvement</option>
                  </select>
                </div>
              </div>

              {/* Subject Marks Inputs */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Subject Marks (Out of 50)
                </label>
                <div className="space-y-2">
                  {marksList.map((sm, idx) => (
                    <div key={sm.subject} className="flex items-center justify-between gap-2">
                      <span className="font-medium text-slate-700 w-28">{sm.subject}:</span>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={sm.marks}
                        onChange={(e) => handleUpdateMarks(idx, Number(e.target.value))}
                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Teacher Comments</label>
                <textarea
                  rows={2}
                  value={teacherComments}
                  onChange={(e) => setTeacherComments(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Next Week Goals</label>
                <input
                  type="text"
                  value={nextWeekGoals}
                  onChange={(e) => setNextWeekGoals(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-md text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Generate & Save PDF Report</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
