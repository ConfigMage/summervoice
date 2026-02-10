import { getSupabaseAdmin } from '@/lib/supabase';

export const AVAILABLE_MODELS = [
  { id: 'claude-sonnet-4-5-20250929', label: 'Claude Sonnet 4.5', description: 'Best balance of speed and quality (default)' },
  { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5', description: 'Fastest, lowest cost — good for testing' },
  { id: 'claude-opus-4-6', label: 'Claude Opus 4.6', description: 'Most capable — highest quality analysis' },
] as const;

export const DEFAULT_CHAT_MODEL = 'claude-sonnet-4-5-20250929';
export const DEFAULT_ANALYSIS_MODEL = 'claude-sonnet-4-5-20250929';

export interface AppSettings {
  chat_model: string;
  analysis_model: string;
}

export async function getSettings(): Promise<AppSettings> {
  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from('app_settings')
      .select('key, value')
      .in('key', ['chat_model', 'analysis_model']);

    const settings: AppSettings = {
      chat_model: DEFAULT_CHAT_MODEL,
      analysis_model: DEFAULT_ANALYSIS_MODEL,
    };

    if (data) {
      for (const row of data) {
        if (row.key === 'chat_model' && row.value) settings.chat_model = row.value;
        if (row.key === 'analysis_model' && row.value) settings.analysis_model = row.value;
      }
    }

    return settings;
  } catch {
    // Table might not exist yet — fall back to defaults
    return {
      chat_model: process.env.CHAT_MODEL || DEFAULT_CHAT_MODEL,
      analysis_model: process.env.ANALYSIS_MODEL || DEFAULT_ANALYSIS_MODEL,
    };
  }
}

export async function updateSetting(key: string, value: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('app_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });

  if (error) {
    console.error('Error updating setting:', key, error);
    throw error;
  }
}
