const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

export async function getSpotifyAccessToken() {
  try {
    if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
      throw new Error('Missing Spotify credentials in environment variables');
    }

    const response = await fetch(SPOTIFY_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')}`
      },
      body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting Spotify access token:', error);
    throw error;
  }
}

export async function getMoodBasedTracks(mood, accessToken, limit = 25) {
  const moodSearchStrategies = {
    happy: {
      primaryQueries: [
        'happy songs 2024',
        'feel good music',
        'upbeat pop hits',
        'positive vibes playlist',
        'cheerful music'
      ],
      genreQueries: [
        'genre:pop happy',
        'genre:dance upbeat',
        'genre:funk feel good'
      ],
      artistQueries: [
        'artist:"Pharrell Williams" Happy',
        'artist:"Bruno Mars" upbeat',
        'artist:"Dua Lipa" dance'
      ],
      playlistQueries: [
        'playlist:"Happy Hits"',
        'playlist:"Good Vibes"',
        'playlist:"Feel Good Pop"'
      ]
    },
    sad: {
      primaryQueries: [
        'sad songs heartbreak',
        'emotional ballads',
        'melancholy music',
        'breakup songs',
        'crying songs'
      ],
      genreQueries: [
        'genre:indie sad',
        'genre:alternative emotional',
        'genre:singer-songwriter heartbreak'
      ],
      artistQueries: [
        'artist:"Billie Eilish" sad',
        'artist:"Adele" heartbreak',
        'artist:"Lewis Capaldi" emotional'
      ],
      playlistQueries: [
        'playlist:"Sad Songs"',
        'playlist:"Heartbreak"',
        'playlist:"Life Sucks"'
      ]
    },
    energetic: {
      primaryQueries: [
        'workout music high energy',
        'pump up songs',
        'motivational music',
        'gym playlist',
        'power songs'
      ],
      genreQueries: [
        'genre:rock energetic',
        'genre:electronic high energy',
        'genre:hip-hop pump up'
      ],
      artistQueries: [
        'artist:"Eminem" motivational',
        'artist:"Imagine Dragons" energetic',
        'artist:"The Weeknd" workout'
      ],
      playlistQueries: [
        'playlist:"Beast Mode"',
        'playlist:"Workout"',
        'playlist:"Power Hour"'
      ]
    },
    calm: {
      primaryQueries: [
        'relaxing music peaceful',
        'chill songs ambient',
        'meditation music',
        'peaceful piano',
        'calming sounds'
      ],
      genreQueries: [
        'genre:ambient peaceful',
        'genre:acoustic calm',
        'genre:classical relaxing'
      ],
      artistQueries: [
        'artist:"Ludovico Einaudi" peaceful',
        'artist:"Ólafur Arnalds" calm',
        'artist:"Max Richter" ambient'
      ],
      playlistQueries: [
        'playlist:"Chill Hits"',
        'playlist:"Peaceful Piano"',
        'playlist:"Ambient Chill"'
      ]
    },
    romantic: {
      primaryQueries: [
        'love songs romantic',
        'slow dance music',
        'romantic ballads',
        'date night playlist',
        'valentine songs'
      ],
      genreQueries: [
        'genre:r-n-b romantic',
        'genre:soul love songs',
        'genre:pop romantic'
      ],
      artistQueries: [
        'artist:"John Legend" love',
        'artist:"Ed Sheeran" romantic',
        'artist:"Alicia Keys" love songs'
      ],
      playlistQueries: [
        'playlist:"Love Pop"',
        'playlist:"Romantic Ballads"',
        'playlist:"Date Night"'
      ]
    },
    angry: {
      primaryQueries: [
        'angry music aggressive',
        'rage songs metal',
        'hardcore music',
        'aggressive rap',
        'metal hits'
      ],
      genreQueries: [
        'genre:metal aggressive',
        'genre:punk angry',
        'genre:hard-rock rage'
      ],
      artistQueries: [
        'artist:"Metallica" aggressive',
        'artist:"Rage Against The Machine" angry',
        'artist:"Slipknot" metal'
      ],
      playlistQueries: [
        'playlist:"Metal Essentials"',
        'playlist:"Rage Beats"',
        'playlist:"Heavy Metal"'
      ]
    },
    nostalgic: {
      primaryQueries: [
        'classic hits throwback',
        'oldies music vintage',
        'retro songs 80s 90s',
        'nostalgic music',
        'throwback hits'
      ],
      genreQueries: [
        'genre:classic-rock throwback',
        'genre:oldies vintage',
        'genre:folk nostalgic'
      ],
      artistQueries: [
        'artist:"Queen" classic',
        'artist:"The Beatles" oldies',
        'artist:"Fleetwood Mac" vintage'
      ],
      playlistQueries: [
        'playlist:"Throwback"',
        'playlist:"Classic Rock"',
        'playlist:"Oldies"'
      ]
    },
    party: {
      primaryQueries: [
        'party music dance hits',
        'club bangers',
        'dance party playlist',
        'festival music',
        'celebration songs'
      ],
      genreQueries: [
        'genre:dance party',
        'genre:electronic club',
        'genre:pop party'
      ],
      artistQueries: [
        'artist:"Calvin Harris" party',
        'artist:"David Guetta" dance',
        'artist:"Daft Punk" electronic'
      ],
      playlistQueries: [
        'playlist:"Party Hits"',
        'playlist:"Dance Party"',
        'playlist:"Club Bangers"'
      ]
    }
  };

  const strategy = moodSearchStrategies[mood] || moodSearchStrategies.happy;
  let allTracks = [];

  for (const query of strategy.primaryQueries.slice(0, 2)) {
    const tracks = await searchSpotifyTracks(query, accessToken, 8);
    allTracks.push(...tracks);
  }

  for (const query of strategy.genreQueries.slice(0, 2)) {
    const tracks = await searchSpotifyTracks(query, accessToken, 6);
    allTracks.push(...tracks);
  }

  for (const query of strategy.artistQueries.slice(0, 2)) {
    const tracks = await searchSpotifyTracks(query, accessToken, 5);
    allTracks.push(...tracks);
  }

  for (const query of strategy.playlistQueries.slice(0, 1)) {
    const tracks = await searchSpotifyTracks(query, accessToken, 6);
    allTracks.push(...tracks);
  }

  const uniqueTracks = removeDuplicateTracks(allTracks);
  const filteredTracks = applyBasicMoodFiltering(uniqueTracks, mood);
  
  return filteredTracks.slice(0, limit);
}

