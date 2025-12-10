import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { fetchIndex } from '../utils/api';
import { IndexMetadata } from '../types/metadata';
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

  // Group components by directory
  const componentsByPath = index.components.reduce((acc, component) => {
    const pathParts = component.filePath.split('/');
    const directory = pathParts.length > 2 ? pathParts[pathParts.length - 2] : 'components';

    if (!acc[directory]) {
      acc[directory] = [];
    }
    acc[directory].push(component);
    return acc;
  }, {} as Record<string, typeof index.components>);

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

      <nav className="sidebar-nav">
        {Object.entries(componentsByPath).map(([directory, components]) => (
          <div key={directory} className="nav-section">
            <h3 className="nav-section-title">{directory}</h3>
            <ul className="nav-list">
              {components.map((component) => (
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
      </nav>
    </aside>
  );
};

export default Sidebar;
