import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/ThemeContext';
import { FiX, FiCheckCircle } from 'react-icons/fi';
import './Settings.css';

const Settings = ({ onClose }) => {
  const { t, i18n } = useTranslation();
  const { themeName, changeTheme } = useTheme();

  // Funktion zum Ändern der Sprache
  const handleLanguageChange = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  // Funktion zum Ändern des Themas
  const handleThemeChange = (e) => {
    changeTheme(e.target.value);
  };

  // Funktion zum Ändern der Schriftgröße
  const handleFontSizeChange = (e) => {
    document.documentElement.style.setProperty('--editor-font-size', `${e.target.value}px`);
    localStorage.setItem('editor-font-size', e.target.value);
  };

  return (
    <div className="settings-overlay">
      <div className="settings-panel">
        <div className="settings-header">
          <h2>{t('settings.appearance')}</h2>
          <button className="close-button" onClick={onClose}>
            <FiX size={22} />
          </button>
        </div>

        <div className="settings-content">
          <div className="settings-group">
            <label htmlFor="language-select">{t('settings.language')}</label>
            <select 
              id="language-select" 
              value={i18n.language}
              onChange={handleLanguageChange}
            >
              <option value="en">{t('languages.en')}</option>
              <option value="de">{t('languages.de')}</option>
              <option value="fr">{t('languages.fr')}</option>
              <option value="es">{t('languages.es')}</option>
            </select>
          </div>

          <div className="settings-group">
            <label htmlFor="theme-select">{t('settings.theme')}</label>
            <select
              id="theme-select"
              value={themeName}
              onChange={handleThemeChange}
            >
              <option value="dark">{t('themes.dark')}</option>
              <option value="light">{t('themes.light')}</option>
              <option value="highContrast">{t('themes.highContrast')}</option>
            </select>
          </div>

          <div className="settings-group">
            <label htmlFor="font-size">{t('settings.fontSize')}</label>
            <div className="range-container">
              <input
                type="range"
                id="font-size"
                min="10"
                max="24"
                step="1"
                defaultValue={localStorage.getItem('editor-font-size') || 14}
                onChange={handleFontSizeChange}
              />
              <span className="range-value">
                {localStorage.getItem('editor-font-size') || 14}px
              </span>
            </div>
          </div>

          <div className="settings-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                defaultChecked={localStorage.getItem('line-wrap') !== 'false'}
                onChange={(e) => {
                  localStorage.setItem('line-wrap', e.target.checked);
                }}
              />
              {t('settings.lineWrapping')}
            </label>
          </div>

          <div className="settings-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                defaultChecked={localStorage.getItem('show-line-numbers') !== 'false'}
                onChange={(e) => {
                  localStorage.setItem('show-line-numbers', e.target.checked);
                }}
              />
              {t('settings.showLineNumbers')}
            </label>
          </div>

          <div className="settings-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                defaultChecked={localStorage.getItem('auto-save') === 'true'}
                onChange={(e) => {
                  localStorage.setItem('auto-save', e.target.checked);
                }}
              />
              {t('settings.autoSave')}
            </label>
          </div>
        </div>

        <div className="settings-footer">
          <button className="save-button" onClick={onClose}>
            <FiCheckCircle size={16} />
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
