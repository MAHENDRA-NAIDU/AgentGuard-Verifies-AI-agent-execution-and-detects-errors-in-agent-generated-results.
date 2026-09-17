import React, { useEffect, useState } from 'react';
import { useAgentExecution } from '../hooks/useAgentExecution';
import { TaskInput } from '../components/TaskInput';
import { ExecutionTimeline } from '../components/ExecutionTimeline';
import { VerificationReport } from '../components/VerificationReport';
import { Link } from 'react-router-dom';
import { ShieldCheck, History, ExternalLink, RotateCcw, Activity } from 'lucide-react';
import { getExecutions } from '../services/api';

export function Dashboard() {
  const {
    status,
    executionId,
    taskText,
    steps,
    currentThinkingStep,
    verificationStatus,
    verificationReport,
    finalResponse,
    error,
    elapsedMs,
    executeTask,
    reset,
  } = useAgentExecution();

  const [recentRuns, setRecentRuns] = useState([]);

  const fetchRecent = async () => {
    try {
      const data = await getExecutions({ limit: 5 });
      setRecentRuns(data.executions || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchRecent();
  }, [status]);

  const isRunning = status === 'RUNNING';
  const hasResults = steps.length > 0 || verificationReport || finalResponse || error;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-sand">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-terracotta">
            Agent Control Center
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-dark tracking-tight mt-1">
            Execution Monitor & Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {hasResults && !isRunning && (
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cream-200 border border-sand text-dark text-xs font-semibold hover:bg-cream-300 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Task</span>
            </button>
          )}
          <Link
            to="/history"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-sand text-dark text-xs font-semibold hover:bg-cream-200 transition-all shadow-sm"
          >
            <History className="w-3.5 h-3.5 text-terracotta" />
            <span>View All History</span>
          </Link>
        </div>
      </div>

      {/* Task Input Section */}
      <TaskInput onSubmit={executeTask} isRunning={isRunning} />

      {/* Main Monitoring Section */}
      {hasResults && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Live Execution Steps */}
          <div className="lg:col-span-7 space-y-6">
            <ExecutionTimeline
              status={status}
              executionId={executionId}
              elapsedMs={elapsedMs}
              steps={steps}
              currentThinkingStep={currentThinkingStep}
              error={error}
            />

            {/* Agent Final Text Summary */}
            {finalResponse && (
              <div className="bg-card rounded-2xl border border-sand p-6 shadow-soft space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-terracotta block">
                  Agent Final Summary Response
                </span>
                <p className="text-dark text-sm leading-relaxed font-sans font-medium">
                  {finalResponse}
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Verification Engine Report */}
          <div className="lg:col-span-5 space-y-6 sticky top-28">
            <VerificationReport
              report={verificationReport}
              isVerifying={verificationStatus === 'VERIFYING'}
            />

            {/* Link to Full Details Page */}
            {executionId && !isRunning && (
              <div className="text-center pt-2">
                <Link
                  to={`/executions/${executionId}`}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-terracotta hover:text-terracotta-hover transition-colors"
                >
                  <span>Inspect Complete Trace Logs & Raw Payload</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Recent Runs Table if idle */}
      {!hasResults && recentRuns.length > 0 && (
        <div className="bg-card rounded-2xl border border-sand p-6 sm:p-8 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-sand">
            <h3 className="font-serif font-bold text-lg text-dark flex items-center gap-2">
              <Activity className="w-4 h-4 text-terracotta" />
              <span>Recent Agent Executions</span>
            </h3>
            <Link to="/history" className="text-xs text-terracotta hover:underline font-semibold">
              View All &rarr;
            </Link>
          </div>

          <div className="divide-y divide-sand/60">
            {recentRuns.map((run) => (
              <div key={run.executionId} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="truncate max-w-md">
                  <span className="font-medium text-dark block truncate font-sans">
                    {run.taskText}
                  </span>
                  <span className="text-[11px] font-mono text-muted">
                    {run.executionId} &bull; {new Date(run.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <Link
                  to={`/executions/${run.executionId}`}
                  className="px-3 py-1 rounded-full bg-cream-100 hover:bg-cream-200 border border-sand font-semibold text-dark text-[11px] flex-shrink-0"
                >
                  View Trace
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;
