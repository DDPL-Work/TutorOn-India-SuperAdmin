import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FiArrowLeft,
  FiShield,
  FiFileText,
  FiLayers,
} from 'react-icons/fi';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { INITIAL_AUDIT_LOGS } from '../../data/auditLogs';

export function AuditLogDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const log = INITIAL_AUDIT_LOGS.find((l) => l.id === id) || null;

  if (!log) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate('/audit-logs')}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back to Audit Logs
        </button>
        <EmptyState
          icon={FiShield}
          title="Audit Entry Not Found"
          description={`No audit record exists for reference ${id}.`}
          action={
            <Button variant="primary" size="sm" onClick={() => navigate('/audit-logs')}>
              Return to Audit Logs Directory
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
            <Link to="/audit-logs" className="hover:text-[#123B66] hover:underline font-medium">
              Audit Logs
            </Link>
          </li>
          <li className="text-slate-400">/</li>
          <li className="font-semibold text-slate-800 font-mono">{log.id}</li>
        </ol>
      </nav>

      {/* Header and Details Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold font-geist text-slate-900 tracking-tight">
                Audit Inspection: <span className="font-mono text-[#123B66]">{log.id}</span>
              </h1>
              <Badge variant="navy" size="sm" className="font-mono">
                {log.category}
              </Badge>
              <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {log.timestamp}
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Action: <strong className="text-slate-900">{log.action}</strong> • Authorized by{' '}
              <span className="font-medium text-slate-800">{log.admin}</span>
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/audit-logs')}
            leftIcon={<FiArrowLeft className="w-3.5 h-3.5" />}
          >
            Back to Directory
          </Button>
        </div>
      </div>

      {/* Main Grid: Parameters & State Diff */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Event Context & State Diff Visualizer */}
        <div className="lg:col-span-2 space-y-6">
          {/* Administrative Justification Box */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3 text-xs">
            <h2 className="text-sm font-semibold font-geist text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <FiFileText className="w-4 h-4 text-[#123B66]" />
              <span>Administrative Justification & Audit Reason</span>
            </h2>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 leading-relaxed font-sans text-xs">
              {log.reason}
            </div>
          </div>

          {/* State Diff Visualizer: Before State vs After State */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h2 className="text-sm font-semibold font-geist text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <FiLayers className="w-4 h-4 text-[#123B66]" />
              <span>State Transition Inspection (Before vs After)</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              {/* Previous State */}
              <div className="bg-rose-50/50 border border-rose-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-rose-200/60">
                  <span className="font-bold text-rose-900 uppercase tracking-wider text-[10px]">
                    Previous State (Before)
                  </span>
                  <span className="text-[10px] text-rose-600 font-sans">Prior to change</span>
                </div>
                <pre className="text-slate-800 text-[11px] whitespace-pre-wrap overflow-x-auto leading-relaxed">
                  {JSON.stringify(log.previousState, null, 2)}
                </pre>
              </div>

              {/* New State */}
              <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60">
                  <span className="font-bold text-emerald-900 uppercase tracking-wider text-[10px]">
                    New State (After Mutation)
                  </span>
                  <span className="text-[10px] text-emerald-600 font-sans">Authorized state</span>
                </div>
                <pre className="text-slate-800 text-[11px] whitespace-pre-wrap overflow-x-auto leading-relaxed">
                  {JSON.stringify(log.newState, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Technical Entity Reference */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4 text-xs">
            <h2 className="text-sm font-semibold font-geist text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <FiShield className="w-4 h-4 text-[#123B66]" />
              <span>Technical Entity Mapping</span>
            </h2>

            <div className="space-y-3">
              <div>
                <span className="text-slate-500 block text-[11px]">Audit Log Reference</span>
                <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">{log.id}</span>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">Target User ID</span>
                <span className="font-mono font-bold text-[#123B66] text-sm mt-0.5 block">
                  {log.userId}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">Related Entity</span>
                <span className="font-medium text-slate-800 mt-0.5 block">{log.relatedEntity}</span>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">Originating IP Address</span>
                <span className="font-mono text-slate-700 mt-0.5 block">{log.ipAddress}</span>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">Timestamp (IST)</span>
                <span className="font-mono text-slate-700 mt-0.5 block">{log.timestamp}</span>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-500 block text-[11px]">Integrity Signature</span>
                <span className="font-mono text-[10px] text-slate-400 break-all block mt-0.5">
                  SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuditLogDetails;
