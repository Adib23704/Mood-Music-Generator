import { NextResponse } from 'next/server';
import { getSpotifyAccessToken, getMoodBasedTracks, getEnhancedMoodTracks } from '@/utils/spotify';

export async function POST(request) {
  try {
    const { mood } = await request.json();
    
    if (!mood) {
      return NextResponse.json({ error: 'Mood is required' }, { status: 400 });
    }
    
    const accessToken = await getSpotifyAccessToken();

    let tracks = await getEnhancedMoodTracks(mood, accessToken, 25);
    
    if (tracks.length < 15) {
      console.log('Using basic mood search fallback');
      const basicTracks = await getMoodBasedTracks(mood, accessToken, 25);
      tracks = [...tracks, ...basicTracks].slice(0, 25);
    }

    if (tracks.length === 0) {
      return NextResponse.json({ 
        error: `No tracks found for mood: ${mood}. Please try a different mood.` 
      }, { status: 404 });
    }

    const formattedTracks = tracks.map(track => ({
      id: track.id,
      name: track.name,
      artist: track.artists?.map(artist => artist.name).join(', ') || 'Unknown Artist',
      album: track.album?.name || 'Unknown Album',
      image: track.album?.images?.[0]?.url || null,
      preview_url: track.preview_url || null,
      external_url: track.external_urls?.spotify || null,
      duration_ms: track.duration_ms || 0,
      popularity: track.popularity || 0
    }));

    return NextResponse.json({
      success: true,
      playlist: {
        mood,
        tracks: formattedTracks,
        method: 'search-only-recommendations',
        note: 'Generated using only Spotify Search API with intelligent mood matching'
      }
    });
    
  } catch (error) {
    console.error('Playlist generation error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate playlist. Please try again.',
      details: error.message
    }, { status: 500 });
  }
}
