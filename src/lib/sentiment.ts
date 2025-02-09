import { supabase } from './supabase';

const SENTIMENT_API_URL = 'https://skchuzee.rcld.dev/api/v1/workspace/sentiment_analysis/chat';
const API_KEY = 'SVQWSN9-1H24CPH-GD7ZRY0-02PKV1H';

export async function analyzeSentiment(message: string, threadId: string, messageId: string) {
  try {
    const response = await fetch(SENTIMENT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        message,
        mode: 'chat',
        sessionId: threadId,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    // Insert sentiment analysis response
    const { error } = await supabase
      .from('messages')
      .insert({
        thread_id: threadId,
        content: data.textResponse,
        type: 'bot',
        bot_type: 'sentiment',
        sentiment_analysis: data.textResponse,
        sentiment_score: calculateSentimentScore(data.textResponse)
      });

    if (error) {
      console.error('Error saving sentiment analysis:', error);
    }

    return data;
  } catch (error) {
    console.error('Error in sentiment analysis:', error);
    throw error;
  }
}

// Basit bir duygu skoru hesaplama fonksiyonu
// Bu fonksiyonu daha gelişmiş bir algoritma ile değiştirebilirsiniz
function calculateSentimentScore(text: string): number {
  const positiveWords = ['mutlu', 'iyi', 'harika', 'güzel', 'pozitif', 'başarılı'];
  const negativeWords = ['üzgün', 'kötü', 'kızgın', 'negatif', 'başarısız'];
  
  const lowerText = text.toLowerCase();
  let score = 0;
  
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) score += 1;
  });
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) score -= 1;
  });
  
  // Normalize score between -1 and 1
  return score / Math.max(positiveWords.length, negativeWords.length);
}