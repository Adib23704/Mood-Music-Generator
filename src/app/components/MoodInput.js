'use client';

import { useState, useEffect } from 'react';
import { Send, Mic, MicOff, Sparkles, Zap, Heart, Sun, Moon, Coffee } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MoodInput({ onMoodSubmit, isLoading }) {
  const [moodText, setMoodText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [recentMoods, setRecentMoods] = useState([]);

  // Load recent moods from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentMoods');
    if (saved) {
      setRecentMoods(JSON.parse(saved));
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (moodText.trim() && !isLoading) {
      // Save to recent moods
      const newRecentMoods = [moodText.trim(), ...recentMoods.filter(m => m !== moodText.trim())].slice(0, 5);
      setRecentMoods(newRecentMoods);
      localStorage.setItem('recentMoods', JSON.stringify(newRecentMoods));
      
      onMoodSubmit(moodText.trim());
      setShowSuggestions(false);
    }
  };

  const startVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      setIsListening(true);
      recognition.start();

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setMoodText(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    } else {
      alert('Voice recognition is not supported in your browser');
    }
  };

  const quickMoodButtons = [
    { mood: 'happy', icon: Sun, color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200', text: 'Happy & Upbeat' },
    { mood: 'calm', icon: Moon, color: 'bg-blue-100 text-blue-700 hover:bg-blue-200', text: 'Calm & Peaceful' },
    { mood: 'energetic', icon: Zap, color: 'bg-red-100 text-red-700 hover:bg-red-200', text: 'Energetic & Pumped' },
    { mood: 'romantic', icon: Heart, color: 'bg-pink-100 text-pink-700 hover:bg-pink-200', text: 'Romantic & Loving' },
    { mood: 'nostalgic', icon: Coffee, color: 'bg-amber-100 text-amber-700 hover:bg-amber-200', text: 'Nostalgic & Reflective' },
    { mood: 'party', icon: Sparkles, color: 'bg-purple-100 text-purple-700 hover:bg-purple-200', text: 'Party & Dance' }
  ];

  const moodSuggestions = [
    'I feel happy and energetic today!',
    'I\'m in a calm and peaceful mood',
    'Feeling a bit sad and need some comfort',
    'I want to party and dance!',
    'In a romantic mood tonight',
    'Feeling nostalgic about old times',
    'I need some motivation and energy',
    'Just want to relax and chill'
  ];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Main Input Form */}
      <motion.form 
        onSubmit={handleSubmit} 
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="relative">
          <textarea
            value={moodText}
            onChange={(e) => setMoodText(e.target.value)}
            placeholder="How are you feeling today? Describe your mood in detail..."
            className="w-full p-6 pr-24 border-2 border-gray-300 rounded-2xl focus:border-purple-500 focus:outline-none resize-none h-40 text-lg bg-white/80 backdrop-blur-sm shadow-lg"
            disabled={isLoading}
          />
          
          {/* Character Counter */}
          <div className="absolute bottom-16 right-4 text-sm text-gray-400">
            {moodText.length}/500
          </div>
          
          <div className="absolute right-4 bottom-4 flex gap-2">
            <motion.button
              type="button"
              onClick={startVoiceInput}
              disabled={isLoading || isListening}
              className={`p-3 rounded-xl transition-all ${
                isListening 
                  ? 'bg-red-500 text-white shadow-lg' 
                  : 'bg-white/80 hover:bg-gray-100 text-gray-600 shadow-md'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </motion.button>
            
            <motion.button
              type="submit"
              disabled={!moodText.trim() || isLoading}
              className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
        
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-center"
          >
            <div className="flex items-center justify-center gap-2 text-red-600">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Mic className="w-5 h-5" />
              </motion.div>
              <span>Listening... Speak now!</span>
            </div>
          </motion.div>
        )}
      </motion.form>

      {/* Quick Mood Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="mb-8"
      >
        <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">Quick Mood Selection</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {quickMoodButtons.map((button, index) => {
            const IconComponent = button.icon;
            return (
              <motion.button
                key={button.mood}
                onClick={() => setMoodText(`I'm feeling ${button.text.toLowerCase()}`)}
                className={`p-4 rounded-xl ${button.color} transition-all flex items-center gap-3 shadow-md hover:shadow-lg`}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                disabled={isLoading}
              >
                <IconComponent className="w-5 h-5" />
                <span className="font-medium">{button.text}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Recent Moods */}
      {recentMoods.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">Recent Moods</h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {recentMoods.map((mood, index) => (
              <motion.button
                key={index}
                onClick={() => setMoodText(mood)}
                className="px-4 py-2 bg-gray-100 hover:bg-purple-100 border border-gray-200 hover:border-purple-300 rounded-full transition-all text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isLoading}
              >
                {mood}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Mood Suggestions */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">Need Inspiration?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {moodSuggestions.map((suggestion, index) => (
                <motion.button
                  key={index}
                  onClick={() => setMoodText(suggestion)}
                  className="p-4 text-left bg-white/60 hover:bg-white/80 backdrop-blur-sm border border-gray-200 hover:border-purple-300 rounded-xl transition-all text-sm shadow-md hover:shadow-lg"
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index }}
                  disabled={isLoading}
                >
                  <span className="text-purple-600 mr-2">💭</span>
                  &quot;{suggestion}&quot;
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
