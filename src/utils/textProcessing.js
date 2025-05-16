/**
 * A collection of pure functions for text processing
 * Demonstrates functional programming concepts like:
 * - Pure functions
 * - Higher-order functions
 * - Function composition
 * - Recursion
 * - Immutability
 */

/**
 * Find all occurrences of a search term in text
 * @param {string} text - The text to search in
 * @param {string} search - The term to search for
 * @param {Object} options - Search options
 * @returns {Array} - Array of match objects with index and length
 */
export const findOccurrences = (text, search, options = {}) => {
  const { caseSensitive = false, wholeWord = false } = options;
  
  if (!text || !search) return [];
  
  // Create regex pattern based on options
  let pattern = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape regex special chars
  
  if (wholeWord) {
    pattern = `\\b${pattern}\\b`;
  }
  
  const regex = new RegExp(pattern, caseSensitive ? 'g' : 'gi');
  
  // Find all matches
  const matches = [];
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    matches.push({
      index: match.index,
      length: match[0].length,
      text: match[0]
    });
  }
  
  return matches;
};

/**
 * Replace all occurrences of a search term in text
 * @param {string} text - The text to search in
 * @param {string} search - The term to search for
 * @param {string} replace - The replacement string
 * @param {Object} options - Search options
 * @returns {string} - The text with replacements
 */
export const replaceAll = (text, search, replace, options = {}) => {
  const { caseSensitive = false, wholeWord = false } = options;
  
  if (!text || !search) return text;
  
  // Create regex pattern based on options
  let pattern = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  if (wholeWord) {
    pattern = `\\b${pattern}\\b`;
  }
  
  const regex = new RegExp(pattern, caseSensitive ? 'g' : 'gi');
  
  // Return new text with replacements
  return text.replace(regex, replace);
};

/**
 * Higher-order function that creates a text transformer
 * @param {Function} transformFn - The transformation function
 * @returns {Function} - A function that transforms text
 */
export const createTextTransformer = (transformFn) => {
  return (text) => {
    if (!text) return '';
    return transformFn(text);
  };
};

// Example transformers created with the higher-order function
export const uppercase = createTextTransformer(text => text.toUpperCase());
export const lowercase = createTextTransformer(text => text.toLowerCase());
export const capitalize = createTextTransformer(text => 
  text.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
);

/**
 * Count words in text using recursion
 * @param {string} text - The text to count words in
 * @returns {number} - The number of words
 */
export const countWords = (text) => {
  if (!text || text.trim() === '') return 0;
  
  // Split text into lines
  const lines = text.split('\n');
  
  // Recursive function to process lines
  const processLines = (remainingLines, count = 0) => {
    // Base case: no more lines
    if (remainingLines.length === 0) return count;
    
    // Process current line
    const currentLine = remainingLines[0];
    const wordsInLine = currentLine.trim() === '' 
      ? 0 
      : currentLine.trim().split(/\s+/).length;
    
    // Process next line (recursive call)
    return processLines(
      remainingLines.slice(1), // Immutable: create new array without first element
      count + wordsInLine
    );
  };
  
  return processLines(lines);
};

/**
 * Get statistics about the text
 * @param {string} text - The text to analyze
 * @returns {Object} - Statistics object
 */
export const getTextStatistics = (text) => {
  if (!text) {
    return {
      characters: 0,
      charactersNoSpaces: 0,
      words: 0,
      lines: 0,
      paragraphs: 0
    };
  }
  
  const lines = text.split('\n');
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  const words = countWords(text);
  
  // Count paragraphs (groups of non-empty lines)
  const paragraphs = lines.reduce((count, line, index, arr) => {
    if (line.trim() !== '' && (index === 0 || arr[index - 1].trim() === '')) {
      return count + 1;
    }
    return count;
  }, 0);
  
  return {
    characters,
    charactersNoSpaces,
    words,
    lines: lines.length,
    paragraphs
  };
};

/**
 * Function composition utility
 * @param {...Function} fns - Functions to compose
 * @returns {Function} - Composed function
 */
export const compose = (...fns) => {
  return (initialValue) => 
    fns.reduceRight((value, fn) => fn(value), initialValue);
};

/**
 * Pipeline utility (left-to-right composition)
 * @param {...Function} fns - Functions to pipe
 * @returns {Function} - Piped function
 */
export const pipe = (...fns) => {
  return (initialValue) => 
    fns.reduce((value, fn) => fn(value), initialValue);
};

// Example of function composition with the pipe function
export const formatText = pipe(
  (text) => text.trim(),
  (text) => text.replace(/\s+/g, ' '),
  capitalize
);
