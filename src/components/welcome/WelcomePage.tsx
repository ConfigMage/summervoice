'use client';

import Button from '@/components/ui/Button';

interface WelcomePageProps {
  onStart: () => void;
}

export default function WelcomePage({ onStart }: WelcomePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-green-50 to-amber-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center space-y-8">
        <div className="space-y-2">
          <div className="text-6xl">&#x2600;&#xFE0F;</div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Summer Voice
          </h1>
          <p className="text-lg text-gray-500">
            Student Feedback Conversation
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur rounded-2xl p-6 md:p-8 shadow-sm space-y-4 text-left">
          <h2 className="text-xl font-semibold text-gray-800 text-center">
            We want to hear about YOUR summer program experience!
          </h2>

          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start gap-3">
              <span className="text-green-500 mt-0.5 text-lg">&#x2714;&#xFE0F;</span>
              <span>This is a <strong>conversation</strong>, not a test. There are no wrong answers!</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500 mt-0.5 text-lg">&#x1F512;</span>
              <span>Your responses are <strong>private and anonymous</strong>.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-500 mt-0.5 text-lg">&#x23F1;&#xFE0F;</span>
              <span>It takes about <strong>10-15 minutes</strong>.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-500 mt-0.5 text-lg">&#x1F4AC;</span>
              <span>Just chat naturally — share what you really think!</span>
            </li>
          </ul>
        </div>

        <Button size="lg" onClick={onStart} className="w-full text-lg py-4 bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500">
          Let&apos;s Get Started
        </Button>
      </div>
    </div>
  );
}
