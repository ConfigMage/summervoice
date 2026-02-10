'use client';

import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

interface Interview {
  id: string;
  program_name: string | null;
  district_name: string | null;
  school_name: string | null;
  grade: number;
  safety_flag: boolean;
  safety_notes: string | null;
  created_at: string;
}

interface SafetyAlertsProps {
  interviews: Interview[];
  onSelect: (id: string) => void;
}

export default function SafetyAlerts({ interviews, onSelect }: SafetyAlertsProps) {
  const flagged = interviews
    .filter((i) => i.safety_flag)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (flagged.length === 0) {
    return (
      <Card>
        <div className="text-center py-8 text-gray-400">
          No safety flags reported. All clear.
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Badge variant="danger">{flagged.length}</Badge>
        <span className="font-semibold text-red-800">Safety Alerts</span>
      </div>

      {flagged.map((interview) => (
        <Card
          key={interview.id}
          className="border-red-200 bg-red-50 cursor-pointer hover:border-red-300 transition-colors"
        >
          <div onClick={() => onSelect(interview.id)}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge variant="danger">SAFETY FLAG</Badge>
                <span className="text-sm text-gray-600">Grade {interview.grade}</span>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(interview.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {interview.district_name && `${interview.district_name} / `}
              {interview.school_name && `${interview.school_name} / `}
              {interview.program_name || 'Unknown Program'}
            </p>
            {interview.safety_notes && (
              <p className="mt-2 text-sm text-red-700 bg-red-100 rounded-lg p-3">
                {interview.safety_notes}
              </p>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