async function searchSpotifyTracks(query, accessToken, limit) {
  try {
    const response = await fetch(
      `${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}&market=US`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      console.error(`Search failed for query "${query}": ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data.tracks?.items || [];
  } catch (error) {
    console.error(`Search error for query "${query}":`, error);
    return [];
  }
}

function removeDuplicateTracks(tracks) {
  const seen = new Set();
  return tracks.filter(track => {
    if (seen.has(track.id)) {
      return false;
    }
    seen.add(track.id);
    return true;
  });
}

function applyBasicMoodFiltering(tracks, mood) {
  // Filter based on track name, artist, and album keywords
  const moodKeywords = {
    happy: {
      include: ['happy', 'joy', 'good', 'love', 'dance', 'party', 'fun', 'smile', 'sunshine', 'bright'],
      exclude: ['sad', 'cry', 'death', 'dark', 'lonely', 'hurt', 'pain', 'break']
    },
    sad: {
      include: ['sad', 'cry', 'hurt', 'pain', 'lonely', 'miss', 'gone', 'lost', 'break', 'heart'],
      exclude: ['happy', 'party', 'dance', 'celebration', 'joy', 'fun']
    },
    energetic: {
      include: ['power', 'strong', 'energy', 'pump', 'beast', 'fire', 'rock', 'metal', 'hard'],
      exclude: ['slow', 'calm', 'peaceful', 'quiet', 'soft', 'gentle']
    },
    calm: {
      include: ['calm', 'peace', 'quiet', 'soft', 'gentle', 'relax', 'chill', 'ambient', 'piano'],
      exclude: ['loud', 'aggressive', 'hard', 'metal', 'rage', 'angry']
    },
    romantic: {
      include: ['love', 'heart', 'kiss', 'romance', 'beautiful', 'forever', 'together', 'valentine'],
      exclude: ['angry', 'hate', 'rage', 'aggressive', 'metal', 'hardcore']
    },
    angry: {
      include: ['rage', 'angry', 'mad', 'hate', 'fight', 'war', 'aggressive', 'metal', 'hardcore'],
      exclude: ['love', 'peace', 'calm', 'gentle', 'soft', 'romantic']
    },
    nostalgic: {
      include: ['classic', 'old', 'vintage', 'remember', 'memory', 'past', 'throwback', 'retro'],
      exclude: ['new', 'modern', 'future', 'electronic', 'digital']
    },
    party: {
      include: ['party', 'dance', 'club', 'celebration', 'festival', 'fun', 'night', 'weekend'],
      exclude: ['sad', 'lonely', 'quiet', 'calm', 'peaceful', 'slow']
    }
  };

  const keywords = moodKeywords[mood] || moodKeywords.happy;
  
  return tracks.filter(track => {
    const searchText = `${track.name} ${track.artists.map(a => a.name).join(' ')} ${track.album.name}`.toLowerCase();
    
    const hasExcluded = keywords.exclude.some(keyword => searchText.includes(keyword));
    if (hasExcluded) return false;
    
    const hasIncluded = keywords.include.some(keyword => searchText.includes(keyword));
    
    return hasIncluded || Math.random() > 0.3; // Keep 70% of tracks that don't have excluded keywords
  });
}

export async function getEnhancedMoodTracks(mood, accessToken, limit = 25) {
  const currentYear = new Date().getFullYear();
  const recentYears = [currentYear, currentYear - 1, currentYear - 2];
  
  let allTracks = [];
  
  for (const year of recentYears.slice(0, 2)) {
    const query = `${mood} year:${year}`;
    const tracks = await searchSpotifyTracks(query, accessToken, 10);
    allTracks.push(...tracks);
  }
  
  const classicQuery = `${mood} year:2000-2020`;
  const classicTracks = await searchSpotifyTracks(classicQuery, accessToken, 10);
  allTracks.push(...classicTracks);
  
  const regularTracks = await getMoodBasedTracks(mood, accessToken, 15);
  allTracks.push(...regularTracks);
  
  const uniqueTracks = removeDuplicateTracks(allTracks);
  
  // Sort by popularity (if available)
  const sortedTracks = uniqueTracks.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  
  return sortedTracks.slice(0, limit);
}
