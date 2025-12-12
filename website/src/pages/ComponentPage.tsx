import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { fetchComponentDoc } from '../utils/api';
import { ComponentDocumentation } from '../types/metadata';
import PropsTable from '../components/PropsTable';
import VariantShowcase from '../components/VariantShowcase';
import CSSVariablesTable from '../components/CSSVariablesTable';
import CoverageBadge from '../components/CoverageBadge';
import CoveragePanel from '../components/CoveragePanel';
import LivePreview from '../components/LivePreview';
import PlaygroundControls, { PlaygroundMode } from '../components/PlaygroundControls';
import CodeEditor from '../components/CodeEditor';
import './ComponentPage.scss';

const ComponentPage: React.FC = () => {
  const { componentName } = useParams<{ componentName: string }>();
  const [doc, setDoc] = useState<ComponentDocumentation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editedProps, setEditedProps] = useState<Record<string, any>>({});
  const [playgroundMode, setPlaygroundMode] = useState<PlaygroundMode>('interactive');
  const [initialProps, setInitialProps] = useState<Record<string, any>>({});

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

      // Set initial prop values from the first variant
      if (data.variants && data.variants.length > 0) {
        const props = data.variants[0].props;
        setEditedProps(props);
        setInitialProps(props);
      }

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load component');
      setLoading(false);
    }
  };

  // Handle individual prop changes from PropsTable
  const handlePropChange = useCallback((propName: string, value: any) => {
    setEditedProps(prev => ({ ...prev, [propName]: value }));
  }, []);

  // Handle mode change
  const handleModeChange = useCallback((mode: PlaygroundMode) => {
    setPlaygroundMode(mode);
  }, []);

  // Handle export code
  const handleExportCode = useCallback(() => {
    if (!doc) return;

    const code = generateComponentCode(doc.component.name, editedProps);

    // Copy to clipboard
    navigator.clipboard.writeText(code).then(() => {
      alert('Code copied to clipboard!');
    }).catch(() => {
      // Fallback: show in alert
      alert(`Component Code:\n\n${code}`);
    });
  }, [doc, editedProps]);

  // Handle reset props
  const handleResetProps = useCallback(() => {
    setEditedProps(initialProps);
  }, [initialProps]);

  // Handle code editor apply
  const handleCodeApply = useCallback((props: Record<string, any>) => {
    setEditedProps(props);
  }, []);

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
          <CoverageBadge coverage={doc.coverage} />
        </div>
      </header>

      <section className="component-section">
        <h2>Interactive Playground</h2>

        <PlaygroundControls
          mode={playgroundMode}
          onModeChange={handleModeChange}
          onExportCode={handleExportCode}
          onResetProps={handleResetProps}
        />

        {playgroundMode === 'interactive' && (
          <>
            <div className="interactive-preview-container">
              <LivePreview
                componentName={doc.component.name}
                props={editedProps}
              />
            </div>
            <div className="props-section">
              <PropsTable
                props={doc.component.props}
                currentValues={editedProps}
                onValueChange={handlePropChange}
                editable={true}
              />
            </div>
          </>
        )}

        {playgroundMode === 'code' && (
          <div className="code-mode-container">
            <CodeEditor
              componentName={doc.component.name}
              initialProps={editedProps}
              onApply={handleCodeApply}
            />
            <div className="code-preview-container">
              <h3>Preview</h3>
              <LivePreview
                componentName={doc.component.name}
                props={editedProps}
              />
            </div>
          </div>
        )}

        {playgroundMode === 'split' && (
          <div className="split-view-container">
            <div className="split-controls">
              <PropsTable
                props={doc.component.props}
                currentValues={editedProps}
                onValueChange={handlePropChange}
                editable={true}
              />
            </div>
            <div className="split-preview">
              <LivePreview
                componentName={doc.component.name}
                props={editedProps}
              />
            </div>
          </div>
        )}
      </section>

      <VariantShowcase componentName={doc.component.name} variants={doc.variants} />

      <CoveragePanel coverage={doc.coverage} />

      {doc.cssVariables.length > 0 && <CSSVariablesTable variables={doc.cssVariables} />}
    </div>
  );
};

/**
 * Generate component code from props
 */
function generateComponentCode(componentName: string, props: Record<string, any>): string {
  // Separate children from other props
  const { children, ...otherProps } = props;
  const entries = Object.entries(otherProps).filter(
    ([_, value]) => value !== undefined && value !== null
  );

  // Generate prop attributes
  const propsString = entries
    .map(([key, value]) => {
      if (typeof value === 'boolean') {
        return value ? `  ${key}` : `  ${key}={false}`;
      }
      if (typeof value === 'string') {
        return `  ${key}="${value}"`;
      }
      if (typeof value === 'number') {
        return `  ${key}={${value}}`;
      }
      if (typeof value === 'object') {
        return `  ${key}={${JSON.stringify(value)}}`;
      }
      return `  ${key}={${JSON.stringify(value)}}`;
    })
    .join('\n');

  // Handle different cases
  if (children !== undefined && children !== null) {
    // Component has children - use opening and closing tags
    const childrenContent = typeof children === 'string' ? children : JSON.stringify(children);

    if (propsString) {
      return `<${componentName}\n${propsString}\n>\n  ${childrenContent}\n</${componentName}>`;
    } else {
      return `<${componentName}>\n  ${childrenContent}\n</${componentName}>`;
    }
  } else if (propsString) {
    // No children, but has other props - use self-closing tag
    return `<${componentName}\n${propsString}\n/>`;
  } else {
    // No props at all - simple self-closing tag
    return `<${componentName} />`;
  }
}

export default ComponentPage;
