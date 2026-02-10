import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const password = req.headers.get('x-admin-password');
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Fetch interview with all related data
    const { data: interview, error: interviewError } = await supabaseAdmin
      .from('interviews')
      .select('*')
      .eq('id', id)
      .single();

    if (interviewError || !interview) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
    }

    const [
      { data: messages },
      { data: ratings },
      { data: summary },
    ] = await Promise.all([
      supabaseAdmin
        .from('messages')
        .select('role, content, created_at')
        .eq('interview_id', id)
        .order('created_at', { ascending: true }),
      supabaseAdmin
        .from('ratings')
        .select('survey_item, survey_category, value, source, confidence')
        .eq('interview_id', id),
      supabaseAdmin
        .from('summaries')
        .select('*')
        .eq('interview_id', id)
        .single(),
    ]);

    return NextResponse.json({
      interview,
      messages: messages || [],
      ratings: ratings || [],
      summary: summary || null,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
