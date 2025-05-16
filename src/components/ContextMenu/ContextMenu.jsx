import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './ContextMenu.css';

const ContextMenu = ({ editorRef }) => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef(null);
  
  useEffect(() => {
    // Only set up context menu if editor reference exists
    if (!editorRef?.current) return;
    
    const editor = editorRef.current;
    
    // Handle context menu on editor
    const handleContextMenu = (event) => {
      event.preventDefault();
      
      // Position the menu at cursor
      setPosition({ x: event.clientX, y: event.clientY });
      setVisible(true);
    };
    
    // Get the DOM node of the editor
    const editorDomNode = editor.getDomNode();
    if (editorDomNode) {
      editorDomNode.addEventListener('contextmenu', handleContextMenu);
    }
    
    // Click outside to close
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setVisible(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      if (editorDomNode) {
        editorDomNode.removeEventListener('contextmenu', handleContextMenu);
      }
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editorRef]);
  
  // Execute editor commands
  const executeCommand = (commandId) => {
    if (!editorRef?.current) return;
    
    const editor = editorRef.current;
    
    switch (commandId) {
      case 'cut':
        editor.trigger('contextmenu', 'editor.action.clipboardCutAction');
        break;
      case 'copy':
        editor.trigger('contextmenu', 'editor.action.clipboardCopyAction');
        break;
      case 'paste':
        document.execCommand('paste');
        break;
      case 'commentLine':
        editor.trigger('contextmenu', 'editor.action.commentLine');
        break;
      case 'formatDocument':
        editor.trigger('contextmenu', 'editor.action.formatDocument');
        break;
      case 'formatSelection':
        const selection = editor.getSelection();
        if (selection && !selection.isEmpty()) {
          editor.trigger('contextmenu', 'editor.action.formatSelection');
        }
        break;
      case 'indent':
        editor.trigger('contextmenu', 'editor.action.indentLines');
        break;
      case 'outdent':
        editor.trigger('contextmenu', 'editor.action.outdentLines');
        break;
      case 'selectAll':
        editor.trigger('contextmenu', 'editor.action.selectAll');
        break;
      default:
        console.log(`Command ${commandId} not implemented`);
    }
    
    setVisible(false);
  };
  
  if (!visible) return null;
  
  const hasSelection = (() => {
    if (!editorRef?.current) return false;
    const selection = editorRef.current.getSelection();
    return selection && !selection.isEmpty();
  })();
  
  const menuStyle = {
    position: 'fixed',
    top: `${position.y}px`,
    left: `${position.x}px`,
    zIndex: 1000
  };
  
  return (
    <div className="editor-context-menu" style={menuStyle} ref={menuRef}>
      <div className="context-menu-group">
        <button className="context-menu-item" onClick={() => executeCommand('cut')}>
          {t('contextMenu.cut')}
          <span className="context-menu-shortcut">Ctrl+X</span>
        </button>
        <button className="context-menu-item" onClick={() => executeCommand('copy')}>
          {t('contextMenu.copy')}
          <span className="context-menu-shortcut">Ctrl+C</span>
        </button>
        <button className="context-menu-item" onClick={() => executeCommand('paste')}>
          {t('contextMenu.paste')}
          <span className="context-menu-shortcut">Ctrl+V</span>
        </button>
      </div>
      
      <div className="context-menu-separator"></div>
      
      <div className="context-menu-group">
        {hasSelection && (
          <button className="context-menu-item" onClick={() => executeCommand('formatSelection')}>
            {t('contextMenu.formatSelection')}
          </button>
        )}
        <button className="context-menu-item" onClick={() => executeCommand('formatDocument')}>
          {t('contextMenu.formatDocument')}
        </button>
        <button className="context-menu-item" onClick={() => executeCommand('commentLine')}>
          {t('contextMenu.toggleComment')}
          <span className="context-menu-shortcut">Ctrl+/</span>
        </button>
      </div>
      
      <div className="context-menu-separator"></div>
      
      <div className="context-menu-group">
        <button className="context-menu-item" onClick={() => executeCommand('selectAll')}>
          {t('contextMenu.selectAll')}
          <span className="context-menu-shortcut">Ctrl+A</span>
        </button>
      </div>
    </div>
  );
};

export default ContextMenu;
