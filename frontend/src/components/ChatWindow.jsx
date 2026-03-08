import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

export default function ChatWindow({ messages, typing }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  return (
    <div className="flex flex-col flex-1 overflow-y-auto bg-gray-50/60 px-5 py-5">
      {messages.map((msg, i) => (
        <MessageBubble key={i} message={msg} />
      ))}
      {typing && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}
