import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Play, Menu, X, Activity, History, Info, HelpCircle } from 'lucide-react';
import OllamaStatusPill from './OllamaStatusPill';

export function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/', icon: null },
    { name: 'How It Works', path: '/how-it-works', icon: HelpCircle },
    { name: 'Monitor', path: '/dashboard', icon: Activity },
    { name: 'History', path: '/history', icon: History },
    { name: 'About', path: '/about', icon: Info },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 bg-cream-100/90 backdrop-blur-md border-b border-sand">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-terracotta flex items-center justify-center text-white shadow-soft transition-transform group-hover:scale-105">
              <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight text-dark flex items-center gap-1.5">
                Agent<span className="text-terracotta">Guard</span>
              </span>
              <span className="block text-[10px] uppercase font-bold tracking-widest text-muted-brown -mt-1">
                Execution Verifier
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-cream-200/80 p-1.5 rounded-full border border-sand">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    active
                      ? 'bg-card text-dark shadow-sm border border-sand/60 font-semibold'
                      : 'text-muted hover:text-dark hover:bg-cream-100'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action & Status Pill */}
          <div className="hidden lg:flex items-center gap-4">
            <OllamaStatusPill />
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-terracotta hover:bg-terracotta-hover text-white text-sm font-semibold shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Agent</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            <OllamaStatusPill />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-cream-200 border border-sand text-dark hover:bg-cream-300 transition-colors"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-sand bg-cream-100 px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-base font-medium transition-colors ${
                isActive(link.path)
                  ? 'bg-terracotta text-white font-semibold'
                  : 'text-dark hover:bg-cream-200'
              }`}
            >
              {link.icon && <link.icon className="w-5 h-5 opacity-80" />}
              <span>{link.name}</span>
            </Link>
          ))}
          <div className="pt-2">
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-terracotta text-white font-semibold shadow-sm"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Agent Loop</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
