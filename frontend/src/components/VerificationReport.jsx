import React from 'react';
import { ErrorCard } from './ErrorCard';
import { StatusBadge } from './StatusBadge';
import { ShieldCheck, AlertTriangle, XCircle, CheckCircle2, Award, ListChecks, Sparkles } from 'lucide-react';

export function VerificationReport({ report, isVerifying = false }) {
  if (isVerifying) {
    return (
      <div className="bg-card rounded-2xl border border-sand p-8 text-center space-y-4 shadow-soft">
        <div className="w-12 h-12 rounded-full bg-[#FCF5E8] border border-[#EED7A1] text-[#B57414] mx-auto flex items-center justify-center animate-spin">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-serif font-bold text-xl text-dark">Verification Engine Active</h3>
          <p className="text-xs text-muted font-light mt-1">
            Running 8 deterministic rule checks and evaluating mathematical & execution integrity...
          </p>
        </div>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  const isVerified = report.verified === true;
  const isPartial = report.status === 'PARTIAL';
  const isFailed = report.status === 'FAILED';

  return (
    <div className="bg-card rounded-2xl border border-sand p-6 sm:p-8 shadow-elevated space-y-8">
      
      {/* Top Banner & Score */}
      <div className={`p-6 sm:p-8 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-6 ${
        isVerified
          ? 'bg-[#EAF3ED]/80 border-[#B8D9C5]'
          : isPartial
          ? 'bg-[#FCF5E8]/80 border-[#EED7A1]'
          : 'bg-[#FCEFEB]/80 border-[#F2BEB6]'
      }`}>
        
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            {isVerified ? (
              <div className="w-10 h-10 rounded-xl bg-[#3D7A5A] text-white flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-[#B93826] text-white flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
              </div>
            )}
            <div>
              <h2 className="font-serif font-bold text-2xl sm:text-3xl text-dark tracking-tight">
                {isVerified ? 'Verification Passed' : isPartial ? 'Partial Verification' : 'Verification Failed'}
              </h2>
              <p className="text-xs sm:text-sm text-muted font-light">
                {isVerified
                  ? 'All execution traces strictly verified against task requirements and deterministic rules.'
                  : `AgentGuard detected ${report.errorCount} anomaly in the agent execution trace.`}
              </p>
            </div>
          </div>
        </div>

        {/* Score Gauge Badge */}
        <div className="flex items-center gap-4 bg-card/90 px-6 py-4 rounded-xl border border-sand shadow-sm self-start md:self-auto">
          <Award className="w-8 h-8 text-terracotta" />
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-muted block">
              Confidence Score
            </span>
            <span className="font-serif font-bold text-3xl text-dark">
              {report.score}%
            </span>
          </div>
        </div>

      </div>

      {/* Step Breakdown Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-cream-100 border border-sand">
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted block mb-0.5">Total Steps</span>
          <span className="font-serif font-bold text-xl text-dark">{report.totalSteps}</span>
        </div>
        <div className="p-4 rounded-xl bg-[#EAF3ED]/60 border border-[#B8D9C5]">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#3D7A5A] block mb-0.5">Successful</span>
          <span className="font-serif font-bold text-xl text-[#3D7A5A]">{report.successfulSteps}</span>
        </div>
        <div className="p-4 rounded-xl bg-[#FCEFEB]/60 border border-[#F2BEB6]">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#B93826] block mb-0.5">Failed Steps</span>
          <span className="font-serif font-bold text-xl text-[#B93826]">{report.failedSteps}</span>
        </div>
        <div className="p-4 rounded-xl bg-cream-100 border border-sand">
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted block mb-0.5">Detected Errors</span>
          <span className="font-serif font-bold text-xl text-terracotta">{report.errorCount}</span>
        </div>
      </div>

      {/* Error Cards Breakdown */}
      {report.errors && report.errors.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-serif font-bold text-xl text-dark flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#B93826]" />
            <span>Detected Verification Errors ({report.errors.length})</span>
          </h3>

          <div className="space-y-3">
            {report.errors.map((err, idx) => (
              <ErrorCard key={idx} error={err} />
            ))}
          </div>
        </div>
      )}

      {/* AI Verifier Explanation Note if available */}
      {report.aiVerification?.enabled && report.aiVerification?.explanation && (
        <div className="p-5 rounded-xl bg-cream-100 border border-sand space-y-2">
          <div className="flex items-center gap-2 text-dark font-serif font-bold text-sm">
            <Sparkles className="w-4 h-4 text-terracotta" />
            <span>Independent Verifier Assessment</span>
          </div>
          <p className="text-xs text-muted font-light leading-relaxed">
            {report.aiVerification.explanation}
          </p>
        </div>
      )}

      {/* Recommendations */}
      {report.recommendations && report.recommendations.length > 0 && (
        <div className="pt-4 border-t border-sand space-y-3">
          <h4 className="font-serif font-bold text-base text-dark flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-terracotta" />
            <span>Key Remediation Recommendations</span>
          </h4>
          <ul className="space-y-2 text-xs text-muted font-light">
            {report.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-terracotta mt-1.5 flex-shrink-0" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
}

export default VerificationReport;
