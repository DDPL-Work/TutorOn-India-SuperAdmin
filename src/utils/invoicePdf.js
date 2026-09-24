import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import tutorOnLogo from '../assets/tutoron-logo.png';
import { numberToWordsINR } from './formatters';

/**
 * Loads an image URL into a base64 Data URL so it can be added to jsPDF cleanly
 */
function loadImageAsBase64(url) {
  return new Promise((resolve) => {
    if (!url) {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width || 300;
        canvas.height = img.naturalHeight || img.height || 300;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl);
      } catch (e) {
        console.warn('Canvas export failed for logo:', e);
        resolve(null);
      }
    };
    img.onerror = () => {
      console.warn('Could not load logo from path:', url);
      resolve(null);
    };
    img.src = url;
  });
}

/**
 * Generates and downloads a clean, professional vector PDF invoice for TutorOn India
 * Engineered to standard A4 (210mm x 297mm) dimensions with 100% full-page coverage,
 * precise 10mm margins, crisp typography, and non-overlapping tabular layout.
 * @param {Object} payment - Payment record data
 * @param {string} customFilename - Optional filename
 */
export async function downloadInvoicePdf(payment, customFilename) {
  if (!payment) {
    throw new Error('Payment details are required to generate the invoice.');
  }

  // Exact standard A4 portrait specifications: 210mm width x 297mm height
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10; // Standard 10mm A4 margin
  const contentWidth = pageWidth - margin * 2; // Exact 190mm
  const rightAlignX = pageWidth - margin; // 200mm

  // Numeric fee calculations (GST 18% inclusive)
  const numAmount = payment.numericAmount || parseFloat(String(payment.amount).replace(/[^0-9.]/g, '')) || 0;
  const numBase = Math.round(numAmount / 1.18);
  const numGst = numAmount - numBase;
  const numCgst = Math.round(numGst / 2);
  const numSgst = numGst - numCgst;

  const formattedBase = `Rs. ${numBase.toLocaleString('en-IN')}`;
  const formattedCgst = `Rs. ${numCgst.toLocaleString('en-IN')}`;
  const formattedSgst = `Rs. ${numSgst.toLocaleString('en-IN')}`;
  const formattedTotalGst = `Rs. ${numGst.toLocaleString('en-IN')}`;
  const formattedTotal = `Rs. ${numAmount.toLocaleString('en-IN')}`;
  const amountInWords = numberToWordsINR(numAmount);

  // 1. Load brand logo
  let logoData = await loadImageAsBase64(tutorOnLogo);
  if (!logoData) {
    logoData = await loadImageAsBase64('/tutoron-logo.png');
  }

  // ==========================================
  // TOP A4 ACCENT HEADER BAR
  // ==========================================
  doc.setFillColor(18, 59, 102); // Primary Brand Navy #123B66
  doc.rect(margin, 10, contentWidth, 2.5, 'F');

  // ==========================================
  // 1. BRAND & INVOICE HEADER (Y: 15 to 42)
  // ==========================================
  let y = 15;

  // Logo: Square ratio (22mm x 22mm)
  if (logoData) {
    try {
      doc.addImage(logoData, 'PNG', margin, y, 22, 22, undefined, 'FAST');
    } catch {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(18, 59, 102);
      doc.text('TutorOn INDIA', margin, y + 10);
    }
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(18, 59, 102);
    doc.text('TutorOn INDIA', margin, y + 10);
  }

  // Brand Info next to logo
  const brandX = margin + 26;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(18, 59, 102);
  doc.text('TUTORON INDIA EDTECH PVT. LTD.', brandX, y + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.2);
  doc.setTextColor(100, 116, 139);
  doc.text('Empowering Next-Gen Learners & Educators', brandX, y + 9.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('GSTIN: 27AABCT8921M1Z8  |  CIN: U80903MH2024PTC123456', brandX, y + 14.5);
  doc.text('Website: www.tutoron.in  |  Support: billing@tutoron.in', brandX, y + 19);

  // Right Header: Tax Invoice Pill & Details
  const pillW = 54;
  doc.setFillColor(18, 59, 102);
  doc.roundedRect(rightAlignX - pillW, y, pillW, 7.5, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('TAX INVOICE / RECEIPT', rightAlignX - pillW / 2, y + 5, { align: 'center' });

  // Invoice ID
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(15, 23, 42);
  doc.text(payment.invoiceId || 'INV-2026-90412', rightAlignX, y + 13.5, { align: 'right' });

  // Date
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Date: ${payment.date || '21 Sep 2026, 11:28 AM'}`, rightAlignX, y + 18, { align: 'right' });

  // Status Badge (Green Pill Container)
  const statusPillWidth = 46;
  const statusPillX = rightAlignX - statusPillWidth;
  const statusPillY = y + 20.5;
  doc.setFillColor(236, 253, 245); // #ECFDF5
  doc.setDrawColor(167, 243, 208); // #A7F3D0
  doc.roundedRect(statusPillX, statusPillY, statusPillWidth, 6, 1.5, 1.5, 'FD');

  // Green Dot
  doc.setFillColor(22, 163, 74);
  doc.circle(statusPillX + 4.5, statusPillY + 3, 1.1, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(22, 163, 74);
  doc.text(`Payment ${payment.status || 'Successful'}`, statusPillX + 7.5, statusPillY + 4.2);

  // Header bottom divider line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, 43, rightAlignX, 43);

  // ==========================================
  // 2. ADDRESSES SECTION (Y: 47 to 88)
  // ==========================================
  y = 47;
  const colGap = 6;
  const colWidth = (contentWidth - colGap) / 2; // 92mm each
  const boxHeight = 40;

  // Left Box: Service Provider
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, colWidth, boxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('SERVICE PROVIDER / ISSUED BY:', margin + 4, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('TutorOn India EdTech Private Limited', margin + 4, y + 11.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(71, 85, 105);
  doc.text('Unit 402, Supreme Business Park, Hiranandani Gardens,', margin + 4, y + 16.5);
  doc.text('Powai, Mumbai, Maharashtra - 400076, India', margin + 4, y + 21.5);
  doc.text('Email: billing@tutoron.in  |  Web: www.tutoron.in', margin + 4, y + 27);
  doc.text('State / Code: Maharashtra (27)  |  PAN: AABCT8921M', margin + 4, y + 32.5);

  // Right Box: Billed To
  const rightBoxX = margin + colWidth + colGap;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(rightBoxX, y, colWidth, boxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('BILLED TO (STUDENT PAYEE):', rightBoxX + 4, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(payment.student?.name || 'Student Name', rightBoxX + 4, y + 11.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Student ID: ${payment.student?.id || '-'}`, rightBoxX + 4, y + 16.5);
  doc.text(`Email: ${payment.student?.email || '-'}`, rightBoxX + 4, y + 21.5);
  doc.text(`Phone: ${payment.student?.phone || '-'}`, rightBoxX + 4, y + 27);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(18, 59, 102);
  doc.text(`Enrollment Ref: ${payment.enrollmentId || '-'}`, rightBoxX + 4, y + 32.5);

  // ==========================================
  // 3. COURSE & GATEWAY SUMMARY BANNER (Y: 91 to 112)
  // ==========================================
  y = 91;
  const bannerHeight = 20;
  doc.setFillColor(239, 246, 255); // #EFF6FF
  doc.setDrawColor(191, 219, 254); // #BFDBFE
  doc.roundedRect(margin, y, contentWidth, bannerHeight, 2, 2, 'FD');

  const bCol1 = margin + 4;
  const bCol2 = margin + 76;
  const bCol3 = margin + 130;

  // Banner Col 1: Course
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('ENROLLED COURSE / BATCH', bCol1, y + 5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(18, 59, 102);
  const courseLines = doc.splitTextToSize(payment.batch?.name || 'Course Batch', 68);
  doc.text(courseLines[0] || '', bCol1, y + 9.5);
  if (courseLines.length > 1) {
    doc.text(courseLines[1], bCol1, y + 13.5);
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text(`${payment.batch?.code || '-'}  •  ${payment.teacher?.subject || '-'}`, bCol1, y + 17.5);

  // Banner Col 2: Faculty
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('FACULTY / INSTRUCTOR', bCol2, y + 5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`${payment.teacher?.name || '-'}`, bCol2, y + 9.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`ID: ${payment.teacher?.id || '-'}  •  ${payment.teacher?.subject || '-'}`, bCol2, y + 14.5);

  // Banner Col 3: Gateway Ref
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('PAYMENT MODE & REF', bCol3, y + 5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`${payment.paymentMethod || 'Online'} • ${payment.gateway || 'Razorpay India'}`, bCol3, y + 9.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  const shortRef = payment.bankRef ? (payment.bankRef.length > 25 ? payment.bankRef.substring(0, 24) + '...' : payment.bankRef) : '-';
  doc.text(`Ref: ${shortRef}`, bCol3, y + 14.5);

  // ==========================================
  // 4. ITEMIZED FEE PARTICULARS TABLE (Y: 115 to 165)
  // ==========================================
  y = 115;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('ITEMIZED FEE PARTICULARS', margin, y);

  const tableData = [
    [
      '1',
      `${payment.batch?.name || 'Online Live Tuition Coaching'}\nLive interactive coaching sessions, academic materials, mock tests & mentoring\nSubject: ${payment.teacher?.subject || 'Academics'} | Code: ${payment.batch?.code || '-'}`,
      '999293',
      '1',
      formattedBase,
      '18%',
      formattedTotal,
    ],
  ];

  // Exact 190mm total width distribution
  autoTable(doc, {
    startY: y + 3,
    head: [['#', 'Description of Educational Services', 'SAC Code', 'Qty', 'Taxable Amount', 'GST Rate', 'Total (INR)']],
    body: tableData,
    theme: 'grid',
    margin: { left: margin, right: margin },
    headStyles: {
      fillColor: [18, 59, 102],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left',
      cellPadding: 3.5,
      valign: 'middle',
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 76 },
      2: { cellWidth: 22, halign: 'center' },
      3: { cellWidth: 14, halign: 'center' },
      4: { cellWidth: 24, halign: 'right' },
      5: { cellWidth: 18, halign: 'center' },
      6: { cellWidth: 26, halign: 'right', fontStyle: 'bold' },
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [15, 23, 42],
      cellPadding: 4.5,
      valign: 'middle',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  // ==========================================
  // 5. CALCULATION BREAKDOWN & DECLARATIONS (Y: ~170 to 240)
  // ==========================================
  y = doc.lastAutoTable.finalY + 6;
  const calcBoxWidth = 76;
  const calcBoxX = pageWidth - margin - calcBoxWidth;
  const wordsBoxWidth = contentWidth - calcBoxWidth - 6; // 108mm
  const lowerBoxHeight = 56;

  // Left Box Top: Amount in Words
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, wordsBoxWidth, 20, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('AMOUNT CHARGEABLE IN WORDS:', margin + 4, y + 6);

  doc.setFont('helvetica', 'bolditalic');
  doc.setFontSize(8.5);
  doc.setTextColor(18, 59, 102);
  const splitWords = doc.splitTextToSize(amountInWords, wordsBoxWidth - 8);
  doc.text(splitWords, margin + 4, y + 12);

  // Left Box Bottom: Disclosures & Legal Terms
  const termsY = y + 24;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('TAX INVOICE DISCLOSURES & TERMS:', margin, termsY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(100, 116, 139);

  const b1 = doc.splitTextToSize('• Educational coaching and digital learning services supplied under HSN/SAC Code 999293.', wordsBoxWidth);
  const b2 = doc.splitTextToSize('• This is a computer-generated tax invoice and receipt authorized electronically by TutorOn India.', wordsBoxWidth);
  const b3 = doc.splitTextToSize('• Subject to Mumbai Jurisdiction. For customer support or tax questions, email billing@tutoron.in.', wordsBoxWidth);
  const b4 = doc.splitTextToSize('• Fees once paid are subject to platform terms and conditions. Verified secure settlement.', wordsBoxWidth);

  doc.text(b1, margin, termsY + 6);
  doc.text(b2, margin, termsY + 12);
  doc.text(b3, margin, termsY + 18);
  doc.text(b4, margin, termsY + 24);

  // Right Box: Itemized Tax Calculation Table
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(calcBoxX, y, calcBoxWidth, lowerBoxHeight, 2, 2, 'FD');

  let calcY = y + 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  // Tuition Base Fee
  doc.text('Tuition Base Fee (Taxable):', calcBoxX + 4.5, calcY);
  doc.text(formattedBase, rightAlignX - 4.5, calcY, { align: 'right' });
  calcY += 7.5;

  // CGST
  doc.text('CGST (9%):', calcBoxX + 4.5, calcY);
  doc.text(formattedCgst, rightAlignX - 4.5, calcY, { align: 'right' });
  calcY += 7.5;

  // SGST
  doc.text('SGST (9%):', calcBoxX + 4.5, calcY);
  doc.text(formattedSgst, rightAlignX - 4.5, calcY, { align: 'right' });
  calcY += 7.5;

  // Total GST
  doc.text('Total GST (18%):', calcBoxX + 4.5, calcY);
  doc.text(formattedTotalGst, rightAlignX - 4.5, calcY, { align: 'right' });
  calcY += 8.5;

  // Grand Total Divider
  doc.setDrawColor(18, 59, 102);
  doc.setLineWidth(0.6);
  doc.line(calcBoxX + 4, calcY, rightAlignX - 4, calcY);
  calcY += 7.5;

  // Total Paid
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(18, 59, 102);
  doc.text('Total Paid:', calcBoxX + 4.5, calcY);
  doc.text(formattedTotal, rightAlignX - 4.5, calcY, { align: 'right' });

  // ==========================================
  // 6. FOOTER & DIGITAL SIGNATURE (Y: 250 to 284)
  // ==========================================
  const footerY = 250;

  // Divider Line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY, rightAlignX, footerY);

  // Left Footer: Digital Verification Badge
  const badgeY = footerY + 5;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, badgeY, 16, 16, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(18, 59, 102);
  doc.text('TUTORON', margin + 8, badgeY + 6.5, { align: 'center' });
  doc.setTextColor(22, 163, 74);
  doc.text('VERIFIED', margin + 8, badgeY + 11.5, { align: 'center' });

  // Verification Details next to badge
  const verX = margin + 19;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Digital Authenticity Verified', verX, badgeY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Transaction ID: ${payment.id || '-'}`, verX, badgeY + 9.5);
  doc.text(`Gateway Ref: ${payment.bankRef || '-'}`, verX, badgeY + 14.5);

  // Right Footer: Authorized Signatory
  doc.setFont('times', 'italic');
  doc.setFontSize(13);
  doc.setTextColor(18, 59, 102);
  doc.text('TutorOn Accounts', rightAlignX, badgeY + 5, { align: 'right' });

  doc.setDrawColor(100, 116, 139);
  doc.setLineWidth(0.3);
  doc.line(rightAlignX - 52, badgeY + 7.5, rightAlignX, badgeY + 7.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('AUTHORIZED SIGNATORY', rightAlignX, badgeY + 12, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('TutorOn India EdTech Private Limited', rightAlignX, badgeY + 16, { align: 'right' });

  // Bottom Notice
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text('This is an authentic computer-generated GST tax invoice • TutorOn India Operational Record', pageWidth / 2, 286, { align: 'center' });

  // Save the PDF
  const filename = customFilename || `TutorOn-Invoice-${payment.invoiceId || payment.id || 'doc'}.pdf`;
  doc.save(filename);
  return true;
}

/**
 * Opens a print window for the invoice formatted strictly for standard A4
 */
export function printInvoiceWindow(element) {
  if (!element) return;

  const printWindow = window.open('', '_blank', 'width=900,height=1000');
  if (!printWindow) {
    window.print();
    return;
  }

  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map((s) => s.outerHTML)
    .join('\n');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Tax Invoice - TutorOn India</title>
        ${styles}
        <style>
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body {
            background-color: #ffffff !important;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            font-family: 'Inter', -apple-system, sans-serif;
          }
        </style>
      </head>
      <body>
        <div style="padding: 0; max-width: 190mm; margin: 0 auto;">
          ${element.innerHTML}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 300);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
