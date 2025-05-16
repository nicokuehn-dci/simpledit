import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FiSend, FiRefreshCw, FiZap, FiCode, FiFileText, FiHelpCircle } from 'react-icons/fi';
import { useTheme } from '../../utils/ThemeContext';
import './AIAssistant.css';

function AIAssistant({ 
  editorRef, 
  language = 'plaintext',
  onInsertText 
}) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('complete'); // complete, review, format, explain
  const [temperature, setTemperature] = useState(0.7);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const assistantRef = useRef(null);

  // API URL
  const API_BASE_URL = 'http://localhost:8000';

  // Close the assistant when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (assistantRef.current && !assistantRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get selected text from editor
  const getSelectedText = () => {
    if (!editorRef?.current) return '';
    const selection = editorRef.current.getSelection();
    return editorRef.current.getModel().getValueInRange(selection);
  };

  // Handle AI interaction
  const handleAIInteraction = async () => {
    const selectedText = getSelectedText();
    
    if (!selectedText) {
      setError(t('aiAssistant.noTextSelected'));
      return;
    }

    setLoading(true);
    setResult('');
    setError('');

    try {
      // Check if backend is accessible first
      try {
        const healthCheck = await fetch(`${API_BASE_URL}/health`, { 
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(3000) // 3 second timeout
        });
        
        if (!healthCheck.ok) {
          throw new Error('Backend not responding');
        }
      } catch (healthErr) {
        throw new Error(t('aiAssistant.error') + ': ' + 
          (healthErr.name === 'AbortError' 
            ? 'Backend server timeout. Please start the backend server.' 
            : 'Backend server unavailable. Please start the backend server.'));
      }
      
      let endpoint;
      switch (mode) {
        case 'review':
          endpoint = `${API_BASE_URL}/code_review`;
          break;
        case 'format':
          endpoint = `${API_BASE_URL}/format_text`;
          break;
        case 'explain':
          endpoint = `${API_BASE_URL}/explain`;
          break;
        case 'complete':
        default:
          endpoint = `${API_BASE_URL}/complete`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: selectedText,
          mode: mode,
          language: language,
          temperature: temperature,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error (${response.status}): ${errorText || response.statusText}`);
      }

      const data = await response.json();
      setResult(data.content);
    } catch (err) {
      console.error('AI Assistant error:', err);
      setError(err.message || t('aiAssistant.error'));
    } finally {
      setLoading(false);
    }
  };

  // Insert the result back into the editor
  const handleInsertResult = () => {
    if (result && onInsertText) {
      onInsertText(result);
      setIsOpen(false);
    }
  };

  return (
    <>
      <button 
        className="ai-assistant-toggle"
        onClick={() => setIsOpen(!isOpen)}
        style={{ backgroundColor: theme.accent, color: theme.background }}
        title={t('aiAssistant.toggleTitle')}
      >
        <FiZap />
      </button>

      {isOpen && (
        <div 
          className="ai-assistant-panel"
          ref={assistantRef}
          style={{ backgroundColor: theme.ui.background, color: theme.ui.foreground }}
        >
          <div className="ai-assistant-header">
            <h3>{t('aiAssistant.title')}</h3>
            <div className="ai-mode-selector">
              <button 
                className={`ai-mode-button ${mode === 'complete' ? 'active' : ''}`}
                onClick={() => setMode('complete')}
                title={t('aiAssistant.completeTooltip')}
              >
                <FiFileText /> {t('aiAssistant.complete')}
              </button>
              <button 
                className={`ai-mode-button ${mode === 'review' ? 'active' : ''}`}
                onClick={() => setMode('review')}
                title={t('aiAssistant.reviewTooltip')}
              >
                <FiCode /> {t('aiAssistant.review')}
              </button>
              <button 
                className={`ai-mode-button ${mode === 'format' ? 'active' : ''}`}
                onClick={() => setMode('format')}
                title={t('aiAssistant.formatTooltip')}
              >
                <FiRefreshCw /> {t('aiAssistant.format')}
              </button>
              <button 
                className={`ai-mode-button ${mode === 'explain' ? 'active' : ''}`}
                onClick={() => setMode('explain')}
                title={t('aiAssistant.explainTooltip')}
              >
                <FiHelpCircle /> {t('aiAssistant.explain')}
              </button>
            </div>
          </div>

          <div className="ai-assistant-controls">
            <label>
              {t('aiAssistant.temperature')}
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="ai-temperature-slider"
              />
              <span className="ai-temperature-value">{temperature}</span>
            </label>
            
            <button 
              className="ai-action-button"
              onClick={handleAIInteraction}
              disabled={loading}
            >
              {loading ? t('aiAssistant.processing') : t('aiAssistant.generate')}
            </button>
          </div>

          {error && (
            <div className="ai-assistant-error">
              {error}
            </div>
          )}

          {result && (
            <div className="ai-assistant-result">
              <pre>{result}</pre>
              <button 
                className="ai-insert-button"
                onClick={handleInsertResult}
              >
                <FiSend /> {t('aiAssistant.insertResult')}
              </button>
            </div>
          )}

          <div className="ai-assistant-footer">
            <small>
              {t('aiAssistant.poweredBy')} <a href="https://groq.com" target="_blank" rel="noopener noreferrer">Groq</a>
            </small>
          </div>
        </div>
      )}
    </>
  );
}

export default AIAssistant;
