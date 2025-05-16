import React, { useState, useRef, useEffect, useCallback } from 'react';
import Dashboard from './components/Dashboard/Dashboard';
import Editor from './components/Editor/Editor';
import SearchBar from './components/SearchReplace/SearchBar';
import Settings from './components/Settings/Settings';
import AIAssistant from './components/AIAssistant';
import MenuBar from './components/MenuBar';
import Terminal from './components/Terminal';
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
  
  // Show/Hide AI Assistant
  const [showAIAssistant, setShowAIAssistant] = useState(true);
  const toggleAIAssistant = () => {
    setShowAIAssistant(!showAIAssistant);
  };
  
  // Show/Hide Terminal
  const [showTerminal, setShowTerminal] = useState(false);
  const toggleTerminal = () => {
    setShowTerminal(!showTerminal);
    // Resize editor after showing/hiding terminal
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.layout();
      }
    }, 300);
  };
  
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
      editor.focus(); // Return focus to the editor
    }
  };

  // Get the editor reference from the Editor component
  const handleEditorReady = (editor) => {
    editorRef.current = editor;
    
    // Add window resize handler to ensure editor layout is recalculated
    const handleResize = () => {
      if (editorRef.current) {
        // Small timeout to allow other DOM changes to complete
        setTimeout(() => {
          editorRef.current.layout();
        }, 0);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Trigger initial layout
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
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

  // Save As functionality
  const saveFileAs = useCallback(() => {
    if (!currentFile) return;
    
    // Prompt user for a new file name
    const newFileName = prompt(t('editor.saveAsPrompt'), currentFile.name);
    
    if (!newFileName) return; // User canceled
    
    // Update the current file name
    setCurrentFile(prevFile => ({
      ...prevFile,
      name: newFileName
    }));
    
    // Create a blob with the content
    const blob = new Blob([currentFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link element for download
    const a = document.createElement('a');
    a.href = url;
    a.download = newFileName;
    
    // Trigger the download
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Update last saved timestamp
    setLastSaved(new Date());
  }, [currentFile, t]);
  
  // Export file to different formats
  const exportFile = useCallback((format) => {
    if (!currentFile || !editorRef.current) return;
    
    if (format === 'pdf') {
      alert(t('editor.pdfExportNotImplemented'));
      // Here you would integrate with PDF generation library
      // or send to backend for conversion
    } else if (format === 'html') {
      // Simple HTML export
      const content = currentFile.content;
      const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${currentFile.name}</title>
  <style>
    body {
      font-family: sans-serif;
      line-height: 1.5;
      margin: 2em;
    }
    pre {
      background-color: #f5f5f5;
      padding: 1em;
      border-radius: 4px;
      overflow-x: auto;
    }
  </style>
</head>
<body>
  <h1>${currentFile.name}</h1>
  <pre>${content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
</body>
</html>`;
      
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentFile.name}.html`;
      
      document.body.appendChild(a);
      a.click();
      
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [currentFile, editorRef, t]);
  
  // Open file using a file input 
  const openFile = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result;
        
        // Determine language based on file extension
        const extension = file.name.split('.').pop().toLowerCase();
        let language = 'plaintext';
        
        switch(extension) {
          case 'js': language = 'javascript'; break;
          case 'ts': language = 'typescript'; break;
          case 'py': language = 'python'; break;
          case 'html': language = 'html'; break;
          case 'css': language = 'css'; break;
          case 'json': language = 'json'; break;
          case 'md': language = 'markdown'; break;
          // Add more languages as needed
          default: language = 'plaintext';
        }
        
        setCurrentFile({
          name: file.name,
          content: content,
          language: language
        });
        
        setShowDashboard(false);
      };
      
      reader.readAsText(file);
    });
    
    input.click();
  }, []);
  
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
            {/* Main Menu Bar */}
            <MenuBar
              editorRef={editorRef}
              currentFile={currentFile}
              onSave={saveFile}
              onSaveAs={saveFileAs}
              onNewFile={() => handleNewFile({
                name: 'untitled.txt',
                content: '',
                language: 'plaintext'
              })}
              onOpenFile={openFile}
              onExportFile={exportFile}
              handleFindReplace={toggleSearch}
              layoutOptions={{
                toggleAIAssistant: toggleAIAssistant,
                toggleTerminal: toggleTerminal,
                toggleSidebar: () => console.log("Sidebar not implemented yet")
              }}
            />
            
            {/* Legacy Toolbar - can be removed later when Menu is complete */}
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

            {showAIAssistant && !showDashboard && (
              <AIAssistant 
                editorRef={editorRef}
                language={currentFile?.language || 'plaintext'}
                fileName={currentFile?.name || 'untitled.txt'}
                insertTextAtCursor={handleInsertAIText}
              />
            )}
            
            {/* Terminal Component */}
            <Terminal visible={showTerminal} />
          </div>
        )}
        
        {showSettings && <Settings onClose={toggleSettings} />}
      </div>
    </ThemeProvider>
  );
}

export default App;
