'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import MoodInput from '@/components/MoodInput';
import PlaylistDisplay from '@/components/PlaylistDisplay';
import LoadingSpinner from '@/components/LoadingSpinner';
import { motion } from 'framer-motion';

export default function Home() {
  const [playlist, setPlaylist] = useState(null);
  const [moodAnalysis, setMoodAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentMood, setCurrentMood] = useState('default');

  const getMoodBackground = (mood) => {
    const backgrounds = {
      happy: 'from-yellow-200 via-orange-200 to-pink-200',
      sad: 'from-blue-200 via-indigo-200 to-purple-200',
      energetic: 'from-red-200 via-pink-200 to-orange-200',
      calm: 'from-green-200 via-teal-200 to-blue-200',
      romantic: 'from-pink-200 via-rose-200 to-red-200',
      angry: 'from-red-300 via-gray-300 to-black',
      nostalgic: 'from-amber-200 via-yellow-200 to-orange-200',
      party: 'from-purple-200 via-pink-200 to-indigo-200',
      default: 'from-purple-50 to-pink-50'
    };
    return backgrounds[mood] || backgrounds.default;
  };

  useEffect(() => {
    if (moodAnalysis?.mood) {
      setCurrentMood(moodAnalysis.mood);
    }
  }, [moodAnalysis]);

  const handleMoodSubmit = async (moodText) => {
    setIsLoading(true);
    setError(null);
    setPlaylist(null);
    setMoodAnalysis(null);

    try {
      const moodResponse = await fetch('/api/analyze-mood', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: moodText }),
      });

      if (!moodResponse.ok) {
        throw new Error('Failed to analyze mood');
      }

      const moodData = await moodResponse.json();
      setMoodAnalysis(moodData.analysis);

      const playlistResponse = await fetch('/api/generate-playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mood: moodData.analysis.mood }),
      });

      if (!playlistResponse.ok) {
        throw new Error('Failed to generate playlist');
      }

      const playlistData = await playlistResponse.json();
      setPlaylist(playlistData.playlist);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className={`min-h-screen bg-gradient-to-br ${getMoodBackground(currentMood)} transition-all duration-1000`}
      animate={{ 
        background: `linear-gradient(to bottom right, var(--tw-gradient-stops))` 
      }}
      transition={{ duration: 1 }}
    >
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <MoodInput onMoodSubmit={handleMoodSubmit} isLoading={isLoading} />
        </motion.div>

        <div className="mt-12">
          {isLoading && (
            <LoadingSpinner message="Analyzing your mood and curating the perfect playlist..." />
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-center max-w-2xl mx-auto"
            >
              <p className="font-medium">Oops! Something went wrong</p>
              <p className="text-sm mt-1">{error}</p>
            </motion.div>
          )}

          {playlist && !isLoading && (
            <PlaylistDisplay playlist={playlist} moodAnalysis={moodAnalysis} />
          )}

          {!playlist && !isLoading && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center text-gray-600 mt-12"
            >
              <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto">
                <p className="text-xl mb-4">
                  Tell us how you&apos;re feeling and we&apos;ll create the perfect playlist for you! 🎵
                </p>
                <p className="text-sm opacity-75">
                  Try phrases like &quot;I&apos;m feeling happy&quot;, &quot;I need some calm music&quot;, or &quot;I want to party!&quot;
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </motion.div>
  );
}
