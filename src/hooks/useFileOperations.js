import { useState, useCallback, useEffect } from 'react';
import { saveAs } from 'file-saver';

/**
 * Custom hook for file operations in the text editor
 * Demonstrates functional programming concepts with pure functions and higher-order functions
 */
function useFileOperations(initialContent = '') {
  const [content, setContent] = useState(initialContent);
  const [filename, setFilename] = useState('untitled.txt');
  const [isModified, setIsModified] = useState(false);
  const [filePath, setFilePath] = useState(null);

  /**
   * Pure function to determine file type based on extension
   * @param {string} fileName - The name of the file
   * @returns {string} - The language identifier for the file
   */
  const getFileLanguage = useCallback((fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    const languageMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'md': 'markdown',
      'py': 'python',
      'txt': 'plaintext'
    };
    
    return languageMap[extension] || 'plaintext';
  }, []);

  /**
   * Create a new file - uses functional approach with immutability
   */
  const newFile = useCallback(() => {
    // Using the functional approach to update state
    const resetState = () => {
      setContent('');
      setFilename('untitled.txt');
      setIsModified(false);
      setFilePath(null);
    };

    // Check for unsaved changes first
    if (isModified) {
      const shouldProceed = window.confirm('You have unsaved changes. Continue?');
      if (shouldProceed) {
        resetState();
      }
      return;
    }
    
    resetState();
  }, [isModified]);

  /**
   * Save the current file
   * Uses pure function approach for file handling
   */
  const saveFile = useCallback(() => {
    // Create a blob with the content
    const blob = new Blob([content], { type: 'text/plain' });
    
    // Use file-saver library to save the file
    saveAs(blob, filename);
    
    // Mark as saved
    setIsModified(false);
  }, [content, filename]);

  /**
   * Open a file using the FileReader API
   * Demonstrates callback pattern common in functional programming
   */
  const openFile = useCallback((file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const fileContent = event.target.result;
        
        // Update state with new file information
        setContent(fileContent);
        setFilename(file.name);
        setFilePath(URL.createObjectURL(file));
        setIsModified(false);
        
        resolve({
          name: file.name,
          content: fileContent,
          path: URL.createObjectURL(file),
          language: getFileLanguage(file.name)
        });
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      reader.readAsText(file);
    });
  }, [getFileLanguage]);

  /**
   * Update content and mark as modified
   */
  const updateContent = useCallback((newContent) => {
    setContent(newContent);
    setIsModified(true);
  }, []);

  /**
   * Word count implementation using functional programming (recursion)
   */
  const countWords = useCallback((text = content) => {
    // Base case for recursion
    if (!text || text.trim() === '') return 0;
    
    // Split the text into lines
    const lines = text.split('\n');
    
    // Recursive function to count words in each line
    const countWordsInLines = (remainingLines, accumulator = 0) => {
      if (remainingLines.length === 0) return accumulator;
      
      const currentLine = remainingLines[0];
      const wordsInLine = currentLine.trim() === '' 
        ? 0 
        : currentLine.trim().split(/\s+/).length;
      
      return countWordsInLines(
        remainingLines.slice(1), 
        accumulator + wordsInLine
      );
    };
    
    return countWordsInLines(lines);
  }, [content]);

  /**
   * Auto-save functionality implementation
   * Uses functional programming approach with pure functions for settings handling
   */
  const getAutoSaveSettings = useCallback(() => {
    return {
      enabled: localStorage.getItem('auto-save') === 'true',
      interval: parseInt(localStorage.getItem('auto-save-interval') || 30000, 10)
    };
  }, []);

  // Set up auto-save based on user settings
  useEffect(() => {
    const { enabled, interval } = getAutoSaveSettings();
    
    if (!enabled || !isModified) return;
    
    const autoSaveTimer = setTimeout(() => {
      saveFile();
    }, interval);
    
    return () => clearTimeout(autoSaveTimer);
  }, [isModified, saveFile, getAutoSaveSettings]);

  return {
    content,
    setContent: updateContent,
    filename,
    setFilename,
    isModified,
    filePath,
    newFile,
    saveFile,
    openFile,
    countWords,
    getFileLanguage,
    getAutoSaveSettings
  };
}

export default useFileOperations;
