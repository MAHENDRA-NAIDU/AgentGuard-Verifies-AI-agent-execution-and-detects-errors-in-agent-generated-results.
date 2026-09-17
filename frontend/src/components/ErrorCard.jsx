import React from 'react';
import { AlertTriangle, AlertCircle, ArrowRight, Lightbulb, Check, X } from 'lucide-react';

export function ErrorCard({ error }) {
  const severityColors = {
    CRITICAL: 'bg-[#B93826] text-white',
    HIGH: 'bg-[#D85C3A] text-white',
    MEDIUM: 'bg-[#B57414] text-white',
    LOW: 'bg-warmbrown text-white',
  };

  const formattedType = (error.type || 'EXECUTION_ANOMALY').replace(/_/g, ' ');

  return (
    <div className="rounded-xl bg-card border border-[#F2BEB6] p-5 shadow-soft space-y-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-sand">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#FCEFEB] text-[#B93826] flex items-center justify-center">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <span className="font-serif font-bold text-dark text-base tracking-tight">
              {formattedType}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {error.stepId && (
            <span className="px-2.5 py-0.5 rounded-md bg-cream-200 text-dark font-mono text-[11px] font-semibold border border-sand">
              Step {String(error.stepId).padStart(2, '0')}
            </span>
          )}
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${severityColors[error.severity] || severityColors.MEDIUM}`}>
            {error.severity || 'MEDIUM'} SEVERITY
          </span>
        </div>
      </div>

      {/* Expected vs Actual Box */}
      {(error.expected || error.actual) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-[#EAF3ED]/60 border border-[#B8D9C5]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#3D7A5A] block mb-1 flex items-center gap-1">
              <Check className="w-3 h-3" /> Expected Behavior
            </span>
            <p className="font-mono text-dark text-[11px]">{error.expected || 'Valid execution'}</p>
          </div>
          <div className="p-3 rounded-lg bg-[#FCEFEB]/80 border border-[#F2BEB6]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#B93826] block mb-1 flex items-center gap-1">
              <X className="w-3 h-3" /> Actual Behavior
            </span>
            <p className="font-mono text-[#B93826] text-[11px] font-semibold">{error.actual || 'Anomalous behavior detected'}</p>
          </div>
        </div>
      )}

      {/* Explanation */}
      <div className="text-xs text-muted leading-relaxed font-light">
        <span className="font-bold text-dark block mb-0.5">Explanation:</span>
        <p>{error.explanation}</p>
      </div>

      {/* Recommendation */}
      {error.recommendation && (
        <div className="p-3 rounded-lg bg-cream-100 border border-sand flex items-start gap-2.5 text-xs text-dark">
          <Lightbulb className="w-4 h-4 text-terracotta flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-dark block text-[11px] uppercase tracking-wider">
              Recommendation
            </span>
            <p className="text-muted text-xs font-light mt-0.5">{error.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ErrorCard;
