import { NextRequest, NextResponse } from 'next/server';
import { runAnalysis } from '@/lib/analyze';

export async function POST(req: NextRequest) {
  try {
    const { interview_id } = await req.json();

    if (!interview_id) {
      return NextResponse.json({ error: 'interview_id is required' }, { status: 400 });
    }

    await runAnalysis(interview_id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Analysis error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
