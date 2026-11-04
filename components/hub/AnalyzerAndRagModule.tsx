'use client';

import React, { useState } from 'react';
import {
  StudyDocument,
  FlashcardItem,
} from '@/lib/study-store';
import {
  Upload,
  FileText,
  Sparkles,
  BrainCircuit,
  Camera,
  CheckCircle2,
  BookOpen,
  HelpCircle,
  Layers,
  Send,
  Zap,
  Database,
  Cpu,
  FileSearch,
} from 'lucide-react';

interface AnalyzerAndRagModuleProps {
  documents: StudyDocument[];
  setDocuments: React.Dispatch<React.SetStateAction<StudyDocument[]>>;
  setFlashcards: React.Dispatch<React.SetStateAction<FlashcardItem[]>>;
  initialQuestion?: string;
  activeSubTab?: 'analyzer' | 'rag' | 'tutor';
}

interface RagMessage {
  id: string;
  role: 'user' | 'assistant';
  question?: string;
  content: string;
  mode: string;
  cacheHit?: boolean;
  modelUsed?: string;
  latencyMs?: number;
  sources?: {
    documentTitle: string;
    pageNumber: number;
    chunkIndex: number;
    snippet: string;
    similarity: number;
  }[];
}

const TUTOR_MODES = [
  'My Notes',
  'General Tutor',
  'Exam Preparation',
  'Quiz Me',
  'Explain Simply',
  'Solve Question',
  'Revision',
];

