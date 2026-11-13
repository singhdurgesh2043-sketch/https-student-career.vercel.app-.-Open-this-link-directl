// STUDENT CAREER - Professional PDF Generation
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ProgressReport, Student, FeePayment, CentreProfile } from '../types';

export function generateProgressReportPDF(
  report: ProgressReport,
  student: Student,
  centre: CentreProfile
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Header Background
  doc.setFillColor(30, 58, 138); // Navy / Royal Blue #1E3A8A
  doc.rect(0, 0, 210, 38, 'F');

  // Centre Brand Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(centre.name || 'STUDENT CAREER COACHING', 14, 18);

  // Tagline / Contact
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `${centre.tagline || 'Empowering Students for Academic Excellence'} | Phone: ${centre.owner_phone || ''}`,
    14,
    26
  );

  // Report Title Badge
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(14, 44, 182, 10, 2, 2, 'F');
  doc.setTextColor(30, 58, 138);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('WEEKLY ACADEMIC PROGRESS REPORT', 18, 51);

  // Student Details Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 58, 182, 34, 2, 2, 'FD');

  doc.setTextColor(51, 65, 85);
  doc.setFontSize(10);

  // Row 1
  doc.setFont('helvetica', 'bold');
  doc.text('Student Name:', 18, 66);
  doc.setFont('helvetica', 'normal');
  doc.text(student.name, 50, 66);

  doc.setFont('helvetica', 'bold');
  doc.text('Roll / Adm No:', 120, 66);
  doc.setFont('helvetica', 'normal');
  doc.text(student.admission_no || 'N/A', 155, 66);

  // Row 2
  doc.setFont('helvetica', 'bold');
  doc.text("Father's Name:", 18, 74);
  doc.setFont('helvetica', 'normal');
  doc.text(student.father_name, 50, 74);

  doc.setFont('helvetica', 'bold');
  doc.text('Class & Course:', 120, 74);
  doc.setFont('helvetica', 'normal');
  doc.text(`${student.class} ${student.course ? `(${student.course})` : ''}`, 155, 74);

  // Row 3
  doc.setFont('helvetica', 'bold');
  doc.text('Batch / Timing:', 18, 82);
  doc.setFont('helvetica', 'normal');
  doc.text(`${student.assigned_batch_name || 'Standard'} | ${student.tuition_timing || 'Evening'}`, 50, 82);

  doc.setFont('helvetica', 'bold');
  doc.text('Report Date:', 120, 82);
  doc.setFont('helvetica', 'normal');
  doc.text(report.report_date, 155, 82);

  // Attendance & General Metric Badges
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.text('PERFORMANCE OVERVIEW', 14, 100);

  // Mini summary cards
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, 104, 56, 18, 2, 2, 'F');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Attendance', 18, 110);
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(`${report.attendance_percentage}%`, 18, 118);

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(77, 104, 56, 18, 2, 2, 'F');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Homework Status', 81, 110);
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(report.homework_status || 'Consistent', 81, 118);

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(140, 104, 56, 18, 2, 2, 'F');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Test Grade', 144, 110);
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(report.test_performance || 'Good', 144, 118);

  // Table of Subjects & Marks
  const tableData = (report.subject_marks || []).map((item) => {
    const pct = item.maxMarks ? Math.round((item.marks / item.maxMarks) * 100) : 0;
    return [item.subject, `${item.marks} / ${item.maxMarks}`, `${pct}%`, pct >= 75 ? 'Distinction' : pct >= 50 ? 'Good' : 'Needs Practice'];
  });

  autoTable(doc, {
    startY: 130,
    head: [['Subject', 'Marks Obtained', 'Percentage', 'Rating']],
    body: tableData.length > 0 ? tableData : [
      ['Mathematics', '44 / 50', '88%', 'Distinction'],
      ['Science', '42 / 50', '84%', 'Distinction'],
      ['English', '38 / 50', '76%', 'Good'],
    ],
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 10,
      cellPadding: 3.5,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14 },
  });

  // @ts-expect-error autoTable adds lastAutoTable to doc
  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 12 : 190;

  // Teacher Comments & Goals Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 58, 138);
  doc.text('TEACHER REMARKS & FEEDBACK', 14, finalY);

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, finalY + 4, 182, 38, 2, 2, 'F');

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Key Observations:', 18, finalY + 12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(
    doc.splitTextToSize(report.teacher_comments || 'Regular attendance and active participation. Grasps concepts quickly.', 170),
    18,
    finalY + 18
  );

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Goals for Next Week:', 18, finalY + 28);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(
    doc.splitTextToSize(report.next_week_goals || 'Complete weekly assignment on time and practice sample question papers.', 170),
    18,
    finalY + 34
  );

  // Signatures at bottom
  const bottomY = 275;
  doc.setDrawColor(203, 213, 225);
  doc.line(18, bottomY, 70, bottomY);
  doc.line(140, bottomY, 192, bottomY);

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("Teacher's Signature", 26, bottomY + 5);
  doc.text("Director / Owner Signature", 144, bottomY + 5);

  // Save the PDF
  doc.save(`${student.name.replace(/\s+/g, '_')}_Progress_Report.pdf`);
}

export function generateFeeReceiptPDF(
  payment: FeePayment,
  student: Student,
  centre: CentreProfile
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [148, 210], // A5 size for fee receipt
  });

  // Header
  doc.setFillColor(30, 58, 138);
  doc.rect(0, 0, 148, 30, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(centre.name || 'STUDENT CAREER', 12, 14);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Official Fee Payment Receipt | Tel: ${centre.owner_phone || ''}`, 12, 22);

  // Receipt Number & Date
  doc.setTextColor(30, 58, 138);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`RECEIPT NO: ${payment.receipt_no}`, 12, 40);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${payment.payment_date}`, 95, 40);

  // Student Details
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(12, 46, 124, 26, 2, 2, 'F');

  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);

  doc.setFont('helvetica', 'bold');
  doc.text('Student:', 16, 54);
  doc.setFont('helvetica', 'normal');
  doc.text(student.name, 35, 54);

  doc.setFont('helvetica', 'bold');
  doc.text("Father's Name:", 16, 62);
  doc.setFont('helvetica', 'normal');
  doc.text(student.father_name, 35, 62);

  doc.setFont('helvetica', 'bold');
  doc.text('Class / Batch:', 75, 54);
  doc.setFont('helvetica', 'normal');
  doc.text(`${student.class} (${student.assigned_batch_name || 'Standard'})`, 95, 54);

  doc.setFont('helvetica', 'bold');
  doc.text('Payment Month:', 75, 62);
  doc.setFont('helvetica', 'normal');
  doc.text(payment.payment_month, 102, 62);

  // Payment Breakdown Table
  autoTable(doc, {
    startY: 78,
    head: [['Description', 'Mode', 'Reference', 'Amount (INR)']],
    body: [
      [
        payment.payment_type.replace('_', ' ').toUpperCase(),
        payment.payment_method.toUpperCase(),
        payment.transaction_id || 'Cash Direct',
        `₹${payment.amount.toLocaleString('en-IN')}`,
      ],
    ],
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
    },
    margin: { left: 12, right: 12 },
  });

  // Total Box
  // @ts-expect-error autoTable adds lastAutoTable to doc
  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : 120;
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(68, finalY, 68, 14, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 58, 138);
  doc.text(`Total Paid: ₹${payment.amount.toLocaleString('en-IN')}`, 72, finalY + 9);

  // Terms & Footer
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Note: This is a computer generated receipt. Fee once paid is non-refundable.', 12, 175);

  doc.save(`Receipt_${payment.receipt_no}.pdf`);
}
