// File: src/services/PromiseService.js
import promisesData from '../../assets/promises.json';

// Get a random promise from the loaded JSON
export const getRandomPromise = () => {
  // If the JSON is structured as an object with categories (e.g., { biblicas: [...], encorajamento: [...] })
  if (promisesData && typeof promisesData === 'object' && !Array.isArray(promisesData)) {
    const categories = Object.keys(promisesData);
    if (categories.length === 0) return { text: 'O Senhor é meu pastor.', ref: 'Salmos 23:1' };
    
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const list = promisesData[randomCategory];
    
    if (list && list.length > 0) {
      const rawText = list[Math.floor(Math.random() * list.length)];
      return parsePromise(rawText);
    }
  }
  
  // Fallback if it's an array
  if (Array.isArray(promisesData) && promisesData.length > 0) {
    const rawText = promisesData[Math.floor(Math.random() * promisesData.length)];
    return parsePromise(rawText);
  }

  return { text: 'Deus é contigo!', ref: '' };
};

// Helper to split "Promise text (Book 1:1)" into { text, ref }
const parsePromise = (rawString) => {
  // Try to extract text inside parentheses as the reference
  const refMatch = rawString.match(/\((.*?)\)$/);
  if (refMatch) {
    const ref = refMatch[1];
    const text = rawString.replace(/\(.*?\)$/, '').trim();
    return { text, ref };
  }
  return { text: rawString, ref: 'Bíblia Sagrada' };
};
