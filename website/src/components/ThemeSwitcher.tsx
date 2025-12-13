import React, { useState, useEffect, useCallback } from 'react';
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

  const applyThemeById = useCallback((themeId: string, themeList: Theme[]) => {
    const theme = themeList.find(t => t.id === themeId);

    if (!theme) {
      console.warn(`Theme not found: ${themeId}`);
      return;
    }

    // Set theme background color as CSS variable (for .preview-content)
    if (theme.background) {
      document.documentElement.style.setProperty('--theme-background', theme.background);
    } else {
      document.documentElement.style.removeProperty('--theme-background');
    }

    // Save preference and set data attribute immediately
    localStorage.setItem('documentor-theme', themeId);
    document.documentElement.setAttribute('data-theme', themeId);

    // Fetch the theme CSS file
    fetch(`/themes/${themeId}.css`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to fetch theme: ${res.status}`);
        }
        return res.text();
      })
      .then(cssText => {
        // Apply theme CSS variables to preview containers only
        applyScopedThemeStyles(cssText);
      })
      .catch(error => {
        console.error('Failed to load theme CSS:', error);
      });
  }, []);

  useEffect(() => {
    // Load theme index
    fetch('/metadata/themes.json')
      .then(res => res.json())
      .then((data: ThemeIndex) => {
        setThemes(data.themes);

        // Check localStorage for saved preference and validate it exists
        const savedTheme = localStorage.getItem('documentor-theme');
        const themeToApply = savedTheme && data.themes.find(t => t.id === savedTheme)
          ? savedTheme
          : data.defaultTheme;

        setCurrentTheme(themeToApply);
        applyThemeById(themeToApply, data.themes);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to load themes:', error);
        setLoading(false);
      });
  }, [applyThemeById]);

  const applyScopedThemeStyles = (cssText: string) => {
    // Extract CSS variables from :root { ... }
    const rootMatch = cssText.match(/:root\s*\{([\s\S]*?)\}/);
    if (!rootMatch) {
      console.warn('No :root selector found in theme CSS');
      return;
    }

    const cssVariables = rootMatch[1].trim();

    // Create new scoped styles that apply to both .preview-content and .live-preview-wrapper
    const scopedCSS = `.preview-content, .live-preview-wrapper { ${cssVariables} }`;

    // Update or create the style element
    let styleElement = document.getElementById('scoped-theme-styles');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'scoped-theme-styles';
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = scopedCSS;
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
