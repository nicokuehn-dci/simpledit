import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/ThemeContext';
import CommandPalette from '../CommandPalette';
import {
  FiFile, FiEdit, FiEye, FiCode, FiTerminal, FiSettings,
  FiSave, FiFolder, FiDownload, FiX, FiClipboard,
  FiCopy, FiScissors, FiCornerDownRight, FiRotateCcw,
  FiRotateCw, FiAlignLeft, FiSearch, FiMaximize
} from 'react-icons/fi';
import './MenuBar.css';

const MenuBar = ({
  editorRef,
  currentFile,
  onSave,
  onSaveAs,
  onNewFile,
  onOpenFile,
  onExportFile,
  handleFindReplace,
  layoutOptions = {}
}) => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  
  const [activeMenu, setActiveMenu] = useState(null);
  const [wordWrapEnabled, setWordWrapEnabled] = useState(
    localStorage.getItem('line-wrap') !== 'false'
  );
  const [lineNumbersEnabled, setLineNumbersEnabled] = useState(
    localStorage.getItem('show-line-numbers') !== 'false'
  );
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [commands, setCommands] = useState([]);
  
  const menuRef = useRef(null);
  
  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Initialize available commands
  useEffect(() => {
    const availableCommands = [
      // File commands
      { id: 'new-file', title: t('menu.new'), category: t('menu.file'), keybinding: 'Ctrl+N' },
      { id: 'open-file', title: t('menu.open'), category: t('menu.file'), keybinding: 'Ctrl+O' },
      { id: 'save-file', title: t('menu.save'), category: t('menu.file'), keybinding: 'Ctrl+S' },
      { id: 'save-as', title: t('menu.saveAs'), category: t('menu.file'), keybinding: 'Ctrl+Shift+S' },
      
      // Edit commands
      { id: 'undo', title: t('menu.undo'), category: t('menu.edit'), keybinding: 'Ctrl+Z' },
      { id: 'redo', title: t('menu.redo'), category: t('menu.edit'), keybinding: 'Ctrl+Y' },
      { id: 'cut', title: t('menu.cut'), category: t('menu.edit'), keybinding: 'Ctrl+X' },
      { id: 'copy', title: t('menu.copy'), category: t('menu.edit'), keybinding: 'Ctrl+C' },
      { id: 'paste', title: t('menu.paste'), category: t('menu.edit'), keybinding: 'Ctrl+V' },
      { id: 'find', title: t('menu.find'), category: t('menu.edit'), keybinding: 'Ctrl+F' },
      
      // View commands
      { id: 'toggle-word-wrap', title: t('menu.wordWrap'), category: t('menu.view') },
      { id: 'toggle-line-numbers', title: t('menu.lineNumbers'), category: t('menu.view') },
      { id: 'zoom-in', title: t('menu.zoomIn'), category: t('menu.view'), keybinding: 'Ctrl+Plus' },
      { id: 'zoom-out', title: t('menu.zoomOut'), category: t('menu.view'), keybinding: 'Ctrl+Minus' },
      { id: 'toggle-theme', title: t('menu.toggleTheme'), category: t('menu.view') },
      
      // Code commands
      { id: 'format-document', title: t('menu.formatDocument'), category: t('menu.code') },
      { id: 'toggle-comment', title: t('menu.toggleComment'), category: t('menu.code'), keybinding: 'Ctrl+/' },
      
      // Tool commands
      { id: 'toggle-ai-assistant', title: t('menu.aiAssistant'), category: t('menu.tools') },
      { id: 'toggle-terminal', title: t('menu.terminal'), category: t('menu.tools'), keybinding: 'Ctrl+`' },
    ];
    
    setCommands(availableCommands);
  }, [t]);
  
  // Command palette keyboard shortcut
  useEffect(() => {
    const handleCommandPalette = (e) => {
      // Ctrl+Shift+P or Cmd+Shift+P
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'p') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };
    
    document.addEventListener('keydown', handleCommandPalette);
    return () => document.removeEventListener('keydown', handleCommandPalette);
  }, []);
  
  // Toggle the active menu
  const toggleMenu = (menuName) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };
  
  // Execute command from palette
  const executeCommand = (commandId) => {
    switch(commandId) {
      // File commands
      case 'new-file': 
        onNewFile(); 
        break;
      case 'open-file': 
        onOpenFile(); 
        break;
      case 'save-file': 
        onSave(); 
        break;
      case 'save-as': 
        onSaveAs(); 
        break;
      
      // Edit commands
      case 'undo': 
        handleEditOperation('undo'); 
        break;
      case 'redo': 
        handleEditOperation('redo'); 
        break;
      case 'cut': 
        handleEditOperation('cut'); 
        break;
      case 'copy': 
        handleEditOperation('copy'); 
        break;
      case 'paste': 
        handleEditOperation('paste'); 
        break;
      case 'find': 
        handleFindReplace(); 
        break;
      
      // View commands
      case 'toggle-word-wrap': 
        handleViewOption('wordWrap'); 
        break;
      case 'toggle-line-numbers': 
        handleViewOption('lineNumbers'); 
        break;
      case 'zoom-in': 
        handleViewOption('zoomIn'); 
        break;
      case 'zoom-out': 
        handleViewOption('zoomOut'); 
        break;
      case 'toggle-theme': 
        toggleTheme(); 
        break;
      
      // Code commands
      case 'format-document': 
        handleEditOperation('format'); 
        break;
      case 'toggle-comment': 
        handleEditOperation('comment'); 
        break;
      
      // Tool commands
      case 'toggle-ai-assistant': 
        layoutOptions.toggleAIAssistant?.(); 
        break;
      case 'toggle-terminal': 
        layoutOptions.toggleTerminal?.(); 
        break;
      
      default:
        console.log(`Command ${commandId} not implemented`);
    }
  };
  
  // Handle common editing operations
  const handleEditOperation = (operation) => {
    if (!editorRef?.current) return;
    
    const editor = editorRef.current;
    const actions = editor.getActions();
    
    switch(operation) {
      case 'undo':
        editor.trigger('keyboard', 'undo', null);
        break;
      case 'redo':
        editor.trigger('keyboard', 'redo', null);
        break;
      case 'copy':
        editor.trigger('keyboard', 'editor.action.clipboardCopyAction', null);
        break;
      case 'cut':
        editor.trigger('keyboard', 'editor.action.clipboardCutAction', null);
        break;
      case 'paste':
        // This is handled by the browser
        document.execCommand('paste');
        break;
      case 'selectAll':
        editor.setSelection(editor.getModel().getFullModelRange());
        break;
      case 'format':
        editor.getAction('editor.action.formatDocument')?.run();
        break;
      case 'comment':
        editor.getAction('editor.action.commentLine')?.run();
        break;
      case 'indent':
        editor.getAction('editor.action.indentLines')?.run();
        break;
      case 'outdent':
        editor.getAction('editor.action.outdentLines')?.run();
        break;
      default:
        console.log(`Operation ${operation} not implemented yet`);
    }
    
    // Close menu after action
    setActiveMenu(null);
  };
  
  // Handle view options
  const handleViewOption = (option) => {
    if (!editorRef?.current) return;
    
    const editor = editorRef.current;
    
    switch(option) {
      case 'wordWrap':
        const newWrapState = !wordWrapEnabled;
        editor.updateOptions({ wordWrap: newWrapState ? 'on' : 'off' });
        localStorage.setItem('line-wrap', newWrapState);
        setWordWrapEnabled(newWrapState);
        break;
      case 'lineNumbers':
        const newLineNumbersState = !lineNumbersEnabled;
        editor.updateOptions({ lineNumbers: newLineNumbersState ? 'on' : 'off' });
        localStorage.setItem('show-line-numbers', newLineNumbersState);
        setLineNumbersEnabled(newLineNumbersState);
        break;
      case 'zoomIn':
        const currentSize = parseInt(localStorage.getItem('editor-font-size') || 14, 10);
        const newSize = Math.min(currentSize + 2, 28); // Max size is 28
        localStorage.setItem('editor-font-size', newSize);
        editor.updateOptions({ fontSize: newSize });
        // Dispatch event to notify other components
        window.dispatchEvent(new Event('storage'));
        break;
      case 'zoomOut':
        const currentFontSize = parseInt(localStorage.getItem('editor-font-size') || 14, 10);
        const newFontSize = Math.max(currentFontSize - 2, 8); // Min size is 8
        localStorage.setItem('editor-font-size', newFontSize);
        editor.updateOptions({ fontSize: newFontSize });
        // Dispatch event to notify other components
        window.dispatchEvent(new Event('storage'));
        break;
      case 'toggleMinimap':
        const currentMinimapState = editor.getOption(editor.getRawOptions().minimap.enabled);
        editor.updateOptions({ 
          minimap: { enabled: !currentMinimapState } 
        });
        break;
      default:
        console.log(`View option ${option} not implemented yet`);
    }
    
    // Close menu after action
    setActiveMenu(null);
  };
  
  // Handle code operations - these may need backend support
  const handleCodeOperation = async (operation) => {
    if (!editorRef?.current) return;
    
    const editor = editorRef.current;
    const selection = editor.getSelection();
    
    if (operation === 'formatSelection' && !selection.isEmpty()) {
      const selectedText = editor.getModel().getValueInRange(selection);
      const language = currentFile?.language || 'plaintext';
      
      try {
        const response = await fetch('http://localhost:8000/code_action', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: selectedText,
            action: 'format',
            language
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          // Replace the selected text with the formatted code
          editor.executeEdits('code-formatting', [{
            range: selection,
            text: data.content,
            forceMoveMarkers: true
          }]);
        }
      } catch (err) {
        console.error('Error formatting code:', err);
      }
    }
    
    // Close menu after action
    setActiveMenu(null);
  };
  
  // Go to line functionality
  const handleGoToLine = () => {
    const lineNumber = prompt(t('editor.enterLineNumber'), '1');
    if (lineNumber && editorRef?.current) {
      const line = parseInt(lineNumber, 10);
      if (!isNaN(line) && line > 0) {
        editorRef.current.revealLineInCenter(line);
        editorRef.current.setPosition({ lineNumber: line, column: 1 });
        editorRef.current.focus();
      }
    }
    setActiveMenu(null);
  };
  
  return (
    <div className="menu-bar" ref={menuRef}>
      {/* Command Palette */}
      <CommandPalette 
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        commands={commands}
        executeCommand={executeCommand}
      />
      
      {/* File Menu */}
      <div className="menu-container">
        <button 
          className={`menu-button ${activeMenu === 'file' ? 'active' : ''}`} 
          onClick={() => toggleMenu('file')}
        >
          <FiFile className="menu-icon" /> {t('menu.file')}
        </button>
        
        {activeMenu === 'file' && (
          <div className="menu-dropdown">
            <button className="menu-item" onClick={() => { onNewFile(); setActiveMenu(null); }}>
              <FiFile className="item-icon" /> {t('menu.new')}
            </button>
            <button className="menu-item" onClick={() => { onOpenFile(); setActiveMenu(null); }}>
              <FiFolder className="item-icon" /> {t('menu.open')}
            </button>
            <div className="menu-separator"></div>
            <button className="menu-item" onClick={() => { onSave(); setActiveMenu(null); }}>
              <FiSave className="item-icon" /> {t('menu.save')}
            </button>
            <button className="menu-item" onClick={() => { onSaveAs(); setActiveMenu(null); }}>
              <FiSave className="item-icon" /> {t('menu.saveAs')}
            </button>
            <div className="menu-separator"></div>
            <button className="menu-item" onClick={() => { onExportFile?.('pdf'); setActiveMenu(null); }}>
              <FiDownload className="item-icon" /> {t('menu.exportPDF')}
            </button>
            <button className="menu-item" onClick={() => { onExportFile?.('html'); setActiveMenu(null); }}>
              <FiDownload className="item-icon" /> {t('menu.exportHTML')}
            </button>
            <div className="menu-separator"></div>
            <button className="menu-item" onClick={() => { window.close(); }}>
              <FiX className="item-icon" /> {t('menu.exit')}
            </button>
          </div>
        )}
      </div>
      
      {/* Edit Menu */}
      <div className="menu-container">
        <button 
          className={`menu-button ${activeMenu === 'edit' ? 'active' : ''}`}
          onClick={() => toggleMenu('edit')}
        >
          <FiEdit className="menu-icon" /> {t('menu.edit')}
        </button>
        
        {activeMenu === 'edit' && (
          <div className="menu-dropdown">
            <button className="menu-item" onClick={() => handleEditOperation('undo')}>
              <FiRotateCcw className="item-icon" /> {t('menu.undo')}
            </button>
            <button className="menu-item" onClick={() => handleEditOperation('redo')}>
              <FiRotateCw className="item-icon" /> {t('menu.redo')}
            </button>
            <div className="menu-separator"></div>
            <button className="menu-item" onClick={() => handleEditOperation('cut')}>
              <FiScissors className="item-icon" /> {t('menu.cut')}
            </button>
            <button className="menu-item" onClick={() => handleEditOperation('copy')}>
              <FiCopy className="item-icon" /> {t('menu.copy')}
            </button>
            <button className="menu-item" onClick={() => handleEditOperation('paste')}>
              <FiClipboard className="item-icon" /> {t('menu.paste')}
            </button>
            <button className="menu-item" onClick={() => handleEditOperation('selectAll')}>
              <FiMaximize className="item-icon" /> {t('menu.selectAll')}
            </button>
            <div className="menu-separator"></div>
            <button className="menu-item" onClick={handleFindReplace}>
              <FiSearch className="item-icon" /> {t('menu.find')}
            </button>
            <button className="menu-item" onClick={handleGoToLine}>
              <FiCornerDownRight className="item-icon" /> {t('menu.goToLine')}
            </button>
          </div>
        )}
      </div>
      
      {/* View Menu */}
      <div className="menu-container">
        <button 
          className={`menu-button ${activeMenu === 'view' ? 'active' : ''}`} 
          onClick={() => toggleMenu('view')}
        >
          <FiEye className="menu-icon" /> {t('menu.view')}
        </button>
        
        {activeMenu === 'view' && (
          <div className="menu-dropdown">
            <button 
              className={`menu-item checkbox-item ${wordWrapEnabled ? 'checked' : ''}`} 
              onClick={() => handleViewOption('wordWrap')}
            >
              <FiAlignLeft className="item-icon" /> {t('menu.wordWrap')}
            </button>
            <button 
              className={`menu-item checkbox-item ${lineNumbersEnabled ? 'checked' : ''}`} 
              onClick={() => handleViewOption('lineNumbers')}
            >
              {t('menu.lineNumbers')}
            </button>
            <div className="menu-separator"></div>
            <button className="menu-item" onClick={() => handleViewOption('zoomIn')}>
              {t('menu.zoomIn')}
            </button>
            <button className="menu-item" onClick={() => handleViewOption('zoomOut')}>
              {t('menu.zoomOut')}
            </button>
            <button className="menu-item" onClick={() => handleViewOption('toggleMinimap')}>
              {t('menu.toggleMinimap')}
            </button>
            <div className="menu-separator"></div>
            <button className="menu-item" onClick={() => { toggleTheme(); setActiveMenu(null); }}>
              {t('menu.toggleTheme')}
            </button>
          </div>
        )}
      </div>
      
      {/* Code Menu */}
      <div className="menu-container">
        <button 
          className={`menu-button ${activeMenu === 'code' ? 'active' : ''}`}
          onClick={() => toggleMenu('code')}
        >
          <FiCode className="menu-icon" /> {t('menu.code')}
        </button>
        
        {activeMenu === 'code' && (
          <div className="menu-dropdown">
            <button className="menu-item" onClick={() => handleEditOperation('comment')}>
              {t('menu.toggleComment')}
            </button>
            <button className="menu-item" onClick={() => handleEditOperation('format')}>
              {t('menu.formatDocument')}
            </button>
            <button className="menu-item" onClick={() => handleCodeOperation('formatSelection')}>
              {t('menu.formatSelection')}
            </button>
            <div className="menu-separator"></div>
            <button className="menu-item" onClick={() => handleEditOperation('indent')}>
              {t('menu.indent')}
            </button>
            <button className="menu-item" onClick={() => handleEditOperation('outdent')}>
              {t('menu.outdent')}
            </button>
          </div>
        )}
      </div>
      
      {/* Tools Menu */}
      <div className="menu-container">
        <button 
          className={`menu-button ${activeMenu === 'tools' ? 'active' : ''}`}
          onClick={() => toggleMenu('tools')}
        >
          <FiTerminal className="menu-icon" /> {t('menu.tools')}
        </button>
        
        {activeMenu === 'tools' && (
          <div className="menu-dropdown">
            <button className="menu-item" onClick={() => { layoutOptions.toggleTerminal?.(); setActiveMenu(null); }}>
              {t('menu.terminal')}
            </button>
            <button className="menu-item" onClick={() => { layoutOptions.toggleAIAssistant?.(); setActiveMenu(null); }}>
              {t('menu.aiAssistant')}
            </button>
            <button className="menu-item" onClick={() => { layoutOptions.toggleSidebar?.(); setActiveMenu(null); }}>
              {t('menu.explorer')}
            </button>
          </div>
        )}
      </div>

      {/* Command Palette - Ctrl+Shift+P */}
      {commandPaletteOpen && (
        <CommandPalette 
          commands={commands} 
          onClose={() => setCommandPaletteOpen(false)} 
          onExecute={executeCommand}
        />
      )}
    </div>
  );
};

export default MenuBar;
