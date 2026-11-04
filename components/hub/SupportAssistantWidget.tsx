'use client';

import React, { useState } from 'react';
import { HelpCircle, X, Send, Sparkles } from 'lucide-react';

const FAQ_ANSWERS: { keywords: string[]; answer: string }[] = [
  { keywords: ['upload', 'pdf', 'notes'], answer: 'Open PDF Analyzer and upload a text-based PDF up to 4 MB. Padhaku extracts page text for source search. Scanned handwriting and OCR are not supported yet.' },
  { keywords: ['question', 'ai', 'citation', 'rag'], answer: 'Upload a PDF, choose it in the analyzer, and ask a question. Padhaku searches only documents in your account and shows matching page passages. Without an AI provider key, it returns the excerpts directly.' },
  { keywords: ['room', 'meet', 'video', 'webrtc', 'session', 'whiteboard'], answer: 'Live video and study rooms are planned. The current page does not connect cameras or create calls.' },
  { keywords: ['encrypt', 'chat', 'group', 'cmat'], answer: 'Group chat is disabled while authenticated membership and safe key exchange are being implemented. The current project should not be described as providing end-to-end encrypted chat.' },
  { keywords: ['quiz', 'flashcard', 'planner'], answer: 'Quiz, flashcard, and planner screens are still prototype modules. Their data is not yet saved through the account API.' },
];

export default function SupportAssistantWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [chat, setChat] = useState<{ sender: 'user' | 'support'; text: string }[]>([
    {
      sender: 'support',
      text: 'Hi! I can explain the current Padhaku features and their limitations. Ask about uploading PDFs, source search, quizzes, group chat, or live rooms.',
    },
  ]);

  const handleAsk = (qText?: string) => {
    const q = (qText ?? input).trim();
    if (!q) return;
    if (!qText) setInput('');

    const lower = q.toLowerCase();
    const matched = FAQ_ANSWERS.find((item) =>
      item.keywords.some((kw) => lower.includes(kw))
    );

    const reply =
      matched?.answer ||
      'Use Notebooks to create personal study notes and PDF Analyzer to upload text-based course material. Chat, video, OCR, and saved quiz results are not ready yet.';

    setChat((prev) => [
      ...prev,
      { sender: 'user', text: q },
      { sender: 'support', text: reply },
    ]);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open ? (
        <div className="w-80 sm:w-96 rounded-3xl bg-[#080909] text-white border border-white/15 shadow-2xl p-4 modal-enter">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-[#c4b5fd]/20 text-[#c4b5fd]">
                <HelpCircle className="w-4 h-4" />
              </span>
              <div>
                <div className="font-epilogue text-xs">Padhaku Support Assistant</div>
                <div className="text-[10px] text-white/55">Module 11 • Isolated FAQ Support DB</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1 rounded-full hover:bg-white/10 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="my-3 space-y-2.5 max-h-60 overflow-y-auto text-xs pr-1">
            {chat.map((c, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-2xl ${
                  c.sender === 'user'
                    ? 'bg-[#c4b5fd] text-[#080909] font-medium ml-6'
                    : 'bg-white/10 text-white/90 mr-4'
                }`}
              >
                {c.text}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-1 mb-2.5">
            {[
              'How do I upload notes?',
              'How do I create a study room?',
              'How does E2EE chat work?',
            ].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleAsk(q)}
                className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-[10px] text-[#c4b5fd] cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="flex gap-1.5"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask platform support..."
              className="flex-1 px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-xs text-white focus:outline-none"
            />
            <button
              type="submit"
              className="btn-tactile px-3 py-2 rounded-xl bg-[#c4b5fd] text-[#080909] font-bold text-xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn-tactile flex items-center gap-2 px-4 py-3 rounded-full bg-[#080909] text-white border border-white/15 shadow-2xl hover:bg-black cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-[#c4b5fd]" />
          <span className="font-epilogue text-xs">Help & FAQ Support</span>
        </button>
      )}
    </div>
  );
}
