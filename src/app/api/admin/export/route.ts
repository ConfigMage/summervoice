import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const password = req.headers.get('x-admin-password');
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all ratings with interview details
    const { data: ratings, error } = await supabaseAdmin
      .from('ratings')
      .select(`
        survey_item,
        survey_category,
        value,
        source,
        confidence,
        interview_id,
        interviews (
          program_name,
          district_name,
          school_name,
          grade,
          gender,
          race,
          created_at,
          safety_flag
        )
      `)
      .order('interview_id');

    if (error) {
      return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
    }

    // Build CSV
    const headers = [
      'interview_id',
      'program_name',
      'district_name',
      'school_name',
      'grade',
      'gender',
      'race',
      'safety_flag',
      'interview_date',
      'survey_category',
      'survey_item',
      'value',
      'source',
      'confidence',
    ];

    const rows = (ratings || []).map((r) => {
      const interview = r.interviews as unknown as Record<string, unknown> | null;
      return [
        r.interview_id,
        csvEscape(String(interview?.program_name || '')),
        csvEscape(String(interview?.district_name || '')),
        csvEscape(String(interview?.school_name || '')),
        String(interview?.grade || ''),
        csvEscape(String(interview?.gender || '')),
        csvEscape(Array.isArray(interview?.race) ? (interview.race as string[]).join('; ') : ''),
        String(interview?.safety_flag || false),
        String(interview?.created_at || ''),
        csvEscape(r.survey_category),
        csvEscape(r.survey_item),
        r.value,
        r.source,
        String(r.confidence ?? ''),
      ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=summer-voice-ratings-export.csv',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function csvEscape(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
