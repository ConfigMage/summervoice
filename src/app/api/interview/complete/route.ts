import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { runAnalysis } from '@/lib/analyze';

export async function POST(req: NextRequest) {
  try {
    const { interview_id } = await req.json();

    if (!interview_id) {
      return NextResponse.json({ error: 'interview_id is required' }, { status: 400 });
    }

    // Mark interview as completed
    const { error } = await supabaseAdmin
      .from('interviews')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', interview_id);

    if (error) {
      console.error('Error completing interview:', error);
      return NextResponse.json({ error: 'Failed to complete interview' }, { status: 500 });
    }

    // Run analysis directly — no HTTP round-trip, avoids Vercel deployment protection
    runAnalysis(interview_id).catch((err) =>
      console.error('Analysis failed for interview:', interview_id, err)
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error completing interview:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
