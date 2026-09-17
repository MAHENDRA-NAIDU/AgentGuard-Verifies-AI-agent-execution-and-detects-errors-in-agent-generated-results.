import React from 'react';
import { Send, Brain, Wrench, FileSearch, ShieldCheck, AlertCircle } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Submit Task',
      description: 'Enter any natural-language objective into AgentGuard. The request is securely dispatched to the Node.js orchestrator.',
      icon: Send,
    },
    {
      number: '02',
      title: 'AI Plans & Decides',
      description: 'The local Ollama LLM (e.g. qwen2.5:7b) reasons over the goal and dynamically chooses from approved controlled tools.',
      icon: Brain,
    },
    {
      number: '03',
      title: 'Execute Controlled Tools',
      description: 'Node.js validates parameters and runs the sandboxed tools (Calculator, FileReader, FileWriter, DatabaseQuery) with anti-traversal safety.',
      icon: Wrench,
    },
    {
      number: '04',
      title: 'Trace Everything',
      description: 'Every tool invocation records input arguments, output payloads, start/end timestamps, and execution duration into MongoDB in real-time.',
      icon: FileSearch,
    },
    {
      number: '05',
      title: 'Verify Execution',
      description: 'The dual-engine verifier checks 8 deterministic rules (missing steps, wrong tools, math integrity, parameter validity, false claims).',
      icon: ShieldCheck,
    },
    {
      number: '06',
      title: 'Detect & Explain',
      description: 'Discrepancies are flagged with severity levels, affected steps, expected vs. actual data, and actionable correction recommendations.',
      icon: AlertCircle,
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-cream-200/50 border-y border-sand">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-terracotta">
            Architecture & Pipeline
          </span>
          <h2 className="text-4xl sm:text-5xl font-serif font-bold text-dark tracking-tight">
            How It Works
          </h2>
          <p className="text-base sm:text-lg text-muted font-light">
            From your task to a verified execution, AgentGuard watches every critical step with transparent accountability.
          </p>
        </div>

        {/* 6 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="group relative bg-card rounded-2xl border border-sand p-8 transition-all duration-300 hover:shadow-elevated hover:-translate-y-1"
              >
                {/* Top Number & Icon */}
                <div className="flex items-center justify-between mb-6">
                  <span className="font-serif text-3xl font-bold text-terracotta opacity-80 group-hover:opacity-100 transition-opacity">
                    {step.number}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-cream-200 border border-sand flex items-center justify-center text-warmbrown group-hover:text-terracotta group-hover:bg-terracotta-light transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="font-serif text-xl font-bold text-dark mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed font-light">
                  {step.description}
                </p>

                {/* Bottom decorative line */}
                <div className="mt-6 w-8 h-0.5 bg-sand group-hover:bg-terracotta group-hover:w-16 transition-all duration-300" />
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

export default HowItWorks;
