import React, { useRef, useState, useEffect } from 'react';
import { Editor as MonacoEditor } from '@monaco-editor/react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/ThemeContext';
import ContextMenu from '../ContextMenu';
import StatusBar from '../StatusBar';
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
  const [lineCount, setLineCount] = useState(initialContent ? initialContent.split('\n').length : 0);
  const [charCount, setCharCount] = useState(initialContent ? initialContent.length : 0);
  const [cursorPosition, setCursorPosition] = useState({ lineNumber: 1, column: 1 });
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
    
    // Configure editor for better event handling and hit testing
    editor.updateOptions({
      automaticLayout: true,
      fixedOverflowWidgets: true
    });
    
    // Set up cursor position change listener
    editor.onDidChangeCursorPosition((e) => {
      setCursorPosition({
        lineNumber: e.position.lineNumber,
        column: e.position.column
      });
    });
    
    // Add this to ensure Monaco editor properly calculates layout dimensions
    setTimeout(() => {
      editor.layout();
      // Fix potential focus and hit testing issues
      window.dispatchEvent(new Event('resize'));
    }, 100);

    // Update statistics on initial load
    updateTextStatistics(initialContent);
    
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

    // Update text statistics
    updateTextStatistics(value || '');
  };

  // Update text statistics using functional programming
  const updateTextStatistics = (text) => {
    if (!text) {
      setWordCount(0);
      setLineCount(0);
      setCharCount(0);
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

    // Update all statistics
    setWordCount(countWords(text));
    setLineCount(text.split('\n').length);
    setCharCount(text.length);
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
    fixedOverflowWidgets: true, // Prevents overflow issues that might cause hit testing problems
    renderValidationDecorations: 'on',
    renderWhitespace: 'selection',
    scrollbar: {
      useShadows: false,
      verticalScrollbarSize: 10,
      horizontalScrollbarSize: 10,
      alwaysConsumeMouseWheel: false // Prevents scroll event conflicts
    },
    overviewRulerLanes: 0, // Simplifies the editor's DOM structure
    hideCursorInOverviewRuler: true,
    renderLineHighlight: 'line', // Simplifies line highlighting
    contextmenu: true, // Ensure context menu works correctly
  };

  // Configure editor theme
  const monacoTheme = theme.name === 'light' ? 'vs' : theme.name === 'dark' ? 'vs-dark' : 'hc-black';
  
  return (
    <div className="editor-container">
      <StatusBar 
        fileName={fileName}
        language={language}
        wordCount={wordCount}
        lineCount={lineCount}
        charCount={charCount}
        cursorPosition={cursorPosition}
      />

      <div className="monaco-container">
        <MonacoEditor
          height="calc(100vh - 100px)" // Adjust based on your layout
          width="100%"
          defaultLanguage={language}
          defaultValue={initialContent}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={editorOptions}
          theme={monacoTheme}
          className="monaco-editor-instance"
          loading={<div className="editor-loading">Loading editor...</div>}
        />
        <ContextMenu editorRef={editorRef} />
      </div>
    </div>
  );
};

export default Editor;
