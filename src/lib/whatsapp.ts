// STUDENT CAREER - WhatsApp Integration Helper
// Generates official click-to-chat links with custom templating and Android intent support

export interface WhatsAppMessagePayload {
  parentPhone: string;
  parentName?: string;
  studentName: string;
  centreName: string;
  type: 'fee_reminder' | 'payment_link' | 'attendance' | 'progress_report' | 'payment_receipt' | 'custom';
  customText?: string;
  details?: Record<string, string | number>;
}

export function formatIndianPhoneNumber(phone: string): string {
  // Strip non-digit characters
  let clean = phone.replace(/\D/g, '');
  // If 10 digits, prepend 91 (India country code)
  if (clean.length === 10) {
    clean = '91' + clean;
  }
  return clean;
}

export function generateWhatsAppMessage(payload: WhatsAppMessagePayload): string {
  const { studentName, centreName, type, details, customText } = payload;
  
  switch (type) {
    case 'fee_reminder': {
      const amount = details?.amount ?? '0';
      const dueDate = details?.dueDate ?? '5th of this month';
      const month = details?.month ?? 'Current Month';
      return `Dear Parent,\n\nGreetings from *${centreName}*! 🎓\n\nThis is a friendly reminder that the tuition fee for *${studentName}* for ${month} is pending.\n\n💰 *Amount Due:* ₹${amount}\n📅 *Due Date:* ${dueDate}\n\nKindly clear the dues at your earliest convenience. If already paid, please ignore this message.\n\nThank you!\n*${centreName} Administration*`;
    }

    case 'payment_link': {
      const amount = details?.amount ?? '0';
      const upiId = details?.upiId ?? '';
      return `Dear Parent,\n\nFee payment details for *${studentName}* at *${centreName}*:\n\n💵 *Amount:* ₹${amount}\n📱 *UPI ID:* ${upiId || 'Contact Centre'}\n\nYou can also pay directly via Google Pay, PhonePe, or Paytm.\n\nPlease share screenshot once payment is completed.\n\nWarm regards,\n*${centreName}*`;
    }

    case 'attendance': {
      const date = details?.date ?? new Date().toLocaleDateString('en-IN');
      const status = (details?.status ?? 'Absent').toString().toUpperCase();
      const statusEmoji = status === 'PRESENT' ? '✅' : status === 'ABSENT' ? '❌' : '⚠️';
      return `Dear Parent,\n\nAttendance update for *${studentName}* on ${date} at *${centreName}*:\n\n${statusEmoji} *Status:* ${status}\n\nFor any queries regarding attendance, please contact us.\n\nRegards,\n*${centreName}*`;
    }

    case 'progress_report': {
      const attendance = details?.attendance ?? '95%';
      const performance = details?.performance ?? 'Good';
      const comments = details?.comments ?? 'Doing great in class!';
      return `Dear Parent,\n\nAcademic Progress Summary for *${studentName}* at *${centreName}* 📊\n\n🎯 *Attendance:* ${attendance}\n📈 *Performance:* ${performance}\n📝 *Teacher Remarks:* ${comments}\n\nWe encourage you to discuss these weekly goals with your child.\n\nBest wishes,\n*${centreName}*`;
    }

    case 'payment_receipt': {
      const receiptNo = details?.receiptNo ?? 'REC-001';
      const amount = details?.amount ?? '0';
      const method = details?.method ?? 'Cash/UPI';
      const date = details?.date ?? new Date().toLocaleDateString('en-IN');
      return `Dear Parent,\n\nPayment received with thanks! 🙏\n\n🏫 *${centreName}*\n🧾 *Receipt No:* ${receiptNo}\n👤 *Student:* ${studentName}\n💰 *Amount Received:* ₹${amount}\n💳 *Payment Mode:* ${method}\n📅 *Date:* ${date}\n\nThank you for choosing *${centreName}*!`;
    }

    case 'custom':
    default:
      return customText || `Hello from ${centreName}. Please feel free to reach out to us regarding ${studentName}'s tuition.`;
  }
}

export function openWhatsAppChat(payload: WhatsAppMessagePayload): { success: boolean; url: string } {
  const formattedPhone = formatIndianPhoneNumber(payload.parentPhone);
  const message = generateWhatsAppMessage(payload);
  const encodedMessage = encodeURIComponent(message);
  
  // Official WhatsApp universal link
  const url = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
  
  try {
    // Open in native WhatsApp on Android or WhatsApp Web
    window.open(url, '_blank');
    return { success: true, url };
  } catch (error) {
    console.error('Failed to open WhatsApp:', error);
    return { success: false, url };
  }
}
