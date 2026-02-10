import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const password = req.headers.get('x-admin-password');
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from('interviews')
      .select(`
        id,
        program_name,
        district_name,
        school_name,
        grade,
        race,
        gender,
        status,
        safety_flag,
        safety_notes,
        created_at,
        completed_at,
        summaries (
          summary,
          themes,
          sentiment_overview
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching interviews:', error);
      return NextResponse.json({ error: 'Failed to fetch interviews' }, { status: 500 });
    }

    return NextResponse.json({ interviews: data });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
