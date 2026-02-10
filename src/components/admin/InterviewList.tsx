'use client';

import { useState, useMemo } from 'react';
import Badge from '@/components/ui/Badge';

interface Interview {
  id: string;
  program_name: string | null;
  district_name: string | null;
  school_name: string | null;
  grade: number;
  gender: string | null;
  status: string;
  safety_flag: boolean;
  created_at: string;
  completed_at: string | null;
  summaries: Array<{
    summary: string;
    themes: string[];
    sentiment_overview: Record<string, string>;
  }>;
}

interface InterviewListProps {
  interviews: Interview[];
  onSelect: (id: string) => void;
}

export default function InterviewList({ interviews, onSelect }: InterviewListProps) {
  const [filter, setFilter] = useState({
    district: '',
    school: '',
    gradeMin: '',
    gradeMax: '',
    safetyOnly: false,
    status: '',
  });
  const [sortField, setSortField] = useState<'created_at' | 'grade' | 'status'>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const districts = useMemo(() => [...new Set(interviews.map((i) => i.district_name).filter(Boolean))], [interviews]);
  const schools = useMemo(() => [...new Set(interviews.map((i) => i.school_name).filter(Boolean))], [interviews]);

  const filtered = useMemo(() => {
    let result = [...interviews];

    if (filter.district) result = result.filter((i) => i.district_name === filter.district);
    if (filter.school) result = result.filter((i) => i.school_name === filter.school);
    if (filter.gradeMin) result = result.filter((i) => i.grade >= parseInt(filter.gradeMin));
    if (filter.gradeMax) result = result.filter((i) => i.grade <= parseInt(filter.gradeMax));
    if (filter.safetyOnly) result = result.filter((i) => i.safety_flag);
    if (filter.status) result = result.filter((i) => i.status === filter.status);

    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [interviews, filter, sortField, sortDir]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const getSentiment = (interview: Interview) => {
    const summary = interview.summaries?.[0];
    return summary?.sentiment_overview?.overall || '-';
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-gray-500 mb-1">District</label>
          <select
            value={filter.district}
            onChange={(e) => setFilter({ ...filter, district: e.target.value })}
            className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 text-gray-700"
          >
            <option value="">All Districts</option>
            {districts.map((d) => (
              <option key={d} value={d!}>{d}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">School</label>
          <select
            value={filter.school}
            onChange={(e) => setFilter({ ...filter, school: e.target.value })}
            className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 text-gray-700"
          >
            <option value="">All Schools</option>
            {schools.map((s) => (
              <option key={s} value={s!}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Grade</label>
          <div className="flex gap-1 items-center">
            <input
              type="number"
              min={5}
              max={12}
              value={filter.gradeMin}
              onChange={(e) => setFilter({ ...filter, gradeMin: e.target.value })}
              placeholder="5"
              className="w-14 text-sm border border-gray-300 rounded-lg px-2 py-1.5 text-gray-700"
            />
            <span className="text-gray-400">-</span>
            <input
              type="number"
              min={5}
              max={12}
              value={filter.gradeMax}
              onChange={(e) => setFilter({ ...filter, gradeMax: e.target.value })}
              placeholder="12"
              className="w-14 text-sm border border-gray-300 rounded-lg px-2 py-1.5 text-gray-700"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Status</label>
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 text-gray-700"
          >
            <option value="">All</option>
            <option value="completed">Completed</option>
            <option value="in_progress">In Progress</option>
          </select>
        </div>
        <label className="flex items-center gap-2 cursor-pointer pb-0.5">
          <input
            type="checkbox"
            checked={filter.safetyOnly}
            onChange={(e) => setFilter({ ...filter, safetyOnly: e.target.checked })}
            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
          />
          <span className="text-sm text-red-600 font-medium">Safety Flags Only</span>
        </label>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th
                className="text-left px-4 py-3 text-gray-600 font-medium cursor-pointer hover:text-gray-800"
                onClick={() => handleSort('created_at')}
              >
                Date {sortField === 'created_at' && (sortDir === 'asc' ? '↑' : '↓')}
              </th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Program</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">District</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">School</th>
              <th
                className="text-left px-4 py-3 text-gray-600 font-medium cursor-pointer hover:text-gray-800"
                onClick={() => handleSort('grade')}
              >
                Grade {sortField === 'grade' && (sortDir === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="text-left px-4 py-3 text-gray-600 font-medium cursor-pointer hover:text-gray-800"
                onClick={() => handleSort('status')}
              >
                Status {sortField === 'status' && (sortDir === 'asc' ? '↑' : '↓')}
              </th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Safety</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Sentiment</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((interview) => (
              <tr
                key={interview.id}
                onClick={() => onSelect(interview.id)}
                className={`border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors ${
                  interview.safety_flag ? 'bg-red-50' : ''
                }`}
              >
                <td className="px-4 py-3 text-gray-700">
                  {new Date(interview.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-gray-700">{interview.program_name || '-'}</td>
                <td className="px-4 py-3 text-gray-700">{interview.district_name || '-'}</td>
                <td className="px-4 py-3 text-gray-700">{interview.school_name || '-'}</td>
                <td className="px-4 py-3 text-gray-700">{interview.grade}</td>
                <td className="px-4 py-3">
                  <Badge variant={interview.status === 'completed' ? 'success' : 'warning'}>
                    {interview.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {interview.safety_flag && (
                    <Badge variant="danger">FLAG</Badge>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-700 capitalize">{getSentiment(interview)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                  No interviews found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400">Showing {filtered.length} of {interviews.length} interviews</p>
    </div>
  );
}
