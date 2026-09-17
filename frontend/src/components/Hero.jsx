import React from 'react';
import { Link } from 'react-router-dom';
import { Play, ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck, Terminal, Cpu, Clock } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
      {/* Subtle warm background elements */}
      <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-soft-beige/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 -z-10 w-80 h-80 bg-terracotta/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cream-200 border border-sand text-xs font-bold uppercase tracking-widest text-warmbrown">
              <ShieldCheck className="w-4 h-4 text-terracotta" />
              <span>AI Agent Execution Monitoring</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-bold text-dark tracking-tight leading-[1.1]">
              Monitor. <br />
              <span className="text-terracotta italic font-normal">Verify.</span> <br />
              Trust.
            </h1>

            <p className="text-lg sm:text-xl text-muted leading-relaxed max-w-2xl font-light">
              AgentGuard observes every step of an AI agent, records deterministic traces in real-time, verifies execution integrity against rigorous behavioral rules, and clearly explains what went wrong.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-terracotta hover:bg-terracotta-hover text-white text-base font-semibold shadow-elevated transition-all hover:-translate-y-0.5"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>Start Agent</span>
              </Link>
              <Link
                to="/how-it-works"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-card hover:bg-cream-200 border border-sand text-dark text-base font-medium transition-all"
              >
                <span>How It Works</span>
                <ArrowRight className="w-4 h-4 text-muted" />
              </Link>
            </div>

            {/* Key trust badges */}
            <div className="pt-6 border-t border-sand grid grid-cols-3 gap-4 text-center sm:text-left">
              <div>
                <span className="block font-serif text-2xl font-bold text-dark">100% Local</span>
                <span className="text-xs text-muted">Powered by Ollama LLMs</span>
              </div>
              <div>
                <span className="block font-serif text-2xl font-bold text-dark">8 Rules</span>
                <span className="text-xs text-muted">Rigorous Verifier Engine</span>
              </div>
              <div>
                <span className="block font-serif text-2xl font-bold text-dark">0 Mocks</span>
                <span className="text-xs text-muted">Real Sandboxed Execution</span>
              </div>
            </div>
          </div>

          {/* Right Monitoring Preview Card */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md bg-card rounded-2xl border border-sand p-6 shadow-elevated">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-sand">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-terracotta animate-pulse" />
                  <span className="font-serif font-bold text-dark text-sm tracking-wide">LIVE EXECUTION TRACE</span>
                </div>
                <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-cream-200 border border-sand text-muted">
                  exec_8f9a2
                </span>
              </div>

              {/* Task Header */}
              <div className="my-4 p-3 rounded-xl bg-cream-100 border border-sand text-xs">
                <span className="font-semibold text-muted uppercase text-[10px] block mb-0.5">Task Objective</span>
                <p className="font-mono text-dark text-xs">"Calculate 50 × 20 and save the result in result.txt"</p>
              </div>

              {/* Step Sequence Mockup */}
              <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-sand">
                
                {/* Step 1 */}
                <div className="relative flex items-start gap-3.5 pl-1">
                  <div className="z-10 w-5 h-5 rounded-full bg-[#EAF3ED] border border-[#B8D9C5] flex items-center justify-center text-[#3D7A5A]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 p-2.5 rounded-lg bg-cream-50 border border-sand/70 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-dark">Step 1: Calculator</span>
                      <span className="text-[10px] font-mono text-muted flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 182 ms
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-muted">
                      input: 50 * 20 &rarr; <span className="font-semibold text-dark">result: 1000</span>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative flex items-start gap-3.5 pl-1">
                  <div className="z-10 w-5 h-5 rounded-full bg-[#EAF3ED] border border-[#B8D9C5] flex items-center justify-center text-[#3D7A5A]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 p-2.5 rounded-lg bg-cream-50 border border-sand/70 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-dark">Step 2: File Writer</span>
                      <span className="text-[10px] font-mono text-muted flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 95 ms
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-muted">
                      file: result.txt &rarr; <span className="font-semibold text-[#3D7A5A]">Created (1000)</span>
                    </div>
                  </div>
                </div>

                {/* Verification Check */}
                <div className="relative flex items-start gap-3.5 pl-1">
                  <div className="z-10 w-5 h-5 rounded-full bg-terracotta-light border border-sand flex items-center justify-center text-terracotta">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 p-2.5 rounded-lg bg-[#EAF3ED] border border-[#B8D9C5] text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-[#3D7A5A] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> VERIFICATION PASSED
                      </span>
                      <span className="font-mono font-bold text-xs text-[#3D7A5A]">Score: 100%</span>
                    </div>
                    <p className="text-[11px] text-muted mt-1">
                      All 8 rules satisfied. No missing steps, mathematical consistency validated.
                    </p>
                  </div>
                </div>

              </div>

              {/* Bottom live indicator */}
              <div className="mt-4 pt-3 border-t border-sand flex items-center justify-between text-[11px] text-muted">
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-terracotta" /> Model: qwen2.5:7b
                </span>
                <span className="font-mono text-dark font-medium">Total: 277 ms</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default Hero;
