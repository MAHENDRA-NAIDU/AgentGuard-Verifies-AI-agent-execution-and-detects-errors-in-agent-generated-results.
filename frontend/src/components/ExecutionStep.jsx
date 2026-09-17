import React, { useState } from 'react';
import { StatusBadge } from './StatusBadge';
import { Calculator, FileText, Database, FileOutput, Clock, ChevronDown, ChevronUp, AlertCircle, Code } from 'lucide-react';

export function ExecutionStep({ step, index }) {
  const [expanded, setExpanded] = useState(true);

  const toolIcons = {
    calculator: Calculator,
    file_writer: FileOutput,
    file_reader: FileText,
    database_query: Database,
  };

  const Icon = toolIcons[step.tool] || Code;
  const isFailed = step.status === 'FAILED';

  return (
    <div className={`rounded-xl border transition-all ${
      isFailed
        ? 'bg-[#FDF8F7] border-[#F2BEB6]'
        : 'bg-card border-sand hover:border-warmbrown/50'
    }`}>
      {/* Step Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between p-4 sm:p-5 cursor-pointer select-none"
      >
        <div className="flex items-center gap-3.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
            isFailed
              ? 'bg-[#FCEFEB] border-[#F2BEB6] text-[#B93826]'
              : 'bg-cream-200 border-sand text-warmbrown'
          }`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-terracotta uppercase">
                Step {String(step.stepId || index + 1).padStart(2, '0')}
              </span>
              <span className="text-dark font-serif font-bold text-base">
                {step.tool}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted mt-0.5">
              {step.duration !== undefined && (
                <span className="flex items-center gap-1 font-mono text-[11px]">
                  <Clock className="w-3 h-3 text-muted" />
                  {step.duration} ms
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={step.status} size="xs" />
          <button className="text-muted hover:text-dark p-1">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Step Details */}
      {expanded && (
        <div className="px-4 sm:px-5 pb-5 pt-2 border-t border-sand/60 space-y-3.5 text-xs">
          
          {/* Input Block */}
          <div>
            <span className="font-semibold text-muted text-[11px] uppercase tracking-wider block mb-1.5">
              Input Parameters
            </span>
            <div className="p-3 rounded-lg bg-cream-100/90 border border-sand/70 font-mono text-dark overflow-x-auto text-[11px]">
              {typeof step.input === 'object' ? (
                <pre className="whitespace-pre-wrap">{JSON.stringify(step.input, null, 2)}</pre>
              ) : (
                String(step.input)
              )}
            </div>
          </div>

          {/* Output / Error Block */}
          {step.status === 'RUNNING' ? (
            <div className="p-3 rounded-lg bg-[#F8E9E3] border border-[#E5D8C8] text-terracotta font-medium flex items-center gap-2 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-terracotta" />
              <span>Executing tool and capturing trace output...</span>
            </div>
          ) : isFailed ? (
            <div>
              <span className="font-semibold text-[#B93826] text-[11px] uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Execution Failure
              </span>
              <div className="p-3 rounded-lg bg-[#FCEFEB] border border-[#F2BEB6] text-[#B93826] font-mono text-[11px]">
                {step.error || 'Tool reported an unhandled execution failure.'}
              </div>
            </div>
          ) : (
            <div>
              <span className="font-semibold text-[#3D7A5A] text-[11px] uppercase tracking-wider block mb-1.5">
                Output Result
              </span>
              <div className="p-3 rounded-lg bg-[#EAF3ED]/60 border border-[#B8D9C5] text-dark font-mono text-[11px] overflow-x-auto">
                <pre className="whitespace-pre-wrap">{JSON.stringify(step.output, null, 2)}</pre>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

export default ExecutionStep;
