import React, { useRef, useState, useEffect } from 'react';
import { Editor as MonacoEditor } from '@monaco-editor/react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/ThemeContext';
import './Editor.css';

const Editor = ({ 
  initialContent = '', 
  language = 'plaintext',
  fileName = 'untitled.txt',
  onContentChange,
  onEditorReady,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const editorRef = useRef(null);
  const [wordCount, setWordCount] = useState(0);
  const [fontSize, setFontSize] = useState(localStorage.getItem('editor-font-size') || 14);
  
  // Lausche auf Änderungen der lokalen Speicherung
  useEffect(() => {
    const handleStorageChange = () => {
      const newFontSize = localStorage.getItem('editor-font-size') || 14;
      setFontSize(newFontSize);
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  // Handle editor mount
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // Update word count on initial load
    updateWordCount(initialContent);
    
    // Gib den Editor an die übergeordnete Komponente weiter
    if (onEditorReady) {
      onEditorReady(editor);
    }
  };

  // Handle content change
  const handleEditorChange = (value) => {
    if (onContentChange) {
      onContentChange(value || '');
    }

    // Update word count
    updateWordCount(value || '');
  };

  // Update word count using functional programming
  const updateWordCount = (text) => {
    if (!text) {
      setWordCount(0);
      return;
    }

    // Pure function to count words
    const countWords = (text) => {
      // Handle edge cases
      if (!text || text.trim() === '') return 0;
      
      // Split by whitespace and filter empty strings
      const words = text
        .trim()
        .split(/\s+/)
        .filter(word => word.length > 0);
      
      return words.length;
    };

    setWordCount(countWords(text));
  };

  // Set editor options
  const editorOptions = {
    fontFamily: 'Consolas, "Courier New", monospace',
    fontSize: parseInt(fontSize, 10),
    minimap: { enabled: true },
    lineNumbers: localStorage.getItem('show-line-numbers') !== 'false' ? 'on' : 'off',
    roundedSelection: true,
    scrollBeyondLastLine: false,
    wordWrap: localStorage.getItem('line-wrap') !== 'false' ? 'on' : 'off',
    automaticLayout: true,
    scrollbar: {
      useShadows: false,
      verticalScrollbarSize: 10,
      horizontalScrollbarSize: 10,
    },
  };

  // Configure editor theme
  const monacoTheme = theme.name === 'light' ? 'vs' : theme.name === 'dark' ? 'vs-dark' : 'hc-black';
  
  return (
    <div className="editor-container">
      <div className="editor-status-bar" style={{ backgroundColor: theme.ui.background }}>
        <div className="status-item">
          <span>{fileName}</span>
        </div>
        <div className="status-item">
          <span>{language}</span>
        </div>
        <div className="status-item">
          <span>{t('editor.wordCount', { count: wordCount })}</span>
        </div>
      </div>

      <MonacoEditor
        height="calc(100vh - 100px)" // Adjust based on your layout
        defaultLanguage={language}
        defaultValue={initialContent}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={editorOptions}
        theme={monacoTheme}
      />
    </div>
  );
};

export default Editor;
