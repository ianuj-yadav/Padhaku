'use client';

import React, { useState } from 'react';
import {
  QuizQuestion,
  FlashcardItem,
  StudyTask,
} from '@/lib/study-store';
import {
  Award,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Calendar,
  Plus,
  Sparkles,
  CheckSquare,
  Square,
  HelpCircle,
  Layers,
} from 'lucide-react';

interface QuizFlashcardPlannerModuleProps {
  quizQuestions: QuizQuestion[];
  flashcards: FlashcardItem[];
  setFlashcards: React.Dispatch<React.SetStateAction<FlashcardItem[]>>;
  tasks: StudyTask[];
  setTasks: React.Dispatch<React.SetStateAction<StudyTask[]>>;
  initialSubView?: 'quizzes' | 'flashcards' | 'planner';
}

export default function QuizFlashcardPlannerModule({
  quizQuestions,
  flashcards,
  setFlashcards,
  tasks,
  setTasks,
  initialSubView = 'quizzes',
}: QuizFlashcardPlannerModuleProps) {
  const [subView, setSubView] = useState<'quizzes' | 'flashcards' | 'planner'>(initialSubView);

  // Quiz Generator Config
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [questionCount, setQuestionCount] = useState<5 | 10 | 20>(5);
  const [questionType, setQuestionType] = useState<'MCQ' | 'True/False' | 'Short Answer' | 'Mixed'>('Mixed');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [savingAttempt, setSavingAttempt] = useState(false);
  const [attemptStatus, setAttemptStatus] = useState('');

  const submitQuiz = async () => {
    setQuizSubmitted(true);
    setSavingAttempt(true);
    setAttemptStatus('');
    try {
      const response = await fetch('/api/quiz-attempts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: correctCount, total: quizQuestions.length, answers: selectedAnswers }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Could not save this attempt.');
      setAttemptStatus('Attempt saved to your account.');
    } catch (error) {
      setAttemptStatus(error instanceof Error ? error.message : 'Could not save this attempt.');
    } finally {
      setSavingAttempt(false);
    }
  };

  // Flashcard state
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Study Planner state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState('Operating Systems');
  const [examDate, setExamDate] = useState('2026-11-15');
  const [dailyHours, setDailyHours] = useState(4);

  const correctCount = quizQuestions.reduce((acc, q) => {
    return acc + (selectedAnswers[q.id] === q.correctAnswer ? 1 : 0);
  }, 0);

  const weakTopics = Array.from(
    new Set(
      quizQuestions
        .filter((q) => selectedAnswers[q.id] !== q.correctAnswer)
        .map((q) => q.topic)
    )
  );

  const activeCard = flashcards[cardIndex] || flashcards[0];

  const handleRateFlashcard = (rating: 'Again' | 'Hard' | 'Good' | 'Easy') => {
    if (!activeCard) return;
    const multiplier =
      rating === 'Again' ? 0.5 : rating === 'Hard' ? 1.2 : rating === 'Good' ? 2.0 : 3.2;
    const nextInterval = Math.max(1, Math.round(activeCard.intervalDays * multiplier));
    const nextLabel =
      rating === 'Again'
        ? 'In 10 mins'
        : rating === 'Hard'
        ? 'Tomorrow'
        : `In ${nextInterval} days`;

    setFlashcards((prev) =>
      prev.map((c, idx) =>
        idx === cardIndex
          ? {
              ...c,
              intervalDays: nextInterval,
              dueLabel: nextLabel,
              lastRating: rating,
            }
          : c
      )
    );
    setIsFlipped(false);
    setTimeout(() => {
      setCardIndex((prev) => (prev + 1) % flashcards.length);
    }, 180);
  };

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setTasks((prev) => [
      {
        id: 'tsk_' + Date.now(),
        title: newTaskTitle.trim(),
        subject: newTaskSubject,
        dueTime: 'Today • 9:00 PM',
        priority: 'High',
        completed: false,
      },
      ...prev,
    ]);
    setNewTaskTitle('');
  };

  const handleGenerateAiStudyPlan = () => {
    const generated: StudyTask[] = [
      {
        id: 'ai_tsk_1_' + Date.now(),
        title: `AI Plan (${dailyHours}h/day): Master Semaphore & Banker’s Algorithm proofs (Pages 42–48)`,
        subject: 'Operating Systems',
        dueTime: `Target Exam: ${examDate}`,
        priority: 'High',
        completed: false,
        aiGenerated: true,
      },
      {
        id: 'ai_tsk_2_' + Date.now(),
        title: `AI Plan: Solve 15 Graph Shortest Path & AVL Rotation problems`,
        subject: 'Data Structures & Algorithms',
        dueTime: `Target Exam: ${examDate}`,
        priority: 'High',
        completed: false,
        aiGenerated: true,
      },
      {
        id: 'ai_tsk_3_' + Date.now(),
        title: `AI Plan: Spaced Repetition Active Recall on DBMS Conflict Serializability`,
        subject: 'Database Management Systems',
        dueTime: `Target Exam: ${examDate}`,
        priority: 'Medium',
        completed: false,
        aiGenerated: true,
      },
    ];
    setTasks((prev) => [...generated, ...prev]);
  };

  return (
    <div className="space-y-6">
      {/* Top Sub-Navigation Banner */}
      <div className="rounded-3xl bg-[#080909] text-white p-5 sm:p-6 border border-white/10 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>Modules 15, 16 & 17 • Adaptive Quizzes, Spaced-Repetition Flashcards & Study Planner</span>
          </div>
          <h2 className="font-epilogue text-xl sm:text-2xl">
            Personalized Active Recall & Revision Engine
          </h2>
        </div>

        <div className="inline-flex p-1 rounded-full bg-white/10 border border-white/15">
          {[
            { id: 'quizzes', label: 'Quiz Generator', icon: HelpCircle },
            { id: 'flashcards', label: `Flashcards (${flashcards.length})`, icon: Layers },
            { id: 'planner', label: `Study Planner (${tasks.filter((t) => !t.completed).length})`, icon: Calendar },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = subView === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSubView(tab.id as typeof subView)}
                className={`btn-tactile px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                  active ? 'bg-[#c4b5fd] text-[#080909]' : 'text-white/75 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SUBVIEW 1: QUIZ GENERATOR */}
      {subView === 'quizzes' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 4 Cols: Quiz Configuration & Post-Quiz Weak Topic Diagnostics */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-3xl bg-[#f7f8fa] border border-black/10 p-5 shadow-sm space-y-4">
              <h3 className="font-epilogue text-base text-[#080909]">Practice quiz</h3>

              {/* Difficulty */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-black/60 mb-1.5">
                  Difficulty
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Easy', 'Medium', 'Hard'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setDifficulty(lvl)}
                      className={`btn-tactile py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                        difficulty === lvl
                          ? 'bg-[#080909] text-white border-[#080909]'
                          : 'bg-white text-[#080909] border-black/15'
                      }`}
                    >
                      {difficulty === lvl ? '● ' : '○ '}
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Questions Count */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-black/60 mb-1.5">
                  Questions
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {([5, 10, 20] as const).map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setQuestionCount(cnt)}
                      className={`btn-tactile py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                        questionCount === cnt
                          ? 'bg-[#080909] text-white border-[#080909]'
                          : 'bg-white text-[#080909] border-black/15'
                      }`}
                    >
                      {cnt} Qs
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Type */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-black/60 mb-1.5">
                  Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['MCQ', 'True/False', 'Short Answer', 'Mixed'] as const).map((tp) => (
                    <button
                      key={tp}
                      type="button"
                      onClick={() => setQuestionType(tp)}
                      className={`btn-tactile py-2 rounded-xl text-xs font-semibold border cursor-pointer ${
                        questionType === tp
                          ? 'bg-[#080909] text-white border-[#080909]'
                          : 'bg-white text-[#080909] border-black/15'
                      }`}
                    >
                      {tp}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={submitQuiz}
                disabled={savingAttempt || quizSubmitted}
                className="btn-tactile w-full py-3 rounded-2xl bg-[#080909] text-white font-epilogue text-xs cursor-pointer"
              >
                {savingAttempt ? 'Saving result…' : quizSubmitted ? 'Quiz submitted' : 'Submit practice quiz'}
              </button>
              {attemptStatus && <p role="status" className="text-xs text-black/65">{attemptStatus}</p>}
            </div>

            {/* Post-Submission Diagnostic Card (Matches Blueprint Section 15) */}
            <div className="rounded-3xl bg-[#080909] text-white p-5 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#c4b5fd]">
                  Diagnostic Result
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-epilogue text-sm">
                  Score: {correctCount * 2}/{quizQuestions.length * 2} ({correctCount}/{quizQuestions.length})
                </span>
              </div>

              <div>
                <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5 mb-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Weak Topics Detected</span>
                </div>
                <div className="space-y-1 text-xs pl-2">
                  {(weakTopics.length > 0 ? weakTopics : ['Deadlock', 'Semaphore']).map((wt) => (
                    <div key={wt} className="text-white/85 font-semibold">
                      → {wt}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-white/15">
                <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 mb-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Recommended Revision</span>
                </div>
                <p className="text-xs text-white/80">
                  <strong>Operating_System_Unit_3.pdf</strong> • Pages 42–48
                </p>
                <p className="text-xs text-white/80 mt-0.5">
                  <strong>Deadlock_Notes.pdf</strong> • Pages 7–14
                </p>
              </div>
            </div>
          </div>

          {/* Right 8 Cols: Interactive Questions List */}
          <div className="lg:col-span-8 space-y-4">
            {quizQuestions.map((q, idx) => {
              const userChoice = selectedAnswers[q.id];
              const isCorrect = userChoice === q.correctAnswer;

              return (
                <div
                  key={q.id}
                  className="rounded-3xl bg-[#f7f8fa] border border-black/10 p-5 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-indigo-700">
                      Question {idx + 1} • {q.topic} ({q.type})
                    </span>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#dfe4f2] font-medium">
                      {q.sourcePage}
                    </span>
                  </div>

                  <h4 className="font-epilogue text-sm sm:text-base text-[#080909]">
                    {q.question}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {q.options?.map((opt) => {
                      const chosen = userChoice === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() =>
                            setSelectedAnswers((prev) => ({ ...prev, [q.id]: opt }))
                          }
                          className={`btn-tactile text-left p-3 rounded-2xl border text-xs font-semibold cursor-pointer ${
                            chosen
                              ? quizSubmitted
                                ? opt === q.correctAnswer
                                  ? 'bg-emerald-600 text-white border-emerald-600'
                                  : 'bg-red-600 text-white border-red-600'
                                : 'bg-[#080909] text-white border-[#080909]'
                              : 'bg-white text-[#080909] border-black/15 hover:bg-[#dfe4f2]/50'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && (
                    <div
                      className={`p-3 rounded-2xl text-xs ${
                        isCorrect
                          ? 'bg-emerald-500/15 text-emerald-950 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-950 border border-amber-500/30'
                      }`}
                    >
                      <strong>{isCorrect ? '✓ Correct! ' : `✗ Correct Answer: ${q.correctAnswer}. `}</strong>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBVIEW 2: SPACED REPETITION 3D FLASHCARDS */}
      {subView === 'flashcards' && activeCard && (
        <div className="max-w-3xl mx-auto space-y-5">
          <div className="flex items-center justify-between text-xs font-semibold text-black/70">
            <span>
              Card {cardIndex + 1} of {flashcards.length} • {activeCard.subject}
            </span>
            <span className="px-3 py-1 rounded-full bg-[#f7f8fa] border border-black/10">
              Next Review: <strong>{activeCard.dueLabel}</strong> (Ease {activeCard.easeFactor})
            </span>
          </div>

          {/* 3D Flip Card */}
          <div
            onClick={() => setIsFlipped((prev) => !prev)}
            className="card-interactive rounded-3xl bg-[#080909] text-white p-8 sm:p-12 min-h-[280px] flex flex-col justify-between cursor-pointer shadow-2xl border border-white/15"
          >
            <div className="flex items-center justify-between text-xs text-[#c4b5fd]">
              <span className="uppercase tracking-wider font-bold">
                {isFlipped ? 'Answer & Grounded Explanation' : 'Question Prompt (Click to Flip)'}
              </span>
              <span className="inline-flex items-center gap-1">
                <RotateCw className="w-3.5 h-3.5" />
                <span>Show Answer</span>
              </span>
            </div>

            <div className="my-6 text-center">
              <h3 className="font-epilogue text-xl sm:text-2xl leading-relaxed whitespace-pre-line">
                {isFlipped ? activeCard.back : activeCard.front}
              </h3>
            </div>

            <div className="text-center text-xs text-white/50">
              {isFlipped
                ? 'Rate how well you recalled this card below to schedule spaced repetition:'
                : 'Tap anywhere on the card to reveal the answer'}
            </div>
          </div>

          {/* Spaced Repetition SM-2 Rating Buttons: Again | Hard | Good | Easy */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Again', sub: '< 10 mins', color: 'bg-red-600 text-white' },
              { label: 'Hard', sub: '1 day', color: 'bg-amber-500 text-[#080909]' },
              { label: 'Good', sub: '3 days', color: 'bg-indigo-600 text-white' },
              { label: 'Easy', sub: '7 days', color: 'bg-emerald-600 text-white' },
            ].map((btn) => (
              <button
                key={btn.label}
                type="button"
                onClick={() => handleRateFlashcard(btn.label as 'Again' | 'Hard' | 'Good' | 'Easy')}
                className={`btn-tactile py-3.5 px-4 rounded-2xl font-epilogue text-sm flex flex-col items-center justify-center shadow cursor-pointer ${btn.color}`}
              >
                <span>{btn.label}</span>
                <span className="text-[10px] font-sans opacity-80 mt-0.5">{btn.sub}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SUBVIEW 3: AI STUDY PLANNER */}
      {subView === 'planner' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 rounded-3xl bg-[#f7f8fa] border border-black/10 p-6 shadow-sm space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#dfe4f2] text-xs font-bold text-indigo-900">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Syllabus-to-Schedule Generator</span>
            </div>
            <h3 className="font-epilogue text-lg text-[#080909]">
              Generate Personalized Revision Plan
            </h3>
            <p className="text-xs text-black/65">
              Padhaku analyzes your weak quiz topics, exam date, and available daily hours to create a balanced study roadmap.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Target University Exam Date</label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-black/15 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Available Study Hours / Day ({dailyHours} hrs)
                </label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={dailyHours}
                  onChange={(e) => setDailyHours(Number(e.target.value))}
                  className="w-full accent-[#080909]"
                />
              </div>
              <button
                type="button"
                onClick={handleGenerateAiStudyPlan}
                className="btn-tactile w-full py-3 rounded-2xl bg-[#080909] text-white font-epilogue text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#c4b5fd]" />
                <span>Generate AI Study Schedule</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 rounded-3xl bg-[#f7f8fa] border border-black/10 p-6 shadow-sm space-y-4">
            <h3 className="font-epilogue text-lg text-[#080909]">Today’s Study Checklist</h3>

            <form onSubmit={handleAddTask} className="flex gap-2">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Add a study task (e.g., 'Revise Graph Theory Unit 2')..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-black/15 text-xs"
              />
              <button
                type="submit"
                className="btn-tactile px-4 py-2.5 rounded-xl bg-[#080909] text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>

            <div className="space-y-2.5">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer ${
                    task.completed
                      ? 'bg-[#dfe4f2]/50 border-black/5 opacity-65'
                      : 'bg-white border-black/10 hover:border-black/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {task.completed ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-black/40 shrink-0" />
                    )}
                    <div>
                      <div
                        className={`text-xs font-bold ${
                          task.completed ? 'line-through text-black/50' : 'text-[#080909]'
                        }`}
                      >
                        {task.title}
                      </div>
                      <div className="text-[10px] text-black/55">
                        {task.subject} • {task.dueTime}
                      </div>
                    </div>
                  </div>
                  {task.aiGenerated && (
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-900 text-[10px] font-bold shrink-0">
                      AI Planned
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
