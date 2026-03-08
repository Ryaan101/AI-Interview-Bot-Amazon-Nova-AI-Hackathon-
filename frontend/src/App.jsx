import { useState } from 'react';
import { startInterview, submitTurn, endInterview } from './api';
import RoleSelector from './components/RoleSelector';
import ChatWindow from './components/ChatWindow';
import AnswerInput from './components/AnswerInput';
import FinalReport from './components/FinalReport';
import Headshot from './components/Headshot';

// phase: 'setup' | 'interviewing' | 'ended'
export default function App() {
  const [phase, setPhase] = useState('setup');
  const [exitingSetup, setExitingSetup] = useState(false);
  const [role, setRole] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [finalReport, setFinalReport] = useState(null);
  const [conductTerminated, setConductTerminated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState(null);
  const [avatarSeeds, setAvatarSeeds] = useState([0, 0]);

  const addMessage = (role, text) =>
    setMessages((prev) => [...prev, { role, text }]);

  const handleStart = async (selectedRole) => {
    setError(null);
    setLoading(true);
    try {
      const data = await startInterview(selectedRole);
      setRole(selectedRole);
      setSessionId(data.session_id);
      setAvatarSeeds([Math.floor(Math.random() * 100000), Math.floor(Math.random() * 100000)]);
      const ai = data.ai;
      const text = [ai.interviewer_message, ai.next_question].filter(Boolean).join('\n\n');
      setMessages([{ role: 'assistant', text }]);
      // Play exit animation before switching phase
      setExitingSetup(true);
      await new Promise((r) => setTimeout(r, 320));
      setPhase('interviewing');
      setExitingSetup(false);
    } catch (e) {
      setExitingSetup(false);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTurn = async (text) => {
    setError(null);
    addMessage('user', text);
    setLoading(true);
    setTyping(true);
    try {
      const data = await submitTurn(sessionId, text);
      const replyText = [data.interviewer_message, data.next_question]
        .filter(Boolean)
        .join('\n\n');

      // Hold the typing indicator for a random natural-feeling delay (800–2200ms)
      const delay = 800 + Math.random() * 1400;
      await new Promise((r) => setTimeout(r, delay));

      setTyping(false);
      addMessage('assistant', replyText);

      if (data.end_interview) {
        setFinalReport(data.final_report);
        setConductTerminated(!!data.conduct_terminated);
        setPhase('ended');
      }
    } catch (e) {
      setTyping(false);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEnd = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await endInterview(sessionId);
      setFinalReport(data.final_report);
      setPhase('ended');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    setPhase('setup');
    setRole('');
    setSessionId(null);
    setMessages([]);
    setFinalReport(null);
    setConductTerminated(false);
    setError(null);
  };

  const handleRestartSameRole = () => {
    const currentRole = role;
    setSessionId(null);
    setMessages([]);
    setFinalReport(null);
    setError(null);
    handleStart(currentRole);
  };

  if (phase === 'ended') {
    return <FinalReport report={finalReport} role={role} conductTerminated={conductTerminated} onRestart={handleRestart} onRestartSameRole={handleRestartSameRole} />;
  }

  if (phase === 'setup') {
    return (
      <div className={exitingSetup ? 'animate-exit' : ''}>
        <RoleSelector onStart={handleStart} loading={loading} />
      </div>
    );
  }

  return (
    <div
      className="animate-chat-enter relative flex items-center justify-center min-h-screen overflow-hidden px-4 py-6"
      style={{ background: 'linear-gradient(145deg, #FEFCF8 0%, #FFF8EE 45%, #F5F4FF 100%)' }}
    >
      {/* Orb background — matches landing & report screens */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="rg-c1" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#FF9900" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#FF9900" stopOpacity="0"    />
            </radialGradient>
            <radialGradient id="rg-c2" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#6366F1" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0"    />
            </radialGradient>
          </defs>
          <ellipse className="orb-1" cx="85%" cy="10%" rx="340" ry="340" fill="url(#rg-c1)" />
          <ellipse className="orb-2" cx="10%" cy="90%" rx="300" ry="300" fill="url(#rg-c2)" />
        </svg>
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.03 }} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dotgrid-c" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.5" fill="#64748B" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dotgrid-c)" />
        </svg>
      </div>

      {/* iPad-landscape card with flanking headshots */}
      <div className="relative z-10 flex items-center gap-6 w-full justify-center">
        {/* Interviewer headshot (left) */}
        <div className="hidden lg:block shrink-0 animate-fade-slide-up" style={{ animationDelay: '200ms' }}>
          <Headshot seed={avatarSeeds[0]} active={typing} label="Interviewer" />
        </div>

        {/* Chat card */}
        <div
          className="flex flex-col w-full overflow-hidden rounded-3xl shadow-2xl bg-white"
          style={{ maxWidth: '1024px', height: 'min(768px, calc(100vh - 3rem))' }}
        >
        {/* Chrome bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #FF9900 0%, #F97316 100%)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                   stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="8" width="18" height="13" rx="3" />
                <line x1="12" y1="3" x2="12" y2="8" />
                <circle cx="12" cy="2.5" r="1.5" fill="white" stroke="none" />
                <circle cx="8.5" cy="14" r="1.5" />
                <circle cx="15.5" cy="14" r="1.5" />
                <path d="M9 18 Q12 20 15 18" />
              </svg>
            </div>
            <div className="leading-tight">
              <p className="text-xs font-semibold text-gray-800">AI Interview Bot</p>
              <p className="text-[10px] text-gray-400">{role}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-b border-red-200 text-red-700 text-sm px-4 py-2 text-center shrink-0">
            {error}
          </div>
        )}
        <ChatWindow messages={messages} role={role} typing={typing} />
        <AnswerInput onSubmit={handleTurn} onEnd={handleEnd} loading={loading} />
        </div>

        {/* Interviewee headshot (right) */}
        <div className="hidden lg:block shrink-0 animate-fade-slide-up" style={{ animationDelay: '300ms' }}>
          <Headshot seed={avatarSeeds[1]} active={!loading && !typing} label="You" />
        </div>
      </div>
    </div>
  );
}
