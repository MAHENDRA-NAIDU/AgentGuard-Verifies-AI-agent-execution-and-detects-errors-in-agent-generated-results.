import React, { useState } from 'react';
import { Play, Sparkles, AlertCircle, Terminal, HelpCircle } from 'lucide-react';

export function TaskInput({ onSubmit, isRunning = false }) {
  const [taskText, setTaskText] = useState('Calculate 50 × 20 and save the result in result.txt');
  const [selectedDemo, setSelectedDemo] = useState('');
  const [testMode, setTestMode] = useState('normal'); // normal, forceWrongCalc, forceToolFail

  const demoScenarios = [
    {
      id: 'calc_file',
      label: 'Standard: Calculate 50 × 20 & Save to File',
      task: 'Calculate 50 × 20 and save the result in result.txt',
      mode: 'normal',
      expected: 'VERIFIED (Calculator + File Writer)',
    },
    {
      id: 'calc_simple',
      label: 'Arithmetic: Evaluate Complex Expression',
      task: 'Calculate (150 * 4) / 5 + sqrt(144)',
      mode: 'normal',
      expected: 'VERIFIED (Calculator)',
    },
    {
      id: 'db_query',
      label: 'Database: Query CSE Department Students',
      task: 'Query the database collection "students" to find students in the "CSE" department.',
      mode: 'normal',
      expected: 'VERIFIED (Database Query)',
    },
    {
      id: 'err_calc',
      label: '⚠️ Demo Error: Corrupted Calculation Output',
      task: 'Calculate 50 × 20 and save the result in result.txt',
      mode: 'forceWrongCalc',
      expected: 'FAILED: INCORRECT_RESULT detected by Verifier',
    },
    {
      id: 'err_file',
      label: '⚠️ Demo Error: Tool Execution Failure',
      task: 'Calculate 100 * 5 and save to result.txt',
      mode: 'forceToolFail',
      expected: 'FAILED: TOOL_EXECUTION_FAILURE detected',
    },
  ];

  const handleSelectDemo = (e) => {
    const demoId = e.target.value;
    setSelectedDemo(demoId);
    const demo = demoScenarios.find((d) => d.id === demoId);
    if (demo) {
      setTaskText(demo.task);
      setTestMode(demo.mode);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!taskText.trim() || isRunning) return;

    const testOptions = {};
    if (testMode === 'forceWrongCalc') {
      testOptions.forceWrongCalculation = true;
    } else if (testMode === 'forceToolFail') {
      testOptions.forceFileWriterFailure = true;
    }

    onSubmit(taskText.trim(), testOptions);
  };

  return (
    <div className="bg-card rounded-2xl border border-sand p-6 sm:p-8 shadow-soft">
      {/* Top Demo Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-sand">
        <div className="flex items-center gap-2 text-dark font-serif font-bold text-lg">
          <Terminal className="w-5 h-5 text-terracotta" />
          <span>Task Objective</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Sparkles className="w-4 h-4 text-terracotta flex-shrink-0" />
          <select
            value={selectedDemo}
            onChange={handleSelectDemo}
            disabled={isRunning}
            className="w-full sm:w-80 px-3.5 py-2 rounded-xl bg-cream-100 border border-sand text-xs font-medium text-dark focus:outline-none focus:ring-2 focus:ring-terracotta transition-all disabled:opacity-50"
          >
            <option value="">Select a Presentation Demo Task...</option>
            {demoScenarios.map((demo) => (
              <option key={demo.id} value={demo.id}>
                {demo.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Task Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={taskText}
            onChange={(e) => {
              setTaskText(e.target.value);
              setTestMode('normal'); // reset test mode if user types custom
            }}
            disabled={isRunning}
            rows={3}
            placeholder="Enter a task for the AI agent (e.g. Calculate 50 × 20 and save in result.txt)..."
            className="w-full px-4 py-3.5 rounded-xl bg-cream-50 border border-sand text-dark placeholder:text-muted/60 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-terracotta transition-all disabled:opacity-60 resize-none font-medium"
          />
        </div>

        {/* Test Mode Banner if active */}
        {testMode !== 'normal' && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#FCF5E8] border border-[#EED7A1] text-xs text-[#B57414]">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>
              <strong>Demo Error Injection Active:</strong> This run simulates an intentional anomaly to demonstrate AgentGuard's automated error detection rules.
            </span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="text-xs text-muted font-light flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Agent uses sandboxed tools: <code>calculator</code>, <code>file_writer</code>, <code>file_reader</code>, <code>database_query</code></span>
          </div>

          <button
            type="submit"
            disabled={isRunning || !taskText.trim()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-terracotta hover:bg-terracotta-hover text-white text-sm font-semibold shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none"
          >
            <Play className={`w-4 h-4 fill-white ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Agent Executing...' : 'Start Agent'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default TaskInput;
