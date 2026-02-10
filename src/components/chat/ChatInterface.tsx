'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import ChatBubble from './ChatBubble';
import TypingIndicator from './TypingIndicator';
import ChatInput from './ChatInput';

interface Message {
  role: 'assistant' | 'user';
  content: string;
}

interface ChatInterfaceProps {
  interviewId: string;
  onComplete: () => void;
}

export default function ChatInterface({ interviewId, onComplete }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText]);

  const sendMessage = useCallback(async (userMessage: string) => {
    if (isLoading) return;

    // Add user message to display
    if (userMessage) {
      setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    }

    setIsLoading(true);
    setStreamingText('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interview_id: interviewId, message: userMessage }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Chat request failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.text) {
                accumulated += data.text;
                setStreamingText(accumulated);
              }

              if (data.done) {
                // Strip [INTERVIEW_COMPLETE] from display text
                const displayText = accumulated.replace(/\[INTERVIEW_COMPLETE\]/g, '').trim();
                setMessages((prev) => [...prev, { role: 'assistant', content: displayText }]);
                setStreamingText('');

                if (data.isComplete) {
                  // Mark interview complete
                  await fetch('/api/interview/complete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ interview_id: interviewId }),
                  });
                  onComplete();
                }
              }
            } catch {
              // Skip malformed JSON lines
            }
          }
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "Hmm, let me think... I'm having a little trouble right now. Could you try saying that again?",
        },
      ]);
      setStreamingText('');
    } finally {
      setIsLoading(false);
    }
  }, [interviewId, isLoading, onComplete]);

  // Send initial empty message to get the AI's greeting
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      sendMessage('hi');
    }
  }, [sendMessage]);

  const handleEndConversation = async () => {
    await fetch('/api/interview/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ interview_id: interviewId }),
    });
    onComplete();
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-sky-50 to-green-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur border-b border-gray-200">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">Summer Voice</h1>
          <p className="text-xs text-gray-500">Your feedback conversation</p>
        </div>
        <button
          onClick={handleEndConversation}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          End Conversation
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.map((msg, i) => (
          <ChatBubble key={i} role={msg.role} content={msg.content} />
        ))}
        {streamingText && (
          <ChatBubble role="assistant" content={streamingText.replace(/\[INTERVIEW_COMPLETE\]/g, '')} />
        )}
        {isLoading && !streamingText && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  );
}
