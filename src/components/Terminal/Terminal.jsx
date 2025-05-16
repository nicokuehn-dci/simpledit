import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/ThemeContext';
import './Terminal.css';

const Terminal = ({ visible }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [history, setHistory] = useState(['Welcome to SimpleEdit Terminal']);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-focus input when visible
  useEffect(() => {
    if (visible) {
      inputRef.current?.focus();
    }
  }, [visible]);

  // Scroll to bottom when history changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add command to history
    const command = input.trim();
    setHistory(prev => [...prev, `> ${command}`]);
    setCommandHistory(prev => [...prev, command]);
    setHistoryIndex(-1);
    
    // Process command
    processCommand(command);
    
    // Reset input
    setInput('');
  };
  
  const processCommand = (command) => {
    const cmd = command.toLowerCase();
    const args = command.split(' ').slice(1);
    
    if (cmd === 'clear') {
      setHistory([]);
    } else if (cmd === 'help') {
      setHistory(prev => [
        ...prev,
        'Available commands:',
        '  help - Show this help',
        '  clear - Clear terminal',
        '  echo [text] - Echo text',
        '  date - Show current date',
        '  time - Show current time'
      ]);
    } else if (cmd.startsWith('echo ')) {
      setHistory(prev => [...prev, args.join(' ')]);
    } else if (cmd === 'date') {
      setHistory(prev => [...prev, new Date().toLocaleDateString()]);
    } else if (cmd === 'time') {
      setHistory(prev => [...prev, new Date().toLocaleTimeString()]);
    } else {
      setHistory(prev => [...prev, `Command not found: ${command}`]);
    }
  };
  
  const handleKeyDown = (e) => {
    // Up arrow key - show previous command
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    }
    
    // Down arrow key - show next command
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
    
    // Tab key - auto-complete (basic implementation)
    if (e.key === 'Tab') {
      e.preventDefault();
      const commands = ['clear', 'help', 'echo', 'date', 'time'];
      const matchingCommands = commands.filter(cmd => cmd.startsWith(input));
      
      if (matchingCommands.length === 1) {
        setInput(matchingCommands[0] + ' ');
      }
    }
  };
  
  if (!visible) return null;
  
  return (
    <div className="terminal-container" style={{ backgroundColor: theme.ui.background }}>
      <div className="terminal-header">
        <span>{t('terminal.title')}</span>
      </div>
      <div className="terminal-body" ref={terminalRef}>
        {history.map((line, i) => (
          <div key={i} className="terminal-line">
            {line}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="terminal-input-container">
        <span className="terminal-prompt">$</span>
        <input
          ref={inputRef}
          type="text"
          className="terminal-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          spellCheck="false"
        />
      </form>
    </div>
  );
};

export default Terminal;
