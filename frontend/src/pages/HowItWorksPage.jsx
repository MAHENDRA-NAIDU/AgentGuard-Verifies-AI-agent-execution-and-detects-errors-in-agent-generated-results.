import React from 'react';
import { HowItWorks } from '../components/HowItWorks';
import { ShieldCheck, Cpu, ArrowRight, Database, Terminal, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

export function HowItWorksPage() {
  const deepRules = [
    {
      id: '01',
      name: 'Required Step Verification',
      type: 'MISSING_STEP',
      scenario: 'User asks to calculate an expression and save the result into a file.',
      check: 'Engine verifies both calculator AND file_writer appear in the trace sequence.',
      impact: 'Prevents incomplete agent workflows where critical sub-actions are skipped.',
    },
    {
      id: '02',
      name: 'Tool Selection Validity',
      type: 'WRONG_TOOL',
      scenario: 'User asks to query a database collection of student records.',
      check: 'Engine verifies database_query was used rather than raw filesystem reader.',
      impact: 'Enforces correct tool domain usage and prevents tool misuse.',
    },
    {
      id: '03',
      name: 'Tool Execution Health',
      type: 'TOOL_EXECUTION_FAILURE',
      scenario: 'Tool returns an error code, throws an exception, or encounters timeout.',
      check: 'Status is captured as FAILED and immediately halts false completion assertions.',
      impact: 'Catches unhandled errors and bad parameters before they propagate.',
    },
    {
      id: '04',
      name: 'Deterministic Result Validation',
      type: 'INCORRECT_RESULT',
      scenario: 'Agent executes calculator tool for arithmetic: "50 * 20".',
      check: 'Engine recalculates mathematical expressions independently using mathjs.',
      impact: 'Eliminates numeric hallucinations or corrupted intermediate state.',
    },
    {
      id: '05',
      name: 'Strict Parameter Validation',
      type: 'INVALID_PARAMETER',
      scenario: 'Agent passes missing, empty, or unparseable arguments to controlled tools.',
      check: 'Tool wrapper performs schema type and emptiness checks before execution.',
      impact: 'Guarantees that sandbox tools receive sanitized and expected payloads.',
    },
    {
      id: '06',
      name: 'False Success Interception',
      type: 'FALSE_SUCCESS',
      scenario: 'Agent prints "Task completed successfully!" while a required tool failed.',
      check: 'Engine correlates agent verbal claim with actual trace execution statuses.',
      impact: 'Stops AI agents from falsely claiming success to unsuspecting users.',
    },
    {
      id: '07',
      name: 'Pipeline Partial Completion',
      type: 'PARTIAL_COMPLETION',
      scenario: 'Agent executes the first step of a multi-turn task but terminates early.',
      check: 'Compares expected task dependency graph against the step count.',
      impact: 'Ensures all stages of compound objectives are fully delivered.',
    },
    {
      id: '08',
      name: 'Constraint Violation Guard',
      type: 'CONSTRAINT_VIOLATION',
      scenario: 'User specifies: "Create only one file", but agent creates multiple files.',
      check: 'Engine tallies side-effects against explicit constraints in the prompt.',
      impact: 'Enforces user boundaries and resource caps on autonomous actions.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Top Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-terracotta">
          Under The Hood
        </span>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-dark tracking-tight">
          How AgentGuard Verifies AI Agents
        </h1>
        <p className="text-base sm:text-lg text-muted font-light leading-relaxed">
          A dual-layer verification architecture bridging autonomous local LLM tool calling with rigorous deterministic guarantees.
        </p>
      </div>

      {/* Interactive 6-Step Pipeline */}
      <HowItWorks />

      {/* Conceptual Architecture Diagram */}
      <div className="bg-card rounded-2xl border border-sand p-8 sm:p-12 shadow-elevated space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-terracotta">
            System Topology
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-dark">
            Zero-Trust Verification Pipeline
          </h2>
          <p className="text-xs sm:text-sm text-muted font-light">
            Every arrow represents a strictly monitored boundary where inputs, tool decisions, and outputs are audited.
          </p>
        </div>

        {/* Visual Architecture Flow */}
        <div className="p-6 rounded-xl bg-cream-100/70 border border-sand font-mono text-xs text-dark space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center">
            <div className="p-3 rounded-lg bg-card border border-sand">
              <span className="font-bold block text-terracotta">1. User Task</span>
              <span className="text-[10px] text-muted">React Frontend</span>
            </div>
            <div className="p-3 rounded-lg bg-card border border-sand">
              <span className="font-bold block text-warmbrown">2. Express Orchestrator</span>
              <span className="text-[10px] text-muted">Node.js Server</span>
            </div>
            <div className="p-3 rounded-lg bg-card border border-sand">
              <span className="font-bold block text-terracotta">3. Local Ollama</span>
              <span className="text-[10px] text-muted">qwen2.5:7b (Tools)</span>
            </div>
            <div className="p-3 rounded-lg bg-card border border-sand">
              <span className="font-bold block text-warmbrown">4. Sandboxed Tools</span>
              <span className="text-[10px] text-muted">Traced Execution</span>
            </div>
            <div className="p-3 rounded-lg bg-card border border-[#B8D9C5] bg-[#EAF3ED]">
              <span className="font-bold block text-[#3D7A5A]">5. Verifier Engine</span>
              <span className="text-[10px] text-[#3D7A5A]">8-Rule Audit Report</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Rules Breakdown */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-terracotta">
            The 8 Verification Rules
          </span>
          <h2 className="text-3xl font-serif font-bold text-dark">
            Rule-by-Rule Integrity Checks
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {deepRules.map((rule) => (
            <div
              key={rule.id}
              className="p-6 rounded-2xl bg-card border border-sand shadow-soft space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-sand">
                <span className="font-serif font-bold text-terracotta text-lg">
                  Rule {rule.id}
                </span>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-cream-200 border border-sand text-muted">
                  {rule.type}
                </span>
              </div>
              <h3 className="font-serif font-bold text-base text-dark">
                {rule.name}
              </h3>
              <div className="space-y-1 text-xs font-light">
                <p><strong className="font-semibold text-dark">Scenario:</strong> <span className="text-muted">{rule.scenario}</span></p>
                <p><strong className="font-semibold text-dark">Check:</strong> <span className="text-muted">{rule.check}</span></p>
                <p><strong className="font-semibold text-[#3D7A5A]">Guarantee:</strong> <span className="text-muted">{rule.impact}</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default HowItWorksPage;
