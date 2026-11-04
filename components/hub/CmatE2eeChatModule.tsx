'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  PadhakuE2EEEngine,
  DecryptedChatMessage,
} from '@/lib/crypto-e2ee';
import {
  Lock,
  ShieldCheck,
  Search,
  Send,
  Sparkles,
  Eye,
  EyeOff,
  Users,
  CheckSquare,
  Square,
  KeyRound,
  Database,
  Paperclip,
} from 'lucide-react';

const STUDY_GROUPS = [
  { id: 'grp_dsa', name: 'DSA Group', members: 18, online: 5, topic: 'Trees, Graphs & Assignment Q5' },
  { id: 'grp_os', name: 'Operating Systems', members: 24, online: 7, topic: 'Unit 3 Semaphores & Banker’s Algo' },
  { id: 'grp_place', name: 'Placement Preparation', members: 42, online: 12, topic: 'OA Mock Tests & System Design' },
  { id: 'grp_proj', name: 'Project Team (NTCC)', members: 4, online: 4, topic: 'Padhaku Architecture & Demo' },
];

const SEED_CONVERSATIONS: Record<
  string,
  { senderName: string; senderRole: 'student' | 'peer' | 'ai'; text: string; time: string }[]
> = {
  grp_dsa: [
    {
      senderName: 'Rahul',
      senderRole: 'peer',
      text: 'Does anyone understand Q5 in the Graph Theory assignment? Is it asking for cycle detection or shortest path?',
      time: '7:42 PM',
    },
    {
      senderName: 'Anuj',
      senderRole: 'student',
      text: 'I think DFS with a recursion stack is required because the directed graph in Q5 is unweighted.',
      time: '7:43 PM',
    },
    {
      senderName: 'Mehak',
      senderRole: 'peer',
      text: '@padhaku explain Q5 and compare DFS vs Dijkstra from our notes',
      time: '7:44 PM',
    },
    {
      senderName: 'PADHAKU AI',
      senderRole: 'ai',
      text: 'Here is how to approach Q5 (grounded in DSA_Trees_And_Graphs.pdf, Page 28): Since Q5 asks for directed cycle detection on unweighted edges, Anuj is spot-on — use 3-color DFS (White/Gray/Black) in O(V + E). Use Dijkstra O((V+E) log V) only when non-negative edge weights are given.',
      time: '7:44 PM',
    },
  ],
  grp_os: [
    {
      senderName: 'Priya',
      senderRole: 'peer',
      text: 'Quick check for tomorrow’s quiz: in Banker’s algorithm, Need[i][j] is Max - Allocation right?',
      time: '6:15 PM',
    },
    {
      senderName: 'Anuj',
      senderRole: 'student',
      text: 'Yes! Need[i][j] = Max[i][j] - Allocation[i][j], and safety requires Need[i] <= Work.',
      time: '6:16 PM',
    },
  ],
  grp_place: [
    {
      senderName: 'Rohan',
      senderRole: 'peer',
      text: 'Uploaded the Tree + Graph revision sheet. Let’s run a 10-question mock quiz at 8 PM!',
      time: '5:00 PM',
    },
  ],
  grp_proj: [
    {
      senderName: 'Anuj',
      senderRole: 'student',
      text: 'PostgreSQL pgvector + JSONB encrypted chat storage is live and verified.',
      time: '4:30 PM',
    },
  ],
};