export default function AnalyzerAndRagModule({
  documents,
  setDocuments,
  setFlashcards,
  initialQuestion = '',
  activeSubTab = 'analyzer',
}: AnalyzerAndRagModuleProps) {
  const [selectedDocId, setSelectedDocId] = useState<string>(documents[0]?.id || '');
  const [analyzerTab, setAnalyzerTab] = useState<'summary' | 'topics' | 'questions' | 'ocr' | 'chunks'>('summary');
  const [tutorMode, setTutorMode] = useState<string>('My Notes');
  const [questionInput, setQuestionInput] = useState<string>(initialQuestion);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStage, setUploadStage] = useState<string>('');
  const [askingAi, setAskingAi] = useState(false);

  const [messages, setMessages] = useState<RagMessage[]>([]);
  const [requestError, setRequestError] = useState('');

  const activeDoc = documents.find((d) => d.id === selectedDocId) || documents[0];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      setRequestError('For this deployment path, PDFs must be 4 MB or smaller.');
      e.target.value = '';
      return;
    }
    setRequestError('');
    setIsUploading(true);
    setUploadStage('Uploading and extracting PDF text…');
    try {
      const form = new FormData();
      form.append('file', file);
      const response = await fetch('/api/documents', { method: 'POST', body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'PDF upload failed.');
      const doc = data.document as StudyDocument;
      const saved: StudyDocument = { ...doc, size: `${(file.size / 1048576).toFixed(1)} MB`, versionHash: '',
        summary: `PDF processed into ${doc.pages} page(s).`, importantTopics: [], examQuestions: [] };
      setDocuments((prev) => [saved, ...prev]);
      setSelectedDocId(saved.id);
      setMessages([]);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'PDF upload failed.');
    } finally {
      setIsUploading(false);
      setUploadStage('');
      e.target.value = '';
    }
  };

  const askRagQuestion = async (customPrompt?: string, overrideMode?: string) => {
    const query = (customPrompt ?? questionInput).trim();
    if (!query) return;

    const activeMode = overrideMode || tutorMode;
    const userMsg: RagMessage = {
      id: 'usr_' + Date.now(),
      role: 'user',
      content: query,
      mode: activeMode,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setQuestionInput('');
    setAskingAi(true);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          mode: activeMode,
          document_id: selectedDocId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Could not answer from your study material.');

      const aiMsg: RagMessage = {
        id: 'ai_' + Date.now(),
        role: 'assistant',
        question: query,
        content: data.answer || 'Processed your study material.',
        mode: activeMode,
        cacheHit: data.cacheHit,
        modelUsed: data.modelUsed,
        latencyMs: data.latencyMs,
        sources: data.sources || [],
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'The study assistant is unavailable.');
      setMessages((prev) => [
        ...prev,
        {
          id: 'ai_err_' + Date.now(),
          role: 'assistant',
          content: 'I could not reach the study service. Please try again.',
          mode: activeMode,
        },
      ]);
    } finally {
      setAskingAi(false);
    }
  };

  const handleGenerateFlashcardsFromDoc = () => {
    if (!activeDoc) return;
    const createdCards: FlashcardItem[] = activeDoc.importantTopics.map((t, idx) => ({
      id: `fc_${Date.now()}_${idx}`,
      subject: activeDoc.subject,
      documentId: activeDoc.id,
      front: `[${activeDoc.title}] Explain: ${t.topic}`,
      back: t.description,
      intervalDays: 1,
      easeFactor: 2.5,
      dueLabel: 'Due Now (New)',
    }));
    setFlashcards((prev) => [...createdCards, ...prev]);
  };

  return (
    <div className="space-y-6">
      {/* Document extraction and source-grounded study questions */}
      <div className="rounded-3xl bg-[#080909] text-white p-5 sm:p-6 border border-white/10 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c4b5fd]/15 text-[#c4b5fd] text-xs font-semibold mb-2">
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>PDF text extraction • Page-level source search</span>
            </div>
            <h2 className="font-epilogue text-xl sm:text-2xl">
              {activeSubTab === 'tutor'
                ? 'Persistent AI Study Tutor & Exam Coach'
                : activeSubTab === 'rag'
                ? 'Study Questions from Your PDFs'
                : 'PDF Text Analyzer'}
            </h2>
          </div>

          {/* Upload Buttons: PDF & Handwritten OCR Scan */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <label className="btn-tactile inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#c4b5fd] text-[#080909] text-xs font-bold cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Study PDF</span>
              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <label className="btn-tactile inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 cursor-pointer">
              <Camera className="w-3.5 h-3.5 text-emerald-300" />
              <span>Handwriting OCR (coming soon)</span>
            </label>
          </div>
        </div>

        {requestError && <p role="alert" className="mt-3 text-sm text-red-200">{requestError}</p>}
        {isUploading && (
          <div className="mt-4 p-3.5 rounded-2xl bg-white/10 border border-[#c4b5fd]/40 flex items-center justify-between text-xs">
            <span className="font-medium text-[#c4b5fd] animate-pulse">{uploadStage}</span>
            <span className="text-white/60 font-mono">Private account • 10 MB limit</span>
          </div>
        )}
      </div>

      {/* Main Two-Column Workbench: Left = Analyzer & Uploaded Material | Right = RAG Q&A + AI Tutor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Uploaded PDFs / Handwritten Scans & AI Notes Analyzer */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl bg-[#f7f8fa] border border-black/10 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-epilogue text-base text-[#080909] flex items-center gap-2">
                <FileSearch className="w-4 h-4 text-indigo-600" />
                <span>Uploaded Documents ({documents.length})</span>
              </h3>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#dfe4f2] font-semibold">
                Page search ready
              </span>
            </div>

            {/* Document Selector List */}
            <div className="space-y-2 mb-5">
              {documents.map((doc) => {
                const selected = activeDoc?.id === doc.id;
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`btn-tactile w-full text-left p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer ${
                      selected
                        ? 'bg-[#080909] text-white border-[#080909]'
                        : 'bg-white text-[#080909] border-black/10 hover:bg-[#dfe4f2]/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold shrink-0 ${
                          doc.fileType === 'OCR_SCAN'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : selected
                            ? 'bg-white/15 text-[#c4b5fd]'
                            : 'bg-indigo-500/10 text-indigo-700'
                        }`}
                      >
                        {doc.fileType === 'OCR_SCAN' ? 'OCR' : 'PDF'}
                      </span>
                      <div className="truncate">
                        <div className="text-xs font-bold truncate">{doc.title}</div>
                        <div className="text-[10px] opacity-70">
                          {doc.subject} • {doc.pages} pages • {doc.versionHash}
                        </div>
                      </div>
                    </div>
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 ${
                        selected ? 'text-emerald-400' : 'text-black/20'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Active Document Analyzer Output */}
            {activeDoc && (
              <div className="pt-4 border-t border-black/10">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                      AI Notes Analyzer Output
                    </span>
                    <h4 className="font-epilogue text-sm text-[#080909] truncate">
                      {activeDoc.title}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateFlashcardsFromDoc}
                    disabled={!activeDoc.importantTopics.length}
                    className="btn-tactile px-3 py-1.5 rounded-full bg-[#dfe4f2] hover:bg-[#c4b5fd] text-[#080909] text-[11px] font-bold disabled:opacity-50 cursor-pointer"
                  >
                    {activeDoc.importantTopics.length ? '+ Create revision cards' : 'No generated topics yet'}
                  </button>
                </div>

                {/* Analyzer Sub-tabs: [Summary] [Important Topics] [Questions] [OCR Raw] */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {[
                    { id: 'summary', label: 'Summary' },
                    { id: 'topics', label: 'Important Topics' },
                    { id: 'questions', label: 'Likely Exam Questions' },
                    ...(activeDoc.ocrRawText ? [{ id: 'ocr', label: 'OCR Extracted Text' }] : []),
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setAnalyzerTab(t.id as typeof analyzerTab)}
                      className={`btn-tactile px-3 py-1 rounded-full text-[11px] font-semibold cursor-pointer ${
                        analyzerTab === t.id
                          ? 'bg-[#080909] text-white'
                          : 'bg-white border border-black/15 text-[#080909]'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="p-4 rounded-2xl bg-white border border-black/10 text-xs space-y-3 max-h-[320px] overflow-y-auto">
                  {analyzerTab === 'summary' && (
                    <div className="space-y-2.5">
                      <div className="font-bold text-[#080909] flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Executive Chapter Summary</span>
                      </div>
                      <p className="text-black/80 leading-relaxed">{activeDoc.summary}</p>
                      <div className="pt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            askRagQuestion(`Give me important exam topics and formulas from ${activeDoc.title}`)
                          }
                          className="btn-tactile px-3 py-1.5 rounded-xl bg-[#080909] text-white text-[11px] font-semibold cursor-pointer"
                        >
                          Ask AI about {activeDoc.title} →
                        </button>
                      </div>
                    </div>
                  )}

                  {analyzerTab === 'topics' && (
                    <div className="space-y-2.5">
                      {activeDoc.importantTopics.map((item) => (
                        <div key={item.topic} className="p-2.5 rounded-xl bg-[#f7f8fa] border border-black/10">
                          <div className="flex items-center justify-between font-bold text-[#080909]">
                            <span>• {item.topic}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-900">
                              Mastery {item.mastery}%
                            </span>
                          </div>
                          <p className="text-[11px] text-black/70 mt-1">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {analyzerTab === 'questions' && (
                    <div className="space-y-2.5">
                      {activeDoc.examQuestions.map((q, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-[#f7f8fa] border border-black/10 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase text-indigo-700">
                              Q{idx + 1} • {q.marks} Marks ({q.difficulty})
                            </span>
                            <button
                              type="button"
                              onClick={() => askRagQuestion(q.question, 'Exam Preparation')}
                              className="text-[10px] font-bold text-[#080909] underline cursor-pointer"
                            >
                              Solve with AI
                            </button>
                          </div>
                          <p className="font-semibold text-[#080909]">{q.question}</p>
                          <p className="text-[11px] text-black/65">
                            <strong>Outline:</strong> {q.answerOutline}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {analyzerTab === 'ocr' && activeDoc.ocrRawText && (
                    <div className="space-y-2">
                      <div className="text-[11px] font-semibold text-emerald-800">
                        📷 Extracted & AI-Cleaned Handwritten Text:
                      </div>
                      <pre className="p-3 rounded-xl bg-[#080909] text-emerald-300 font-mono text-[11px] whitespace-pre-wrap">
                        {activeDoc.ocrRawText}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 7 Cols: RAG Q&A + Semantic Cache + 7-Mode AI Study Tutor */}
        <div className="lg:col-span-7">
          <div className="rounded-3xl bg-[#f7f8fa] border border-black/10 p-5 sm:p-6 shadow-sm flex flex-col h-full">
            {/* Tutor Mode Selector Bar */}
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-black/10">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                  Search selected PDF pages → cite matching passages
                </span>
              <h3 className="font-epilogue text-lg text-[#080909]">Study assistant</h3>
              </div>

              <span className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-[11px] font-semibold">Only your documents</span>
            </div>

            {/* 7 Study Modes */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-3 border-b border-black/10">
              {TUTOR_MODES.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setTutorMode(m)}
                  className={`btn-tactile px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 cursor-pointer ${
                    tutorMode === m
                      ? 'bg-[#080909] text-white'
                      : 'bg-white border border-black/10 text-[#080909] hover:bg-[#dfe4f2]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Conversation Stream */}
            <div className="flex-1 space-y-4 my-4 max-h-[430px] overflow-y-auto pr-1">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-4 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-[#080909] text-white ml-8'
                      : 'bg-white border border-black/10 text-[#080909] mr-4'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2 text-[11px]">
                    <span className="font-bold flex items-center gap-1.5">
                      {msg.role === 'user' ? (
                        'You'
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          <span>PADHAKU AI ({msg.mode})</span>
                        </>
                      )}
                    </span>

                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {msg.cacheHit ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 font-bold text-[10px]">
                            ⚡ SEMANTIC CACHE HIT • FREE ({msg.latencyMs}ms)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-900 font-bold text-[10px]">
                            🧠 {msg.modelUsed || 'NVIDIA z-ai/glm-5.3'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Message Body */}
                  <div className="text-xs leading-relaxed whitespace-pre-line">{msg.content}</div>

                  {/* Grounded Source Citations */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3.5 pt-3 border-t border-black/10">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-black/55 mb-2 flex items-center gap-1">
                        <Database className="w-3 h-3 text-indigo-600" />
                        <span>Matching passages from your study material:</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {msg.sources.map((src, i) => (
                          <div
                            key={i}
                            className="p-2.5 rounded-xl bg-[#f7f8fa] border border-black/10 text-[11px]"
                          >
                            <div className="flex items-center justify-between font-bold text-[#080909]">
                              <span className="truncate">{src.documentTitle}</span>
                              <span className="px-1.5 py-0.5 rounded bg-[#dfe4f2] text-[10px] shrink-0">
                                Page {src.pageNumber}
                              </span>
                            </div>
                            <p className="text-[10px] text-black/65 line-clamp-2 mt-1">{src.snippet}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Student-Focused Follow-up Action Chips */}
                  {msg.role === 'assistant' && (
                    <div className="mt-3 pt-2.5 border-t border-black/5 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-black/50 mr-1">Follow up:</span>
                      {[
                        { label: 'Explain simply', mode: 'Explain Simply' },
                        { label: 'Give example', mode: 'General Tutor' },
                        { label: 'Generate question', mode: 'Exam Preparation' },
                        { label: 'Create quiz', mode: 'Quiz Me' },
                        { label: 'Show from my notes', mode: 'My Notes' },
                      ].map((chip) => (
                        <button
                          key={chip.label}
                          type="button"
                          onClick={() =>
                            askRagQuestion(
                              `${chip.label} for: ${msg.question || 'this topic'}`,
                              chip.mode
                            )
                          }
                          className="btn-tactile px-2.5 py-1 rounded-full bg-[#dfe4f2] hover:bg-[#c4b5fd] text-[#080909] text-[10px] font-semibold cursor-pointer"
                        >
                          [{chip.label}]
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {askingAi && (
                <div className="p-4 rounded-2xl bg-white border border-black/10 text-xs flex items-center gap-3">
                  <Cpu className="w-4 h-4 text-indigo-600 animate-spin" />
                  <span>
                    Searching your selected document pages…
                  </span>
                </div>
              )}
            </div>

            {/* Prompt Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                askRagQuestion();
              }}
              className="space-y-2"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  placeholder="Ask any question from your uploaded PDFs (e.g., 'What is deadlock according to my notes?' or 'Explain Dijkstra')..."
                  className="flex-1 px-4 py-3 rounded-2xl bg-white border border-black/15 text-xs focus:outline-none focus:border-[#080909]"
                />
                <button
                  type="submit"
                  disabled={askingAi}
                  className="btn-tactile px-5 py-3 rounded-2xl bg-[#080909] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Ask AI</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Demo Preset Queries */}
              <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                <span className="text-black/50">Try:</span>
                {[
                  'What is deadlock according to my notes?',
                  'Differentiate Semaphore and Mutex from Unit 3',
                  "Explain Dijkstra's algorithm complexity",
                  'Summarize my handwritten OCR scan on Banker’s formula',
                ].map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => askRagQuestion(sample)}
                    className="px-2.5 py-0.5 rounded-full bg-white border border-black/10 hover:bg-[#dfe4f2] text-[#080909] text-[10px] cursor-pointer"
                  >
                    “{sample}”
                  </button>
                ))}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
