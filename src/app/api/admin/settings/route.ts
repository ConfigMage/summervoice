import { NextRequest, NextResponse } from 'next/server';
import { getSettings, updateSetting, AVAILABLE_MODELS } from '@/lib/settings';

const validModelIds = new Set(AVAILABLE_MODELS.map((m) => m.id));

export async function GET(req: NextRequest) {
  try {
    const password = req.headers.get('x-admin-password');
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await getSettings();
    return NextResponse.json({ settings, available_models: AVAILABLE_MODELS });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const password = req.headers.get('x-admin-password');
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { chat_model, analysis_model } = await req.json();

    if (chat_model) {
      if (!validModelIds.has(chat_model)) {
        return NextResponse.json({ error: `Invalid chat model: ${chat_model}` }, { status: 400 });
      }
      await updateSetting('chat_model', chat_model);
    }

    if (analysis_model) {
      if (!validModelIds.has(analysis_model)) {
        return NextResponse.json({ error: `Invalid analysis model: ${analysis_model}` }, { status: 400 });
      }
      await updateSetting('analysis_model', analysis_model);
    }

    const settings = await getSettings();
    return NextResponse.json({ success: true, settings });
  } catch (err) {
    console.error('Error updating settings:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
