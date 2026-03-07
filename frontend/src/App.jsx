import { useState } from 'react';
import { startInterview, submitTurn, endInterview } from './api';
import RoleSelector from './components/RoleSelector';
import ChatWindow from './components/ChatWindow';
import AnswerInput from './components/AnswerInput';
import FinalReport from './components/FinalReport';

// phase: 'setup' | 'interviewing' | 'ended'
export default function App() {
  const [phase, setPhase] = useState('setup');
  const [role, setRole] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [finalReport, setFinalReport] = useState(null);
  const [loading, setLoading] = useState(false);
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
      setPhase('interviewing');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTurn = async (text) => {
    setError(null);
    addMessage('user', text);
    setLoading(true);
    try {
      const data = await submitTurn(sessionId, text);
      const replyText = [data.interviewer_message, data.next_question]
        .filter(Boolean)
        .join('\n\n');
      addMessage('assistant', replyText);

      if (data.end_interview) {
        setFinalReport(data.final_report);
        setPhase('ended');
      }
    } catch (e) {
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

  if (phase === 'ended') {
    return <FinalReport report={finalReport} role={role} onRestart={handleRestart} />;
  }

  if (phase === 'setup') {
    return <RoleSelector onStart={handleStart} loading={loading} />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white">
      {error && (
        <div className="bg-red-900 text-red-200 text-sm px-4 py-2 text-center">
          {error}
        </div>
      )}
      <ChatWindow messages={messages} role={role} />
      <AnswerInput onSubmit={handleTurn} onEnd={handleEnd} loading={loading} />
    </div>
  );
}
