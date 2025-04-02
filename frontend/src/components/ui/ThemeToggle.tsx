// src/components/ui/ThemeToggle.tsx
import React, { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  
  return (
    <div className="theme-toggle-container">
      <button 
        className="theme-toggle-button"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? (
          <span className="toggle-icon">🌙</span>
        ) : (
          <span className="toggle-icon">☀️</span>
        )}
      </button>
    </div>
  );
};

export default ThemeToggle;