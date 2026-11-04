import Link from 'next/link';
import FooterBackground from './footer-background';
import BrandLogo from './brand-logo';
import LandingPortalDock from '@/components/LandingPortalDock';
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  ShieldCheck,
  Video,
  Award,
  FileSearch,
  LogIn,
  UserPlus,
  Sparkles,
} from 'lucide-react';

export default function Home() {
  return (
    <>
      <LandingPortalDock />

      <footer className="footer" aria-label="Padhaku Smart Study Hub Home">
        <FooterBackground />

        {/* Left Column: Padhaku Core Modules */}
        <div className="jobs">
          <span className="tag">Smart Study Ecosystem</span>
          <span className="headline job-title">
            Study smarter,
            <br />
            not harder.
          </span>

          <div className="footer-nav">
            <Link
              href="/dashboard?tab=notebooks"
              className="btn-tactile inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#f7f8fa]/95 hover:bg-[#080909] text-[#080909] hover:text-white border border-black/10 text-xs font-bold shadow-sm"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>Personal Notebooks & Notes</span>
            </Link>

            <Link
              href="/dashboard?tab=analyzer"
              className="btn-tactile inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#f7f8fa]/95 hover:bg-[#080909] text-[#080909] hover:text-white border border-black/10 text-xs font-bold shadow-sm"
            >
              <FileSearch className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>PDF Text Extraction</span>
            </Link>

            <Link
              href="/dashboard?tab=rag"
              className="btn-tactile inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#f7f8fa]/95 hover:bg-[#080909] text-[#080909] hover:text-white border border-black/10 text-xs font-bold shadow-sm"
            >
              <BrainCircuit className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Study Q&A with Source Pages</span>
            </Link>

            <Link
              href="/dashboard?tab=chat"
              className="btn-tactile inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#f7f8fa]/95 hover:bg-[#080909] text-[#080909] hover:text-white border border-black/10 text-xs font-bold shadow-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Study Groups (in development)</span>
            </Link>

            <Link
              href="/dashboard?tab=rooms"
              className="btn-tactile inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#f7f8fa]/95 hover:bg-[#080909] text-[#080909] hover:text-white border border-black/10 text-xs font-bold shadow-sm"
            >
              <Video className="w-3.5 h-3.5 text-pink-600 shrink-0" />
              <span>Live Study Rooms (in development)</span>
            </Link>

            <Link
              href="/dashboard?tab=quizzes"
              className="btn-tactile inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#f7f8fa]/95 hover:bg-[#080909] text-[#080909] hover:text-white border border-black/10 text-xs font-bold shadow-sm"
            >
              <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Quiz & Flashcard Concepts</span>
            </Link>
          </div>
        </div>

        {/* Center Brand Logo above the Eye-Following 3D Character */}
        <div className="logo" role="img" aria-label="Padhaku logo">
          <Link href="/dashboard" className="text-[#080909] block" title="Open Padhaku Dashboard">
            <BrandLogo />
          </Link>
        </div>

        {/* Right Column: Project Value Proposition & High-Contrast Dashboard / Login / Sign Up CTAs */}
        <div className="contact">
          <span className="tag">Student Study Workspace</span>
          <div className="headline contact-links">
            <span>Ground every answer.</span>
            <span>Practice from your material.</span>
          </div>
          <p className="note">
            Upload a text-based PDF, search its pages, and keep personal study notes in one place. Group chat, handwriting OCR, and video rooms are planned.
          </p>

          {/* Direct Action CTA Buttons for Dashboard, Login & Sign Up */}
          <div className="mt-5 flex flex-col gap-2.5 max-w-[260px]">
            <Link
              href="/dashboard"
              className="btn-tactile flex items-center justify-between px-4 py-3 rounded-2xl bg-[#080909] text-white text-xs font-bold shadow-lg hover:bg-black/85"
            >
              <span className="flex items-center gap-2 text-white">
                <Sparkles className="w-4 h-4 text-[#c4b5fd] shrink-0" />
                <span>Open Study Dashboard</span>
              </span>
              <ArrowRight className="w-4 h-4 text-white shrink-0" />
            </Link>

            <div className="grid grid-cols-2 gap-2.5">
              <Link
                href="/login"
                className="btn-tactile flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#f7f8fa] border border-black/15 text-[#080909] text-xs font-bold hover:bg-white shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5 text-indigo-600" />
                <span>Login</span>
              </Link>
              <Link
                href="/register"
                className="btn-tactile flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 shadow-sm"
              >
                <UserPlus className="w-3.5 h-3.5 text-white" />
                <span>Sign Up</span>
              </Link>
            </div>
          </div>

          {/* Core Architecture Badges */}
          <div className="mt-4 flex flex-wrap gap-1.5 max-w-[260px]">
            {['Next.js', 'FastAPI', 'SQLite / PostgreSQL', 'Source-grounded study Q&A'].map((tech) => (
              <span
                key={tech}
                className="px-2.5 py-1 rounded-lg bg-[#f7f8fa]/90 border border-black/10 text-[10px] font-bold text-[#080909]"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
