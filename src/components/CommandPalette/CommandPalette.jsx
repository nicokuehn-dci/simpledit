import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './CommandPalette.css';

const CommandPalette = ({ 
  isOpen, 
  onClose, 
  commands, 
  executeCommand 
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCommands, setFilteredCommands] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    // Focus input when opened
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Filter commands when search term changes
  useEffect(() => {
    if (!isOpen) return;
    
    if (!searchTerm.trim()) {
      setFilteredCommands(commands);
      setSelectedIndex(0);
      return;
    }
    
    const normalizedSearch = searchTerm.toLowerCase().trim();
    const filtered = commands.filter(cmd => {
      const normalizedTitle = cmd.title.toLowerCase();
      const normalizedCategory = cmd.category.toLowerCase();
      
      return normalizedTitle.includes(normalizedSearch) || 
             normalizedCategory.includes(normalizedSearch);
    });
    
    setFilteredCommands(filtered);
    setSelectedIndex(0);
  }, [searchTerm, commands, isOpen]);
  
  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current && filteredCommands.length > 0) {
      const selectedElement = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex, filteredCommands.length]);

  if (!isOpen) return null;
  
  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredCommands.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        if (filteredCommands[selectedIndex]) {
          executeCommand(filteredCommands[selectedIndex].id);
          onClose();
        }
        break;
      case 'Escape':
        onClose();
        break;
      default:
        // Other keys are handled normally for input
        break;
    }
  };

  return (
    <div className="command-palette-overlay" onClick={onClose}>
      <div className="command-palette" onClick={e => e.stopPropagation()}>
        <div className="command-palette-input-container">
          <input
            ref={inputRef}
            type="text"
            className="command-palette-input"
            placeholder={t('commandPalette.searchPlaceholder')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            spellCheck="false"
          />
        </div>
        
        {filteredCommands.length > 0 ? (
          <div className="command-palette-list" ref={listRef}>
            {filteredCommands.map((command, index) => (
              <div
                key={command.id}
                className={`command-palette-item ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => {
                  executeCommand(command.id);
                  onClose();
                }}
                data-index={index}
              >
                <div className="command-title">{command.title}</div>
                <div className="command-category">{command.category}</div>
                {command.keybinding && (
                  <div className="command-keybinding">
                    {command.keybinding.split('+').map((key, i) => (
                      <span key={i} className="keybinding-key">{key}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="command-palette-empty">
            {t('commandPalette.noResults')}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommandPalette;
