import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

export default function ChatWindow({ messages, role, typing }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  return (
    <div className="flex flex-col flex-1 overflow-y-auto bg-gray-50 px-4 py-4">
      <p className="text-center text-xs text-gray-400 mb-4">
        Interview: <span className="text-gray-600 font-medium">{role}</span>
      </p>
      {messages.map((msg, i) => (
        <MessageBubble key={i} message={msg} />
      ))}
      {typing && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}
