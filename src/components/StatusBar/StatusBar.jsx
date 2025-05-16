import React from 'react';
import { useTranslation } from 'react-i18next';
import './StatusBar.css';

const StatusBar = ({
  fileName,
  language,
  wordCount,
  lineCount = 0,
  charCount = 0,
  cursorPosition = { lineNumber: 1, column: 1 }
}) => {
  const { t } = useTranslation();

  return (
    <div className="status-bar">
      <div className="status-section">
        <div className="status-item file-name">{fileName}</div>
        <div className="status-item language">{language}</div>
      </div>
      
      <div className="status-section">
        <div className="status-item">
          {t('statusBar.lineCol', { 
            line: cursorPosition.lineNumber, 
            column: cursorPosition.column 
          })}
        </div>
        <div className="status-item">
          {t('statusBar.lines', { count: lineCount })}
        </div>
        <div className="status-item">
          {t('statusBar.words', { count: wordCount })}
        </div>
        <div className="status-item">
          {t('statusBar.chars', { count: charCount })}
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
