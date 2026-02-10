'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface AggregateData {
  total_completed: number;
  total_in_progress: number;
  total_safety_flags: number;
  ratings_by_item: Record<string, Record<string, number>>;
  themes: Array<{ theme: string; count: number }>;
  districts: string[];
  schools: string[];
}

interface AggregateChartsProps {
  password: string;
}

const RATING_COLORS: Record<string, string> = {
  strongly_agree: '#22c55e',
  agree: '#86efac',
  disagree: '#fbbf24',
  strongly_disagree: '#ef4444',
  yes: '#22c55e',
  no: '#ef4444',
  often: '#22c55e',
  sometimes: '#86efac',
  rarely: '#fbbf24',
  never: '#ef4444',
  always: '#22c55e',
  a_lot: '#22c55e',
  not_discussed: '#d1d5db',
};

export default function AggregateCharts({ password }: AggregateChartsProps) {
  const [data, setData] = useState<AggregateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ district: '', school: '', gradeMin: '', gradeMax: '' });

  useEffect(() => {
    async function load() {
      const params = new URLSearchParams();
      if (filters.district) params.set('district', filters.district);
      if (filters.school) params.set('school', filters.school);
      if (filters.gradeMin) params.set('grade_min', filters.gradeMin);
      if (filters.gradeMax) params.set('grade_max', filters.gradeMax);

      const res = await fetch(`/api/admin/aggregate?${params}`, {
        headers: { 'x-admin-password': password },
      });
      if (res.ok) {
        setData(await res.json());
      }
      setLoading(false);
    }
    load();
  }, [password, filters]);

  if (loading) return <div className="p-8 text-center text-gray-400">Loading aggregate data...</div>;
  if (!data) return <div className="p-8 text-center text-gray-400">Failed to load data</div>;

  // Build chart data
  const chartData = Object.entries(data.ratings_by_item).map(([item, values]) => {
    const shortItem = item.length > 60 ? item.substring(0, 57) + '...' : item;
    return { name: shortItem, fullName: item, ...values };
  });

  // All rating values used
  const allValues = new Set<string>();
  Object.values(data.ratings_by_item).forEach((values) => {
    Object.keys(values).forEach((v) => allValues.add(v));
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-gray-500 mb-1">District</label>
          <select
            value={filters.district}
            onChange={(e) => setFilters({ ...filters, district: e.target.value })}
            className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 text-gray-700"
          >
            <option value="">All Districts</option>
            {data.districts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">School</label>
          <select
            value={filters.school}
            onChange={(e) => setFilters({ ...filters, school: e.target.value })}
            className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 text-gray-700"
          >
            <option value="">All Schools</option>
            {data.schools.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Grade Range</label>
          <div className="flex gap-1 items-center">
            <input
              type="number"
              min={5}
              max={12}
              value={filters.gradeMin}
              onChange={(e) => setFilters({ ...filters, gradeMin: e.target.value })}
              placeholder="5"
              className="w-14 text-sm border border-gray-300 rounded-lg px-2 py-1.5 text-gray-700"
            />
            <span className="text-gray-400">-</span>
            <input
              type="number"
              min={5}
              max={12}
              value={filters.gradeMax}
              onChange={(e) => setFilters({ ...filters, gradeMax: e.target.value })}
              placeholder="12"
              className="w-14 text-sm border border-gray-300 rounded-lg px-2 py-1.5 text-gray-700"
            />
          </div>
        </div>
      </div>

      {/* Rating Charts */}
      {chartData.length > 0 && (
        <Card>
          <h3 className="font-semibold text-gray-800 mb-4">Rating Distribution by Survey Item</h3>
          <div className="overflow-x-auto">
            <div style={{ minWidth: '600px', height: Math.max(400, chartData.length * 28) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 200, right: 20 }}>
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={200} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend />
                  {[...allValues].filter((v) => v !== 'not_discussed').map((value) => (
                    <Bar
                      key={value}
                      dataKey={value}
                      stackId="stack"
                      fill={RATING_COLORS[value] || '#9ca3af'}
                      name={value.replace(/_/g, ' ')}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      )}

      {/* Theme Cloud */}
      {data.themes.length > 0 && (
        <Card>
          <h3 className="font-semibold text-gray-800 mb-3">Common Themes</h3>
          <div className="flex flex-wrap gap-2">
            {data.themes.slice(0, 20).map(({ theme, count }) => (
              <span
                key={theme}
                className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm"
                style={{ fontSize: `${Math.min(16, 12 + count * 2)}px` }}
              >
                {theme} ({count})
              </span>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
