import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchComponentDoc } from '../utils/api';
import { ComponentDocumentation } from '../types/metadata';
import PropsTable from '../components/PropsTable';
import VariantShowcase from '../components/VariantShowcase';
import CSSVariablesTable from '../components/CSSVariablesTable';
import './ComponentPage.scss';

const ComponentPage: React.FC = () => {
  const { componentName } = useParams<{ componentName: string }>();
  const [doc, setDoc] = useState<ComponentDocumentation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (componentName) {
      loadComponent(componentName);
    }
  }, [componentName]);

  const loadComponent = async (name: string) => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchComponentDoc(name);
      setDoc(data);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load component');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="component-page">
        <div className="loading">Loading {componentName}...</div>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="component-page">
        <div className="error">
          <h1>Error</h1>
          <p>{error || 'Component not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="component-page">
      <header className="component-header">
        <div className="component-title-row">
          <h1 className="component-name">{doc.component.name}</h1>
          <span className="component-file-path">{doc.component.filePath}</span>
        </div>

        {doc.component.description && (
          <p className="component-description">{doc.component.description}</p>
        )}

        <div className="component-meta">
          <span className="meta-item">
            <span className="meta-label">Variants:</span>
            <span className="meta-value">{doc.variants.length}</span>
          </span>
          <span className="meta-item">
            <span className="meta-label">Props:</span>
            <span className="meta-value">
              {Object.keys(doc.component.props).filter(
                (key) => !doc.component.props[key].hideInDocs
              ).length}
            </span>
          </span>
          <span className="meta-item">
            <span className="meta-label">CSS Variables:</span>
            <span className="meta-value">{doc.cssVariables.length}</span>
          </span>
        </div>
      </header>

      <section className="component-section">
        <h2>Properties</h2>
        <PropsTable props={doc.component.props} />
      </section>

      <VariantShowcase componentName={doc.component.name} variants={doc.variants} />

      {doc.cssVariables.length > 0 && <CSSVariablesTable variables={doc.cssVariables} />}
    </div>
  );
};

export default ComponentPage;
