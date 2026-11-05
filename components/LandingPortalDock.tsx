'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  BrainCircuit,
  ShieldCheck,
  Video,
  ArrowRight,
  LogIn,
  UserPlus,
  Layers,
  X,
  Database,
  Cpu,
  Lock,
  Search,
  Menu,
} from 'lucide-react';

export default function LandingPortalDock() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* TOP WHITE GLOSSY NAVIGATION PILL */}
      <header className="portal-header">
        <div
          className="portal-dock"
        >
          {/* Left: Brand Identity */}
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '9px',
              whiteSpace: 'nowrap',
              color: '#080909',
            }}
          >
            <span
              style={{
                width: '9px',
                height: '9px',
                borderRadius: '9999px',
                backgroundColor: '#4f46e5',
                boxShadow: '0 0 8px rgba(79,70,229,0.55)',
                flexShrink: 0,
              }}
            />
            <span className="font-epilogue" style={{ fontSize: '14px', letterSpacing: '-0.02em' }}>
              PADHAKU
            </span>
            <span
              className="hidden xl:inline-flex"
              style={{
                padding: '3px 10px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                color: '#4338ca',
                fontSize: '11px',
                fontWeight: 700,
                whiteSpace: 'nowrap',
              }}
            >
              Smart Study Hub
            </span>
          </Link>

          {/* Subtle Divider */}
          <div
            className="portal-nav-divider"
            style={{ width: '1px', height: '20px', backgroundColor: 'rgba(8,9,9,0.1)', flexShrink: 0 }}
          />

          {/* Center: Single-Line Concise Navigation */}
          <nav
            className="portal-desktop-nav"
            style={{ alignItems: 'center', gap: '4px', whiteSpace: 'nowrap', fontSize: '12.5px' }}
          >
            {[
              { label: 'Notebooks & OCR', href: '/dashboard?tab=notebooks' },
              { label: 'RAG + AI Tutor', href: '/dashboard?tab=rag' },
              { label: 'E2EE Study Chat', href: '/dashboard?tab=chat' },
              { label: 'Live Study Rooms', href: '/dashboard?tab=rooms' },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="btn-tactile hover:bg-black/5"
                style={{
                  height: '36px',
                  padding: '0 13px',
                  borderRadius: '9999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  fontWeight: 600,
                  color: 'rgba(8, 9, 9, 0.78)',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.label}
              </Link>
            ))}

            <button
              type="button"
              onClick={() => setDrawerOpen((prev) => !prev)}
              className="btn-tactile cursor-pointer"
              style={{
                height: '36px',
                padding: '0 14px',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                color: '#065f46',
                fontWeight: 700,
                fontSize: '12px',
                whiteSpace: 'nowrap',
                marginLeft: '4px',
              }}
            >
              <Layers className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Architecture</span>
            </button>
          </nav>

          {/* Subtle Divider */}
          <div
            className="portal-nav-divider"
            style={{ width: '1px', height: '20px', backgroundColor: 'rgba(8,9,9,0.1)', flexShrink: 0 }}
          />

          {/* Right: Perfectly Contained Action Pills */}
          <div className="portal-actions">
            <Link
              href="/login"
              className="portal-auth-action btn-tactile"
              style={{
                height: '36px',
                padding: '0 15px',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 700,
                backgroundColor: '#ffffff',
                color: '#080909',
                border: '1px solid rgba(8, 9, 9, 0.12)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                whiteSpace: 'nowrap',
              }}
            >
              <LogIn className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>Login</span>
            </Link>

            <Link
              href="/register"
              className="portal-auth-action btn-tactile"
              style={{
                height: '36px',
                padding: '0 15px',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 700,
                backgroundColor: '#4f46e5',
                color: '#ffffff',
                boxShadow: '0 2px 6px rgba(79, 70, 229, 0.35)',
                whiteSpace: 'nowrap',
              }}
            >
              <UserPlus className="w-3.5 h-3.5 text-white shrink-0" />
              <span>Sign Up</span>
            </Link>

            <Link
              href="/dashboard"
              className="btn-tactile"
              style={{
                height: '36px',
                padding: '0 16px',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 700,
                backgroundColor: '#080909',
                color: '#ffffff',
                boxShadow: '0 2px 8px rgba(8, 9, 9, 0.25)',
                whiteSpace: 'nowrap',
              }}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#c4b5fd] shrink-0" />
              <span className="portal-dashboard-label">Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5 text-white shrink-0" />
            </Link>

            <button
              type="button"
              className="portal-menu-toggle btn-tactile"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="portal-mobile-menu"
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div id="portal-mobile-menu" className="portal-mobile-menu">
          <nav aria-label="Main navigation" className="portal-mobile-links">
            <Link href="/dashboard?tab=notebooks" onClick={() => setMobileMenuOpen(false)}>Notebooks &amp; Notes</Link>
            <Link href="/dashboard?tab=rag" onClick={() => setMobileMenuOpen(false)}>PDF Search &amp; Study Q&amp;A</Link>
            <Link href="/dashboard?tab=chat" onClick={() => setMobileMenuOpen(false)}>Study Groups · planned</Link>
            <Link href="/dashboard?tab=rooms" onClick={() => setMobileMenuOpen(false)}>Live Study Rooms · planned</Link>
            <button type="button" onClick={() => { setDrawerOpen(true); setMobileMenuOpen(false); }}>Project architecture</button>
          </nav>
          <div className="portal-mobile-actions">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
            <Link href="/register" onClick={() => setMobileMenuOpen(false)}>Sign up</Link>
          </div>
        </div>
      )}

      {/* Expandable White Glossy Architecture & Module Modal */}
      {drawerOpen && (
        <div
          style={{
            background:
              'linear-gradient(145deg, rgba(255,255,255,0.96) 0%, rgba(244,245,252,0.94) 100%)',
            boxShadow:
              '0 24px 60px -12px rgba(24, 24, 54, 0.18), inset 0 1.5px 0 0 rgba(255, 255, 255, 1)',
            backdropFilter: 'blur(28px) saturate(190%)',
          }}
          className="fixed inset-x-4 top-20 z-50 max-w-5xl mx-auto rounded-3xl text-[#080909] border border-white p-6 modal-enter max-h-[80vh] overflow-y-auto"
        >
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-800 border border-indigo-500/15 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Student study workspace • Project in progress</span>
              </div>
              <h2 className="font-epilogue text-2xl sm:text-3xl text-[#080909]">
                PADHAKU — What is working and what is next
              </h2>
              <p className="text-sm text-black/65 mt-1">
                Start with private notes and PDF page search. Group chat, video, and advanced AI study tools are planned.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="btn-tactile p-2 rounded-full bg-black/5 hover:bg-black/10 text-[#080909] cursor-pointer"
              aria-label="Close architecture drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Link
              href="/dashboard?tab=rag"
              className="card-interactive p-4 rounded-2xl bg-white/90 hover:bg-white border border-black/10 shadow-sm flex flex-col justify-between text-[#080909]"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="p-2 rounded-xl bg-purple-500/15 text-purple-700">
                    <BrainCircuit className="w-5 h-5" />
                  </span>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 font-bold">
                    Page search + citations
                  </span>
                </div>
                <h3 className="font-epilogue text-base text-[#080909] mb-1">
                  PDF Text Search & Study Q&A
                </h3>
                <p className="text-xs text-black/65 leading-relaxed">
                  Upload a text-based PDF, search matching page passages, and optionally use a server-configured AI provider for a grounded explanation.
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs text-indigo-700 font-bold">
                Open PDF Analyzer <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>

            <Link
              href="/dashboard?tab=chat"
              className="card-interactive p-4 rounded-2xl bg-white/90 hover:bg-white border border-black/10 shadow-sm flex flex-col justify-between text-[#080909]"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="p-2 rounded-xl bg-blue-500/15 text-blue-700">
                    <ShieldCheck className="w-5 h-5" />
                  </span>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-800 font-bold">
                    Planned
                  </span>
                </div>
                <h3 className="font-epilogue text-base text-[#080909] mb-1">
                  Private Study Group Chat
                </h3>
                <p className="text-xs text-black/65 leading-relaxed">
                  Group chat is disabled until authenticated group membership and a reviewed end-to-end key exchange are in place.
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs text-indigo-700 font-bold">
                View Group Chat Status <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>

            <Link
              href="/dashboard?tab=rooms"
              className="card-interactive p-4 rounded-2xl bg-white/90 hover:bg-white border border-black/10 shadow-sm flex flex-col justify-between text-[#080909]"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="p-2 rounded-xl bg-pink-500/15 text-pink-700">
                    <Video className="w-5 h-5" />
                  </span>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-pink-500/15 text-pink-800 font-bold">
                    Planned
                  </span>
                </div>
                <h3 className="font-epilogue text-base text-[#080909] mb-1">
                  Live Study Rooms
                </h3>
                <p className="text-xs text-black/65 leading-relaxed">
                  Real-time video calls and shared rooms are future work; the current project does not connect to cameras or establish calls.
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs text-indigo-700 font-bold">
                View Room Status <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-black/10 text-xs">
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/80 border border-black/5">
              <Database className="w-4 h-4 text-indigo-600 shrink-0" />
              <div>
                <div className="font-bold text-[#080909]">Database options</div>
                <div className="text-black/55 text-[11px]">SQLite locally • PostgreSQL deploy target</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/80 border border-black/5">
              <Cpu className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <div className="font-bold text-[#080909]">Optional AI synthesis</div>
                <div className="text-black/55 text-[11px]">Server-side provider key required</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/80 border border-black/5">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <div className="font-bold text-[#080909]">Session security</div>
                <div className="text-black/55 text-[11px]">HttpOnly account cookies</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/80 border border-black/5">
              <Search className="w-4 h-4 text-sky-600 shrink-0" />
              <div>
                <div className="font-bold text-[#080909]">Document search</div>
                <div className="text-black/55 text-[11px]">Private page text retrieval</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
