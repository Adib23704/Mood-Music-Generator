import { InferenceClient } from '@huggingface/inference';

const hf = new InferenceClient(process.env.HUGGINGFACE_API_KEY);

export async function analyzeWithHuggingFace(text) {
  try {
    const emotionResult = await hf.textClassification({
      model: 'j-hartmann/emotion-english-distilroberta-base',
      inputs: text,
      provider: 'hf-inference'
    });

    const sentimentResult = await hf.textClassification({
      model: 'distilbert-base-uncased-finetuned-sst-2-english',
      inputs: text,
      provider: 'hf-inference'
    });

    const emotionMapping = {
      'joy': 'happy',
      'sadness': 'sad',
      'anger': 'angry',
      'fear': 'anxious',
      'surprise': 'excited',
      'disgust': 'frustrated',
      'neutral': 'calm'
    };

    const topEmotion = emotionResult[0];
    const topSentiment = sentimentResult[0];

    const primaryMood = emotionMapping[topEmotion.label.toLowerCase()] || 'calm';

    let secondaryMood = null;
    if (emotionResult.length > 1 && emotionResult[1].score > 0.2) {
      secondaryMood = emotionMapping[emotionResult[1].label.toLowerCase()];
    }

    const intensity = Math.round(topEmotion.score * 10);
    const musicStyles = getMusicStylesForMood(primaryMood, secondaryMood);
    const context = generateContextExplanation(topEmotion, topSentiment, emotionResult);

    return {
      mood: primaryMood,
      secondaryMood: secondaryMood,
      intensity: intensity,
      confidence: topEmotion.score,
      context: context,
      musicStyles: musicStyles,
      rawEmotions: emotionResult,
      rawSentiment: sentimentResult,
      method: 'huggingface-emotion-analysis'
    };

  } catch (error) {
    console.error('Hugging Face analysis failed:', error);
    return fallbackMoodAnalysis(text);
  }
}

function getMusicStylesForMood(primaryMood, secondaryMood) {
  const moodToStyles = {
    happy: ['pop', 'upbeat', 'dance', 'feel-good', 'cheerful'],
    sad: ['indie', 'melancholy', 'acoustic', 'emotional', 'blues'],
    energetic: ['rock', 'electronic', 'hip-hop', 'pump-up', 'high-energy'],
    calm: ['ambient', 'classical', 'chill', 'peaceful', 'relaxing'],
    romantic: ['r&b', 'soul', 'love songs', 'intimate', 'slow dance'],
    angry: ['metal', 'punk', 'aggressive', 'hardcore', 'rage'],
    nostalgic: ['classic rock', 'oldies', 'throwback', 'vintage', 'retro'],
    party: ['dance', 'electronic', 'club', 'celebration', 'festival'],
    anxious: ['calming', 'soothing', 'meditation', 'stress-relief', 'gentle'],
    excited: ['upbeat', 'energetic', 'celebration', 'motivational', 'dynamic'],
    frustrated: ['alternative', 'grunge', 'emotional release', 'cathartic', 'intense']
  };

  let styles = moodToStyles[primaryMood] || ['general', 'popular'];

  if (secondaryMood && moodToStyles[secondaryMood]) {
    styles = [...styles, ...moodToStyles[secondaryMood].slice(0, 2)];
  }

  return [...new Set(styles)].slice(0, 5);
}

function generateContextExplanation(topEmotion, topSentiment, allEmotions) {
  const emotionName = topEmotion.label.toLowerCase();
  const confidence = Math.round(topEmotion.score * 100);
  const sentimentName = topSentiment.label.toLowerCase();

  let explanation = `Detected ${emotionName} with ${confidence}% confidence`;

  if (sentimentName !== 'neutral') {
    explanation += `, with ${sentimentName} sentiment`;
  }

  const significantEmotions = allEmotions.filter(e => e.score > 0.15 && e !== topEmotion);
  if (significantEmotions.length > 0) {
    const secondaryNames = significantEmotions.map(e => e.label.toLowerCase()).join(', ');
    explanation += `. Also detected traces of ${secondaryNames}`;
  }

  return explanation + '.';
}

