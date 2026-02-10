import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const password = req.headers.get('x-admin-password');
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const district = url.searchParams.get('district');
    const school = url.searchParams.get('school');
    const gradeMin = url.searchParams.get('grade_min');
    const gradeMax = url.searchParams.get('grade_max');

    // Get completed interview IDs matching filters
    let interviewQuery = supabaseAdmin
      .from('interviews')
      .select('id')
      .eq('status', 'completed');

    if (district) interviewQuery = interviewQuery.eq('district_name', district);
    if (school) interviewQuery = interviewQuery.eq('school_name', school);
    if (gradeMin) interviewQuery = interviewQuery.gte('grade', parseInt(gradeMin));
    if (gradeMax) interviewQuery = interviewQuery.lte('grade', parseInt(gradeMax));

    const { data: interviews } = await interviewQuery;
    const interviewIds = (interviews || []).map((i) => i.id);

    if (interviewIds.length === 0) {
      return NextResponse.json({
        total_completed: 0,
        total_in_progress: 0,
        total_safety_flags: 0,
        ratings_by_item: {},
        themes: [],
        districts: [],
        schools: [],
      });
    }

    // Get all ratings for these interviews
    const { data: ratings } = await supabaseAdmin
      .from('ratings')
      .select('survey_item, survey_category, value, source')
      .in('interview_id', interviewIds);

    // Aggregate ratings by item
    const ratingsByItem: Record<string, Record<string, number>> = {};
    (ratings || []).forEach((r) => {
      if (!ratingsByItem[r.survey_item]) {
        ratingsByItem[r.survey_item] = {};
      }
      ratingsByItem[r.survey_item][r.value] = (ratingsByItem[r.survey_item][r.value] || 0) + 1;
    });

    // Get overall counts
    const { count: totalCompleted } = await supabaseAdmin
      .from('interviews')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'completed');

    const { count: totalInProgress } = await supabaseAdmin
      .from('interviews')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'in_progress');

    const { count: totalSafetyFlags } = await supabaseAdmin
      .from('interviews')
      .select('id', { count: 'exact', head: true })
      .eq('safety_flag', true);

    // Get all themes
    const { data: summaries } = await supabaseAdmin
      .from('summaries')
      .select('themes')
      .in('interview_id', interviewIds);

    const themeCounts: Record<string, number> = {};
    (summaries || []).forEach((s) => {
      (s.themes || []).forEach((theme: string) => {
        themeCounts[theme] = (themeCounts[theme] || 0) + 1;
      });
    });

    const sortedThemes = Object.entries(themeCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([theme, count]) => ({ theme, count }));

    // Get distinct districts and schools for filter options
    const { data: districtData } = await supabaseAdmin
      .from('interviews')
      .select('district_name')
      .not('district_name', 'is', null);

    const { data: schoolData } = await supabaseAdmin
      .from('interviews')
      .select('school_name')
      .not('school_name', 'is', null);

    const districts = [...new Set((districtData || []).map((d) => d.district_name).filter(Boolean))];
    const schools = [...new Set((schoolData || []).map((s) => s.school_name).filter(Boolean))];

    return NextResponse.json({
      total_completed: totalCompleted || 0,
      total_in_progress: totalInProgress || 0,
      total_safety_flags: totalSafetyFlags || 0,
      ratings_by_item: ratingsByItem,
      themes: sortedThemes,
      districts,
      schools,
    });
  } catch (err) {
    console.error('Aggregate error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
