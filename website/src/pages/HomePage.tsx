import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchIndex } from '../utils/api';
import { IndexMetadata } from '../types/metadata';
import './HomePage.scss';

const HomePage: React.FC = () => {
  const [index, setIndex] = useState<IndexMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIndex();
  }, []);

  const loadIndex = async () => {
    try {
      const data = await fetchIndex();
      setIndex(data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  if (loading || !index) {
    return (
      <div className="home-page">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <header className="home-header">
        <h1>{index.config.name}</h1>
        {index.config.description && <p className="subtitle">{index.config.description}</p>}
        {index.config.version && <span className="version-badge">v{index.config.version}</span>}
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{index.stats.componentCount}</div>
          <div className="stat-label">Components</div>
          <p className="stat-description">Fully documented React components</p>
        </div>

        <div className="stat-card">
          <div className="stat-value">{index.stats.variantCount}</div>
          <div className="stat-label">Variants</div>
          <p className="stat-description">Auto-generated examples</p>
        </div>

        <div className="stat-card">
          <div className="stat-value">{index.stats.cssVariableCount}</div>
          <div className="stat-label">CSS Variables</div>
          <p className="stat-description">Customizable design tokens</p>
        </div>
      </div>

      <section className="components-section">
        <h2>All Components</h2>
        <div className="components-grid">
          {index.components.map((component) => {
            const truncatedDescription = component.description && component.description.length > 450
              ? component.description.substring(0, 450) + '...'
              : component.description;

            return (
              <Link
                key={component.name}
                to={`/components/${component.name}`}
                className="component-card"
              >
                <h3 className="card-title">{component.name}</h3>
                {truncatedDescription && (
                  <p className="card-description">{truncatedDescription}</p>
                )}

                <div className="card-footer">
                  <span className="card-stat">
                    {component.variantCount} variant{component.variantCount !== 1 ? 's' : ''}
                  </span>
                  <span className="card-stat">
                    {component.cssVariableCount} CSS var{component.cssVariableCount !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="card-file-path">{component.filePath}</div>
              </Link>
            );
          })}
        </div>
      </section>

      <footer className="home-footer">
        <p>
          Generated with <strong>Documentor</strong> - Automated React component documentation
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
