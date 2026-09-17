import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getExecution, reverifyExecution } from '../services/api';
import { ExecutionStep } from '../components/ExecutionStep';
import { VerificationReport } from '../components/VerificationReport';
import { StatusBadge } from '../components/StatusBadge';
import { ArrowLeft, RefreshCw, Clock, Layers, Calendar, Terminal, ShieldCheck } from 'lucide-react';

export function ExecutionDetails() {
  const { executionId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reverifying, setReverifying] = useState(false);
  const [error, setError] = useState(null);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await getExecution(executionId);
      setData(res.execution);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch execution details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [executionId]);

  const handleReverify = async () => {
    try {
      setReverifying(true);
      const res = await reverifyExecution(executionId);
      if (res.report) {
        setData((prev) => ({
          ...prev,
          verificationReport: res.report,
          verificationStatus: res.report.status,
        }));
      }
    } catch (err) {
      alert(`Re-verification failed: ${err.message}`);
    } finally {
      setReverifying(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-muted">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-terracotta" />
        <p className="font-serif text-lg text-dark">Loading Execution Trace Details...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[#B93826]">Execution Not Found</h2>
        <p className="text-sm text-muted">{error || 'Could not retrieve data for ID: ' + executionId}</p>
        <Link
          to="/history"
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-cream-200 border border-sand text-dark font-semibold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to History</span>
        </Link>
      </div>
    );
  }

  const { steps = [], verificationReport } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Breadcrumb & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-sand">
        <div className="flex items-center gap-3">
          <Link
            to="/history"
            className="p-2 rounded-full bg-cream-200 border border-sand hover:bg-cream-300 text-dark transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-muted">EXECUTION</span>
              <span className="font-mono text-xs font-bold text-dark">{executionId}</span>
              <StatusBadge status={data.status} size="xs" />
              <StatusBadge status={data.verificationStatus} size="xs" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-dark mt-1">
              Execution Trace Inspector
            </h1>
          </div>
        </div>

        <button
          onClick={handleReverify}
          disabled={reverifying}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-card hover:bg-cream-200 border border-sand text-dark text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
        >
          <ShieldCheck className={`w-4 h-4 text-terracotta ${reverifying ? 'animate-spin' : ''}`} />
          <span>{reverifying ? 'Re-verifying...' : 'Re-run Verifier'}</span>
        </button>
      </div>

      {/* Task Banner */}
      <div className="bg-card rounded-2xl border border-sand p-6 shadow-soft space-y-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted block flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-terracotta" /> User Task
        </span>
        <p className="font-serif text-lg sm:text-xl font-bold text-dark">
          "{data.taskText}"
        </p>
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted pt-2 border-t border-sand/60">
          <span className="flex items-center gap-1.5 font-mono">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(data.createdAt || data.startedAt).toLocaleString()}
          </span>
          <span className="flex items-center gap-1.5 font-mono">
            <Clock className="w-3.5 h-3.5" />
            Total Duration: {data.totalDuration} ms
          </span>
          <span className="flex items-center gap-1.5 font-mono">
            <Layers className="w-3.5 h-3.5" />
            {steps.length} Tool Steps
          </span>
        </div>
      </div>

      {/* Main Grid: Steps + Verification */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Trace Steps Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-card rounded-2xl border border-sand p-6 sm:p-8 shadow-soft space-y-6">
            <h3 className="font-serif font-bold text-xl text-dark">
              Deterministic Step Traces ({steps.length})
            </h3>

            {steps.length === 0 ? (
              <p className="text-sm text-muted font-light">No tool steps were recorded for this execution.</p>
            ) : (
              <div className="space-y-4">
                {steps.map((step, idx) => (
                  <ExecutionStep key={step.stepId || idx} step={step} index={idx} />
                ))}
              </div>
            )}

            {data.finalResponse && (
              <div className="p-4 rounded-xl bg-cream-100 border border-sand space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted block">
                  Agent Final Output Summary
                </span>
                <p className="text-xs text-dark font-medium leading-relaxed font-sans">
                  {data.finalResponse}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Verification Column */}
        <div className="lg:col-span-5 space-y-6 sticky top-28">
          <VerificationReport report={verificationReport} />
        </div>

      </div>

    </div>
  );
}

export default ExecutionDetails;
