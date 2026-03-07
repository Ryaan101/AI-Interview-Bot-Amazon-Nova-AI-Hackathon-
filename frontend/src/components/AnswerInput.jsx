import { useState, useRef, useEffect } from 'react';

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition || null;

export default function AnswerInput({ onSubmit, onEnd, loading }) {
  const [text, setText] = useState('');
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!SpeechRecognition) return;
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US';

    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setText((prev) => (prev ? prev + ' ' + transcript : transcript));
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);

    recognitionRef.current = rec;
  }, []);

  const toggleMic = () => {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    onSubmit(trimmed);
    setText('');
  };

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-3">
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) handleSubmit(e);
          }}
          disabled={loading}
          placeholder="Type your answer… (Enter to send, Shift+Enter for new line)"
          rows={2}
          className="flex-1 resize-none bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 rounded-xl
                     px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9900]
                     disabled:opacity-50"
        />

        {SpeechRecognition && (
          <button
            type="button"
            onClick={toggleMic}
            disabled={loading}
            title={listening ? 'Stop recording' : 'Start voice input'}
            className={`p-3 rounded-xl transition-colors disabled:opacity-50
              ${listening
                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                : 'bg-gray-100 hover:bg-gray-200'
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${listening ? 'text-white' : 'text-gray-600'}`} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm6 10a6 6 0 0 1-12 0H4a8 8 0 0 0 16 0h-2zm-6 8a8 8 0 0 0 8-8h-2a6 6 0 0 1-12 0H4a8 8 0 0 0 8 8zm-1 2h2v2h-2v-2z"/>
            </svg>
          </button>
        )}

        <button
          type="submit"
          disabled={!text.trim() || loading}
          className="btn-orange px-4 py-3 rounded-xl text-sm font-medium transition-colors"
        >
          {loading ? '…' : 'Send'}
        </button>

        <button
          type="button"
          onClick={onEnd}
          disabled={loading}
          className="bg-gray-100 hover:bg-red-100 hover:text-red-700 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed
                     px-4 py-3 rounded-xl text-sm font-medium transition-colors border border-gray-200"
          title="End interview and get report"
        >
          End
        </button>
      </form>
    </div>
  );
}
