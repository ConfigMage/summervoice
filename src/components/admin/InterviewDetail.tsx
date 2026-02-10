'use client';

import { useState, useEffect } from 'react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface InterviewDetailProps {
  interviewId: string;
  password: string;
  onBack: () => void;
}

interface DetailData {
  interview: {
    id: string;
    program_name: string;
    district_name: string;
    school_name: string;
    grade: number;
    race: string[];
    gender: string;
    status: string;
    safety_flag: boolean;
    safety_notes: string;
    created_at: string;
    completed_at: string;
  };
  messages: Array<{ role: string; content: string; created_at: string }>;
  ratings: Array<{
    survey_item: string;
    survey_category: string;
    value: string;
    source: string;
    confidence: number;
  }>;
  summary: {
    summary: string;
    themes: string[];
    key_quotes: string[];
    sentiment_overview: Record<string, string>;
    strengths: string[];
    improvements: string[];
  } | null;
}

export default function InterviewDetail({ interviewId, password, onBack }: InterviewDetailProps) {
  const [data, setData] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/admin/interview/${interviewId}`, {
        headers: { 'x-admin-password': password },
      });
      if (res.ok) {
        setData(await res.json());
      }
      setLoading(false);
    }
    load();
  }, [interviewId, password]);

  if (loading) return <div className="p-8 text-center text-gray-400">Loading interview details...</div>;
  if (!data) return <div className="p-8 text-center text-gray-400">Interview not found</div>;

  const { interview, messages, ratings, summary } = data;

  // Group ratings by category
  const ratingsByCategory: Record<string, typeof ratings> = {};
  ratings.forEach((r) => {
    if (!ratingsByCategory[r.survey_category]) ratingsByCategory[r.survey_category] = [];
    ratingsByCategory[r.survey_category].push(r);
  });

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack}>&larr; Back to list</Button>

      {/* Header */}
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-gray-800">Interview Detail</h2>
        <Badge variant={interview.status === 'completed' ? 'success' : 'warning'}>
          {interview.status}
        </Badge>
        {interview.safety_flag && <Badge variant="danger">SAFETY FLAG</Badge>}
      </div>

      {/* Safety Alert */}
      {interview.safety_flag && (
        <Card className="border-red-300 bg-red-50">
          <h3 className="font-semibold text-red-800 mb-1">Safety Concern Flagged</h3>
          <p className="text-red-700 text-sm">{interview.safety_notes || 'No details provided'}</p>
        </Card>
      )}

      {/* Demographics */}
      <Card>
        <h3 className="font-semibold text-gray-800 mb-3">Demographics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div><span className="text-gray-500">Grade:</span> <span className="text-gray-800 font-medium">{interview.grade}</span></div>
          <div><span className="text-gray-500">Program:</span> <span className="text-gray-800">{interview.program_name || '-'}</span></div>
          <div><span className="text-gray-500">District:</span> <span className="text-gray-800">{interview.district_name || '-'}</span></div>
          <div><span className="text-gray-500">School:</span> <span className="text-gray-800">{interview.school_name || '-'}</span></div>
          <div><span className="text-gray-500">Gender:</span> <span className="text-gray-800">{interview.gender || '-'}</span></div>
          <div><span className="text-gray-500">Race:</span> <span className="text-gray-800">{interview.race?.join(', ') || '-'}</span></div>
          <div><span className="text-gray-500">Started:</span> <span className="text-gray-800">{new Date(interview.created_at).toLocaleString()}</span></div>
          <div><span className="text-gray-500">Completed:</span> <span className="text-gray-800">{interview.completed_at ? new Date(interview.completed_at).toLocaleString() : '-'}</span></div>
        </div>
      </Card>

      {/* Summary */}
      {summary && (
        <>
          <Card>
            <h3 className="font-semibold text-gray-800 mb-2">Summary</h3>
            <p className="text-gray-700 text-sm leading-relaxed">{summary.summary}</p>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <h3 className="font-semibold text-gray-800 mb-2">Themes</h3>
              <div className="flex flex-wrap gap-2">
                {summary.themes.map((theme, i) => (
                  <Badge key={i} variant="info">{theme}</Badge>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold text-gray-800 mb-2">Sentiment</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(summary.sentiment_overview || {}).map(([key, val]) => (
                  <div key={key}>
                    <span className="text-gray-500 capitalize">{key.replace(/_/g, ' ')}:</span>{' '}
                    <span className="text-gray-800 font-medium capitalize">{val}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold text-gray-800 mb-2">Strengths</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                {(summary.strengths || []).map((s, i) => (
                  <li key={i}>&bull; {s}</li>
                ))}
              </ul>
            </Card>

            <Card>
              <h3 className="font-semibold text-gray-800 mb-2">Improvements</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                {(summary.improvements || []).map((s, i) => (
                  <li key={i}>&bull; {s}</li>
                ))}
              </ul>
            </Card>
          </div>

          <Card>
            <h3 className="font-semibold text-gray-800 mb-2">Key Quotes</h3>
            <div className="space-y-2">
              {summary.key_quotes.map((q, i) => (
                <blockquote key={i} className="border-l-3 border-blue-300 pl-3 text-sm text-gray-600 italic">
                  &ldquo;{q}&rdquo;
                </blockquote>
              ))}
            </div>
          </Card>
        </>
      )}

      {/* Ratings */}
      {ratings.length > 0 && (
        <Card>
          <h3 className="font-semibold text-gray-800 mb-3">Ratings ({ratings.length} items)</h3>
          <div className="space-y-4">
            {Object.entries(ratingsByCategory).map(([category, items]) => (
              <div key={category}>
                <h4 className="text-sm font-medium text-gray-600 mb-2">{category}</h4>
                <div className="space-y-1">
                  {items.map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-gray-50">
                      <span className="text-gray-700 flex-1 mr-4">{r.survey_item}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-medium text-gray-800 capitalize">{r.value.replace(/_/g, ' ')}</span>
                        <Badge variant={r.source === 'direct' ? 'success' : 'default'}>
                          {r.source}
                        </Badge>
                        {r.confidence !== null && (
                          <span className="text-gray-400">{Math.round(r.confidence * 100)}%</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Transcript */}
      <Card>
        <h3 className="font-semibold text-gray-800 mb-3">Full Transcript ({messages.length} messages)</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {messages.map((msg, i) => (
            <div key={i} className={`text-sm ${msg.role === 'assistant' ? 'text-gray-600' : 'text-gray-800'}`}>
              <span className="font-medium capitalize">{msg.role === 'user' ? 'Student' : 'Interviewer'}:</span>{' '}
              {msg.content.replace(/\[INTERVIEW_COMPLETE\]/g, '')}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
