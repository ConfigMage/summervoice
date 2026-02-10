import Anthropic from '@anthropic-ai/sdk';
import { getSupabaseAdmin } from '@/lib/supabase';
import { ANALYZER_SYSTEM_PROMPT } from '@/lib/prompts/analyzer';
import { getSurveyItemsText } from '@/lib/constants/survey-items';
import { getSettings } from '@/lib/settings';

// Valid values that match the DB check constraint
const VALID_RATING_VALUES = new Set([
  'strongly_agree', 'agree', 'disagree', 'strongly_disagree',
  'yes', 'no',
  'often', 'sometimes', 'rarely', 'never',
  'always', 'a_lot',
  'not_discussed',
]);

function normalizeRatingValue(value: string): string {
  // Normalize: lowercase, trim, replace spaces with underscores
  const normalized = value.toLowerCase().trim().replace(/\s+/g, '_');
  if (VALID_RATING_VALUES.has(normalized)) return normalized;

  // Common AI variations
  const mappings: Record<string, string> = {
    'strongly_agree': 'strongly_agree',
    'strong_agree': 'strongly_agree',
    'strongly_disagree': 'strongly_disagree',
    'strong_disagree': 'strongly_disagree',
    'a_lot': 'a_lot',
    'alot': 'a_lot',
    'not_applicable': 'not_discussed',
    'n/a': 'not_discussed',
    'na': 'not_discussed',
    'unknown': 'not_discussed',
    'cannot_determine': 'not_discussed',
  };

  return mappings[normalized] || 'not_discussed';
}

function extractJSON(text: string): string {
  // Strip markdown code fences if present
  let cleaned = text.trim();

  // Remove ```json ... ``` or ``` ... ```
  const fenceMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  }

  // Try to find JSON object boundaries if there's preamble text
  if (!cleaned.startsWith('{')) {
    const jsonStart = cleaned.indexOf('{');
    if (jsonStart !== -1) {
      cleaned = cleaned.substring(jsonStart);
      // Find matching closing brace
      let depth = 0;
      for (let i = 0; i < cleaned.length; i++) {
        if (cleaned[i] === '{') depth++;
        if (cleaned[i] === '}') depth--;
        if (depth === 0) {
          cleaned = cleaned.substring(0, i + 1);
          break;
        }
      }
    }
  }

  return cleaned;
}

export async function runAnalysis(interview_id: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  // Load transcript
  const { data: messages, error: msgError } = await supabase
    .from('messages')
    .select('role, content')
    .eq('interview_id', interview_id)
    .order('created_at', { ascending: true });

  if (msgError || !messages || messages.length === 0) {
    console.error('No transcript found for analysis:', interview_id);
    return;
  }

  // Load interview demographics
  const { data: interview } = await supabase
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

  // Get model from settings
  const settings = await getSettings();
  const analysisModel = settings.analysis_model;

  console.log('Starting analysis for interview:', interview_id, 'using model:', analysisModel);

  const response = await client.messages.create({
    model: analysisModel,
    max_tokens: 8192,
    system: ANALYZER_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  });

  const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

  // Parse JSON response — handle markdown fences and preamble
  let analysis;
  try {
    const jsonText = extractJSON(responseText);
    analysis = JSON.parse(jsonText);
  } catch (parseErr) {
    console.error('Failed to parse analysis JSON. Raw response (first 1000 chars):', responseText.substring(0, 1000));
    console.error('Parse error:', parseErr);
    return;
  }

  console.log('Analysis parsed successfully. Safety flag:', analysis.safety_flag, 'Ratings count:', analysis.inferred_ratings?.length);

  // Delete any existing summary/ratings for this interview (allows re-runs)
  await supabase.from('summaries').delete().eq('interview_id', interview_id);
  await supabase.from('ratings').delete().eq('interview_id', interview_id);

  // Insert summary
  const { error: summaryError } = await supabase.from('summaries').insert({
    interview_id,
    summary: analysis.summary,
    themes: analysis.themes || [],
    key_quotes: analysis.key_quotes || [],
    sentiment_overview: analysis.sentiment_overview || {},
    strengths: analysis.strengths || [],
    improvements: analysis.improvements || [],
  });

  if (summaryError) {
    console.error('Error inserting summary:', JSON.stringify(summaryError));
  } else {
    console.log('Summary inserted for interview:', interview_id);
  }

  // Insert ratings with value normalization
  if (analysis.inferred_ratings && Array.isArray(analysis.inferred_ratings)) {
    const ratings = analysis.inferred_ratings.map(
      (r: { survey_item: string; survey_category: string; value: string; source: string; confidence: number }) => ({
        interview_id,
        survey_item: r.survey_item,
        survey_category: r.survey_category,
        value: normalizeRatingValue(r.value),
        source: r.source === 'direct' ? 'direct' : 'inferred',
        confidence: r.confidence,
      })
    );

    const { error: ratingsError } = await supabase.from('ratings').insert(ratings);

    if (ratingsError) {
      console.error('Error inserting ratings:', JSON.stringify(ratingsError));
      // Try inserting one at a time to identify the problematic row
      let inserted = 0;
      for (const rating of ratings) {
        const { error: singleError } = await supabase.from('ratings').insert(rating);
        if (singleError) {
          console.error('Failed rating:', JSON.stringify(rating), 'Error:', JSON.stringify(singleError));
        } else {
          inserted++;
        }
      }
      console.log(`Inserted ${inserted}/${ratings.length} ratings individually`);
    } else {
      console.log(`All ${ratings.length} ratings inserted for interview:`, interview_id);
    }
  }

  // Update safety flag if needed
  if (analysis.safety_flag) {
    await supabase
      .from('interviews')
      .update({ safety_flag: true, safety_notes: analysis.safety_notes })
      .eq('id', interview_id);
  }

  console.log('Analysis completed for interview:', interview_id);
}
