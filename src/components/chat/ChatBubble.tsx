'use client';

interface ChatBubbleProps {
  role: 'assistant' | 'user';
  content: string;
}

export default function ChatBubble({ role, content }: ChatBubbleProps) {
  const isAssistant = role === 'assistant';

  return (
    <div className={`flex ${isAssistant ? 'justify-start' : 'justify-end'} mb-3`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm md:text-base leading-relaxed ${
          isAssistant
            ? 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-sm'
            : 'bg-emerald-600 text-white rounded-tr-sm'
        }`}
      >
        {content}
      </div>
    </div>
  );
}
