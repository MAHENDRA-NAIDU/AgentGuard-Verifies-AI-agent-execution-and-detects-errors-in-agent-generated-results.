import React from 'react';
import { Hero } from '../components/Hero';
import { HowItWorks } from '../components/HowItWorks';
import { Link } from 'react-router-dom';
import { ShieldCheck, Cpu, CheckCircle2, Lock, ArrowRight, Activity, Layers, AlertTriangle } from 'lucide-react';

export function Home() {
  const rules = [
    { title: 'Rule 1: Required Step', desc: 'Ensures no required pipeline operations were skipped or hallucinated.' },
    { title: 'Rule 2: Tool Usage', desc: 'Validates that the AI agent selected the appropriate tool for the goal.' },
    { title: 'Rule 3: Tool Execution', desc: 'Detects runtime failures and traps unhandled tool exceptions.' },
    { title: 'Rule 4: Result Validation', desc: 'Independently calculates and verifies mathematical and deterministic integrity.' },
    { title: 'Rule 5: Parameter Validity', desc: 'Verifies strict typing and presence of required tool arguments.' },
    { title: 'Rule 6: False Success', desc: 'Flags cases where the agent claims victory despite failed steps.' },
    { title: 'Rule 7: Partial Completion', desc: 'Identifies abandoned or incomplete multi-step workflows.' },
    { title: 'Rule 8: Constraint Violation', desc: 'Guards against unauthorized extra file creations or side-effects.' },
  ];

  return (
    <div className="space-y-16">
      {/* Hero */}
      <Hero />

      {/* How It Works Section */}
      <HowItWorks />

      {/* Verification Rules Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-terracotta">
            Deterministic Engine
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-dark tracking-tight">
            8-Layer Automated Verification
          </h2>
          <p className="text-sm sm:text-base text-muted font-light">
            Autonomous LLMs cannot be trusted on final words alone. AgentGuard applies independent verification rules to every step.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {rules.map((r, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-card border border-sand hover:border-terracotta/40 transition-all shadow-soft space-y-2"
            >
              <div className="w-8 h-8 rounded-lg bg-cream-200 text-terracotta flex items-center justify-center font-serif font-bold text-sm">
                0{i + 1}
              </div>
              <h3 className="font-serif font-bold text-base text-dark pt-1">{r.title}</h3>
              <p className="text-xs text-muted font-light leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="relative rounded-3xl bg-warmbrown text-white p-10 sm:p-14 overflow-hidden shadow-elevated">
          <div className="absolute right-0 top-0 w-96 h-96 bg-terracotta/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-6">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight">
              Ready to observe your AI agent in action?
            </h2>
            <p className="text-cream-200 text-sm sm:text-base font-light leading-relaxed">
              Launch real-time monitored tasks, inspect sandbox execution traces, and view immediate error reports with local Ollama models.
            </p>
            <div className="pt-2">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-cream-100 text-dark font-semibold hover:bg-white transition-all shadow-sm"
              >
                <span>Open Monitoring Dashboard</span>
                <ArrowRight className="w-4 h-4 text-terracotta" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
