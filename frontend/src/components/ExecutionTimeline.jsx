import React from 'react';
import { ExecutionStep } from './ExecutionStep';
import { StatusBadge } from './StatusBadge';
import { Clock, Layers, AlertOctagon, Brain, CheckCircle2 } from 'lucide-react';

export function ExecutionTimeline({
  status,
  executionId,
  elapsedMs,
  steps = [],
  currentThinkingStep = null,
  error = null,
}) {
  const failedCount = steps.filter((s) => s.status === 'FAILED').length;
  const isRunning = status === 'RUNNING';

  return (
    <div className="space-y-6">
      {/* Execution Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        
        {/* Status */}
        <div className="p-4 rounded-xl bg-card border border-sand shadow-soft">
          <span className="text-[10px] uppercase font-bold tracking-widest text-muted block mb-1">
            Agent Status
          </span>
          <div className="mt-1">
            <StatusBadge status={status} size="sm" />
          </div>
        </div>

        {/* Elapsed Time */}
        <div className="p-4 rounded-xl bg-card border border-sand shadow-soft">
          <span className="text-[10px] uppercase font-bold tracking-widest text-muted block mb-1">
            Elapsed Time
          </span>
          <div className="flex items-center gap-1.5 font-mono text-dark text-lg font-bold mt-0.5">
            <Clock className="w-4 h-4 text-terracotta" />
            <span>{(elapsedMs / 1000).toFixed(2)} s</span>
          </div>
        </div>

        {/* Steps Completed */}
        <div className="p-4 rounded-xl bg-card border border-sand shadow-soft">
          <span className="text-[10px] uppercase font-bold tracking-widest text-muted block mb-1">
            Steps Traced
          </span>
          <div className="flex items-center gap-1.5 font-mono text-dark text-lg font-bold mt-0.5">
            <Layers className="w-4 h-4 text-warmbrown" />
            <span>{steps.length}</span>
          </div>
        </div>

        {/* Errors */}
        <div className="p-4 rounded-xl bg-card border border-sand shadow-soft">
          <span className="text-[10px] uppercase font-bold tracking-widest text-muted block mb-1">
            Step Errors
          </span>
          <div className={`flex items-center gap-1.5 font-mono text-lg font-bold mt-0.5 ${
            failedCount > 0 ? 'text-[#B93826]' : 'text-[#3D7A5A]'
          }`}>
            <AlertOctagon className="w-4 h-4" />
            <span>{failedCount}</span>
          </div>
        </div>

      </div>

      {/* Timeline Steps Card */}
      <div className="bg-card rounded-2xl border border-sand p-6 sm:p-8 shadow-soft">
        <div className="flex items-center justify-between pb-5 border-b border-sand mb-6">
          <div>
            <h3 className="font-serif font-bold text-xl text-dark">
              Live Execution Trace
            </h3>
            <p className="text-xs text-muted font-light mt-0.5">
              Deterministic sequence of tool calls and sandbox responses
            </p>
          </div>
          {executionId && (
            <span className="text-xs font-mono text-muted bg-cream-200 px-3 py-1 rounded-full border border-sand">
              {executionId}
            </span>
          )}
        </div>

        {/* Steps List */}
        {steps.length === 0 && !isRunning && (
          <div className="py-12 text-center text-muted text-sm font-light">
            No execution steps recorded yet. Start an agent task above to begin live tracing.
          </div>
        )}

        <div className="space-y-4">
          {steps.map((step, idx) => (
            <ExecutionStep key={step.stepId || idx} step={step} index={idx} />
          ))}

          {/* Live Thinking Node */}
          {isRunning && (
            <div className="p-4 rounded-xl bg-[#FCF5E8] border border-[#EED7A1] text-xs text-[#B57414] flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-3">
                <Brain className="w-4 h-4 text-terracotta animate-spin" />
                <span className="font-medium">
                  Local LLM reasoning (Step {currentThinkingStep || steps.length + 1})...
                </span>
              </div>
              <span className="font-mono text-[11px]">Evaluating next action</span>
            </div>
          )}
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mt-6 p-4 rounded-xl bg-[#FCEFEB] border border-[#F2BEB6] text-xs text-[#B93826] flex items-start gap-3">
            <AlertOctagon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-sm mb-0.5">Execution Loop Error</span>
              <p>{error}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default ExecutionTimeline;
