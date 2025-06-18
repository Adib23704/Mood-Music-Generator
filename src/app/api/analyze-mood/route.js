import { NextResponse } from 'next/server';
import { analyzeMood } from '@/utils/moodAnalyzer';

export async function POST(request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const analysis = analyzeMood(text);

    return NextResponse.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('Mood analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze mood' }, { status: 500 });
  }
}
