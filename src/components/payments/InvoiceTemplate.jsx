import { forwardRef } from 'react';
import tutorOnLogo from '../../assets/tutoron-logo.png';
import { numberToWordsINR } from '../../utils/formatters';
import { FiCheckCircle } from 'react-icons/fi';

export const InvoiceTemplate = forwardRef(function InvoiceTemplate({ payment }, ref) {
  if (!payment) return null;

  // Calculate numeric breakdown for CGST / SGST split

  const numAmount = payment.numericAmount || parseFloat(String(payment.amount).replace(/[^0-9.]/g, '')) || 0;
  const numBase = Math.round(numAmount / 1.18);
  const numGst = numAmount - numBase;
  const numCgst = Math.round(numGst / 2);
  const numSgst = numGst - numCgst;

  const formattedBaseFee = `₹${numBase.toLocaleString('en-IN')}`;
  const formattedCgst = `₹${numCgst.toLocaleString('en-IN')}`;
  const formattedSgst = `₹${numSgst.toLocaleString('en-IN')}`;
  const formattedTotalGst = `₹${numGst.toLocaleString('en-IN')}`;
  const amountInWords = numberToWordsINR(numAmount);

  return (
    <div
      ref={ref}
      id="invoice-document"
      className="bg-white text-slate-800 p-8 sm:p-10 max-w-[820px] mx-auto border border-slate-200 shadow-sm rounded-xl font-sans"
      style={{ minHeight: '1050px', backgroundColor: '#ffffff', color: '#0f172a' }}
    >
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b-2 border-slate-800 gap-4">
        {/* Left: Brand Logo & Tagline */}
        <div className="flex items-center gap-3.5">
          <img
            src={tutorOnLogo}
            alt="TutorOn India"
            className="h-14 w-14 object-contain shrink-0"
          />
          <div className="border-l border-slate-300 pl-3.5">
            <p className="text-[11px] font-bold tracking-wider uppercase text-[#123B66]">
              TutorOn India EdTech Pvt. Ltd.
            </p>
            <p className="text-[10px] text-slate-500 font-medium">
              Empowering Next-Gen Learners & Educators
            </p>
            <p className="text-[9px] text-slate-400 font-mono">GSTIN: 27AABCT8921M1Z8 | CIN: U80903MH2024PTC123456</p>
          </div>
        </div>

        {/* Right: Invoice Type & Status */}
        <div className="text-left sm:text-right">
          <span className="inline-block px-3 py-1 bg-[#123B66] text-white text-xs font-bold uppercase tracking-widest rounded-md">
            Tax Invoice / Receipt
          </span>
          <div className="mt-2 text-xs space-y-0.5">
            <p className="font-mono font-bold text-slate-900 text-sm">{payment.invoiceId || 'INV-2026-90412'}</p>
            <p className="text-slate-500 text-[11px]">Date: {payment.date}</p>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 mt-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold rounded-full">
              <FiCheckCircle className="w-3 h-3 text-emerald-600" />
              <span>Payment {payment.status || 'Successful'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Addresses & Particulars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-5 border-b border-slate-200 text-xs">
        {/* Company Address */}
        <div className="space-y-1 bg-slate-50 p-3.5 rounded-lg border border-slate-100">
          <p className="font-bold uppercase tracking-wider text-[10px] text-slate-500">Service Provider / Issued By:</p>
          <p className="font-bold text-slate-900 text-sm">TutorOn India EdTech Private Limited</p>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            Unit 402, Supreme Business Park, Hiranandani Gardens, Powai, Mumbai, Maharashtra - 400076, India
          </p>
          <div className="pt-1 text-[11px] text-slate-600 space-y-0.5 font-mono">
            <p><span className="text-slate-500">Email:</span> billing@tutoron.in</p>
            <p><span className="text-slate-500">Website:</span> www.tutoron.in</p>
            <p><span className="text-slate-500">State / Code:</span> Maharashtra (27)</p>
          </div>
        </div>

        {/* Student / Customer Address */}
        <div className="space-y-1 bg-slate-50 p-3.5 rounded-lg border border-slate-100">
          <p className="font-bold uppercase tracking-wider text-[10px] text-slate-500">Billed To (Student Payee):</p>
          <p className="font-bold text-slate-900 text-sm">{payment.student?.name || 'Student Name'}</p>
          <div className="pt-1 text-[11px] text-slate-600 space-y-0.5">
            <p><span className="text-slate-500 font-mono">Student ID:</span> <span className="font-mono font-medium text-slate-800">{payment.student?.id}</span></p>
            <p><span className="text-slate-500">Email:</span> {payment.student?.email}</p>
            <p><span className="text-slate-500">Phone:</span> {payment.student?.phone}</p>
            <p><span className="text-slate-500 font-mono">Enrollment Ref:</span> <span className="font-mono font-semibold text-[#123B66]">{payment.enrollmentId}</span></p>
          </div>
        </div>
      </div>

      {/* 3. Course & Gateway Summary Strip */}
      <div className="my-5 p-3.5 bg-blue-50/70 rounded-lg border border-blue-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Enrolled Course / Batch</span>
          <span className="font-semibold text-slate-900 block mt-0.5 text-xs line-clamp-1">{payment.batch?.name}</span>
          <span className="text-[10px] text-slate-500 font-mono">{payment.batch?.code} • {payment.teacher?.subject}</span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Faculty / Instructor</span>
          <span className="font-semibold text-slate-900 block mt-0.5 text-xs">{payment.teacher?.name}</span>
          <span className="text-[10px] text-slate-500 font-mono">ID: {payment.teacher?.id}</span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Payment Mode & Ref</span>
          <span className="font-semibold text-slate-900 block mt-0.5 text-xs">{payment.paymentMethod} • {payment.gateway}</span>
          <span className="text-[10px] text-slate-500 font-mono truncate block" title={payment.bankRef}>Ref: {payment.bankRef}</span>
        </div>
      </div>

      {/* 4. Itemized Particulars Table */}
      <div className="mt-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Itemized Fee Particulars</h4>
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3">Description of Educational Services</th>
                <th className="py-2.5 px-3 w-20 text-center">SAC Code</th>
                <th className="py-2.5 px-3 w-16 text-center">Qty</th>
                <th className="py-2.5 px-3 text-right">Taxable Amount</th>
                <th className="py-2.5 px-3 text-right">GST Rate</th>
                <th className="py-2.5 px-3 text-right w-28">Total (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr className="text-slate-800">
                <td className="py-3 px-3 text-center font-mono">1</td>
                <td className="py-3 px-3">
                  <p className="font-semibold text-slate-900">{payment.batch?.name || 'Online Live Tuition Classes'}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Live interactive coaching sessions, academic materials, mock tests & mentoring
                  </p>
                </td>
                <td className="py-3 px-3 text-center font-mono text-slate-600">999293</td>
                <td className="py-3 px-3 text-center font-mono">1</td>
                <td className="py-3 px-3 text-right font-mono font-medium">{formattedBaseFee}</td>
                <td className="py-3 px-3 text-right font-mono text-slate-600">18%</td>
                <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">{payment.amount}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Calculation Summary & Taxes Breakdown */}
      <div className="mt-4 flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
        {/* Amount in Words & Notes */}
        <div className="w-full sm:w-7/12 space-y-3">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-[10px] uppercase font-bold text-slate-500">Amount Chargeable in Words:</p>
            <p className="text-xs font-semibold text-slate-900 mt-0.5 italic">{amountInWords}</p>
          </div>

          <div className="text-[10px] text-slate-500 space-y-1">
            <p className="font-bold uppercase tracking-wider text-slate-600">Tax Invoice Disclosures & Terms:</p>
            <ul className="list-disc list-inside space-y-0.5 leading-relaxed text-slate-600">
              <li>Educational coaching and digital learning services supplied under HSN/SAC Code 999293.</li>
              <li>This is a computer-generated tax invoice and receipt authorized electronically by TutorOn India.</li>
              <li>Subject to Mumbai Jurisdiction. For customer support or tax questions, email <span className="font-mono text-slate-700">billing@tutoron.in</span>.</li>
            </ul>
          </div>
        </div>

        {/* Totals Table */}
        <div className="w-full sm:w-5/12">
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-3.5 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Tuition Base Fee (Taxable):</span>
              <span className="font-mono font-medium text-slate-900">{formattedBaseFee}</span>
            </div>
            <div className="flex justify-between text-slate-600 text-[11px]">
              <span>CGST (9%):</span>
              <span className="font-mono text-slate-800">{formattedCgst}</span>
            </div>
            <div className="flex justify-between text-slate-600 text-[11px]">
              <span>SGST (9%):</span>
              <span className="font-mono text-slate-800">{formattedSgst}</span>
            </div>
            <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-200">
              <span className="font-medium">Total GST (18%):</span>
              <span className="font-mono font-medium text-slate-900">{formattedTotalGst}</span>
            </div>
            <div className="flex justify-between items-center text-slate-900 font-bold text-sm pt-2 border-t-2 border-slate-800">
              <span>Total Paid:</span>
              <span className="font-mono text-base text-[#123B66]">{payment.amount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Footer / Signatory & QR Verification */}
      <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex flex-col items-center justify-center p-1 text-[8px] text-center font-mono font-bold text-slate-600">
            <span className="text-[#123B66]">TUTORON</span>
            <span className="text-emerald-600">VERIFIED</span>
          </div>
          <div className="text-[10px] text-slate-500">
            <p className="font-bold text-slate-700">Digital Authenticity Verified</p>
            <p>Transaction ID: <span className="font-mono">{payment.id}</span></p>
            <p>Gateway Ref: <span className="font-mono">{payment.bankRef}</span></p>
          </div>
        </div>

        <div className="text-center sm:text-right">
          <div className="inline-block border-b border-slate-400 pb-1 px-4 mb-1">
            <span className="font-serif italic font-semibold text-slate-800 text-sm">TutorOn Accounts</span>
          </div>
          <p className="text-[10px] font-bold text-slate-700 uppercase">Authorized Signatory</p>
          <p className="text-[9px] text-slate-400">TutorOn India EdTech Private Limited</p>
        </div>
      </div>
    </div>
  );
});

export default InvoiceTemplate;
