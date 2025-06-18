import Sentiment from 'sentiment';

const sentiment = new Sentiment();

const moodKeywords = {
  happy: ['happy', 'joy', 'excited', 'cheerful', 'upbeat', 'positive', 'great', 'awesome', 'fantastic', 'wonderful'],
  sad: ['sad', 'depressed', 'down', 'blue', 'melancholy', 'heartbroken', 'lonely', 'upset', 'disappointed'],
  energetic: ['energetic', 'pumped', 'hyped', 'active', 'motivated', 'powerful', 'strong', 'intense', 'dynamic'],
  calm: ['calm', 'peaceful', 'relaxed', 'chill', 'serene', 'tranquil', 'mellow', 'zen', 'quiet', 'gentle'],
  romantic: ['romantic', 'love', 'intimate', 'passionate', 'tender', 'affectionate', 'sweet', 'loving'],
  angry: ['angry', 'mad', 'furious', 'rage', 'frustrated', 'annoyed', 'irritated', 'pissed', 'livid'],
  nostalgic: ['nostalgic', 'memories', 'past', 'remember', 'miss', 'throwback', 'vintage', 'old times'],
  party: ['party', 'dance', 'celebration', 'fun', 'wild', 'crazy', 'festive', 'club', 'nightlife']
};

export function analyzeMood(text) {
  const lowerText = text.toLowerCase();
  const sentimentResult = sentiment.analyze(text);

  let detectedMood = 'happy'; // default
  let maxMatches = 0;

  for (const [mood, keywords] of Object.entries(moodKeywords)) {
    const matches = keywords.filter(keyword => lowerText.includes(keyword)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      detectedMood = mood;
    }
  }

  // If no specific keywords found, use sentiment analysis
  if (maxMatches === 0) {
    if (sentimentResult.score > 2) {
      detectedMood = 'happy';
    } else if (sentimentResult.score < -2) {
      detectedMood = 'sad';
    } else if (sentimentResult.score >= -2 && sentimentResult.score <= 2) {
      detectedMood = 'calm';
    }
  }

  return {
    mood: detectedMood,
    confidence: Math.min(Math.abs(sentimentResult.score) / 5 + maxMatches * 0.2, 1),
    sentiment: sentimentResult
  };
}
