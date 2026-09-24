import { useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FiArrowLeft,
  FiCreditCard,
  FiExternalLink,
  FiShield,
  FiDownload,
  FiFileText,
  FiPrinter,
  FiCheckCircle,
  FiUser,
  FiBookOpen,
  FiCopy,
  FiCheck,
} from 'react-icons/fi';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import InvoiceTemplate from '../../components/payments/InvoiceTemplate';
import { downloadInvoicePdf, printInvoiceWindow } from '../../utils/invoicePdf';
import { INITIAL_PAYMENTS } from '../../data/payments';

export function PaymentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  const modalInvoiceRef = useRef(null);

  const payment = INITIAL_PAYMENTS.find((p) => p.id === id) || null;

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadInvoice = async () => {
    try {
      setIsDownloading(true);
      const filename = `TutorOn-Invoice-${payment?.invoiceId || payment?.id || 'doc'}.pdf`;
      await downloadInvoicePdf(payment, filename);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (error) {
      console.error('Failed to generate invoice PDF:', error);
      alert('Unable to generate invoice PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrintInvoice = () => {
    const targetElement = modalInvoiceRef.current;
    if (targetElement) {
      printInvoiceWindow(targetElement);
    }
  };

  if (!payment) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate('/payments')}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back to Payments
        </button>
        <EmptyState
          icon={FiCreditCard}
          title="Transaction Not Found"
          description={`No payment record exists with transaction ID ${id}.`}
          action={
            <Button variant="primary" size="sm" onClick={() => navigate('/payments')}>
              Back to Payments Directory
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-slate-200">
        <div className="space-y-1.5">
          <nav aria-label="Breadcrumb" className="flex items-center text-xs">
            <ol className="flex items-center gap-1.5 text-slate-500 flex-wrap">
              <li>
                <Link to="/dashboard" className="hover:text-[#123B66] hover:underline font-medium">
                  Dashboard
                </Link>
              </li>
              <li className="text-slate-400">/</li>
              <li>
                <Link to="/payments" className="hover:text-[#123B66] hover:underline font-medium">
                  Payments
                </Link>
              </li>
              <li className="text-slate-400">/</li>
              <li className="font-semibold text-slate-800 font-mono">{payment.id}</li>
            </ol>
          </nav>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold font-geist text-slate-900">
              Transaction Details
            </h1>
            <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 font-medium">
              {payment.id}
            </span>
            <StatusBadge status={payment.status} />
          </div>
        </div>

        {/* Top Header Quick Actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/payments')}
            leftIcon={<FiArrowLeft className="w-3.5 h-3.5" />}
            className="text-xs text-slate-700 hover:bg-slate-50"
          >
            Back
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsPreviewOpen(true)}
            leftIcon={<FiFileText className="w-3.5 h-3.5 text-[#123B66]" />}
            className="text-xs bg-white hover:bg-slate-50 border-slate-200 text-slate-800"
          >
            Preview Invoice
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleDownloadInvoice}
            isLoading={isDownloading}
            leftIcon={<FiDownload className="w-3.5 h-3.5" />}
            className="text-xs bg-[#123B66] hover:bg-[#0B1F3A] text-white shadow-2xs"
          >
            Download PDF
          </Button>
        </div>
      </div>

      {/* Main Content Layout (2 Columns on Large Screens) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Financial Breakdown & Participant Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Amount & Financial Settlement Summary */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-[#123B66] rounded-lg">
                  <FiCreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold font-geist text-slate-900 leading-none">
                    Financial Settlement Summary
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Complete fee and taxation breakdown for transaction
                  </p>
                </div>
              </div>
              <span className="font-mono text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                {payment.currency} INR
              </span>
            </div>

            {/* Big Amount Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-gradient-to-r from-slate-50 to-blue-50/40 rounded-xl border border-slate-200/80 gap-4">
              <div>
                <span className="text-xs text-slate-500 font-medium block">
                  Total Transaction Amount (Gross)
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-bold font-geist text-slate-900 tracking-tight">
                    {payment.amount}
                  </span>
                  <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    18% GST Inclusive
                  </span>
                </div>
              </div>

              <div className="sm:text-right space-y-1">
                <span className="text-xs text-slate-500 font-medium block">
                  Payment Mode & Gateway
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-lg border border-slate-200 text-xs font-bold text-[#123B66] shadow-2xs">
                  <span>{payment.paymentMethod}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-600 font-normal">{payment.gateway}</span>
                </span>
              </div>
            </div>

            {/* Itemized Fee Distribution Matrix */}
            <div className="space-y-2.5 pt-1 text-xs">
              <h3 className="font-semibold text-slate-800 text-xs">
                Itemized Settlement Distribution
              </h3>
              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span>Tuition Base Fee (Taxable Subtotal):</span>
                  </span>
                  <span className="font-mono font-semibold text-slate-900">
                    {payment.feeBreakdown.tuitionFee}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>Goods & Services Tax (GST 18%):</span>
                  </span>
                  <span className="font-mono font-semibold text-slate-900">
                    {payment.feeBreakdown.gst}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>TutorOn Platform Commission (10%):</span>
                  </span>
                  <span className="font-mono font-semibold text-slate-900">
                    {payment.feeBreakdown.platformCommission}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-900 font-bold pt-3 border-t border-slate-200/90">
                  <span className="flex items-center gap-1.5 text-emerald-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Net Faculty Payout Allocation:</span>
                  </span>
                  <span className="font-mono text-base text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                    {payment.feeBreakdown.teacherDisbursement}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Student & Faculty Linked Entities */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
                  <FiUser className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold font-geist text-slate-900 leading-none">
                    Participant & Enrollment Info
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Student payer profile and enrolled course batch details
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Student Payee Card */}
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">
                    Student Payee
                  </span>
                  <span className="font-mono text-[11px] text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 font-medium">
                    {payment.student.id}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src={payment.student.avatar}
                    alt={payment.student.name}
                    className="w-11 h-11 rounded-full object-cover border border-slate-300 shadow-2xs shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm truncate">
                      {payment.student.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate">
                      {payment.student.email}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-600 space-y-1">
                  <p className="flex justify-between">
                    <span className="text-slate-500">Contact:</span>
                    <span className="font-medium text-slate-800">{payment.student.phone}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-500">Billing Address:</span>
                    <span className="font-medium text-slate-800">Maharashtra (27)</span>
                  </p>
                </div>
              </div>

              {/* Enrolled Course / Cohort Card */}
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">
                      Enrolled Cohort
                    </span>
                    <span className="font-mono text-[11px] text-[#123B66] bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-medium">
                      {payment.batch.code}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                    {payment.batch.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Faculty: <span className="font-medium text-slate-800">{payment.teacher.name}</span> • {payment.teacher.subject}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => navigate(`/enrollments/${payment.enrollmentId}`)}
                    className="w-full py-2 px-3 bg-white hover:bg-slate-100 text-[#123B66] rounded-lg border border-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <span>View Enrollment Application ({payment.enrollmentId})</span>
                    <FiExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Gateway Technical Details & Invoice Card */}
        <div className="space-y-6">
          {/* Card 1: Gateway Technical Details */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-slate-100 text-[#123B66] rounded-md">
                  <FiShield className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-semibold font-geist text-slate-900">
                  Gateway Details
                </h2>
              </div>
              <StatusBadge status={payment.status} />
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-500">Transaction ID:</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(payment.id, 'txId')}
                  className="font-mono font-bold text-slate-900 hover:text-[#123B66] flex items-center gap-1 cursor-pointer"
                  title="Click to copy"
                >
                  <span>{payment.id}</span>
                  {copiedKey === 'txId' ? (
                    <FiCheck className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <FiCopy className="w-3 h-3 text-slate-400" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-500">Processor:</span>
                <span className="font-semibold text-slate-800">{payment.gateway}</span>
              </div>

              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-500">Bank Ref (RRN):</span>
                <span className="font-mono text-slate-800 text-[11px] truncate max-w-[170px]" title={payment.bankRef}>
                  {payment.bankRef}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-500">Invoice Ref:</span>
                <span className="font-mono font-bold text-[#123B66]">{payment.invoiceId}</span>
              </div>

              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-500">Enrollment ID:</span>
                <button
                  type="button"
                  onClick={() => navigate(`/enrollments/${payment.enrollmentId}`)}
                  className="font-mono font-bold text-[#123B66] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>{payment.enrollmentId}</span>
                  <FiExternalLink className="w-3 h-3 text-[#123B66]" />
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Invoice & Receipts Card (Polished Header, Sleek Badge, Clean Single-Line Buttons) */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-2 bg-blue-50 text-[#123B66] rounded-lg shrink-0">
                  <FiFileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold font-geist text-slate-900 leading-tight truncate">
                    Invoice & Receipts
                  </h2>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    GST tax invoice document
                  </p>
                </div>
              </div>

              {/* Single-line sleek GST Ready Badge */}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full shrink-0 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                GST Ready
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Official GST-compliant tax invoice and settlement receipt configured for standard A4 printing.
            </p>

            {/* Info Summary Box */}
            <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Invoice No:</span>
                <span className="font-mono font-bold text-slate-900">{payment.invoiceId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Date Issued:</span>
                <span className="font-medium text-slate-800">{payment.date}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Format:</span>
                <span className="font-mono text-[11px] text-slate-700">Standard A4 (1-Page)</span>
              </div>
            </div>

            {/* Action Buttons: Clean, Single-Line, Professional */}
            <div className="space-y-2.5 pt-1">
              <Button
                variant="primary"
                fullWidth
                size="md"
                leftIcon={<FiDownload className="w-4 h-4" />}
                isLoading={isDownloading}
                onClick={handleDownloadInvoice}
                className="bg-[#123B66] hover:bg-[#0B1F3A] text-white text-xs h-10 font-semibold shadow-2xs whitespace-nowrap justify-center"
              >
                {isDownloading ? 'Generating PDF...' : 'Download Invoice (PDF)'}
              </Button>

              <Button
                variant="secondary"
                fullWidth
                size="md"
                leftIcon={<FiFileText className="w-4 h-4 text-[#123B66]" />}
                onClick={() => setIsPreviewOpen(true)}
                className="bg-white hover:bg-slate-50 border-slate-200 text-slate-800 text-xs h-10 font-semibold shadow-2xs whitespace-nowrap justify-center"
              >
                Preview Invoice Template
              </Button>
            </div>

            {downloadSuccess && (
              <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 p-3 rounded-lg border border-emerald-200 animate-fade-in font-medium">
                <FiCheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Invoice downloaded successfully!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={`Tax Invoice - ${payment.invoiceId}`}
        description={`Issued for ${payment.student.name} • ${payment.amount}`}
        size="xl"
        footer={
          <div className="flex items-center justify-between w-full text-xs">
            <div className="text-slate-500 hidden sm:block">
              Official Tax Invoice • TutorOn India EdTech Pvt. Ltd. (A4 Format)
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<FiPrinter className="w-4 h-4" />}
                onClick={handlePrintInvoice}
              >
                Print Invoice
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<FiDownload className="w-4 h-4" />}
                isLoading={isDownloading}
                onClick={handleDownloadInvoice}
                className="bg-[#123B66] hover:bg-[#0B1F3A] text-white"
              >
                {isDownloading ? 'Downloading...' : 'Download PDF'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPreviewOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        }
      >
        <div className="py-2 overflow-x-auto">
          <InvoiceTemplate ref={modalInvoiceRef} payment={payment} />
        </div>
      </Modal>
    </div>
  );
}

export default PaymentDetails;
