import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { supabaseAdmin } from '@/lib/supabase';
import { getInterviewerSystemPrompt } from '@/lib/prompts/interviewer';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { interview_id, message } = await req.json();

    if (!interview_id || !message) {
      return new Response(JSON.stringify({ error: 'interview_id and message are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Save student message
    const { error: insertError } = await supabaseAdmin
      .from('messages')
      .insert({ interview_id, role: 'user', content: message });

    if (insertError) {
      console.error('Error saving student message:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to save message' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Load interview for grade level
    const { data: interview, error: interviewError } = await supabaseAdmin
      .from('interviews')
      .select('grade')
      .eq('id', interview_id)
      .single();

    if (interviewError || !interview) {
      return new Response(JSON.stringify({ error: 'Interview not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Load full conversation history
    const { data: messages, error: messagesError } = await supabaseAdmin
      .from('messages')
      .select('role, content')
      .eq('interview_id', interview_id)
      .order('created_at', { ascending: true });

    if (messagesError) {
      return new Response(JSON.stringify({ error: 'Failed to load messages' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const conversationHistory = (messages || []).map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    // Stream response from Anthropic
    const stream = client.messages.stream({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      system: getInterviewerSystemPrompt(interview.grade),
      messages: conversationHistory,
    });

    const encoder = new TextEncoder();
    let fullResponse = '';

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              const text = event.delta.text;
              fullResponse += text;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          }

          // Save complete AI response
          await supabaseAdmin
            .from('messages')
            .insert({ interview_id, role: 'assistant', content: fullResponse });

          // Check for interview complete tag
          const isComplete = fullResponse.includes('[INTERVIEW_COMPLETE]');
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ done: true, isComplete })}\n\n`)
          );
          controller.close();
        } catch (err) {
          console.error('Streaming error:', err);
          // Retry once on failure
          try {
            const retryResponse = await client.messages.create({
              model: 'claude-sonnet-4-5-20250929',
              max_tokens: 1024,
              system: getInterviewerSystemPrompt(interview.grade),
              messages: conversationHistory,
            });

            const retryText =
              retryResponse.content[0].type === 'text' ? retryResponse.content[0].text : '';
            fullResponse = retryText;

            await supabaseAdmin
              .from('messages')
              .insert({ interview_id, role: 'assistant', content: fullResponse });

            const isComplete = fullResponse.includes('[INTERVIEW_COMPLETE]');
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: retryText, done: true, isComplete })}\n\n`)
            );
            controller.close();
          } catch (retryErr) {
            console.error('Retry also failed:', retryErr);
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ text: "Hmm, let me think... I'm having a little trouble right now. Could you try saying that again?", done: true, isComplete: false })}\n\n`
              )
            );
            controller.close();
          }
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err) {
    console.error('Chat API error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
