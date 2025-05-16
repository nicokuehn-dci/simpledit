import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/ThemeContext';
import './Dashboard.css';

// Icons (you would need to install react-icons package)
import { FiFile, FiFolderPlus, FiSettings, FiClock } from 'react-icons/fi';

const Dashboard = ({ onFileOpen, onNewFile, onSettingsOpen }) => {
  const { t, i18n } = useTranslation();
  const { theme, themeName, changeTheme } = useTheme();
  const [recentFiles, setRecentFiles] = useState([]);
  const [templates, setTemplates] = useState([
    { name: t('templates.html'), extension: 'html', content: '<!DOCTYPE html>\n<html>\n<head>\n  <title>New Document</title>\n</head>\n<body>\n\n</body>\n</html>' },
    { name: t('templates.css'), extension: 'css', content: '/* Styles go here */\n' },
    { name: t('templates.javascript'), extension: 'js', content: '// JavaScript code\n' },
    { name: t('templates.python'), extension: 'py', content: '# Python script\n' },
    { name: t('templates.markdown'), extension: 'md', content: '# New Document\n\n' },
    { name: t('templates.text'), extension: 'txt', content: '' }
  ]);
  
  // Load recent files from localStorage
  useEffect(() => {
    const storedFiles = localStorage.getItem('recentFiles');
    if (storedFiles) {
      try {
        setRecentFiles(JSON.parse(storedFiles));
      } catch (e) {
        console.error('Failed to parse recent files', e);
        setRecentFiles([]);
      }
    }
  }, []);

  // Update templates when language changes
  useEffect(() => {
    setTemplates([
      { name: t('templates.html'), extension: 'html', content: '<!DOCTYPE html>\n<html>\n<head>\n  <title>New Document</title>\n</head>\n<body>\n\n</body>\n</html>' },
      { name: t('templates.css'), extension: 'css', content: '/* Styles go here */\n' },
      { name: t('templates.javascript'), extension: 'js', content: '// JavaScript code\n' },
      { name: t('templates.python'), extension: 'py', content: '# Python script\n' },
      { name: t('templates.markdown'), extension: 'md', content: '# New Document\n\n' },
      { name: t('templates.text'), extension: 'txt', content: '' }
    ]);
  }, [i18n.language, t]);

  // Create a new file from template
  const handleNewFile = (template) => {
    onNewFile({
      name: `new.${template.extension}`,
      content: template.content,
      language: template.extension
    });
  };
  
  // Open file dialog
  const openFileDialog = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.md,.html,.css,.js,.py,.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const fileData = {
            name: file.name,
            content: event.target.result,
            path: URL.createObjectURL(file),
            lastOpened: new Date().toISOString()
          };
          
          onFileOpen(fileData);
          
          // Update recent files
          const updatedRecentFiles = [
            fileData,
            ...recentFiles.filter(f => f.name !== file.name).slice(0, 9)
          ];
          setRecentFiles(updatedRecentFiles);
          localStorage.setItem('recentFiles', JSON.stringify(updatedRecentFiles));
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // Change language handler
  const changeLanguage = (event) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <div className="dashboard" style={{ backgroundColor: theme.background, color: theme.foreground }}>
      <header className="dashboard-header" style={{ backgroundColor: theme.ui.background }}>
        <h1>{t('appName')}</h1>
        <div className="dashboard-controls">
          <div className="language-selector">
            <select value={i18n.language} onChange={changeLanguage}>
              <option value="en">{t('languages.en')}</option>
              <option value="de">{t('languages.de')}</option>
              <option value="fr">{t('languages.fr')}</option>
              <option value="es">{t('languages.es')}</option>
            </select>
          </div>
          <div className="theme-selector">
            <select value={themeName} onChange={(e) => changeTheme(e.target.value)}>
              <option value="dark">{t('themes.dark')}</option>
              <option value="light">{t('themes.light')}</option>
              <option value="highContrast">{t('themes.highContrast')}</option>
            </select>
          </div>
          <button 
            onClick={onSettingsOpen}
            className="settings-button"
            style={{ 
              backgroundColor: theme.ui.hover, 
              color: theme.ui.foreground,
              border: `1px solid ${theme.ui.border}`
            }}
          >
            <FiSettings size={18} /> {t('dashboard.settings')}
          </button>
        </div>
      </header>
      
      <main className="dashboard-content">
        <section className="quick-actions" style={{ backgroundColor: theme.ui.background }}>
          <h2>{t('dashboard.quickStart')}</h2>
          <div className="action-buttons">
            <button 
              onClick={openFileDialog} 
              className="action-button"
              style={{ 
                backgroundColor: theme.ui.hover, 
                color: theme.ui.foreground,
                border: `1px solid ${theme.ui.border}`
              }}
            >
              <FiFolderPlus size={22} /> {/* Kleinere Größe für das Icon */}
              <span>{t('dashboard.openFile')}</span>
            </button>
            <button 
              onClick={() => handleNewFile(templates[5])} 
              className="action-button"
              style={{ 
                backgroundColor: theme.ui.hover, 
                color: theme.ui.foreground,
                border: `1px solid ${theme.ui.border}`
              }}
            >
              <FiFile size={22} /> {/* Kleinere Größe für das Icon */}
              <span>{t('dashboard.newFile')}</span>
            </button>
          </div>
        </section>

        <section className="templates-section" style={{ backgroundColor: theme.ui.background }}>
          <h2>{t('dashboard.templates')}</h2>
          <div className="templates-grid">
            {templates.map((template, index) => (
              <div 
                key={index} 
                className="template-card"
                onClick={() => handleNewFile(template)}
                style={{ 
                  backgroundColor: theme.ui.hover, 
                  color: theme.ui.foreground,
                  border: `1px solid ${theme.ui.border}`
                }}
              >
                <div className="template-icon">{template.extension}</div>
                <div className="template-info">
                  <h3>{template.name}</h3>
                  <p>.{template.extension}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {recentFiles.length > 0 && (
          <section className="recent-files" style={{ backgroundColor: theme.ui.background }}>
            <h2><FiClock size={20} /> {t('dashboard.recentFiles')}</h2>
            <ul className="files-list">
              {recentFiles.map((file, index) => (
                <li 
                  key={index} 
                  onClick={() => onFileOpen(file)}
                  style={{ 
                    backgroundColor: theme.ui.hover, 
                    color: theme.ui.foreground,
                    border: `1px solid ${theme.ui.border}`
                  }}
                >
                  <span className="file-name">{file.name}</span>
                  <span className="file-date">
                    {new Date(file.lastOpened).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
