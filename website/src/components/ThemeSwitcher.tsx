import React, { useState, useEffect } from 'react';
import './ThemeSwitcher.scss';

interface Theme {
  id: string;
  name: string;
  filePath: string;
  background?: string;
  tokenCount: number;
  metadata?: {
    description?: string;
  };
}

interface ThemeIndex {
  themes: Theme[];
  defaultTheme: string;
}

const ThemeSwitcher: React.FC = () => {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [currentTheme, setCurrentTheme] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load theme index
    fetch('/metadata/themes.json')
      .then(res => res.json())
      .then((data: ThemeIndex) => {
        setThemes(data.themes);

        // Check localStorage for saved preference
        const savedTheme = localStorage.getItem('documentor-theme') || data.defaultTheme;
        setCurrentTheme(savedTheme);
        applyThemeById(savedTheme, data.themes);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to load themes:', error);
        setLoading(false);
      });
  }, []);

  const applyThemeById = (themeId: string, themeList: Theme[]) => {
    const theme = themeList.find(t => t.id === themeId);

    // Fetch the theme CSS file
    fetch(`/themes/${themeId}.css`)
      .then(res => res.text())
      .then(cssText => {
        // Apply theme CSS variables to preview containers only
        applyScopedThemeStyles(cssText);
      })
      .catch(error => {
        console.error('Failed to load theme CSS:', error);
      });

    // Set theme background color as CSS variable (for .preview-content)
    if (theme?.background) {
      document.documentElement.style.setProperty('--theme-background', theme.background);
    } else {
      document.documentElement.style.removeProperty('--theme-background');
    }

    // Save preference
    localStorage.setItem('documentor-theme', themeId);
    document.documentElement.setAttribute('data-theme', themeId);
  };

  const applyScopedThemeStyles = (cssText: string) => {
    // Remove existing scoped theme styles
    const existingStyle = document.getElementById('scoped-theme-styles');
    if (existingStyle) {
      existingStyle.remove();
    }

    // Extract CSS variables from :root { ... }
    const rootMatch = cssText.match(/:root\s*\{([\s\S]*?)\}/);
    if (!rootMatch) return;

    const cssVariables = rootMatch[1].trim();

    // Create new scoped styles that apply to both .preview-content and .live-preview-content
    const scopedCSS = `.preview-content, .live-preview-content { ${cssVariables} }`;

    const styleElement = document.createElement('style');
    styleElement.id = 'scoped-theme-styles';
    styleElement.textContent = scopedCSS;
    document.head.appendChild(styleElement);
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTheme = e.target.value;
    setCurrentTheme(newTheme);
    applyThemeById(newTheme, themes);
  };

  if (loading || themes.length === 0) {
    return null;
  }

  return (
    <div className="theme-switcher">
      <label htmlFor="theme-select" className="theme-label">
        Component Theme
      </label>
      <select
        id="theme-select"
        value={currentTheme}
        onChange={handleThemeChange}
        className="theme-select"
      >
        {themes.map(theme => (
          <option key={theme.id} value={theme.id}>
            {theme.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ThemeSwitcher;
