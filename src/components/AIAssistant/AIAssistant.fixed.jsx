import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './AIAssistant.css';

const AIAssistant = ({ isDarkMode, editorRef, fileName, insertTextAtCursor }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const [showProactiveSuggestion, setShowProactiveSuggestion] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const [idleTimeout, setIdleTimeout] = useState(null);
  const inputRef = useRef(null);
  
  // Get selected text from editor
  const getSelectedText = useCallback(() => {
    if (!editorRef?.current) return '';
    
    const selection = editorRef.current.getSelection();
    if (selection && !selection.isEmpty()) {
      return editorRef.current.getModel().getValueInRange(selection);
    }
    return '';
  }, [editorRef]);

  // Get entire editor content
  const getEditorContent = useCallback(() => {
    if (!editorRef?.current) return '';
    return editorRef.current.getValue();
  }, [editorRef]);

  // Get line count
  const getLineCount = useCallback(() => {
    if (!editorRef?.current) return 0;
    return editorRef.current.getModel().getLineCount();
  }, [editorRef]);

  // Get cursor position
  const getCursorPosition = useCallback(() => {
    if (!editorRef?.current) return { lineNumber: 0, column: 0 };
    return editorRef.current.getPosition();
  }, [editorRef]);

  // Function to handle chat submission
  const handleChatSubmit = useCallback(async (e) => {
    e?.preventDefault();
    
    if (!newMessage.trim() && !getSelectedText()) return;
    
    const userInput = newMessage.trim();
    setNewMessage('');
    
    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: userInput || t('aiAssistant.selectedTextPrompt'),
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setIsLoading(true);
    setError(null);
    
    try {
      // Get editor context
      const selectedText = getSelectedText();
      const editorContent = getEditorContent();
      const lineCount = getLineCount();
      const cursorPosition = getCursorPosition();
      
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...messages.map(msg => ({
              role: msg.sender === 'user' ? 'user' : 'assistant',
              content: msg.text
            })),
            {
              role: 'user',
              content: userInput || `Analyze this code: \n\`\`\`\n${selectedText}\n\`\`\``,
            }
          ],
          editorContext: {
            fileName: fileName || null,
            language: fileName ? fileName.split('.').pop() : 'plaintext',
            selectedText: selectedText || null,
            cursorPosition: cursorPosition,
            lineCount: lineCount,
            hasFullContent: !!editorContent,
            fullContent: editorContent || null
          },
          language: fileName ? fileName.split('.').pop() : 'plaintext',
          temperature: 0.7,
          max_tokens: 1000
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const data = await response.json();
      
      const aiMessage = {
        id: Date.now(),
        sender: 'assistant',
        text: data.content,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prevMessages => [...prevMessages, aiMessage]);
    } catch (err) {
      setError(err.message);
      console.error('Error sending message:', err);
    } finally {
      setIsLoading(false);
    }
  }, [newMessage, messages, fileName, t, getSelectedText, getEditorContent, getLineCount, getCursorPosition]);

  // Function to generate a proactive suggestion based on user activity
  const generateProactiveSuggestion = useCallback(() => {
    if (isOpen || messages.length > 0) return;
    
    const selectedText = getSelectedText();
    if (selectedText && selectedText.length > 10) {
      setShowProactiveSuggestion(true);
    }
  }, [isOpen, messages, getSelectedText]);

  // Handle idle detection
  useEffect(() => {
    const resetIdleTimer = () => {
      if (idleTimeout) clearTimeout(idleTimeout);
      
      // After 30 seconds of no activity, show a proactive suggestion
      const timeout = setTimeout(() => {
        generateProactiveSuggestion();
      }, 30000);
      
      setIdleTimeout(timeout);
    };
    
    // Set up event listeners for user activity
    window.addEventListener('mousemove', resetIdleTimer);
    window.addEventListener('keypress', resetIdleTimer);
    
    // Initial setup
    resetIdleTimer();
    
    // Cleanup
    return () => {
      if (idleTimeout) clearTimeout(idleTimeout);
      window.removeEventListener('mousemove', resetIdleTimer);
      window.removeEventListener('keypress', resetIdleTimer);
    };
  }, [generateProactiveSuggestion, idleTimeout]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Toggle the AI Assistant
  const toggleAssistant = () => {
    setIsOpen(prev => !prev);
    setShowProactiveSuggestion(false);
  };

  // Format message with code blocks for display
  const formatMessage = (text) => {
    if (!text) return '';
    
    // Split by code blocks
    const parts = text.split(/```([\s\S]*?)```/);
    
    return parts.map((part, index) => {
      // Even indices are regular text, odd indices are code blocks
      if (index % 2 === 0) {
        return <span key={index}>{part}</span>;
      } else {
        return (
          <div className="ai-code-block" key={index}>
            <pre>{part}</pre>
            <div className="code-actions">
              <button 
                onClick={() => handleInsertCode(part)}
                title={t('aiAssistant.insertCode')}
              >
                {t('aiAssistant.insert')}
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(part)}
                title={t('aiAssistant.copyCode')}
              >
                {t('aiAssistant.copy')}
              </button>
            </div>
          </div>
        );
      }
    });
  };

  // Handle inserting code into editor
  const handleInsertCode = (code) => {
    if (insertTextAtCursor && code) {
      insertTextAtCursor(code);
    }
  };

  // Extract and insert code from a message
  const handleExtractAndInsertCode = (message) => {
    const codeRegex = /```([\s\S]*?)```/;
    const match = message.match(codeRegex);
    
    if (match && match[1]) {
      handleInsertCode(match[1]);
    }
  };

  // Handle code action (explain, improve, etc.)
  const handleCodeAction = async (action) => {
    const selectedText = getSelectedText();
    if (!selectedText) {
      setError(t('aiAssistant.noCodeSelected'));
      return;
    }
    
    setIsOpen(true);
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/code_action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: selectedText,
          action: action,
          language: fileName ? fileName.split('.').pop() : 'plaintext'
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const data = await response.json();
      
      // Add messages to the chat
      const userMessage = {
        id: Date.now(),
        sender: 'user',
        text: `${t(`aiAssistant.${action}`)} ${t('aiAssistant.thisCode')}`,
        timestamp: new Date().toISOString(),
      };
      
      const aiMessage = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: data.content,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prevMessages => [...prevMessages, userMessage, aiMessage]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Render welcome message when no messages exist
  const renderWelcomeScreen = () => (
    <div className="ai-assistant-welcome">
      <h3>{t('aiAssistant.welcomeTitle')}</h3>
      <p>{t('aiAssistant.welcomeText')}</p>
      
      <div className="ai-assistant-suggestions">
        <button onClick={() => setNewMessage(t('aiAssistant.suggestion1'))}>
          {t('aiAssistant.suggestion1')}
        </button>
        <button onClick={() => setNewMessage(t('aiAssistant.suggestion2'))}>
          {t('aiAssistant.suggestion2')}
        </button>
        <button onClick={() => setNewMessage(t('aiAssistant.suggestion3'))}>
          {t('aiAssistant.suggestion3')}
        </button>
        {fileName && (
          <button onClick={() => setNewMessage(t('aiAssistant.suggestion4', { fileName }))}>
            {t('aiAssistant.suggestion4', { fileName })}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* AI toggle button */}
      <button 
        className={`ai-toggle-button ${isDarkMode ? 'dark' : ''}`}
        onClick={toggleAssistant}
        title={t('aiAssistant.toggleAssistant')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <path fill="none" d="M0 0h24v24H0z"/>
          <path d="M13 10h7l-9 13v-9H4l9-13z" fill="currentColor"/>
        </svg>
      </button>
      
      {/* Proactive suggestion bubble */}
      {showProactiveSuggestion && !isOpen && (
        <div className={`ai-proactive-suggestion ${isDarkMode ? 'dark' : ''}`}>
          <p>{t('aiAssistant.proactiveSuggestion')}</p>
          <div className="suggestion-actions">
            <button onClick={toggleAssistant}>{t('aiAssistant.analyze')}</button>
            <button onClick={() => setShowProactiveSuggestion(false)}>{t('common.dismiss')}</button>
          </div>
        </div>
      )}
      
      {/* Main AI Assistant panel */}
      <div className={`ai-assistant ${isDarkMode ? 'dark' : ''} ${isOpen ? 'open' : ''}`}>
        <div className="ai-assistant-header">
          <h3>{t('aiAssistant.title')}</h3>
          <button 
            className="ai-assistant-close" 
            onClick={toggleAssistant}
            title={t('common.close')}
          >
            &times;
          </button>
        </div>
        
        {/* Code action toolbar */}
        {showToolbar && (
          <div className="ai-toolbar">
            <button onClick={() => handleCodeAction('explain')}>
              {t('aiAssistant.explain')}
            </button>
            <button onClick={() => handleCodeAction('improve')}>
              {t('aiAssistant.improve')}
            </button>
            <button onClick={() => handleCodeAction('format')}>
              {t('aiAssistant.format')}
            </button>
            <button onClick={() => handleCodeAction('debug')}>
              {t('aiAssistant.debug')}
            </button>
            <button onClick={() => handleCodeAction('generate_test')}>
              {t('aiAssistant.test')}
            </button>
          </div>
        )}
        
        <div className="ai-assistant-body">
          {messages.length === 0 ? (
            renderWelcomeScreen()
          ) : (
            <div className="ai-chat-messages">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`ai-chat-message ${message.sender}`}
                >
                  <div className="message-content">
                    {message.sender === 'user' ? (
                      <p>{message.text}</p>
                    ) : (
                      <div>{formatMessage(message.text)}</div>
                    )}
                  </div>
                  
                  {message.sender === 'assistant' && (
                    <div className="message-actions">
                      <button 
                        onClick={() => navigator.clipboard.writeText(message.text)}
                        title={t('aiAssistant.copyResponse')}
                      >
                        {t('aiAssistant.copy')}
                      </button>
                      <button 
                        onClick={() => handleExtractAndInsertCode(message.text)}
                        title={t('aiAssistant.extractCode')}
                      >
                        {t('aiAssistant.extractCode')}
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="ai-chat-message assistant loading">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
              {error && (
                <div className="ai-chat-message error">
                  <p>{t('aiAssistant.error')}: {error}</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        <form className="ai-assistant-input" onSubmit={handleChatSubmit}>
          <textarea
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t('aiAssistant.placeholder')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleChatSubmit(e);
              }
            }}
          />
          <button 
            type="submit" 
            disabled={isLoading || (!newMessage.trim() && !getSelectedText())}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </form>
        
        {/* Footer with active indicator */}
        <div className="ai-assistant-footer">
          <div className="ai-active-indicator">
            <span className="active-dot"></span>
            {t('aiAssistant.activeAssistant')}
          </div>
          <button 
            className="ai-toolbar-toggle"
            onClick={() => setShowToolbar(!showToolbar)}
            title={t('aiAssistant.toggleToolbar')}
          >
            {showToolbar ? t('common.hideTools') : t('common.showTools')}
          </button>
        </div>
      </div>
    </>
  );
};

export default AIAssistant;
