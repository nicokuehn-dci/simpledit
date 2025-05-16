import React, { useState, useRef, useEffect, useCallback } from 'react';
import Dashboard from './components/Dashboard/Dashboard';
import Editor from './components/Editor/Editor';
import SearchBar from './components/SearchReplace/SearchBar';
import Settings from './components/Settings/Settings';
import AIAssistant from './components/AIAssistant';
import { ThemeProvider } from './utils/ThemeContext';
import { useTranslation } from 'react-i18next';
import './App.css';
import './i18n';
import { FiSave, FiChevronLeft, FiSearch, FiSettings, FiClock } from 'react-icons/fi';

function App() {
  const { t } = useTranslation();
  const [currentFile, setCurrentFile] = useState(null);
  const [showDashboard, setShowDashboard] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const editorRef = useRef(null);
  
  // Handle file open
  const handleFileOpen = (file) => {
    setCurrentFile(file);
    setShowDashboard(false);
    setShowSearch(false);
  };

  // Handle new file creation
  const handleNewFile = (fileTemplate) => {
    setCurrentFile(fileTemplate);
    setShowDashboard(false);
    setShowSearch(false);
  };

  // Return to dashboard
  const backToDashboard = () => {
    setShowDashboard(true);
    setShowSearch(false);
  };

  // Toggle search bar
  const toggleSearch = () => {
    setShowSearch(!showSearch);
  };

  // Toggle settings
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  // Handle editor content change
  const handleEditorContentChange = (newContent) => {
    if (currentFile) {
      setCurrentFile({
        ...currentFile,
        content: newContent
      });
    }
  };

  // Handle AI text insertion
  const handleInsertAIText = (text) => {
    if (editorRef.current) {
      const editor = editorRef.current;
      const selection = editor.getSelection();
      const id = { major: 1, minor: 1 };
      const op = { identifier: id, range: selection, text: text, forceMoveMarkers: true };
      editor.executeEdits("ai-assistant", [op]);
    }
  };

  // Get the editor reference from the Editor component
  const handleEditorReady = (editor) => {
    editorRef.current = editor;
  };

  // Save file
  const saveFile = useCallback(() => {
    if (!currentFile) return;
    
    // Create a blob with the content
    const blob = new Blob([currentFile.content], { type: 'text/plain' });
    
    // Create a URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link element
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFile.name;
    
    // Trigger the download
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Update last saved timestamp
    setLastSaved(new Date());
  }, [currentFile]);
  
  // Implementieren von Auto-Save
  useEffect(() => {
    if (!currentFile) return;
    
    // Überprüfen, ob Auto-Save aktiviert ist
    const autoSaveEnabled = localStorage.getItem('auto-save') === 'true';
    if (!autoSaveEnabled) return;
    
    // Auto-Save alle 30 Sekunden
    const autoSaveInterval = setInterval(() => {
      saveFile();
    }, 30000);
    
    // Aufräumen beim Unmounting
    return () => clearInterval(autoSaveInterval);
  }, [currentFile, saveFile]);
  
  // Implementieren von Tastaturkürzeln
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Strg+S zum Speichern
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveFile();
      }
      
      // Strg+F zum Suchen
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setShowSearch(true);
      }
      
      // Escape zum Schließen der Suche oder Einstellungen
      if (e.key === 'Escape') {
        if (showSearch) setShowSearch(false);
        if (showSettings) setShowSettings(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showSearch, showSettings, saveFile]);

  return (
    <ThemeProvider>
      <div className="App">
        {showDashboard ? (
          <Dashboard 
            onFileOpen={handleFileOpen} 
            onNewFile={handleNewFile}
            onSettingsOpen={toggleSettings}
          />
        ) : (
          <div className="editor-view">
            <div className="toolbar">
              <button onClick={backToDashboard} className="toolbar-button">
                <FiChevronLeft /> {t('dashboard.title')}
              </button>
              
              <div className="file-info">
                {currentFile?.name || 'Untitled'}
              </div>
              
              <div className="toolbar-actions">
                <button onClick={toggleSearch} className="toolbar-button">
                  <FiSearch /> {t('editor.find')}
                </button>
                <button onClick={saveFile} className="toolbar-button">
                  <FiSave /> {t('editor.saveFile')}
                </button>
                <button onClick={toggleSettings} className="toolbar-button">
                  <FiSettings />
                </button>
                {lastSaved && (
                  <div className="last-saved">
                    <FiClock size={12} /> {t('editor.lastSaved')}: {lastSaved.toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
            
            {showSearch && (
              <SearchBar editorRef={editorRef} />
            )}
            
            <Editor 
              initialContent={currentFile?.content || ''}
              language={currentFile?.language || 'plaintext'}
              fileName={currentFile?.name || 'untitled.txt'}
              onContentChange={handleEditorContentChange}
              onEditorReady={handleEditorReady}
            />

            {!showDashboard && (
              <AIAssistant 
                editorRef={editorRef}
                language={currentFile?.language || 'plaintext'}
                onInsertText={handleInsertAIText}
              />
            )}
          </div>
        )}
        
        {showSettings && <Settings onClose={toggleSettings} />}
      </div>
    </ThemeProvider>
  );
}

export default App;
