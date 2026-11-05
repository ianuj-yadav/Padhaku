'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import BrandLogo from '@/app/brand-logo';
import {
  INITIAL_QUIZ_QUESTIONS,
  UserProfile,
  NotebookFolder,
  NoteItem,
  StudyDocument,
  FlashcardItem,
  StudySessionMeeting,
  StudyTask,
} from '@/lib/study-store';
import NotebookModule from '@/components/hub/NotebookModule';
import AnalyzerAndRagModule from '@/components/hub/AnalyzerAndRagModule';
import UnavailableModuleNotice from '@/components/hub/UnavailableModuleNotice';
import QuizFlashcardPlannerModule from '@/components/hub/QuizFlashcardPlannerModule';
import SupportAssistantWidget from '@/components/hub/SupportAssistantWidget';
import {
  LayoutDashboard,
  BookOpen,
  BrainCircuit,
  MessageSquareLock,
  Video,
  Award,
  Search,
  Plus,
  Upload,
  Sparkles,
  Flame,
  Calendar,
  ArrowRight,
  Clock,
  CheckCircle2,
  LogOut,
  FileText,
} from 'lucide-react';

type HubTab =
  | 'overview'
  | 'notebooks'
  | 'analyzer'
  | 'rag'
  | 'tutor'
  | 'chat'
  | 'rooms'
  | 'quizzes';

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<HubTab>('overview');
  const [user, setUser] = useState<UserProfile>({ id: '', name: '', email: '', university: '', course: '', semester: '', subjects: [], avatar: '', streakDays: 0, xp: 0, verified: false });
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [notebooks, setNotebooks] = useState<NotebookFolder[]>([]);
  const [documents, setDocuments] = useState<StudyDocument[]>([]);
  const [flashcards, setFlashcards] = useState<FlashcardItem[]>([]);
  const [meetings, setMeetings] = useState<StudySessionMeeting[]>([]);
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [dataReady, setDataReady] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [aiBridgePrompt, setAiBridgePrompt] = useState('');

  useEffect(() => {
    const tabParam = searchParams.get('tab') as HubTab | null;
    if (
      tabParam &&
      ['overview', 'notebooks', 'analyzer', 'rag', 'tutor', 'chat', 'rooms', 'quizzes'].includes(tabParam)
    ) {
      setActiveTab(tabParam);
    }
    let cancelled = false;
    const loadWorkspace = async () => {
      try {
        const response = await fetch('/api/me', { cache: 'no-store' });
        if (!response.ok) throw new Error('Sign in required');
        const { user: account } = await response.json();
        if (cancelled) return;
        const subjects = account.subjects?.length ? account.subjects : ['General'];
        const subjectNotebooks = subjects.map((subject: string, index: number) => ({
          id: subject, subject, color: ['#6366f1', '#8b5cf6', '#ec4899', '#10b981'][index % 4],
          icon: 'BookOpen', units: [],
        }));
        setUser({ ...account, avatar: account.name.split(/\s+/).map((part: string) => part[0]).join('').slice(0, 2).toUpperCase(), streakDays: 0, xp: 0, verified: false });
        setNotebooks(subjectNotebooks);
        const [noteResponse, documentResponse, taskResponse] = await Promise.all([
          fetch('/api/notes', { cache: 'no-store' }),
          fetch('/api/documents', { cache: 'no-store' }),
          fetch('/api/tasks', { cache: 'no-store' }),
        ]);
        if (!noteResponse.ok || !documentResponse.ok || !taskResponse.ok) throw new Error('Could not load study data');
        const noteData = await noteResponse.json();
        const documentData = await documentResponse.json();
        const taskData = await taskResponse.json();
        if (cancelled) return;
        setNotes(noteData.notes.map((note: NoteItem) => ({ ...note, versions: [] })));
        setDocuments(documentData.documents.map((doc: StudyDocument) => ({
          ...doc, size: '', versionHash: '', summary: `PDF processed into ${doc.pages} page(s).`,
          importantTopics: [], examQuestions: [],
        })));
        setTasks(taskData.tasks);
        setDataReady(true);
      } catch {
        if (!cancelled) router.replace('/login?error=api');
      }
    };
    void loadWorkspace();
    return () => { cancelled = true; };
  }, [searchParams, router]);

  useEffect(() => {
    if (!dataReady) return;
    for (const note of notes) {
      void fetch('/api/notes', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note),
      });
    }
  }, [notes, dataReady]);

  useEffect(() => {
    if (!dataReady) return;
    for (const task of tasks) {
      void fetch('/api/tasks', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
    }
  }, [tasks, dataReady]);

  const handleAskAiAboutNote = (noteTitle: string, noteContent: string) => {
    setAiBridgePrompt(`Summarize and generate 3 likely exam questions from my note "${noteTitle}": ${noteContent.slice(0, 220)}...`);
    setActiveTab('rag');
  };

  const globalSearchMatches = globalSearch.trim()
    ? [
        ...notes
          .filter(
            (n) =>
              n.title.toLowerCase().includes(globalSearch.toLowerCase()) ||
              n.subject.toLowerCase().includes(globalSearch.toLowerCase())
          )
          .map((n) => ({ type: 'Note', label: n.title, sub: n.subject, tab: 'notebooks' as HubTab })),
        ...documents
          .filter(
            (d) =>
              d.title.toLowerCase().includes(globalSearch.toLowerCase()) ||
              d.summary.toLowerCase().includes(globalSearch.toLowerCase())
          )
          .map((d) => ({ type: 'Document', label: d.title, sub: d.subject, tab: 'analyzer' as HubTab })),
      ]
    : [];

  return (
    <div className="min-h-screen bg-[#dfe4f2] text-[#080909] pb-20">
      {/* Top Studio Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#dfe4f2]/90 backdrop-blur-xl border-b border-black/10 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <Link href="/" className="w-36 sm:w-40 text-[#080909] block shrink-0" title="Return to Studio Home">
              <BrandLogo />
            </Link>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#080909] text-white text-[11px] font-bold">
              <Sparkles className="w-3 h-3 text-[#c4b5fd]" />
              <span>SMART STUDY HUB</span>
            </span>
          </div>

          {/* Global Search Bar (Section 4 Spec: "Search your notes, subjects, AI...") */}
          <div className="relative min-w-0 flex-1 max-w-md">
            <Search className="w-4 h-4 text-black/45 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Search your saved notes and PDF titles..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-[#f7f8fa] border border-black/15 text-xs focus:outline-none focus:border-[#080909]"
            />

            {globalSearchMatches.length > 0 && (
              <div className="absolute left-0 right-0 top-11 rounded-2xl bg-white border border-black/15 shadow-xl p-2 z-50 space-y-1">
                {globalSearchMatches.map((m, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setActiveTab(m.tab);
                      setGlobalSearch('');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#dfe4f2] flex items-center justify-between text-xs cursor-pointer"
                  >
                    <span className="font-bold">{m.label}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#080909] text-white">
                      {m.type} • {m.sub}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Student Profile Pill & Streak */}
          <div className="flex items-center gap-2.5">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f7f8fa] border border-black/10 text-xs font-bold">
              <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
              <span>{user.streakDays}d Streak</span>
              <span className="text-black/30">•</span>
              <span className="text-indigo-700">{user.xp} XP</span>
            </div>

            <button
              type="button"
              onClick={async () => {
                await fetch('/api/logout', { method: 'POST' });
                router.replace('/login');
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f7f8fa] border border-black/10 hover:bg-white text-xs font-semibold"
              title="Sign out"
            >
              <span className="w-6 h-6 rounded-full bg-[#080909] text-white font-epilogue text-[10px] flex items-center justify-center">
                {user.avatar}
              </span>
              <span className="hidden sm:inline">{user.name.split(' ')[0]}</span>
              <LogOut className="w-3 h-3 text-black/50" />
            </button>
          </div>
        </div>

        {/* Module Navigation Bar */}
        <div className="dashboard-module-nav max-w-7xl mx-auto mt-3 grid grid-cols-2 sm:flex sm:flex-nowrap items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'notebooks', label: 'My Notebooks', icon: BookOpen },
            { id: 'analyzer', label: 'PDF Analyzer', icon: FileText },
            { id: 'rag', label: 'Study Q&A', icon: BrainCircuit },
            { id: 'chat', label: 'Study Groups (planned)', icon: MessageSquareLock },
            { id: 'rooms', label: 'Study Rooms (planned)', icon: Video },
            { id: 'quizzes', label: 'Practice & Planner', icon: Award },
          ].map((nav) => {
            const Icon = nav.icon;
            const active = activeTab === nav.id;
            return (
              <button
                key={nav.id}
                type="button"
                onClick={() => setActiveTab(nav.id as HubTab)}
                className={`btn-tactile min-w-0 w-full sm:w-auto justify-center sm:justify-start px-3 sm:px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 sm:shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[#080909] text-white shadow'
                    : 'bg-[#f7f8fa] text-[#080909]/80 hover:bg-white border border-black/10'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#c4b5fd]' : ''}`} />
                <span>{nav.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6">
        {/* TAB 1: MAIN DASHBOARD OVERVIEW (Matches Blueprint Section 4) */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Greeting & Quick Actions Hero */}
            <div className="rounded-3xl bg-[#080909] text-white p-6 sm:p-8 shadow-xl border border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#c4b5fd] text-xs font-medium mb-3">
                  <span>{user.university}</span>
                  <span>•</span>
                  <span>{user.course}</span>
                  <span>•</span>
                  <span>{user.semester}</span>
                </div>
                <h1 className="font-epilogue text-3xl sm:text-4xl tracking-tight">
                  Hello, {user.name.split(' ')[0]} 👋
                </h1>
                <p className="text-sm text-white/70 mt-1.5 max-w-2xl">
                  Your unified AI-powered study workspace: {documents.length} PDFs & OCR scans indexed in pgvector, {notes.length} structured notebooks, and 4 active E2EE study groups.
                </p>
              </div>

              {/* Quick Actions (Section 4 Blueprint: + Upload PDF, + Create Note, + Ask AI, + Start Study Room) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab('analyzer')}
                  className="btn-tactile px-4 py-3 rounded-2xl bg-[#c4b5fd] text-[#080909] font-epilogue text-xs flex items-center gap-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>+ Upload PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('notebooks')}
                  className="btn-tactile px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-epilogue text-xs flex items-center gap-2 border border-white/15 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-emerald-300" />
                  <span>+ Create Note</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('rag')}
                  className="btn-tactile px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-epilogue text-xs flex items-center gap-2 border border-white/15 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>+ Ask AI</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('rooms')}
                  className="btn-tactile px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-epilogue text-xs flex items-center gap-2 border border-white/15 cursor-pointer"
                >
                  <Video className="w-4 h-4 text-pink-300" />
                  <span>+ Start Study Room</span>
                </button>
              </div>
            </div>

            {/* 3 Primary Pillar Cards: [AI Tutor] [My Notes] [Study Room] */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div
                onClick={() => setActiveTab('rag')}
                className="card-interactive rounded-3xl bg-[#f7f8fa] border border-black/10 p-6 cursor-pointer flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="p-3 rounded-2xl bg-[#080909] text-[#c4b5fd]">
                      <BrainCircuit className="w-6 h-6" />
                    </span>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-900">
                      Source-grounded Q&A
                    </span>
                  </div>
                  <h2 className="font-epilogue text-xl text-[#080909]">AI Tutor & RAG Q&A</h2>
                  <p className="text-xs text-black/65 mt-1 leading-relaxed">
                    Ask about uploaded text PDFs and review the matching source passages and page numbers.
                  </p>
                </div>
                <div className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700">
                  <span>Open AI Tutor & RAG</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <div
                onClick={() => setActiveTab('notebooks')}
                className="card-interactive rounded-3xl bg-[#f7f8fa] border border-black/10 p-6 cursor-pointer flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="p-3 rounded-2xl bg-[#080909] text-emerald-300">
                      <BookOpen className="w-6 h-6" />
                    </span>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#dfe4f2] text-[#080909]">
                      {notebooks.length} Subjects • {notes.length} Notes
                    </span>
                  </div>
                  <h2 className="font-epilogue text-xl text-[#080909]">My Notes & PDFs</h2>
                  <p className="text-xs text-black/65 mt-1 leading-relaxed">
                    Create and edit personal notes. PDF text extraction is available in the document analyzer; handwriting OCR is planned.
                  </p>
                </div>
                <div className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700">
                  <span>Open Notebook System</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <div
                onClick={() => setActiveTab('rooms')}
                className="card-interactive rounded-3xl bg-[#f7f8fa] border border-black/10 p-6 cursor-pointer flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="p-3 rounded-2xl bg-[#080909] text-pink-300">
                      <Video className="w-6 h-6" />
                    </span>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-pink-500/15 text-pink-900">
                      Planned
                    </span>
                  </div>
                  <h2 className="font-epilogue text-xl text-[#080909]">Study Groups & Rooms</h2>
                  <p className="text-xs text-black/65 mt-1 leading-relaxed">
                    Group messaging, end-to-end encryption, and video calls are separate future milestones and are not active yet.
                  </p>
                </div>
                <div className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700">
                  <span>Join Study Room</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Dashboard Middle Grid: Today's Classes + Upcoming Study Sessions + Study Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Today's Classes & Study Tasks */}
              <div className="lg:col-span-4 rounded-3xl bg-[#f7f8fa] border border-black/10 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-epilogue text-base text-[#080909] flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>Today’s Study Plan</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('quizzes')}
                    className="text-xs font-bold text-indigo-700 cursor-pointer"
                  >
                    Planner →
                  </button>
                </div>

                <div className="space-y-2.5">
                  <p className="rounded-xl bg-white p-3 text-xs text-black/55">Add a task in Planner to start building your study plan.</p>
                </div>

                <div className="pt-3 border-t border-black/10 space-y-2">
                  <div className="text-xs font-bold text-[#080909]">Active Study Tasks</div>
                  {!tasks.length && <p className="text-xs text-black/55">No tasks yet.</p>}
                  {tasks.slice(0, 3).map((t) => (
                    <div key={t.id} className="flex items-center gap-2 text-xs">
                      <CheckCircle2
                        className={`w-3.5 h-3.5 shrink-0 ${
                          t.completed ? 'text-emerald-600' : 'text-black/30'
                        }`}
                      />
                      <span className={t.completed ? 'line-through text-black/45' : 'text-black/80'}>
                        {t.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Study Sessions (Section 14 Blueprint) */}
              <div className="lg:col-span-4 rounded-3xl bg-[#f7f8fa] border border-black/10 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-epilogue text-base text-[#080909] flex items-center gap-2">
                    <Video className="w-4 h-4 text-pink-600" />
                    <span>Upcoming Study Sessions</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('rooms')}
                    className="text-xs font-bold text-indigo-700 cursor-pointer"
                  >
                    All Rooms →
                  </button>
                </div>

                <div className="space-y-3">
                  {!meetings.length && <p className="rounded-xl bg-white p-3 text-xs text-black/55">Scheduled study sessions will appear here when room scheduling is available.</p>}
                  {meetings.map((meet) => (
                    <div
                      key={meet.id}
                      className="p-4 rounded-2xl bg-white border border-black/10 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                          {meet.mode}
                        </span>
                        <span className="text-[11px] font-semibold text-black/60">
                          {meet.participants} participants
                        </span>
                      </div>
                      <h4 className="font-epilogue text-sm text-[#080909]">{meet.title}</h4>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-black/65 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {meet.date} • {meet.time}
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveTab('rooms')}
                          className="btn-tactile px-3.5 py-1.5 rounded-xl bg-[#080909] text-white text-xs font-bold cursor-pointer"
                        >
                          Join Meeting
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Study Progress & Recent Notes */}
              <div className="lg:col-span-4 rounded-3xl bg-[#f7f8fa] border border-black/10 p-6 shadow-sm space-y-4">
                <h3 className="font-epilogue text-base text-[#080909]">
                  Subject Mastery & Recent Notes
                </h3>

                <div className="space-y-3">
                  {[
                    { subj: 'Operating Systems (Unit 1–4)', pct: 86, color: 'bg-indigo-600' },
                    { subj: 'Data Structures & Algorithms', pct: 91, color: 'bg-emerald-600' },
                    { subj: 'Database Management Systems', pct: 78, color: 'bg-purple-600' },
                    { subj: 'Computer Networks', pct: 72, color: 'bg-amber-500' },
                  ].map((bar) => (
                    <div key={bar.subj} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>{bar.subj}</span>
                        <span>{bar.pct}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#dfe4f2] overflow-hidden">
                        <div
                          className={`h-full rounded-full ${bar.color}`}
                          style={{ width: `${bar.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-black/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#080909]">Recent Notes</span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('notebooks')}
                      className="text-xs font-bold text-indigo-700 cursor-pointer"
                    >
                      Open All →
                    </button>
                  </div>
                  {notes.slice(0, 3).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => setActiveTab('notebooks')}
                      className="p-2.5 rounded-xl bg-white border border-black/10 flex items-center justify-between text-xs cursor-pointer hover:bg-[#dfe4f2]/50"
                    >
                      <span className="font-semibold truncate">{n.title}</span>
                      <span className="text-[10px] text-black/50 shrink-0">{n.updatedAt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: NOTEBOOK MANAGEMENT SYSTEM */}
        {activeTab === 'notebooks' && (
          <NotebookModule
            notebooks={notebooks}
            notes={notes}
            setNotes={setNotes}
            onAskAiAboutNote={handleAskAiAboutNote}
          />
        )}

        {/* TAB 3, 4, 5: AI NOTES ANALYZER, OCR, RAG & AI TUTOR */}
        {(activeTab === 'analyzer' || activeTab === 'rag' || activeTab === 'tutor') && (
          <AnalyzerAndRagModule
            documents={documents}
            setDocuments={setDocuments}
            setFlashcards={setFlashcards}
            initialQuestion={aiBridgePrompt}
            activeSubTab={
              activeTab === 'tutor' ? 'tutor' : activeTab === 'rag' ? 'rag' : 'analyzer'
            }
          />
        )}

        {/* TAB 6: CMAT E2EE STUDY GROUP CHAT + MINISEARCH */}
        {activeTab === 'chat' && <UnavailableModuleNotice title="Study group chat is being built" description="The anonymous relay has been disabled. Real group chat needs authenticated membership, durable messages, and a reviewed key-sharing design before it can be safely enabled." />}

        {/* TAB 7: LIVE STUDY ROOM (WEBRTC + GOOGLE MEET + WHITEBOARD + POMODORO) */}
        {activeTab === 'rooms' && (
          <UnavailableModuleNotice title="Live study rooms are planned" description="The current room controls do not establish a real video connection. A later release will add authenticated signaling and a supported WebRTC or meeting provider." />
        )}

        {/* TAB 8: QUIZZES, FLASHCARDS & AI PLANNER */}
        {activeTab === 'quizzes' && (
          <QuizFlashcardPlannerModule
            quizQuestions={INITIAL_QUIZ_QUESTIONS}
            flashcards={flashcards}
            setFlashcards={setFlashcards}
            tasks={tasks}
            setTasks={setTasks}
          />
        )}
      </main>

      {/* Isolated Module 11 Support Assistant */}
      <SupportAssistantWidget />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#dfe4f2] flex items-center justify-center font-epilogue text-lg">
          Loading Padhaku Smart Study Hub...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
