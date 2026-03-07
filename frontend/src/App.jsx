import { useState } from 'react';
import { startInterview, submitTurn, endInterview } from './api';
import RoleSelector from './components/RoleSelector';
import ChatWindow from './components/ChatWindow';
import AnswerInput from './components/AnswerInput';
import FinalReport from './components/FinalReport';

// phase: 'setup' | 'interviewing' | 'ended'
export default function App() {
  const [phase, setPhase] = useState('setup');
  const [exitingSetup, setExitingSetup] = useState(false);
  const [role, setRole] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [finalReport, setFinalReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState(null);

  const addMessage = (role, text) =>
    setMessages((prev) => [...prev, { role, text }]);

  const handleStart = async (selectedRole) => {
    setError(null);
    setLoading(true);
    try {
      const data = await startInterview(selectedRole);
      setRole(selectedRole);
      setSessionId(data.session_id);
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
    return <FinalReport report={finalReport} role={role} onRestart={handleRestart} onRestartSameRole={handleRestartSameRole} />;
  }

  if (phase === 'setup') {
    return (
      <div className={exitingSetup ? 'animate-exit' : ''}>
        <RoleSelector onStart={handleStart} loading={loading} />
      </div>
    );
  }

  return (
    <div className="animate-chat-enter flex flex-col h-screen bg-white text-gray-900">
      {error && (
        <div className="bg-red-50 border-b border-red-200 text-red-700 text-sm px-4 py-2 text-center">
          {error}
        </div>
      )}
      <ChatWindow messages={messages} role={role} typing={typing} />
      <AnswerInput onSubmit={handleTurn} onEnd={handleEnd} loading={loading} />
    </div>
  );
}
