import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { supabaseAdmin } from '@/lib/supabase';
import { ANALYZER_SYSTEM_PROMPT } from '@/lib/prompts/analyzer';
import { getSurveyItemsText } from '@/lib/constants/survey-items';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { interview_id } = await req.json();

    if (!interview_id) {
      return NextResponse.json({ error: 'interview_id is required' }, { status: 400 });
    }

    // Load transcript
    const { data: messages, error: msgError } = await supabaseAdmin
      .from('messages')
      .select('role, content')
      .eq('interview_id', interview_id)
      .order('created_at', { ascending: true });

    if (msgError || !messages || messages.length === 0) {
      return NextResponse.json({ error: 'No transcript found' }, { status: 404 });
    }

    // Load interview demographics
    const { data: interview } = await supabaseAdmin
      .from('interviews')
      .select('grade, program_name, district_name, school_name')
      .eq('id', interview_id)
      .single();

    // Format transcript
    const transcript = messages
      .map((m) => `[${m.role === 'assistant' ? 'assistant' : 'student'}]: ${m.content}`)
      .join('\n');

    const userMessage = `Here is the full interview transcript:

---TRANSCRIPT START---
${transcript}
---TRANSCRIPT END---

Student demographics: Grade ${interview?.grade || 'unknown'}, Program: ${interview?.program_name || 'unknown'}, District: ${interview?.district_name || 'unknown'}, School: ${interview?.school_name || 'unknown'}

---SURVEY ITEMS START---
${getSurveyItemsText()}
---SURVEY ITEMS END---

Please analyze this transcript and produce the structured JSON output.`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 8192,
      system: ANALYZER_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

    // Parse JSON response
    let analysis;
    try {
      analysis = JSON.parse(responseText);
    } catch {
      console.error('Failed to parse analysis JSON:', responseText);
      return NextResponse.json({ error: 'Failed to parse analysis' }, { status: 500 });
    }

    // Insert summary
    const { error: summaryError } = await supabaseAdmin.from('summaries').insert({
      interview_id,
      summary: analysis.summary,
      themes: analysis.themes || [],
      key_quotes: analysis.key_quotes || [],
      sentiment_overview: analysis.sentiment_overview || {},
      strengths: analysis.strengths || [],
      improvements: analysis.improvements || [],
    });

    if (summaryError) {
      console.error('Error inserting summary:', summaryError);
    }

    // Insert ratings
    if (analysis.inferred_ratings && Array.isArray(analysis.inferred_ratings)) {
      const ratings = analysis.inferred_ratings.map(
        (r: { survey_item: string; survey_category: string; value: string; source: string; confidence: number }) => ({
          interview_id,
          survey_item: r.survey_item,
          survey_category: r.survey_category,
          value: r.value,
          source: r.source,
          confidence: r.confidence,
        })
      );

      const { error: ratingsError } = await supabaseAdmin.from('ratings').insert(ratings);

      if (ratingsError) {
        console.error('Error inserting ratings:', ratingsError);
      }
    }

    // Update safety flag if needed
    if (analysis.safety_flag) {
      await supabaseAdmin
        .from('interviews')
        .update({ safety_flag: true, safety_notes: analysis.safety_notes })
        .eq('id', interview_id);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Analysis error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
