export default function MessageBubble({ message }) {
  const isAI = message.role === 'assistant';

  return (
    <div className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-4`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap
          ${isAI
            ? 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
            : 'bg-indigo-600 text-white rounded-tr-sm'
          }`}
      >
        {message.text}
      </div>
    </div>
  );
}
