import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getExecutions } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { Search, Filter, RefreshCw, Calendar, Clock, Layers, ChevronRight, History as HistoryIcon, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function History() {
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVerification, setFilterVerification] = useState('ALL'); // ALL, VERIFIED, FAILED, PARTIAL
  const [totalCount, setTotalCount] = useState(0);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await getExecutions({
        search: searchTerm,
        verification: filterVerification,
        limit: 50,
      });
      setExecutions(data.executions || []);
      setTotalCount(data.total || 0);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [filterVerification]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHistory();
  };

  const filterTabs = [
    { label: 'All Executions', value: 'ALL' },
    { label: 'Verified', value: 'VERIFIED' },
    { label: 'Failed', value: 'FAILED' },
    { label: 'Partial', value: 'PARTIAL' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-sand">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-terracotta">
            Audit Trail
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-dark tracking-tight mt-1">
            Execution History
          </h1>
        </div>

        <button
          onClick={fetchHistory}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card hover:bg-cream-200 border border-sand text-dark text-xs font-semibold shadow-sm transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-terracotta ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-cream-200/80 rounded-full border border-sand overflow-x-auto">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterVerification(tab.value)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                filterVerification === tab.value
                  ? 'bg-card text-dark shadow-sm border border-sand'
                  : 'text-muted hover:text-dark'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by task description..."
            className="w-full pl-9 pr-4 py-2 rounded-full bg-card border border-sand text-xs text-dark focus:outline-none focus:ring-2 focus:ring-terracotta placeholder:text-muted/60"
          />
          <Search className="w-4 h-4 text-muted absolute left-3 top-2.5" />
        </form>
      </div>

      {/* Executions Table / Card List */}
      <div className="bg-card rounded-2xl border border-sand shadow-soft overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-muted space-y-2">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-terracotta" />
            <p className="font-serif text-sm">Fetching recorded execution logs...</p>
          </div>
        ) : executions.length === 0 ? (
          <div className="py-20 text-center text-muted space-y-3">
            <HistoryIcon className="w-10 h-10 mx-auto text-sand" />
            <p className="font-serif text-lg text-dark">No executions found</p>
            <p className="text-xs text-muted max-w-sm mx-auto font-light">
              There are no recorded executions matching your active filter criteria. Run a task from the dashboard.
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-terracotta text-white text-xs font-semibold mt-2"
            >
              <span>Go to Dashboard</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-sand/60">
            {executions.map((item) => (
              <div
                key={item.executionId}
                className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-cream-50 transition-colors"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-terracotta">
                      {item.executionId}
                    </span>
                    <StatusBadge status={item.status} size="xs" />
                    <StatusBadge status={item.verificationStatus} size="xs" />
                    {item.verificationScore !== null && (
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-cream-200 border border-sand text-dark">
                        Score: {item.verificationScore}%
                      </span>
                    )}
                  </div>

                  <h3 className="font-medium text-dark text-sm sm:text-base truncate font-sans">
                    "{item.taskText}"
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted font-light pt-1">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Calendar className="w-3 h-3 text-muted" />
                      {new Date(item.createdAt || item.startedAt).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Clock className="w-3 h-3 text-muted" />
                      {item.totalDuration || 0} ms
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Layers className="w-3 h-3 text-muted" />
                      {item.stepCount || 0} steps
                    </span>
                    {item.errorCount > 0 && (
                      <span className="flex items-center gap-1 font-mono text-[11px] text-[#B93826] font-semibold">
                        <AlertTriangle className="w-3 h-3" />
                        {item.errorCount} error(s)
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end lg:self-center flex-shrink-0">
                  <Link
                    to={`/executions/${item.executionId}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-cream-200 hover:bg-cream-300 border border-sand text-xs font-semibold text-dark transition-all"
                  >
                    <span>Inspect</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default History;
