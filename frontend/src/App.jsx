import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import HowItWorksPage from './pages/HowItWorksPage';
import Dashboard from './pages/Dashboard';
import ExecutionDetails from './pages/ExecutionDetails';
import History from './pages/History';
import About from './pages/About';
import { ShieldCheck, Heart } from 'lucide-react';

export function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-cream-100 text-dark flex flex-col font-sans selection:bg-terracotta selection:text-white">
        {/* Navigation Bar */}
        <Navbar />

        {/* Main Content Pages */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/executions/:executionId" element={<ExecutionDetails />} />
            <Route path="/history" element={<History />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>

        {/* Editorial Minimal Footer */}
        <footer className="bg-card border-t border-sand py-12 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-terracotta text-white flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-serif font-bold text-dark text-lg">
                Agent<span className="text-terracotta">Guard</span>
              </span>
              <span className="text-xs text-muted font-light pl-2 border-l border-sand">
                AI Agent Execution Monitoring & Error Verification
              </span>
            </div>

            <p className="text-xs text-muted font-light text-center sm:text-right">
              Powered by Local LLM via Ollama &bull; 100% Deterministic Verification
            </p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
