import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/ThemeContext';
import './SearchBar.css';
import { FiSearch, FiX, FiArrowDown, FiArrowUp } from 'react-icons/fi';

const SearchBar = ({ editorRef }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [showReplace, setShowReplace] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [matchWholeWord, setMatchWholeWord] = useState(false);

  // Function to search in the editor
  const handleSearch = () => {
    if (!editorRef.current || !searchTerm) return;
    
    const editor = editorRef.current;
    
    // Get find action from the editor
    const findAction = editor.getAction('actions.find');
    if (findAction) {
      findAction.run();
      
      // Set search options
      const findController = editor._actions['editor.actions.findWithArgs']._findController;
      if (findController) {
        findController.setSearchString(searchTerm);
        findController.setOptions({
          caseSensitive,
          isRegex: useRegex,
          matchWholeWord
        });
      }
    }
  };

  // Function to replace
  const handleReplace = () => {
    if (!editorRef.current || !searchTerm) return;
    
    const editor = editorRef.current;
    
    // Find current selection
    const selection = editor.getSelection();
    
    // If there's a selection that matches the search term
    if (selection) {
      const selectedText = editor.getModel().getValueInRange(selection);
      
      // If case sensitive is off, compare lowercases
      const matches = caseSensitive 
        ? selectedText === searchTerm 
        : selectedText.toLowerCase() === searchTerm.toLowerCase();
        
      if (matches) {
        // Replace the selected text
        editor.executeEdits('replace', [
          {
            range: selection,
            text: replaceTerm
          }
        ]);
        
        // Continue searching
        handleSearch();
      }
    }
  };

  // Function to replace all
  const handleReplaceAll = () => {
    if (!editorRef.current || !searchTerm) return;
    
    const editor = editorRef.current;
    const model = editor.getModel();
    const text = model.getValue();
    
    let newText;
    
    if (useRegex) {
      try {
        const flags = caseSensitive ? 'g' : 'gi';
        const regex = new RegExp(searchTerm, flags);
        newText = text.replace(regex, replaceTerm);
      } catch (error) {
        console.error('Invalid regex', error);
        return;
      }
    } else {
      // Simple string replace with functional programming approach
      const replaceAllOccurrences = (text, search, replace, isCaseSensitive) => {
        if (!isCaseSensitive) {
          // For case-insensitive, we need to use regex
          const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
          return text.replace(regex, replace);
        }
        
        // For case-sensitive, we can use split and join for clarity
        return text.split(search).join(replace);
      };
      
      newText = replaceAllOccurrences(text, searchTerm, replaceTerm, caseSensitive);
    }
    
    // Apply the changes to the editor
    model.setValue(newText);
  };

  // Find next occurrence
  const findNext = () => {
    if (!editorRef.current) return;
    
    const editor = editorRef.current;
    const findNextAction = editor.getAction('editor.action.nextMatchFindAction');
    if (findNextAction) {
      findNextAction.run();
    }
  };

  // Find previous occurrence
  const findPrevious = () => {
    if (!editorRef.current) return;
    
    const editor = editorRef.current;
    const findPrevAction = editor.getAction('editor.action.previousMatchFindAction');
    if (findPrevAction) {
      findPrevAction.run();
    }
  };

  return (
    <div 
      className="search-bar"
      style={{ 
        backgroundColor: theme.ui.background,
        borderBottom: `1px solid ${theme.ui.border}`
      }}
    >
      <div className="search-row">
        <div className="search-input-container">
          <FiSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder={t('editor.find')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              backgroundColor: theme.ui.hover,
              color: theme.foreground,
              border: `1px solid ${theme.ui.border}`
            }}
          />
        </div>
        
        <div className="search-buttons">
          <button onClick={findPrevious} title={t('Previous match')}>
            <FiArrowUp />
          </button>
          <button onClick={findNext} title={t('Next match')}>
            <FiArrowDown />
          </button>
          <button 
            onClick={() => setShowReplace(!showReplace)}
            className={showReplace ? 'active' : ''}
          >
            {t('editor.replace')}
          </button>
          <button onClick={() => handleSearch()}>
            {t('editor.find')}
          </button>
          <button onClick={() => setSearchTerm('')} className="close-button">
            <FiX />
          </button>
        </div>
      </div>
      
      {showReplace && (
        <div className="replace-row">
          <div className="search-input-container">
            <input
              type="text"
              className="search-input"
              placeholder={t('editor.replace')}
              value={replaceTerm}
              onChange={(e) => setReplaceTerm(e.target.value)}
              style={{ 
                backgroundColor: theme.ui.hover,
                color: theme.foreground,
                border: `1px solid ${theme.ui.border}`
              }}
            />
          </div>
          
          <div className="search-buttons">
            <button onClick={handleReplace}>
              Replace
            </button>
            <button onClick={handleReplaceAll}>
              Replace All
            </button>
          </div>
        </div>
      )}
      
      <div className="search-options">
        <label>
          <input 
            type="checkbox" 
            checked={caseSensitive} 
            onChange={(e) => setCaseSensitive(e.target.checked)} 
          />
          Case sensitive
        </label>
        
        <label>
          <input 
            type="checkbox" 
            checked={matchWholeWord} 
            onChange={(e) => setMatchWholeWord(e.target.checked)} 
          />
          Whole word
        </label>
        
        <label>
          <input 
            type="checkbox" 
            checked={useRegex} 
            onChange={(e) => setUseRegex(e.target.checked)} 
          />
          Use regex
        </label>
      </div>
    </div>
  );
};

export default SearchBar;
