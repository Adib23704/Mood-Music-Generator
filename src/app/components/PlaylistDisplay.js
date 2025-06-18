'use client';

import { useState, useRef } from 'react';
import { Play, Pause, ExternalLink, Clock, Heart, Download, Share2, Shuffle, SkipForward, SkipBack, Volume2, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PlaylistDisplay({ playlist, moodAnalysis }) {
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [likedTracks, setLikedTracks] = useState(new Set());
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const playPreview = (track, index) => {
    if (currentlyPlaying && currentlyPlaying.id === track.id) {
      currentlyPlaying.audio.pause();
      setCurrentlyPlaying(null);
      return;
    }

    if (currentlyPlaying) {
      currentlyPlaying.audio.pause();
    }

    if (track.preview_url) {
      const audio = new Audio(track.preview_url);
      audio.volume = volume;
      audio.play();
      setCurrentlyPlaying({ id: track.id, audio });
      setCurrentTrackIndex(index);
      audioRef.current = audio;

      audio.ontimeupdate = () => {
        setProgress(audio.currentTime);
        setDuration(audio.duration);
      };

      audio.onended = () => {
        setCurrentlyPlaying(null);
        setProgress(0);
        playNext();
      };
    }
  };

  const playNext = () => {
    const nextIndex = isShuffled 
      ? Math.floor(Math.random() * playlist.tracks.length)
      : (currentTrackIndex + 1) % playlist.tracks.length;
    
    const nextTrack = playlist.tracks[nextIndex];
    if (nextTrack?.preview_url) {
      playPreview(nextTrack, nextIndex);
    }
  };

  const playPrevious = () => {
    const prevIndex = isShuffled 
      ? Math.floor(Math.random() * playlist.tracks.length)
      : (currentTrackIndex - 1 + playlist.tracks.length) % playlist.tracks.length;
    
    const prevTrack = playlist.tracks[prevIndex];
    if (prevTrack?.preview_url) {
      playPreview(prevTrack, prevIndex);
    }
  };

  const toggleShuffle = () => {
    setIsShuffled(!isShuffled);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (currentlyPlaying?.audio) {
      currentlyPlaying.audio.volume = newVolume;
    }
  };

  const toggleLike = (trackId) => {
    const newLikedTracks = new Set(likedTracks);
    if (newLikedTracks.has(trackId)) {
      newLikedTracks.delete(trackId);
    } else {
      newLikedTracks.add(trackId);
    }
    setLikedTracks(newLikedTracks);
  };

  const sharePlaylist = async () => {
    const shareData = {
      title: `My ${playlist.mood} Playlist - MoodTunes`,
      text: `Check out this ${playlist.mood} playlist I generated with MoodTunes!`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
      alert('Playlist details copied to clipboard!');
    }
  };

  const downloadPlaylist = () => {
    const playlistData = {
      mood: playlist.mood,
      generated: new Date().toISOString(),
      tracks: playlist.tracks.map(track => ({
        name: track.name,
        artist: track.artist,
        album: track.album,
        spotify_url: track.external_url
      }))
    };

    const blob = new Blob([JSON.stringify(playlistData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${playlist.mood}-playlist-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getMoodColor = (mood) => {
    const colors = {
      happy: 'from-yellow-400 to-orange-500',
      sad: 'from-blue-400 to-indigo-600',
      energetic: 'from-red-500 to-pink-600',
      calm: 'from-green-400 to-teal-500',
      romantic: 'from-pink-400 to-rose-500',
      angry: 'from-red-600 to-gray-800',
      nostalgic: 'from-amber-400 to-brown-500',
      party: 'from-purple-500 to-pink-600'
    };
    return colors[mood] || 'from-purple-500 to-pink-600';
  };

  const getMoodEmoji = (mood) => {
    const emojis = {
      happy: '😊',
      sad: '😢',
      energetic: '⚡',
      calm: '🧘',
      romantic: '💕',
      angry: '😠',
      nostalgic: '🌅',
      party: '🎉'
    };
    return emojis[mood] || '🎵';
  };

  if (!playlist) return null;

  const totalDuration = playlist.tracks.reduce((acc, track) => acc + (track.duration_ms || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto"
    >
      {/* Mood Analysis Display */}
      {moodAnalysis && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`bg-gradient-to-r ${getMoodColor(moodAnalysis.mood)} text-white p-6 rounded-xl mb-6 relative overflow-hidden`}
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-bold mb-2 flex items-center gap-2">
                  {getMoodEmoji(moodAnalysis.mood)}
                  Detected Mood: {moodAnalysis.mood.charAt(0).toUpperCase() + moodAnalysis.mood.slice(1)}
                </h3>
                <p className="opacity-90 text-lg">
                  Confidence: {Math.round(moodAnalysis.confidence * 100)}%
                </p>
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="text-6xl opacity-20"
              >
                {getMoodEmoji(moodAnalysis.mood)}
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Playlist Header with Controls */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Your {playlist.mood.charAt(0).toUpperCase() + playlist.mood.slice(1)} Playlist
            </h2>
            <p className="text-gray-600">
              {playlist.tracks.length} tracks • {formatTime(totalDuration / 1000)} total
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button
              onClick={toggleShuffle}
              className={`p-3 rounded-full transition-colors ${
                isShuffled ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Shuffle className="w-5 h-5" />
            </motion.button>
            
            <motion.button
              onClick={sharePlaylist}
              className="p-3 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-full transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Share2 className="w-5 h-5" />
            </motion.button>
            
            <motion.button
              onClick={downloadPlaylist}
              className="p-3 bg-green-100 text-green-600 hover:bg-green-200 rounded-full transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Mini Player Controls */}
        {currentlyPlaying && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-50 rounded-lg p-4 mb-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={playPrevious}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <SkipBack className="w-4 h-4" />
                </motion.button>
                
                <motion.button
                  onClick={() => {
                    if (currentlyPlaying?.audio) {
                      currentlyPlaying.audio.pause();
                      setCurrentlyPlaying(null);
                    }
                  }}
                  className="p-2 bg-purple-600 text-white hover:bg-purple-700 rounded-full transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Pause className="w-4 h-4" />
                </motion.button>
                
                <motion.button
                  onClick={playNext}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <SkipForward className="w-4 h-4" />
                </motion.button>
              </div>
              
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-gray-600" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20"
                />
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{formatTime(progress)}</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }}
                ></div>
              </div>
              <span>{formatTime(duration)}</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Tracks List */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
        <AnimatePresence>
          {playlist.tracks.map((track, index) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 group transition-all ${
                currentlyPlaying?.id === track.id ? 'bg-purple-50 border-purple-200' : ''
              }`}
            >
              {/* Track Number / Playing Indicator */}
              <div className="w-8 text-center mr-4">
                {currentlyPlaying?.id === track.id ? (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-purple-600 font-bold"
                  >
                    ♪
                  </motion.div>
                ) : (
                  <span className="text-gray-400 text-sm">{index + 1}</span>
                )}
              </div>

              {/* Album Art */}
              <div className="relative w-16 h-16 mr-4 flex-shrink-0">
                {track.image ? (
                  <img
                    src={track.image}
                    alt={track.album}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                    <Music className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                
                {/* Play Button Overlay */}
                {track.preview_url && (
                  <motion.button
                    onClick={() => playPreview(track, index)}
                    className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {currentlyPlaying?.id === track.id ? (
                      <Pause className="w-6 h-6 text-white" />
                    ) : (
                      <Play className="w-6 h-6 text-white" />
                    )}
                  </motion.button>
                )}
              </div>

              {/* Track Info */}
              <div className="flex-grow min-w-0">
                <h4 className="font-semibold text-gray-800 truncate">
                  {track.name}
                </h4>
                <p className="text-gray-600 truncate">{track.artist}</p>
                <p className="text-sm text-gray-500 truncate">{track.album}</p>
              </div>

              {/* Popularity Indicator */}
              {track.popularity && (
                <div className="mr-4 text-center">
                  <div className="text-xs text-gray-500 mb-1">Popular</div>
                  <div className="w-12 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${track.popularity}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Duration */}
              <div className="flex items-center text-gray-500 text-sm mr-4">
                <Clock className="w-4 h-4 mr-1" />
                {formatDuration(track.duration_ms)}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={() => toggleLike(track.id)}
                  className={`p-2 rounded-full transition-colors ${
                    likedTracks.has(track.id)
                      ? 'text-red-500 bg-red-50'
                      : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Heart className={`w-5 h-5 ${likedTracks.has(track.id) ? 'fill-current' : ''}`} />
                </motion.button>

                <motion.a
                  href={track.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-full transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ExternalLink className="w-5 h-5" />
                </motion.a>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Playlist Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 bg-white/60 backdrop-blur-sm rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Playlist Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-purple-600">{playlist.tracks.length}</div>
            <div className="text-sm text-gray-600">Tracks</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{formatTime(totalDuration / 1000)}</div>
            <div className="text-sm text-gray-600">Duration</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{likedTracks.size}</div>
            <div className="text-sm text-gray-600">Liked</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-pink-600">
              {Math.round(playlist.tracks.reduce((acc, track) => acc + (track.popularity || 0), 0) / playlist.tracks.length)}%
            </div>
            <div className="text-sm text-gray-600">Avg Popularity</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
