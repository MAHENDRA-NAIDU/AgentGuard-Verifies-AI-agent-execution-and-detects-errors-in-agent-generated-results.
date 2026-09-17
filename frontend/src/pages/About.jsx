import React from 'react';
import { ShieldCheck, Cpu, Lock, Layers, CheckCircle2, AlertTriangle, Terminal } from 'lucide-react';

export function About() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-terracotta">
          Philosophy & Mission
        </span>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-dark tracking-tight">
          About AgentGuard
        </h1>
        <p className="text-base sm:text-lg text-muted font-light leading-relaxed">
          Bridging autonomous AI decision-making with verifiable guarantees, real-time observability, and local privacy.
        </p>
      </div>

      {/* Core Mission Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 rounded-2xl bg-card border border-sand shadow-soft space-y-4">
          <div className="w-10 h-10 rounded-xl bg-[#F8E9E3] text-terracotta flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h2 className="font-serif font-bold text-2xl text-dark">
            Why AI Agents Need Verification
          </h2>
          <p className="text-sm text-muted font-light leading-relaxed">
            As LLMs are granted tool access (calculators, file systems, databases), traditional black-box prompting is no longer sufficient. Agents can silently fail, skip critical intermediate steps, use the wrong tool, hallucinate numeric calculations, or falsely claim success when underlying APIs failed.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-card border border-sand shadow-soft space-y-4">
          <div className="w-10 h-10 rounded-xl bg-[#EAF3ED] text-[#3D7A5A] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="font-serif font-bold text-2xl text-dark">
            The AgentGuard Solution
          </h2>
          <p className="text-sm text-muted font-light leading-relaxed">
            AgentGuard wraps every controlled tool invocation in an isolated trace logger. After task completion, a dual-layer Verification Engine audits the trace against 8 rigorous behavioral rules and calculates an objective confidence score, explaining discrepancies with pinpoint remediation advice.
          </p>
        </div>
      </div>

      {/* Safety & Sandbox Architecture */}
      <div className="p-8 sm:p-10 rounded-2xl bg-card border border-sand shadow-soft space-y-6">
        <h2 className="font-serif font-bold text-2xl text-dark flex items-center gap-2">
          <Lock className="w-5 h-5 text-terracotta" />
          <span>Strict Agent Safety & Sandboxing</span>
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
          <div className="space-y-2">
            <span className="font-serif font-bold text-base text-dark block">1. Sandboxed Workspace</span>
            <p className="text-xs text-muted font-light leading-relaxed">
              File operations are strictly confined to <code>agent_workspace/</code>. Relative path traversal (e.g. <code>../../</code>) is automatically detected and rejected.
            </p>
          </div>

          <div className="space-y-2">
            <span className="font-serif font-bold text-base text-dark block">2. No Arbitrary Code</span>
            <p className="text-xs text-muted font-light leading-relaxed">
              The agent cannot execute shell commands, PowerShell scripts, or Javascript <code>eval()</code>. Only explicitly approved registry tools are callable.
            </p>
          </div>

          <div className="space-y-2">
            <span className="font-serif font-bold text-base text-dark block">3. Safety Step Limiter</span>
            <p className="text-xs text-muted font-light leading-relaxed">
              Execution is capped at a maximum of 10 steps per task to prevent infinite loops, resource depletion, and runaway LLM execution cycles.
            </p>
          </div>
        </div>
      </div>

      {/* Local LLM Privacy Note */}
      <div className="p-8 rounded-2xl bg-cream-200/60 border border-sand flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-terracotta" />
            <h3 className="font-serif font-bold text-xl text-dark">100% Local Intelligence via Ollama</h3>
          </div>
          <p className="text-xs sm:text-sm text-muted font-light max-w-2xl">
            AgentGuard connects directly to your local Ollama server running <code>qwen2.5:7b</code>. Zero sensitive enterprise data, prompts, or execution traces ever leave your machine.
          </p>
        </div>
        <span className="px-4 py-2 rounded-full bg-card border border-sand font-mono text-xs font-semibold text-dark shadow-sm whitespace-nowrap">
          http://localhost:11434
        </span>
      </div>

    </div>
  );
}

export default About;