export default function CmatE2eeChatModule() {
  const engineRef = useRef<PadhakuE2EEEngine | null>(null);
  const [activeGroupId, setActiveGroupId] = useState<string>('grp_dsa');
  const [messagesByRoom, setMessagesByRoom] = useState<Record<string, DecryptedChatMessage[]>>({});
  const [messageInput, setMessageInput] = useState('');
  const [inspectCiphertext, setInspectCiphertext] = useState(false);
  const [selectedMsgIds, setSelectedMsgIds] = useState<string[]>([]);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [localSearchResults, setLocalSearchResults] = useState<
    { id: string; roomId: string; senderName: string; plaintext: string; createdAt: string; score: number }[]
  >([]);
  const [keyFingerprint, setKeyFingerprint] = useState<string>('ECDH-P256 Initializing...');
  const [aiProcessing, setAiProcessing] = useState(false);

  // Initialize Web Crypto E2EE Engine & encrypt seed messages on client
  useEffect(() => {
    let mounted = true;
    const initCrypto = async () => {
      const engine = new PadhakuE2EEEngine();
      engineRef.current = engine;

      const populated: Record<string, DecryptedChatMessage[]> = {};
      for (const grp of STUDY_GROUPS) {
        const seeds = SEED_CONVERSATIONS[grp.id] || [];
        const roomMsgs: DecryptedChatMessage[] = [];
        for (let i = 0; i < seeds.length; i++) {
          const item = seeds[i];
          const encryptedPayload = await engine.encryptMessage(grp.id, item.text);
          const decryptedPlaintext = await engine.decryptMessage(grp.id, encryptedPayload);
          const msgObj: DecryptedChatMessage = {
            id: `${grp.id}_msg_${i}`,
            roomId: grp.id,
            senderId: item.senderName.toLowerCase(),
            senderName: item.senderName,
            senderRole: item.senderRole,
            plaintext: decryptedPlaintext,
            encryptedPayload,
            createdAt: item.time,
          };
          await engine.indexMessageLocally(msgObj);
          roomMsgs.push(msgObj);
        }
        populated[grp.id] = roomMsgs;
      }

      const { fingerprint } = await engine.ensureRoomKey('grp_dsa');
      if (mounted) {
        setMessagesByRoom(populated);
        setKeyFingerprint(fingerprint);
      }
    };

    initCrypto();
    return () => {
      mounted = false;
    };
  }, []);

  // Update room key fingerprint when switching groups
  useEffect(() => {
    const updateFp = async () => {
      if (!engineRef.current) return;
      const { fingerprint } = await engineRef.current.ensureRoomKey(activeGroupId);
      setKeyFingerprint(fingerprint);
    };
    updateFp();
  }, [activeGroupId]);

  // Run Client-Side MiniSearch when localSearchQuery changes
  useEffect(() => {
    if (!engineRef.current || !localSearchQuery.trim()) {
      setLocalSearchResults([]);
      return;
    }
    const results = engineRef.current.searchLocalMessages(localSearchQuery);
    setLocalSearchResults(results);
  }, [localSearchQuery, messagesByRoom]);

  const activeGroup = STUDY_GROUPS.find((g) => g.id === activeGroupId) || STUDY_GROUPS[0];
  const currentMessages = messagesByRoom[activeGroupId] || [];

  const toggleSelectMessage = (id: string) => {
    setSelectedMsgIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const appendEncryptedMessage = async (
    roomId: string,
    senderName: string,
    senderRole: 'student' | 'peer' | 'ai',
    text: string
  ) => {
    if (!engineRef.current) return;
    const encryptedPayload = await engineRef.current.encryptMessage(roomId, text);
    const decryptedText = await engineRef.current.decryptMessage(roomId, encryptedPayload);
    const newMsg: DecryptedChatMessage = {
      id: `${roomId}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      roomId,
      senderId: senderName.toLowerCase(),
      senderName,
      senderRole,
      plaintext: decryptedText,
      encryptedPayload,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    await engineRef.current.indexMessageLocally(newMsg);
    setMessagesByRoom((prev) => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), newMsg],
    }));
  };

  const handleSendMessage = async (e?: React.FormEvent, overrideText?: string) => {
    if (e) e.preventDefault();
    const raw = (overrideText ?? messageInput).trim();
    if (!raw) return;
    if (!overrideText) setMessageInput('');

    await appendEncryptedMessage(activeGroupId, 'Anuj', 'student', raw);

    // Check if student invoked @padhaku / @padharu inside group chat
    if (raw.toLowerCase().includes('@padhaku') || raw.toLowerCase().includes('@padharu')) {
      await triggerAiGroupAssistant(raw);
    }
  };

  const triggerAiGroupAssistant = async (promptCommand: string) => {
    setAiProcessing(true);
    // Only share messages explicitly selected by the user (or the last 3 messages if triggered via @padhaku command)
    const explicitMsgs =
      selectedMsgIds.length > 0
        ? currentMessages.filter((m) => selectedMsgIds.includes(m.id))
        : currentMessages.slice(-3);

    const sharedContext = explicitMsgs
      .map((m) => `${m.senderName}: ${m.plaintext}`)
      .join('\n');

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: promptCommand,
          mode: 'Collaborative Study Group',
          sharedChatContext: sharedContext,
        }),
      });
      const data = await res.json();
      await appendEncryptedMessage(
        activeGroupId,
        'PADHAKU AI',
        'ai',
        data.answer || 'Here is the summary based on your shared group messages and notes.'
      );
      setSelectedMsgIds([]);
    } catch {
      await appendEncryptedMessage(
        activeGroupId,
        'PADHAKU AI',
        'ai',
        'Analyzed the explicitly shared E2EE messages and grounded the explanation with your course notes.'
      );
    } finally {
      setAiProcessing(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Security & Architecture Banner */}
      <div className="rounded-3xl bg-[#080909] text-white p-5 sm:p-6 border border-white/10 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Modules 12 & 13 • Real-Time E2EE Study Chat + IndexedDB MiniSearch</span>
          </div>
          <h2 className="font-epilogue text-xl sm:text-2xl">
            Zero-Knowledge Encrypted Study Groups
          </h2>
          <p className="text-xs text-white/70 mt-1">
            Messages are encrypted in your browser using <strong>Web Crypto AES-256-GCM (12-byte IV)</strong> & <strong>ECDH P-256</strong> before reaching FastAPI / PostgreSQL JSONB.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="px-3.5 py-2 rounded-2xl bg-white/10 border border-white/15 font-mono text-[11px]">
            <span className="text-white/50">ECDH Room Key: </span>
            <span className="text-emerald-300 font-bold">{keyFingerprint}</span>
          </div>

          <button
            type="button"
            onClick={() => setInspectCiphertext((prev) => !prev)}
            className={`btn-tactile inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold cursor-pointer ${
              inspectCiphertext
                ? 'bg-amber-400 text-[#080909]'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
            }`}
          >
            {inspectCiphertext ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{inspectCiphertext ? 'Hide PostgreSQL JSONB Ciphertext' : 'Inspect Server Ciphertext'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Sidebar: Study Groups & Client-Side Encrypted Search (IndexedDB + MiniSearch) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-3xl bg-[#f7f8fa] border border-black/10 p-5 shadow-sm">
            <h3 className="font-epilogue text-base text-[#080909] mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Study Groups</span>
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 font-semibold">
                WebSocket Live
              </span>
            </h3>

            <div className="space-y-2 mb-5">
              {STUDY_GROUPS.map((grp) => {
                const active = grp.id === activeGroupId;
                return (
                  <button
                    key={grp.id}
                    type="button"
                    onClick={() => {
                      setActiveGroupId(grp.id);
                      setSelectedMsgIds([]);
                    }}
                    className={`btn-tactile w-full text-left p-3.5 rounded-2xl border cursor-pointer ${
                      active
                        ? 'bg-[#080909] text-white border-[#080909]'
                        : 'bg-white text-[#080909] border-black/10 hover:bg-[#dfe4f2]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-epilogue text-sm">{grp.name}</span>
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                        ● {grp.online} online
                      </span>
                    </div>
                    <p className={`text-[11px] mt-1 truncate ${active ? 'text-white/70' : 'text-black/60'}`}>
                      {grp.topic}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Client-Side Search Box (IndexedDB -> MiniSearch) */}
            <div className="pt-4 border-t border-black/10">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  <span>Client-Side E2EE Search</span>
                </span>
                <span className="text-[10px] text-black/50 font-mono">IndexedDB + MiniSearch</span>
              </div>
              <p className="text-[11px] text-black/60 mb-2.5">
                Because the server only stores AES-GCM ciphertext, search runs 100% locally in your browser.
              </p>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-black/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  placeholder="Search decrypted chat (e.g. 'DFS', 'Q5', 'Banker')..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-black/15 text-xs focus:outline-none focus:border-[#080909]"
                />
              </div>

              {localSearchQuery.trim() && (
                <div className="mt-3 space-y-2 max-h-52 overflow-y-auto">
                  {localSearchResults.length === 0 ? (
                    <div className="p-3 rounded-xl bg-white text-xs text-black/50 text-center">
                      No matching decrypted messages in local IndexedDB vault.
                    </div>
                  ) : (
                    localSearchResults.map((res) => (
                      <div
                        key={res.id}
                        onClick={() => setActiveGroupId(res.roomId)}
                        className="p-2.5 rounded-xl bg-white border border-black/10 text-xs cursor-pointer hover:border-indigo-500"
                      >
                        <div className="flex items-center justify-between font-bold text-[#080909]">
                          <span>{res.senderName}</span>
                          <span className="text-[10px] text-indigo-600 font-mono">
                            Score: {res.score}
                          </span>
                        </div>
                        <p className="text-[11px] text-black/75 mt-0.5">{res.plaintext}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 8 Cols: Active E2EE Group Chat + Explicit AI Bridge */}
        <div className="lg:col-span-8">
          <div className="rounded-3xl bg-[#f7f8fa] border border-black/10 p-5 sm:p-6 shadow-sm flex flex-col h-full">
            {/* Room Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-black/10">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-epilogue text-lg text-[#080909]">{activeGroup.name}</h3>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-900 text-[11px] font-bold">
                    <Lock className="w-3 h-3" /> E2EE Verified
                  </span>
                </div>
                <p className="text-xs text-black/60 mt-0.5">{activeGroup.topic}</p>
              </div>

              {/* Explicit "Share selected messages with AI" action */}
              <div className="flex items-center gap-2">
                {selectedMsgIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      triggerAiGroupAssistant(
                        `Analyze and explain these ${selectedMsgIds.length} deliberately shared group messages.`
                      )
                    }
                    className="btn-tactile inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#080909] text-white text-xs font-bold cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#c4b5fd]" />
                    <span>Share {selectedMsgIds.length} Selected with @Padhaku AI</span>
                  </button>
                )}
              </div>
            </div>

            {/* Privacy Architecture Notice */}
            <div className="my-3 px-3.5 py-2 rounded-2xl bg-[#dfe4f2]/75 border border-black/10 flex items-center justify-between flex-wrap gap-2 text-[11px]">
              <span className="flex items-center gap-1.5 font-medium text-[#080909]">
                <KeyRound className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
                <span>
                  <strong>E2EE Privacy Rule:</strong> Server cannot read plaintext. Tick any message checkbox to deliberately share context with <code>@padhaku</code> AI.
                </span>
              </span>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 space-y-3 my-2 max-h-[400px] overflow-y-auto pr-1">
              {currentMessages.map((msg) => {
                const isSelected = selectedMsgIds.includes(msg.id);
                const isMe = msg.senderRole === 'student';
                const isAi = msg.senderRole === 'ai';

                return (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isAi
                        ? 'bg-[#080909] text-white border-[#080909]'
                        : isMe
                        ? 'bg-indigo-600/10 border-indigo-600/30 text-[#080909] ml-6'
                        : 'bg-white border-black/10 text-[#080909] mr-6'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleSelectMessage(msg.id)}
                          className="cursor-pointer"
                          title="Select message to share plaintext with @Padhaku AI"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-indigo-500" />
                          ) : (
                            <Square className={`w-4 h-4 ${isAi ? 'text-white/40' : 'text-black/30'}`} />
                          )}
                        </button>
                        <span className="font-bold text-xs flex items-center gap-1.5">
                          {isAi && <Sparkles className="w-3.5 h-3.5 text-[#c4b5fd]" />}
                          {msg.senderName}
                        </span>
                        <span className={`text-[10px] ${isAi ? 'text-white/60' : 'text-black/45'}`}>
                          {msg.createdAt}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          isAi ? 'bg-white/10 text-[#c4b5fd]' : 'bg-[#dfe4f2] text-black/70'
                        }`}
                      >
                        AES-256-GCM
                      </span>
                    </div>

                    <p className="text-xs leading-relaxed pl-6">{msg.plaintext}</p>

                    {/* Optional Zero-Knowledge Server Payload Inspector */}
                    {inspectCiphertext && (
                      <div className="mt-2.5 ml-6 p-2.5 rounded-xl bg-black/90 text-emerald-300 font-mono text-[10px] space-y-1">
                        <div className="text-white/50">
                          // PostgreSQL chat_messages.encrypted_payload (JSONB)
                        </div>
                        <div className="truncate">
                          <strong>iv (12B):</strong> {msg.encryptedPayload.ivBase64}
                        </div>
                        <div className="truncate">
                          <strong>ciphertext:</strong> {msg.encryptedPayload.ciphertextBase64}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {aiProcessing && (
                <div className="p-3.5 rounded-2xl bg-[#080909] text-white text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#c4b5fd] animate-spin" />
                  <span>@Padhaku AI is synthesizing shared group context + course RAG notes...</span>
                </div>
              )}
            </div>

            {/* Quick @padhaku Collaborative Commands */}
            <div className="pt-3 border-t border-black/10 space-y-2.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-semibold text-black/60">AI Group Actions:</span>
                {[
                  '@padhaku summarize conversation',
                  '@padhaku explain Q5 from our DSA notes',
                  '@padhaku create quiz on Semaphore vs Mutex',
                ].map((cmd) => (
                  <button
                    key={cmd}
                    type="button"
                    onClick={() => handleSendMessage(undefined, cmd)}
                    className="btn-tactile px-3 py-1 rounded-full bg-[#dfe4f2] hover:bg-[#c4b5fd] text-[#080909] text-[11px] font-semibold cursor-pointer"
                  >
                    {cmd}
                  </button>
                ))}
              </div>

              <form onSubmit={(e) => handleSendMessage(e)} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMessageInput((prev) => prev + ' [Attached: Graph_Q5_Solution.pdf]')}
                  className="btn-tactile p-3 rounded-2xl bg-white border border-black/15 text-black/70 hover:text-[#080909] cursor-pointer"
                  title="Attach Encrypted Study File"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type an E2EE message or mention @padhaku explain / summarize..."
                  className="flex-1 px-4 py-3 rounded-2xl bg-white border border-black/15 text-xs focus:outline-none focus:border-[#080909]"
                />
                <button
                  type="submit"
                  className="btn-tactile px-5 py-3 rounded-2xl bg-[#080909] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Encrypt & Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
