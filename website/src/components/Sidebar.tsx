import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { fetchIndex } from '../utils/api';
import { IndexMetadata } from '../types/metadata';
import ThemeSwitcher from './ThemeSwitcher';
import './Sidebar.scss';

const Sidebar: React.FC = () => {
  const [index, setIndex] = useState<IndexMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    loadIndex();
  }, []);

  const loadIndex = async () => {
    try {
      const data = await fetchIndex();
      setIndex(data);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load components');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>Loading...</h1>
        </div>
      </aside>
    );
  }

  if (error || !index) {
    return (
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>Error</h1>
        </div>
        <div className="sidebar-error">
          <p>{error || 'Failed to load component library'}</p>
        </div>
      </aside>
    );
  }

  // Build nested component structure (max 2 levels deep)
  interface ComponentGroup {
    name: string;
    components: typeof index.components;
    subgroups: Record<string, ComponentGroup>;
  }

  const formatFolderName = (name: string): string => {
    return name
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const buildComponentTree = () => {
    const root: Record<string, ComponentGroup> = {};

    index.components.forEach((component) => {
      // Extract path relative to src/components/
      const pathParts = component.filePath.split('/');
      const componentsIndex = pathParts.indexOf('components');
      const relativeParts = pathParts.slice(componentsIndex + 1, -1); // Exclude filename

      if (relativeParts.length === 0) {
        // Component directly in src/components/
        if (!root['root']) {
          root['root'] = { name: 'Components', components: [], subgroups: {} };
        }
        root['root'].components.push(component);
      } else if (relativeParts.length === 1) {
        // One level deep (e.g., forms/Button.tsx)
        const dir = relativeParts[0];
        if (!root[dir]) {
          root[dir] = { name: formatFolderName(dir), components: [], subgroups: {} };
        }
        root[dir].components.push(component);
      } else {
        // Two or more levels deep (e.g., forms/buttons/Button.tsx)
        const topDir = relativeParts[0];
        const subDir = relativeParts[1];

        if (!root[topDir]) {
          root[topDir] = { name: formatFolderName(topDir), components: [], subgroups: {} };
        }
        if (!root[topDir].subgroups[subDir]) {
          root[topDir].subgroups[subDir] = { name: formatFolderName(subDir), components: [], subgroups: {} };
        }
        root[topDir].subgroups[subDir].components.push(component);
      }
    });

    // Sort components within each group alphabetically
    Object.values(root).forEach(group => {
      group.components.sort((a, b) => a.name.localeCompare(b.name));

      // Sort components within subgroups
      Object.values(group.subgroups).forEach(subgroup => {
        subgroup.components.sort((a, b) => a.name.localeCompare(b.name));
      });
    });

    return root;
  };

  const componentTree = buildComponentTree();

  // Sort folders alphabetically (top level)
  const sortedFolders = Object.entries(componentTree).sort((a, b) =>
    a[1].name.localeCompare(b[1].name)
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Link to="/" className="sidebar-logo">
          <h1>{index.config.name}</h1>
          {index.config.version && <span className="version">v{index.config.version}</span>}
        </Link>
        {index.config.description && (
          <p className="sidebar-description">{index.config.description}</p>
        )}
      </div>

      <div className="sidebar-stats">
        <div className="stat">
          <span className="stat-value">{index.stats.componentCount}</span>
          <span className="stat-label">Components</span>
        </div>
        <div className="stat">
          <span className="stat-value">{index.stats.variantCount}</span>
          <span className="stat-label">Variants</span>
        </div>
        <div className="stat">
          <span className="stat-value">{index.stats.cssVariableCount}</span>
          <span className="stat-label">CSS Vars</span>
        </div>
      </div>

      <ThemeSwitcher />

      <nav className="sidebar-nav">
        {sortedFolders.map(([key, group]) => (
          <div key={key} className="nav-section">
            <h3 className="nav-section-title">{group.name}</h3>

            {/* Render components at this level */}
            {group.components.length > 0 && (
              <ul className="nav-list">
                {group.components.map((component) => (
                  <li key={component.name} className="nav-item">
                    <Link
                      to={`/components/${component.name}`}
                      className={`nav-link ${
                        location.pathname === `/components/${component.name}` ? 'active' : ''
                      }`}
                    >
                      <span className="nav-link-name">{component.name}</span>
                      <span className="nav-link-count">{component.variantCount}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {/* Render subgroups (sorted alphabetically) */}
            {Object.entries(group.subgroups)
              .sort((a, b) => a[1].name.localeCompare(b[1].name))
              .map(([subKey, subgroup]) => (
                <div key={subKey} className="nav-subsection">
                  <h4 className="nav-subsection-title">{subgroup.name}</h4>
                  <ul className="nav-list nav-list--nested">
                    {subgroup.components.map((component) => (
                      <li key={component.name} className="nav-item">
                        <Link
                          to={`/components/${component.name}`}
                          className={`nav-link ${
                            location.pathname === `/components/${component.name}` ? 'active' : ''
                          }`}
                        >
                          <span className="nav-link-name">{component.name}</span>
                          <span className="nav-link-count">{component.variantCount}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
