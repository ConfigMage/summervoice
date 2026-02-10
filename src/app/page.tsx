'use client';

import { useState } from 'react';
import WelcomePage from '@/components/welcome/WelcomePage';
import DemographicsForm from '@/components/demographics/DemographicsForm';
import ChatInterface from '@/components/chat/ChatInterface';
import ThankYouPage from '@/components/thankyou/ThankYouPage';

type Screen = 'welcome' | 'demographics' | 'chat' | 'thankyou';

export default function Home() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [interviewId, setInterviewId] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);

  const handleDemographicsSubmit = async (data: {
    program_name: string;
    district_name: string;
    school_name: string;
    grade: number;
    race: string[];
    home_languages: string;
    gender: string;
  }) => {
    setIsCreating(true);
    try {
      const res = await fetch('/api/interview/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.interview_id) {
        setInterviewId(result.interview_id);
        setScreen('chat');
      }
    } catch (err) {
      console.error('Error creating interview:', err);
    } finally {
      setIsCreating(false);
    }
  };

  switch (screen) {
    case 'welcome':
      return <WelcomePage onStart={() => setScreen('demographics')} />;
    case 'demographics':
      return <DemographicsForm onSubmit={handleDemographicsSubmit} isLoading={isCreating} />;
    case 'chat':
      return <ChatInterface interviewId={interviewId} onComplete={() => setScreen('thankyou')} />;
    case 'thankyou':
      return <ThankYouPage />;
  }
}
