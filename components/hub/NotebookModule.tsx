'use client';

import React, { useState } from 'react';
import { NoteItem, NotebookFolder } from '@/lib/study-store';
import {
  FolderOpen,
  Plus,
  Star,
  Search,
  Sparkles,
  Clock,
  Download,
  Tag,
  Check,
  FileText,
  History,
  BookOpen,
  Eye,
  Edit3,
} from 'lucide-react';

interface NotebookModuleProps {
  notebooks: NotebookFolder[];
  notes: NoteItem[];
  setNotes: React.Dispatch<React.SetStateAction<NoteItem[]>>;
  onAskAiAboutNote: (noteTitle: string, noteContent: string) => void;
}

export default function NotebookModule({
  notebooks,
  notes,
  setNotes,
  onAskAiAboutNote,
}: NotebookModuleProps) {
  const [selectedNotebookId, setSelectedNotebookId] = useState<string>('all');
  const [selectedNoteId, setSelectedNoteId] = useState<string>(notes[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyFavourites, setOnlyFavourites] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [autosaveStatus, setAutosaveStatus] = useState<'Saved' | 'Saving...'>('Saved');
  const [showNewNoteModal, setShowNewNoteModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState(notebooks[0]?.subject || 'Data Structures & Algorithms');
  const [newUnit, setNewUnit] = useState('Unit 1');
  const [newTagInput, setNewTagInput] = useState('');

  const filteredNotes = notes.filter((note) => {
    const matchesNb = selectedNotebookId === 'all' || note.notebookId === selectedNotebookId;
    const matchesFav = !onlyFavourites || note.favourite;
    const matchesSearch =
      !searchQuery.trim() ||
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesNb && matchesFav && matchesSearch;
  });

  const activeNote = notes.find((n) => n.id === selectedNoteId) || filteredNotes[0] || notes[0];

  const handleContentChange = (value: string) => {
    if (!activeNote) return;
    setAutosaveStatus('Saving...');
    setNotes((prev) =>
      prev.map((n) =>
        n.id === activeNote.id
          ? {
              ...n,
              content: value,
              updatedAt: 'Just now',
            }
          : n
      )
    );
    setTimeout(() => setAutosaveStatus('Saved'), 450);
  };

  const toggleFavourite = (id: string) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, favourite: !n.favourite } : n)));
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagInput.trim() || !activeNote) return;
    const clean = newTagInput.trim();
    setNotes((prev) =>
      prev.map((n) =>
        n.id === activeNote.id && !n.tags.includes(clean)
          ? { ...n, tags: [...n.tags, clean] }
          : n
      )
    );
    setNewTagInput('');
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const matchingNb = notebooks.find((nb) => nb.subject === newSubject) || notebooks[0];
    const created: NoteItem = {
      id: 'note_' + Date.now(),
      notebookId: matchingNb.id,
      subject: matchingNb.subject,
      unit: newUnit,
      title: newTitle.trim(),
      content: `# ${newTitle.trim()}\n\n## Key Concepts\n- Write your structured lecture notes here...\n\n## Important Exam Formulas\n- Add definitions, diagrams, or code snippets.\n`,
      tags: [matchingNb.subject.split(' ')[0], newUnit],
      favourite: false,
      updatedAt: 'Just now',
      versions: [{ timestamp: 'Just now', summary: 'Created new notebook page' }],
    };
    setNotes((prev) => [created, ...prev]);
    setSelectedNoteId(created.id);
    setNewTitle('');
    setShowNewNoteModal(false);
  };

  const handleExportPdf = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Left Sidebar: Subject Hierarchy & Notes List */}
      <div className="lg:col-span-4 space-y-4">
        <div className="rounded-3xl bg-[#f7f8fa] border border-black/10 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                Module 5 • Notebooks
              </span>
              <h3 className="font-epilogue text-lg text-[#080909]">My Subject Vault</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowNewNoteModal(true)}
              className="btn-tactile inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#080909] text-white text-xs font-semibold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#c4b5fd]" />
              <span>New Note</span>
            </button>
          </div>

          {/* Search & Favourites Filter */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-black/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes, tags, formulas..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-black/15 text-xs focus:outline-none focus:border-[#080909]"
              />
            </div>
            <button
              type="button"
              onClick={() => setOnlyFavourites((prev) => !prev)}
              className={`btn-tactile px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                onlyFavourites
                  ? 'bg-amber-400/20 border-amber-500 text-amber-900'
                  : 'bg-white border-black/15 text-black/70'
              }`}
              title="Filter Favourites"
            >
              <Star className={`w-3.5 h-3.5 ${onlyFavourites ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>
          </div>

          {/* Notebook Folder Pills */}
          <div className="space-y-1.5 mb-4">
            <button
              type="button"
              onClick={() => setSelectedNotebookId('all')}
              className={`btn-tactile w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                selectedNotebookId === 'all'
                  ? 'bg-[#080909] text-white'
                  : 'bg-[#dfe4f2]/60 text-[#080909] hover:bg-[#dfe4f2]'
              }`}
            >
              <span className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5" />
                <span>All Notebooks</span>
              </span>
              <span className="text-[11px] opacity-75">{notes.length} notes</span>
            </button>

            {notebooks.map((nb) => {
              const count = notes.filter((n) => n.notebookId === nb.id).length;
              const active = selectedNotebookId === nb.id;
              return (
                <div key={nb.id} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setSelectedNotebookId(nb.id)}
                    className={`btn-tactile w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                      active
                        ? 'bg-[#080909] text-white'
                        : 'bg-white border border-black/10 text-[#080909] hover:bg-[#dfe4f2]/50'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <FolderOpen className="w-3.5 h-3.5 shrink-0" style={{ color: active ? '#c4b5fd' : nb.color }} />
                      <span className="truncate">{nb.subject}</span>
                    </span>
                    <span className="text-[11px] opacity-70 shrink-0">{count}</span>
                  </button>
                  {active && (
                    <div className="pl-6 pr-2 py-1 flex flex-wrap gap-1">
                      {nb.units.map((u) => (
                        <span
                          key={u}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-[#dfe4f2] text-[#080909]/80 font-medium"
                        >
                          ├── {u}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Notes List */}
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {filteredNotes.map((note) => {
              const isSelected = activeNote?.id === note.id;
              return (
                <div
                  key={note.id}
                  onClick={() => setSelectedNoteId(note.id)}
                  className={`card-interactive p-3.5 rounded-2xl border cursor-pointer ${
                    isSelected
                      ? 'bg-[#080909] text-white border-[#080909] shadow-md'
                      : 'bg-white text-[#080909] border-black/10 hover:border-black/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wider ${
                          isSelected ? 'text-[#c4b5fd]' : 'text-indigo-600'
                        }`}
                      >
                        {note.subject} • {note.unit}
                      </span>
                      <h4 className="font-epilogue text-sm mt-0.5">{note.title}</h4>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavourite(note.id);
                      }}
                      className="p-1 cursor-pointer"
                      aria-label="Toggle favourite"
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          note.favourite
                            ? 'fill-amber-400 text-amber-400'
                            : isSelected
                            ? 'text-white/40'
                            : 'text-black/30'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-2.5 text-[11px] opacity-75">
                    <div className="flex gap-1 flex-wrap">
                      {note.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className={`px-2 py-0.5 rounded-full text-[10px] ${
                            isSelected ? 'bg-white/15 text-white' : 'bg-[#dfe4f2] text-[#080909]'
                          }`}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <span className="flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" />
                      {note.updatedAt}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Column: Rich Markdown & Code Note Editor + AI Context Bridge */}
      <div className="lg:col-span-8">
        {activeNote ? (
          <div className="rounded-3xl bg-[#f7f8fa] border border-black/10 p-6 shadow-sm flex flex-col h-full">
            {/* Note Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-black/10">
              <div>
                <div className="flex items-center gap-2 text-xs text-indigo-700 font-semibold">
                  <span>{activeNote.subject}</span>
                  <span>/</span>
                  <span>{activeNote.unit}</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 text-[11px]">
                    <Check className="w-3 h-3" />
                    {autosaveStatus}
                  </span>
                </div>
                <h2 className="font-epilogue text-xl sm:text-2xl text-[#080909] mt-1">
                  {activeNote.title}
                </h2>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Editor View Mode Toggle */}
                <div className="inline-flex p-1 rounded-xl bg-[#dfe4f2] border border-black/10 text-xs">
                  <button
                    type="button"
                    onClick={() => setViewMode('edit')}
                    className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 cursor-pointer ${
                      viewMode === 'edit' ? 'bg-[#080909] text-white' : 'text-[#080909]/70'
                    }`}
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('split')}
                    className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 cursor-pointer ${
                      viewMode === 'split' ? 'bg-[#080909] text-white' : 'text-[#080909]/70'
                    }`}
                  >
                    <FileText className="w-3 h-3" /> Split
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('preview')}
                    className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 cursor-pointer ${
                      viewMode === 'preview' ? 'bg-[#080909] text-white' : 'text-[#080909]/70'
                    }`}
                  >
                    <Eye className="w-3 h-3" /> Reader
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onAskAiAboutNote(activeNote.title, activeNote.content)}
                  className="btn-tactile inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#080909] text-white text-xs font-semibold hover:bg-black/85 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#c4b5fd]" />
                  <span>Ask AI about this note</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportPdf}
                  className="btn-tactile inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white border border-black/15 text-xs font-semibold hover:bg-[#dfe4f2] cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>
              </div>
            </div>

            {/* Tags Bar */}
            <div className="flex items-center gap-2 flex-wrap py-3 border-b border-black/10">
              <Tag className="w-3.5 h-3.5 text-black/45" />
              {activeNote.tags.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-0.5 rounded-full bg-[#dfe4f2] text-[#080909] text-xs font-medium"
                >
                  #{t}
                </span>
              ))}
              <form onSubmit={handleAddTag} className="inline-flex items-center">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  placeholder="+ Add tag..."
                  className="px-2.5 py-0.5 rounded-full bg-white border border-black/15 text-xs w-24 focus:outline-none focus:w-32 transition-all"
                />
              </form>
            </div>

            {/* Editor & Live Formatted Study View */}
            <div
              className={`grid gap-4 my-4 flex-1 ${
                viewMode === 'split' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
              }`}
            >
              {(viewMode === 'edit' || viewMode === 'split') && (
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-black/50 mb-1.5">
                    Markdown + LaTeX Source Editor
                  </span>
                  <textarea
                    value={activeNote.content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    rows={16}
                    className="w-full flex-1 p-4 rounded-2xl bg-white border border-black/15 font-mono text-xs leading-relaxed focus:outline-none focus:border-[#080909] resize-none"
                  />
                </div>
              )}

              {(viewMode === 'preview' || viewMode === 'split') && (
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-black/50 mb-1.5">
                    Formatted Study Sheet Preview
                  </span>
                  <div className="flex-1 p-5 rounded-2xl bg-white border border-black/10 overflow-y-auto space-y-2.5 text-xs leading-relaxed">
                    {activeNote.content.split('\n').map((line, i) => {
                      if (line.startsWith('# ')) {
                        return (
                          <h3 key={i} className="font-epilogue text-lg text-[#080909] pt-1">
                            {line.replace('# ', '')}
                          </h3>
                        );
                      }
                      if (line.startsWith('## ')) {
                        return (
                          <h4 key={i} className="font-epilogue text-sm text-indigo-900 pt-2">
                            {line.replace('## ', '')}
                          </h4>
                        );
                      }
                      if (line.startsWith('### ')) {
                        return (
                          <h5 key={i} className="font-bold text-xs text-[#080909] pt-1">
                            {line.replace('### ', '')}
                          </h5>
                        );
                      }
                      if (line.startsWith('> ')) {
                        return (
                          <div
                            key={i}
                            className="p-3 rounded-xl bg-[#dfe4f2]/70 border-l-4 border-[#080909] text-[#080909] font-medium"
                          >
                            {line.replace('> ', '')}
                          </div>
                        );
                      }
                      if (line.startsWith('- ')) {
                        return (
                          <div key={i} className="flex items-start gap-2 pl-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                            <span>{line.replace('- ', '')}</span>
                          </div>
                        );
                      }
                      return (
                        <p key={i} className="text-black/80 font-mono text-[11px]">
                          {line}
                        </p>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Version History Footer */}
            <div className="pt-3 border-t border-black/10 flex items-center justify-between flex-wrap gap-2 text-xs text-black/60">
              <div className="flex items-center gap-2">
                <History className="w-3.5 h-3.5 text-indigo-600" />
                <span className="font-semibold text-[#080909]">Edit History:</span>
                <span>
                  {activeNote.versions[0]?.timestamp} — {activeNote.versions[0]?.summary}
                </span>
              </div>
              <span>Saved to your Padhaku account</span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Create New Note Modal */}
      {showNewNoteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-3xl bg-[#f7f8fa] border border-black/15 p-6 max-w-md w-full shadow-2xl modal-enter">
            <h3 className="font-epilogue text-xl text-[#080909] mb-1">Create New Study Note</h3>
            <p className="text-xs text-black/60 mb-4">
              Automatically indexed for RAG Q&A, Flashcards, and Quiz Generation.
            </p>
            <form onSubmit={handleCreateNote} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold mb-1">Note Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Red-Black Trees & B+ Tree Indexing"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-black/15 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Subject Notebook</label>
                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-black/15 text-xs"
                >
                  {notebooks.map((nb) => (
                    <option key={nb.id} value={nb.subject}>
                      {nb.subject}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Unit / Folder</label>
                <input
                  type="text"
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  placeholder="e.g., Unit 3"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-black/15 text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewNoteModal(false)}
                  className="btn-tactile px-4 py-2 rounded-xl bg-[#dfe4f2] text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-tactile px-5 py-2 rounded-xl bg-[#080909] text-white text-xs font-semibold cursor-pointer"
                >
                  Create & Open Editor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
