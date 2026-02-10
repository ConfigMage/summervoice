'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import InterviewList from './InterviewList';
import InterviewDetail from './InterviewDetail';
import SafetyAlerts from './SafetyAlerts';
import AggregateCharts from './AggregateCharts';
import ExportButton from './ExportButton';

interface Interview {
  id: string;
  program_name: string | null;
  district_name: string | null;
  school_name: string | null;
  grade: number;
  gender: string | null;
  race: string[];
  status: string;
  safety_flag: boolean;
  safety_notes: string | null;
  created_at: string;
  completed_at: string | null;
  summaries: Array<{
    summary: string;
    themes: string[];
    sentiment_overview: Record<string, string>;
  }>;
}

type Tab = 'overview' | 'interviews' | 'safety' | 'aggregate';

interface AdminDashboardProps {
  password: string;
}

export default function AdminDashboard({ password }: AdminDashboardProps) {
  const [tab, setTab] = useState<Tab>('overview');
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/admin/interviews', {
        headers: { 'x-admin-password': password },
      });
      if (res.ok) {
        const data = await res.json();
        setInterviews(data.interviews || []);
      }
      setLoading(false);
    }
    load();
  }, [password]);

  const completed = interviews.filter((i) => i.status === 'completed');
  const inProgress = interviews.filter((i) => i.status === 'in_progress');
  const flagged = interviews.filter((i) => i.safety_flag);

  const avgDuration = completed
    .filter((i) => i.completed_at)
    .reduce((acc, i) => {
      const start = new Date(i.created_at).getTime();
      const end = new Date(i.completed_at!).getTime();
      return acc + (end - start);
    }, 0) / (completed.filter((i) => i.completed_at).length || 1);

  const avgMinutes = Math.round(avgDuration / 60000);

  // District breakdown
  const districtCounts: Record<string, number> = {};
  interviews.forEach((i) => {
    const key = i.district_name || 'Unknown';
    districtCounts[key] = (districtCounts[key] || 0) + 1;
  });

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading...</div>;
  }

  if (selectedId) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto">
          <InterviewDetail interviewId={selectedId} password={password} onBack={() => setSelectedId(null)} />
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; alert?: boolean }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'interviews', label: 'Interviews' },
    { id: 'safety', label: `Safety Alerts${flagged.length > 0 ? ` (${flagged.length})` : ''}`, alert: flagged.length > 0 },
    { id: 'aggregate', label: 'Aggregate Data' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Summer Voice Admin</h1>
            <p className="text-sm text-gray-500">{interviews.length} total interviews</p>
          </div>
          <ExportButton password={password} />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="max-w-6xl mx-auto flex gap-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              } ${t.alert ? 'text-red-600' : ''}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
        {tab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-3xl font-bold text-gray-800">{completed.length}</p>
              </Card>
              <Card>
                <p className="text-sm text-gray-500">In Progress</p>
                <p className="text-3xl font-bold text-amber-600">{inProgress.length}</p>
              </Card>
              <Card className={flagged.length > 0 ? 'border-red-200 bg-red-50' : ''}>
                <p className="text-sm text-gray-500">Safety Flags</p>
                <p className={`text-3xl font-bold ${flagged.length > 0 ? 'text-red-600' : 'text-gray-800'}`}>
                  {flagged.length}
                </p>
              </Card>
              <Card>
                <p className="text-sm text-gray-500">Avg. Duration</p>
                <p className="text-3xl font-bold text-gray-800">{avgMinutes}m</p>
              </Card>
            </div>

            {/* Safety alerts preview */}
            {flagged.length > 0 && (
              <div>
                <h3 className="font-semibold text-red-800 mb-3">Recent Safety Alerts</h3>
                <SafetyAlerts interviews={interviews} onSelect={(id) => setSelectedId(id)} />
              </div>
            )}

            {/* District breakdown */}
            <Card>
              <h3 className="font-semibold text-gray-800 mb-3">By District</h3>
              <div className="space-y-2">
                {Object.entries(districtCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([district, count]) => (
                    <div key={district} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{district}</span>
                      <span className="text-gray-500">{count} interviews</span>
                    </div>
                  ))}
              </div>
            </Card>
          </div>
        )}

        {tab === 'interviews' && (
          <InterviewList interviews={interviews} onSelect={(id) => setSelectedId(id)} />
        )}

        {tab === 'safety' && (
          <SafetyAlerts interviews={interviews} onSelect={(id) => setSelectedId(id)} />
        )}

        {tab === 'aggregate' && (
          <AggregateCharts password={password} />
        )}
      </div>
    </div>
  );
}
