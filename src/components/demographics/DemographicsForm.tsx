'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';

interface DemographicsData {
  program_name: string;
  district_name: string;
  school_name: string;
  grade: number;
  race: string[];
  home_languages: string;
  gender: string;
}

interface DemographicsFormProps {
  onSubmit: (data: DemographicsData) => void;
  isLoading?: boolean;
}

const RACE_OPTIONS = [
  'American Indian/Alaskan Native',
  'Native Hawaiian/Pacific Islander',
  'Asian',
  'Black/African American',
  'White',
  'Hispanic/Latino/a/x',
  'Prefer not to answer',
];

const GENDER_OPTIONS = ['Female', 'Male', 'Non-binary', 'I prefer not to answer'];

const GRADES = [5, 6, 7, 8, 9, 10, 11, 12];

export default function DemographicsForm({ onSubmit, isLoading }: DemographicsFormProps) {
  const [form, setForm] = useState<DemographicsData>({
    program_name: '',
    district_name: '',
    school_name: '',
    grade: 0,
    race: [],
    home_languages: '',
    gender: '',
  });

  const handleRaceToggle = (race: string) => {
    if (race === 'Prefer not to answer') {
      setForm((prev) => ({
        ...prev,
        race: prev.race.includes(race) ? [] : [race],
      }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      race: prev.race.includes(race)
        ? prev.race.filter((r) => r !== race)
        : [...prev.race.filter((r) => r !== 'Prefer not to answer'), race],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.grade === 0) return;
    onSubmit(form);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-green-50 to-amber-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">A little about you</h1>
          <p className="text-gray-500 mt-1">This helps us understand who we&apos;re talking to.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-sm space-y-5">
          {/* Program Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Program Name <span className="text-gray-400 font-normal">(if you know it)</span>
            </label>
            <input
              type="text"
              value={form.program_name}
              onChange={(e) => setForm({ ...form, program_name: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="e.g., Summer Bridge Academy"
            />
          </div>

          {/* District Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              District Name <span className="text-gray-400 font-normal">(ask an adult if unsure)</span>
            </label>
            <input
              type="text"
              value={form.district_name}
              onChange={(e) => setForm({ ...form, district_name: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* School Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              School Name <span className="text-gray-400 font-normal">(ask an adult if unsure)</span>
            </label>
            <input
              type="text"
              value={form.school_name}
              onChange={(e) => setForm({ ...form, school_name: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Grade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grade (upcoming year) <span className="text-red-500">*</span>
            </label>
            <select
              value={form.grade}
              onChange={(e) => setForm({ ...form, grade: parseInt(e.target.value) })}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value={0}>Select your grade...</option>
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  Grade {g}
                </option>
              ))}
            </select>
          </div>

          {/* Race */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Race / Ethnicity <span className="text-gray-400 font-normal">(select all that apply)</span>
            </label>
            <div className="space-y-2">
              {RACE_OPTIONS.map((race) => (
                <label key={race} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.race.includes(race)}
                    onChange={() => handleRaceToggle(race)}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">{race}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Home Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Home Language(s)
            </label>
            <input
              type="text"
              value={form.home_languages}
              onChange={(e) => setForm({ ...form, home_languages: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="e.g., English, Spanish"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
            <div className="space-y-2">
              {GENDER_OPTIONS.map((g) => (
                <label key={g} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={form.gender === g}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">{g}</span>
                </label>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={form.grade === 0 || isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
          >
            {isLoading ? 'Setting up...' : 'Start Conversation'}
          </Button>
        </form>
      </div>
    </div>
  );
}
