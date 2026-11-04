'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BrandLogo from '@/app/brand-logo';
import {
  Sparkles,
  Mail,
  Lock,
  User,
  GraduationCap,
  BookOpen,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  RefreshCw,
  ArrowLeft,
  Cpu,
  Terminal,
} from 'lucide-react';

const AVAILABLE_SUBJECTS = [
  'Operating Systems',
  'Data Structures & Algorithms',
  'Database Management Systems',
  'Computer Networks',
  'Machine Learning & AI',
  'Compiler Design',
  'Theory of Computation',
  'Distributed Systems',
];

export default function LoginPage({
  initialMode = 'login',
}: {
  initialMode?: 'login' | 'register';
} = {}) {
  const router = useRouter();
  const [authTab, setAuthTab] = useState<'login' | 'register'>(initialMode);
  const [step, setStep] = useState<1 | 3>(1); // 1: Credentials, 3: Course & Subjects
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [university, setUniversity] = useState('Amity / NTCC University');
  const [course, setCourse] = useState('B.Tech Computer Science & Engineering');
  const [semester, setSemester] = useState('Semester 5');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([
    'Operating Systems',
    'Data Structures & Algorithms',
    'Database Management Systems',
    'Computer Networks',
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: ny * -6, y: nx * 6 });
  };

  const toggleSubject = (subj: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subj) ? prev.filter((s) => s !== subj) : [...prev, subj]
    );
  };

  const handleContinueRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStep(3);
  };

  const handleCompleteAuth = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: authTab === 'login' ? 'login' : 'register_complete',
          email,
          password,
          name,
          university,
          course,
          semester,
          subjects: selectedSubjects,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.detail || data.error || 'Unable to sign in.');
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The Padhaku API is unavailable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#dfe4f2] text-[#080909] flex flex-col justify-between relative overflow-hidden">
      {/* Ambient interactive gradient orbs */}
      <div className="pointer-events-none fixed -top-32 -left-32 w-96 h-96 rounded-full bg-[#c4b5fd]/50 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-indigo-300/40 blur-3xl" />

      {/* Top Navigation Bar */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-12 py-6">
        <Link href="/" className="inline-flex items-center group" aria-label="Padhaku Home">
          <div className="w-40 sm:w-44 text-[#080909]">
            <BrandLogo />
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="btn-tactile inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#f7f8fa] text-xs font-medium border border-black/10 hover:bg-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Studio Home</span>
          </Link>
          <button
            type="button"
            onClick={() => handleCompleteAuth()}
            className="btn-tactile inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#080909] text-white text-xs font-medium hover:bg-black/85 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#c4b5fd]" />
            <span>Secure account sessions</span>
          </button>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="relative z-10 max-w-6xl w-full mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Interactive 3D Studio Identity & Security Telemetry */}
        <div
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setTilt({ x: 0, y: 0 })}
          style={{
            transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transition: 'transform 180ms cubic-bezier(0.23, 1, 0.32, 1)',
          }}
          className="lg:col-span-5 rounded-3xl bg-[#080909] text-[#f7f8fa] p-7 sm:p-8 shadow-2xl border border-white/15 flex flex-col justify-between"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#c4b5fd] text-xs font-medium mb-4">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Module 1 • Auth & Student Identity</span>
            </div>

            <h1 className="font-epilogue text-3xl sm:text-4xl leading-tight text-white mb-3">
              Your notes, study PDFs, and revision workspace in one place.
            </h1>

            <p className="text-sm text-white/70 leading-relaxed mb-6">
              Padhaku keeps your study notes and documents in a private account and answers questions from matching PDF passages.
            </p>

            {/* Interactive Onboarding Flow Pipeline */}
            <div className="space-y-3 mb-6">
              {[
                {
                  idx: 1,
                  label: 'Create a private study account',
                  desc: 'Zero-plaintext credential verification + JWT refresh rotation',
                  active: authTab === 'login' || step === 1,
                  done: authTab === 'register' && step > 1,
                },
                {
                  idx: 2,
                  label: 'Student account registration',
                  desc: 'Create an account and academic profile',
                  active: authTab === 'register',
                  done: authTab === 'register' && step > 2,
                },
                {
                  idx: 3,
                  label: 'Course, Semester & Subject Graph',
                  desc: 'Initializes notebooks, pgvector namespace & E2EE study rooms',
                  active: authTab === 'register' && step === 3,
                  done: false,
                },
              ].map((item) => (
                <div
                  key={item.idx}
                  className={`p-3.5 rounded-2xl border transition-colors ${
                    item.active
                      ? 'bg-[#c4b5fd]/15 border-[#c4b5fd]/50'
                      : item.done
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-white/5 border-white/10 opacity-65'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-white/15 inline-flex items-center justify-center text-[11px]">
                        {item.done ? '✓' : item.idx}
                      </span>
                      {item.label}
                    </span>
                    {item.active && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#c4b5fd] text-[#080909] font-bold">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-white/60 mt-1 pl-7">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Live Cryptographic Telemetry Box */}
          <div className="rounded-2xl bg-black/60 border border-white/10 p-4 font-mono text-[11px] space-y-2">
            <div className="flex items-center justify-between text-emerald-400">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                <span>LIVE SECURITY TELEMETRY</span>
              </span>
              <span className="text-[10px] text-white/50">TLS 1.3 + WebCrypto</span>
            </div>
            <div className="text-white/75 truncate">
              <span className="text-white/40">Hash: </span>
              Passwords are protected with a salted, slow hash on the server.
            </div>
            <div className="text-purple-300 truncate">
              <span className="text-white/40">E2EE: </span>
              ECDH P-256 + AES-256-GCM (12B IV)
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Login / Multi-step Registration Card */}
        <div className="lg:col-span-7 rounded-3xl bg-[#f7f8fa] p-7 sm:p-10 shadow-xl border border-black/10">
          {/* Mode Switcher */}
          <div className="flex items-center justify-between flex-wrap gap-4 mb-7">
            <div className="inline-flex p-1 rounded-full bg-[#dfe4f2] border border-black/10">
              <button
                type="button"
                onClick={() => {
                  setAuthTab('login');
                  setError('');
                }}
                className={`btn-tactile px-5 py-2 rounded-full text-xs font-bold cursor-pointer ${
                  authTab === 'login'
                    ? 'bg-[#080909] text-white shadow'
                    : 'text-[#080909]/70 hover:text-[#080909]'
                }`}
              >
                Sign In to Hub
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthTab('register');
                  setStep(1);
                  setError('');
                }}
                className={`btn-tactile px-5 py-2 rounded-full text-xs font-bold cursor-pointer ${
                  authTab === 'register'
                    ? 'bg-[#080909] text-white shadow'
                    : 'text-[#080909]/70 hover:text-[#080909]'
                }`}
              >
                New Student Registration
              </button>
            </div>

            <span className="text-xs text-black/60 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              <span>Powered by your study material</span>
            </span>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-800 text-xs font-medium">
              {error}
            </div>
          )}

          {/* LOGIN TAB */}
          {authTab === 'login' && (
            <form onSubmit={handleCompleteAuth} className="space-y-5">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-[#dfe4f2] text-xs font-medium mb-2">
                  welcome back, scholar
                </span>
                <h2 className="font-epilogue text-2xl sm:text-3xl text-[#080909]">
                  Sign in to Padhaku Study Hub
                </h2>
                <p className="text-xs text-black/60 mt-1">
                  Sign in to your account. New here? Create an account to start a private study space.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-black/70 mb-1.5">
                    University Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-black/45 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-black/15 text-sm focus:outline-none focus:border-[#080909]"
                      placeholder="anuj.sharma@ntcc.edu.in"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-black/70 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-black/45 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-black/15 text-sm focus:outline-none focus:border-[#080909]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-tactile flex-1 py-3.5 px-6 rounded-2xl bg-[#080909] text-white font-epilogue text-sm flex items-center justify-center gap-2 hover:bg-black/85 cursor-pointer"
                >
                  <span>{loading ? 'Authenticating...' : 'Enter Padhaku Dashboard'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('register');
                    setStep(1);
                  }}
                  className="btn-tactile py-3.5 px-5 rounded-2xl bg-[#dfe4f2] text-[#080909] text-xs font-semibold hover:bg-[#d0d7ec] cursor-pointer"
                >
                  Create an account →
                </button>
              </div>
            </form>
          )}

          {/* REGISTER TAB - STEP 1: CREDENTIALS */}
          {authTab === 'register' && step === 1 && (
            <form onSubmit={handleContinueRegistration} className="space-y-4">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-[#dfe4f2] text-xs font-medium mb-2">
                  Step 1 of 2 • Account details
                </span>
                <h2 className="font-epilogue text-2xl text-[#080909]">
                  Create your Student Account
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-black/70 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-black/45 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-black/15 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-black/70 mb-1">University Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-black/45 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-black/15 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-black/70 mb-1">
                  Create a password (at least 10 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-black/45 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-black/15 text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-tactile w-full py-3.5 px-6 rounded-2xl bg-[#080909] text-white font-epilogue text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <KeyRound className="w-4 h-4 text-[#c4b5fd]" />
                <span>{loading ? 'Continuing...' : 'Continue to course profile'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* REGISTER TAB - STEP 3: COURSE, SEMESTER & SUBJECTS */}
          {authTab === 'register' && step === 3 && (
            <form onSubmit={handleCompleteAuth} className="space-y-4">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-950 text-xs font-semibold mb-2">
                  Step 2 of 2 • Academic profile
                </span>
                <h2 className="font-epilogue text-2xl text-[#080909]">
                  Select Course, Semester & Subjects
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-black/70 mb-1">University</label>
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-black/15 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-black/70 mb-1">Course / Degree</label>
                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-black/15 text-xs font-medium"
                  >
                    <option>B.Tech Computer Science & Engineering</option>
                    <option>B.Tech Artificial Intelligence & ML</option>
                    <option>BCA / MCA Computer Applications</option>
                    <option>B.Sc Data Science & Computing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-black/70 mb-1">Semester</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-black/15 text-xs font-medium"
                  >
                    <option>Semester 3</option>
                    <option>Semester 4</option>
                    <option>Semester 5</option>
                    <option>Semester 6</option>
                    <option>Semester 7</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-black/70 mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Select Active Subjects (Initializes Notebooks & RAG Collections)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_SUBJECTS.map((subj) => {
                    const active = selectedSubjects.includes(subj);
                    return (
                      <button
                        key={subj}
                        type="button"
                        onClick={() => toggleSubject(subj)}
                        className={`btn-tactile px-3.5 py-2 rounded-full text-xs font-semibold border cursor-pointer ${
                          active
                            ? 'bg-[#080909] text-white border-[#080909]'
                            : 'bg-white text-[#080909] border-black/15 hover:bg-[#dfe4f2]'
                        }`}
                      >
                        {active ? '✓ ' : '+ '}
                        {subj}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-tactile w-full py-3.5 px-6 rounded-2xl bg-[#080909] text-white font-epilogue text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <GraduationCap className="w-4 h-4 text-[#c4b5fd]" />
                <span>Launch Padhaku Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Bottom Status Bar */}
      <div className="relative z-10 px-6 sm:px-12 py-4 flex items-center justify-between text-xs text-black/60">
        <span>PADHAKU — Smart Study Hub • Next.js + FastAPI</span>
        <span>Group chat and live rooms are planned features</span>
      </div>
    </div>
  );
}