function fallbackMoodAnalysis(text) {
  console.log('Using fallback mood analysis');

  const advancedMoodKeywords = {
    happy: {
      keywords: ['happy', 'joy', 'excited', 'cheerful', 'upbeat', 'positive', 'great', 'awesome', 'fantastic', 'wonderful', 'thrilled', 'elated', 'euphoric', 'delighted', 'ecstatic'],
      phrases: ['feeling good', 'on cloud nine', 'over the moon', 'walking on air', 'bright side', 'good vibes'],
      weight: 2
    },
    sad: {
      keywords: ['sad', 'depressed', 'down', 'blue', 'melancholy', 'heartbroken', 'lonely', 'upset', 'disappointed', 'grief', 'sorrow', 'miserable', 'devastated'],
      phrases: ['feeling down', 'heavy heart', 'breaking apart', 'tears in my eyes', 'can\'t stop crying', 'feel empty'],
      weight: 2
    },
    energetic: {
      keywords: ['energetic', 'pumped', 'hyped', 'active', 'motivated', 'powerful', 'strong', 'intense', 'dynamic', 'charged', 'fired up', 'amped'],
      phrases: ['ready to conquer', 'full of energy', 'pumped up', 'ready to go', 'bring it on', 'let\'s do this'],
      weight: 2
    },
    calm: {
      keywords: ['calm', 'peaceful', 'relaxed', 'chill', 'serene', 'tranquil', 'mellow', 'zen', 'quiet', 'gentle', 'soothing', 'restful'],
      phrases: ['at peace', 'feeling zen', 'nice and calm', 'totally relaxed', 'inner peace'],
      weight: 2
    },
    romantic: {
      keywords: ['romantic', 'love', 'intimate', 'passionate', 'tender', 'affectionate', 'sweet', 'loving', 'adore', 'cherish'],
      phrases: ['in love', 'romantic mood', 'date night', 'feeling romantic', 'love is in the air'],
      weight: 2
    },
    angry: {
      keywords: ['angry', 'mad', 'furious', 'rage', 'frustrated', 'annoyed', 'irritated', 'pissed', 'livid', 'outraged', 'enraged'],
      phrases: ['so angry', 'can\'t stand', 'fed up', 'had enough', 'boiling mad', 'seeing red'],
      weight: 2
    },
    anxious: {
      keywords: ['anxious', 'worried', 'nervous', 'stressed', 'overwhelmed', 'panic', 'tense', 'restless', 'uneasy', 'concerned'],
      phrases: ['can\'t stop thinking', 'butterflies in stomach', 'on edge', 'stressed out', 'freaking out'],
      weight: 2
    },
    nostalgic: {
      keywords: ['nostalgic', 'memories', 'past', 'remember', 'miss', 'throwback', 'vintage', 'old times', 'reminiscing'],
      phrases: ['good old days', 'back in the day', 'miss those times', 'thinking about', 'remember when'],
      weight: 2
    },
    party: {
      keywords: ['party', 'dance', 'celebration', 'fun', 'wild', 'crazy', 'festive', 'club', 'nightlife', 'celebrate'],
      phrases: ['party time', 'let\'s celebrate', 'ready to party', 'dance all night', 'good times'],
      weight: 2
    },
    excited: {
      keywords: ['excited', 'thrilled', 'anticipating', 'eager', 'enthusiastic', 'stoked', 'psyched', 'buzzing'],
      phrases: ['so excited', 'can\'t wait', 'really looking forward', 'super stoked'],
      weight: 2
    }
  };

  let detectedMood = 'calm';
  let maxScore = 0;
  let matchedKeywords = [];

  const lowerText = text.toLowerCase();

  for (const [mood, patterns] of Object.entries(advancedMoodKeywords)) {
    let score = 0;
    let currentMatches = [];

    patterns.keywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        score += patterns.weight;
        currentMatches.push(keyword);
      }
    });

    if (patterns.phrases) {
      patterns.phrases.forEach(phrase => {
        if (lowerText.includes(phrase)) {
          score += patterns.weight + 1;
          currentMatches.push(phrase);
        }
      });
    }

    if (score > maxScore) {
      maxScore = score;
      detectedMood = mood;
      matchedKeywords = currentMatches;
    }
  }

  const confidence = maxScore > 0 ? Math.min(maxScore * 0.15, 0.85) : 0.3;

  return {
    mood: detectedMood,
    secondaryMood: null,
    intensity: Math.min(maxScore + 3, 10),
    confidence: confidence,
    context: `Detected using keyword matching. Found: ${matchedKeywords.join(', ') || 'general mood indicators'}`,
    musicStyles: getMusicStylesForMood(detectedMood),
    method: 'fallback-enhanced-keywords'
  };
}
