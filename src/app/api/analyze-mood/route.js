import { NextResponse } from 'next/server';
import { analyzeWithHuggingFace } from '@/utils/huggingFaceMoodAnalyzer';

export async function POST(request) {
  try {
    const { text } = await request.json();
    
    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    if (text.length > 1000) {
      return NextResponse.json({ 
        error: 'Text too long. Please limit to 1000 characters.' 
      }, { status: 400 });
    }
    
    const analysis = await analyzeWithHuggingFace(text);
    
    return NextResponse.json({
      success: true,
      analysis: {
        mood: analysis.mood,
        secondaryMood: analysis.secondaryMood,
        confidence: analysis.confidence,
        intensity: analysis.intensity,
        context: analysis.context,
        musicStyles: analysis.musicStyles,
        method: analysis.method,
        debug: {
          rawEmotions: analysis.rawEmotions?.slice(0, 3),
          rawSentiment: analysis.rawSentiment?.slice(0, 2)
        }
      }
    });
  } catch (error) {
    console.error('Mood analysis error:', error);
    return NextResponse.json({ 
      error: 'Failed to analyze mood',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}
