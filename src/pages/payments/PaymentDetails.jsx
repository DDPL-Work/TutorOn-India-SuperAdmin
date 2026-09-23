import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FiArrowLeft,
  FiCreditCard,
  FiClock,
  FiExternalLink,
  FiShield,
} from 'react-icons/fi';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { INITIAL_PAYMENTS } from '../../data/payments';

export function PaymentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const payment = INITIAL_PAYMENTS.find((p) => p.id === id) || null;

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
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center text-xs">
        <ol className="flex items-center gap-1.5 text-slate-500">
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

      

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Transaction Breakdown & Financials (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Amount & Settlement Box */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-semibold font-geist text-slate-900 flex items-center gap-2">
                <FiCreditCard className="w-4 h-4 text-[#123B66]" />
                <span>Financial Settlement Summary</span>
              </h2>
              <span className="font-mono text-xs text-slate-500">{payment.currency} Currency</span>
            </div>

            <div className="flex items-baseline justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <span className="text-xs text-slate-500 block">Total Transaction Amount</span>
                <span className="text-3xl font-bold font-geist text-slate-900 mt-1 block">
                  {payment.amount}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">Payment Method</span>
                <span className="text-sm font-bold text-[#123B66] mt-1 block">
                  {payment.paymentMethod}
                </span>
              </div>
            </div>

            {/* GST & Fee Breakdown */}
            <div className="space-y-2 pt-2 text-xs">
              <h3 className="font-semibold text-slate-800">Itemized Fee Distribution</h3>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex justify-between text-slate-600">
                  <span>Tuition Base Fee:</span>
                  <span className="font-mono font-medium text-slate-900">
                    {payment.feeBreakdown.tuitionFee}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Goods & Services Tax (GST):</span>
                  <span className="font-mono font-medium text-slate-900">
                    {payment.feeBreakdown.gst}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>TutorOn Platform Commission:</span>
                  <span className="font-mono font-medium text-slate-900">
                    {payment.feeBreakdown.platformCommission}
                  </span>
                </div>
                <div className="flex justify-between text-slate-800 font-bold pt-2 border-t border-slate-200">
                  <span>Net Teacher Payout Allocation:</span>
                  <span className="font-mono text-emerald-700">
                    {payment.feeBreakdown.teacherDisbursement}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Student & Faculty Linked Entities */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h2 className="text-sm font-semibold font-geist text-slate-900 border-b border-slate-100 pb-3">
              Participant Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Student Card */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[11px] text-slate-500 block uppercase font-mono tracking-wider">
                  Student Payee
                </span>
                <div className="flex items-center gap-2.5">
                  <img
                    src={payment.student.avatar}
                    alt={payment.student.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="font-semibold text-slate-900">{payment.student.name}</h3>
                    <span className="font-mono text-[10px] text-slate-400">{payment.student.id}</span>
                  </div>
                </div>
                <div className="pt-2 text-[11px] text-slate-600 space-y-0.5">
                  <p>Email: {payment.student.email}</p>
                  <p>Phone: {payment.student.phone}</p>
                </div>
              </div>

              {/* Batch & Teacher Card */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[11px] text-slate-500 block uppercase font-mono tracking-wider">
                  Enrolled Cohort
                </span>
                <div>
                  <h3 className="font-semibold text-slate-900 line-clamp-1">{payment.batch.name}</h3>
                  <span className="font-mono text-[10px] text-slate-500 block mt-0.5">
                    {payment.batch.code} • Faculty: {payment.teacher.name}
                  </span>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/enrollments/${payment.enrollmentId}`)}
                    className="text-[#1D4ED8] hover:underline flex items-center gap-1 font-semibold text-xs cursor-pointer"
                  >
                    <span>View Enrollment Application ({payment.enrollmentId})</span>
                    <FiExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Gateway & Reference Specs (1 Col) */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h2 className="text-sm font-semibold font-geist text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <FiShield className="w-4 h-4 text-[#123B66]" />
              <span>Gateway Technical Details</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction ID:</span>
                <span className="font-mono font-medium text-slate-900">{payment.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gateway Processor:</span>
                <span className="font-medium text-slate-800">{payment.gateway}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bank Reference (RRN):</span>
                <span className="font-mono text-slate-800 text-[11px]">{payment.bankRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice Reference:</span>
                <span className="font-mono text-slate-800 text-[11px]">{payment.invoiceId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Associated Enrollment:</span>
                <span className="font-mono font-bold text-[#123B66]">{payment.enrollmentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Settlement Status:</span>
                <StatusBadge status={payment.status} />
              </div>
            </div>
          </div>

          
        </div>
      </div>
    </div>
  );
}

export default PaymentDetails;
