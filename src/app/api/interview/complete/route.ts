import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

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

    // Trigger async analysis — fire and forget
    const baseUrl = req.nextUrl.origin;
    fetch(`${baseUrl}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ interview_id }),
    }).catch((err) => console.error('Failed to trigger analysis:', err));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error completing interview:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
