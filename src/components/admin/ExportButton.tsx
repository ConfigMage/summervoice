'use client';

import Button from '@/components/ui/Button';

interface ExportButtonProps {
  password: string;
}

export default function ExportButton({ password }: ExportButtonProps) {
  const handleExport = async () => {
    const res = await fetch('/api/admin/export', {
      headers: { 'x-admin-password': password },
    });

    if (!res.ok) return;

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'summer-voice-ratings-export.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Button variant="secondary" onClick={handleExport}>
      Export CSV
    </Button>
  );
}
