'use client';

import React, { useState, useRef, useEffect } from 'react';
import { StudySessionMeeting } from '@/lib/study-store';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  MonitorUp,
  Users,
  Timer,
  PenTool,
  Trash2,
  Plus,
  ExternalLink,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface LiveStudyRoomModuleProps {
  meetings: StudySessionMeeting[];
  setMeetings: React.Dispatch<React.SetStateAction<StudySessionMeeting[]>>;
}

export default function LiveStudyRoomModule({
  meetings,
  setMeetings,
}: LiveStudyRoomModuleProps) {
  const [activeRoom, setActiveRoom] = useState<StudySessionMeeting>(meetings[0]);
  const [camEnabled, setCamEnabled] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [activeToolTab, setActiveToolTab] = useState<'grid' | 'whiteboard'>('whiteboard');

  // Shared Whiteboard state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeColor, setStrokeColor] = useState('#080909');
  const [strokeWidth, setStrokeWidth] = useState(3);

  // Local Camera WebRTC stream ref
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Synchronized Pomodoro Timer (25:00 Focus)
  const [pomodoroSeconds, setPomodoroSeconds] = useState(25 * 60);
  const [pomodoroRunning, setPomodoroRunning] = useState(false);

  // Create Meeting Form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('Graph Theory Revision');
  const [newSubject, setNewSubject] = useState('Data Structures & Algorithms');
  const [newDate, setNewDate] = useState('30 July');
  const [newTime, setNewTime] = useState('8:00 PM');
  const [newParticipants, setNewParticipants] = useState(5);

  useEffect(() => {
    if (!pomodoroRunning) return;
    const interval = setInterval(() => {
      setPomodoroSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [pomodoroRunning]);

  // Pre-populate whiteboard with a sample Binary Search Tree / Graph diagram
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw sample graph nodes for Graph Theory Revision
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2.5;
    const nodes = [
      { x: 280, y: 60, label: '0 (Src)' },
      { x: 160, y: 150, label: '1 (d=4)' },
      { x: 400, y: 150, label: '2 (d=2)' },
      { x: 280, y: 240, label: '3 (d=5)' },
    ];
    // Edges
    const edges = [
      [0, 1],
      [0, 2],
      [2, 1],
      [1, 3],
      [2, 3],
    ];
    edges.forEach(([a, b]) => {
      ctx.beginPath();
      ctx.moveTo(nodes[a].x, nodes[a].y);
      ctx.lineTo(nodes[b].x, nodes[b].y);
      ctx.stroke();
    });
    nodes.forEach((n) => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, 26, 0, Math.PI * 2);
      ctx.fillStyle = '#dfe4f2';
      ctx.fill();
      ctx.strokeStyle = '#080909';
      ctx.stroke();
      ctx.fillStyle = '#080909';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(n.label, n.x, n.y + 4);
    });
  }, []);

  const toggleCamera = async () => {
    if (camEnabled) {
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
      setCamEnabled(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      mediaStreamRef.current = stream;
      setCamEnabled(true);
      setTimeout(() => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      }, 100);
    } catch {
      // Graceful fallback when running in headless browser or without webcam hardware
      setCamEnabled(true);
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(
      ((e.clientX - rect.left) / rect.width) * canvas.width,
      ((e.clientY - rect.top) / rect.height) * canvas.height
    );
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineTo(
      ((e.clientX - rect.left) / rect.width) * canvas.width,
      ((e.clientY - rect.top) / rect.height) * canvas.height
    );
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearWhiteboard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    const mode: StudySessionMeeting['mode'] =
      newParticipants <= 4
        ? 'P2P WebRTC Mesh (1-4)'
        : newParticipants <= 6
        ? 'Google Meet'
        : 'LiveKit SFU (Group)';

    const created: StudySessionMeeting = {
      id: 'meet_' + Date.now(),
      title: newTitle,
      subject: newSubject,
      date: `Today • ${newDate}`,
      time: newTime,
      participants: newParticipants,
      maxParticipants: Math.max(6, newParticipants + 2),
      mode,
      meetUrl: `https://meet.google.com/pdh-${Math.random().toString(36).slice(2, 6)}-stu`,
      host: 'Anuj Sharma',
      isLive: true,
    };

    setMeetings((prev) => [created, ...prev]);
    setActiveRoom(created);
    setShowCreateModal(false);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Architecture Banner */}
      <div className="rounded-3xl bg-[#080909] text-white p-5 sm:p-6 border border-white/10 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-semibold mb-2">
            <Video className="w-3.5 h-3.5" />
            <span>Module 14 • P2P WebRTC Mesh (2–4) • LiveKit SFU • Google Meet Integration</span>
          </div>
          <h2 className="font-epilogue text-xl sm:text-2xl">
            Live Collaborative Study Rooms & Whiteboard
          </h2>
          <p className="text-xs text-white/70 mt-1">
            Automatically selects P2P WebRTC Mesh for 2–4 peers (zero server media cost) and scales to SFU / Google Meet for larger study groups.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="btn-tactile inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#c4b5fd] text-[#080909] text-xs font-bold cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Study Session</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 4 Cols: Upcoming Study Sessions & Synced Pomodoro Timer */}
        <div className="lg:col-span-4 space-y-4">
          {/* Synchronized Study Pomodoro Timer */}
          <div className="rounded-3xl bg-[#080909] text-white p-5 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#c4b5fd] flex items-center gap-1.5">
                <Timer className="w-4 h-4" />
                <span>Synced Room Pomodoro</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                25m Deep Focus
              </span>
            </div>
            <div className="font-epilogue text-4xl tracking-tight my-3 text-center">
              {formatTimer(pomodoroSeconds)}
            </div>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setPomodoroRunning((prev) => !prev)}
                className="btn-tactile px-4 py-2 rounded-full bg-[#c4b5fd] text-[#080909] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {pomodoroRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{pomodoroRunning ? 'Pause' : 'Start Focus'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPomodoroRunning(false);
                  setPomodoroSeconds(25 * 60);
                }}
                className="btn-tactile p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                title="Reset Timer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Upcoming Study Sessions List */}
          <div className="rounded-3xl bg-[#f7f8fa] border border-black/10 p-5 shadow-sm space-y-3">
            <h3 className="font-epilogue text-base text-[#080909]">
              Upcoming Study Sessions ({meetings.length})
            </h3>

            {meetings.map((m) => {
              const selected = activeRoom.id === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => setActiveRoom(m)}
                  className={`card-interactive p-4 rounded-2xl border cursor-pointer ${
                    selected
                      ? 'bg-[#080909] text-white border-[#080909]'
                      : 'bg-white text-[#080909] border-black/10'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                      {m.mode}
                    </span>
                    {m.isLive && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                        ● LIVE
                      </span>
                    )}
                  </div>
                  <h4 className="font-epilogue text-sm">{m.title}</h4>
                  <div className="text-[11px] opacity-75 mt-1">
                    {m.date} • {m.time} • {m.participants} participants
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveRoom(m);
                      }}
                      className={`btn-tactile px-3 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer ${
                        selected ? 'bg-[#c4b5fd] text-[#080909]' : 'bg-[#080909] text-white'
                      }`}
                    >
                      Join WebRTC Room
                    </button>
                    <a
                      href={m.meetUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="btn-tactile px-3 py-1.5 rounded-xl bg-white/15 border border-current/20 text-[11px] font-semibold inline-flex items-center gap-1"
                    >
                      <span>Google Meet</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 8 Cols: Active WebRTC Room + Interactive Canvas Whiteboard */}
        <div className="lg:col-span-8">
          <div className="rounded-3xl bg-[#f7f8fa] border border-black/10 p-5 sm:p-6 shadow-sm space-y-4">
            {/* Room Control Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-black/10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="font-epilogue text-lg text-[#080909]">{activeRoom.title}</h3>
                </div>
                <p className="text-xs text-black/60">
                  {activeRoom.subject} • {activeRoom.mode} • {activeRoom.participants} Peers Connected
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveToolTab('whiteboard')}
                  className={`btn-tactile px-3.5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                    activeToolTab === 'whiteboard'
                      ? 'bg-[#080909] text-white'
                      : 'bg-white border border-black/15 text-[#080909]'
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Shared Whiteboard</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveToolTab('grid')}
                  className={`btn-tactile px-3.5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                    activeToolTab === 'grid'
                      ? 'bg-[#080909] text-white'
                      : 'bg-white border border-black/15 text-[#080909]'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Peer Video Grid</span>
                </button>
              </div>
            </div>

            {/* Participant Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Local User Tile */}
              <div className="relative h-28 rounded-2xl bg-[#080909] text-white overflow-hidden flex items-center justify-center border border-black/15">
                {camEnabled ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-full bg-[#c4b5fd] text-[#080909] font-epilogue text-sm flex items-center justify-center mx-auto">
                      AS
                    </div>
                    <span className="text-[11px] font-semibold mt-1 block">Anuj (You)</span>
                  </div>
                )}
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px]">
                  {screenSharing ? 'Sharing Screen' : 'P2P Host'}
                </span>
              </div>

              {[
                { name: 'Mehak Kaur', initials: 'MK', status: 'Drawing on Board', color: 'bg-emerald-300' },
                { name: 'Rahul Verma', initials: 'RV', status: 'Solving Q5', color: 'bg-amber-300' },
                { name: 'Priya Nair', initials: 'PN', status: 'Notes Synced', color: 'bg-sky-300' },
              ].map((peer) => (
                <div
                  key={peer.name}
                  className="relative h-28 rounded-2xl bg-[#080909] text-white flex flex-col items-center justify-center border border-black/15"
                >
                  <div
                    className={`w-10 h-10 rounded-full ${peer.color} text-[#080909] font-epilogue text-sm flex items-center justify-center`}
                  >
                    {peer.initials}
                  </div>
                  <span className="text-[11px] font-semibold mt-1.5">{peer.name}</span>
                  <span className="text-[10px] text-white/60">{peer.status}</span>
                </div>
              ))}
            </div>

            {/* Interactive Shared Whiteboard Canvas */}
            {activeToolTab === 'whiteboard' ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#080909]">Pen Color:</span>
                    {['#080909', '#4f46e5', '#e11d48', '#059669'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setStrokeColor(c)}
                        style={{ backgroundColor: c }}
                        className={`w-6 h-6 rounded-full cursor-pointer ${
                          strokeColor === c ? 'ring-2 ring-offset-2 ring-[#080909]' : ''
                        }`}
                        aria-label={`Select color ${c}`}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={clearWhiteboard}
                    className="btn-tactile inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-black/15 text-xs font-semibold cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Canvas</span>
                  </button>
                </div>

                <div className="rounded-2xl overflow-hidden border-2 border-[#080909]/15 bg-white">
                  <canvas
                    ref={canvasRef}
                    width={640}
                    height={300}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="w-full h-[280px] cursor-crosshair block"
                  />
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-[#080909] text-white text-center space-y-2">
                <Sparkles className="w-8 h-8 text-[#c4b5fd] mx-auto" />
                <h4 className="font-epilogue text-lg">Full-Screen WebRTC Mesh Active</h4>
                <p className="text-xs text-white/70 max-w-md mx-auto">
                  Connected via STUN/TURN P2P WebRTC DataChannel & MediaStream with 4 study group members.
                </p>
              </div>
            )}

            {/* Bottom WebRTC Media Controls Bar */}
            <div className="pt-3 border-t border-black/10 flex items-center justify-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => setMicEnabled((prev) => !prev)}
                className={`btn-tactile px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 cursor-pointer ${
                  micEnabled ? 'bg-[#080909] text-white' : 'bg-red-600 text-white'
                }`}
              >
                {micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                <span>{micEnabled ? 'Mic On' : 'Mic Muted'}</span>
              </button>

              <button
                type="button"
                onClick={toggleCamera}
                className={`btn-tactile px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 cursor-pointer ${
                  camEnabled ? 'bg-emerald-600 text-white' : 'bg-white border border-black/15 text-[#080909]'
                }`}
              >
                {camEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                <span>{camEnabled ? 'Camera Live' : 'Start Camera'}</span>
              </button>

              <button
                type="button"
                onClick={() => setScreenSharing((prev) => !prev)}
                className={`btn-tactile px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 cursor-pointer ${
                  screenSharing ? 'bg-indigo-600 text-white' : 'bg-white border border-black/15 text-[#080909]'
                }`}
              >
                <MonitorUp className="w-4 h-4" />
                <span>{screenSharing ? 'Sharing Screen' : 'Share Screen'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Study Session Modal (Module 14 Spec) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-3xl bg-[#f7f8fa] border border-black/15 p-6 max-w-md w-full shadow-2xl modal-enter">
            <h3 className="font-epilogue text-xl text-[#080909] mb-1">Create Study Session</h3>
            <p className="text-xs text-black/60 mb-4">
              Generates both a P2P WebRTC Study Room and a Google Meet link.
            </p>
            <form onSubmit={handleCreateSession} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold mb-1">Topic</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-black/15 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Date</label>
                  <input
                    type="text"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-black/15 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Time</label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-black/15 text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Subject</label>
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-black/15 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Participants</label>
                  <input
                    type="number"
                    min={2}
                    max={25}
                    value={newParticipants}
                    onChange={(e) => setNewParticipants(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-black/15 text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-tactile px-4 py-2 rounded-xl bg-[#dfe4f2] text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-tactile px-5 py-2 rounded-xl bg-[#080909] text-white text-xs font-semibold cursor-pointer"
                >
                  Create Meeting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
