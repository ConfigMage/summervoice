import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { program_name, district_name, school_name, grade, race, home_languages, gender } = body;

    if (!grade || grade < 5 || grade > 12) {
      return NextResponse.json({ error: 'Grade is required and must be between 5 and 12' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('interviews')
      .insert({
        program_name: program_name || null,
        district_name: district_name || null,
        school_name: school_name || null,
        grade,
        race: race || [],
        home_languages: home_languages || null,
        gender: gender || null,
        status: 'in_progress',
      })
      .select('id')
      .single();

    if (error) {
      console.error('Supabase error creating interview:', error);
      return NextResponse.json({ error: 'Failed to create interview' }, { status: 500 });
    }

    return NextResponse.json({ interview_id: data.id });
  } catch (err) {
    console.error('Error creating interview:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
