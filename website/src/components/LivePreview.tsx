import React, { useState, useEffect } from 'react';
import { COMPONENT_MAP } from '../preview-components';
import './LivePreview.scss';

interface LivePreviewProps {
  componentName: string;
  props: Record<string, any>;
  fallback?: React.ReactNode;
}

/**
 * LivePreview Component
 *
 * Renders a live preview of a component with the given props.
 * Falls back to a placeholder if the component is not registered.
 */
const LivePreview: React.FC<LivePreviewProps> = ({
  componentName,
  props,
  fallback,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    setError(null);

    // Check if component exists in the component map
    if (!COMPONENT_MAP[componentName]) {
      setComponent(null);
      return;
    }

    try {
      const comp = COMPONENT_MAP[componentName];
      setComponent(() => comp);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load component');
      setComponent(null);
    }
  }, [componentName]);

  // Show error state
  if (error) {
    return (
      <div className="live-preview-error">
        <span className="error-icon">⚠️</span>
        <span className="error-message">Error: {error}</span>
      </div>
    );
  }

  // Component not registered - show fallback or placeholder
  if (!Component) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="live-preview-placeholder">
        <span className="component-tag">&lt;{componentName} /&gt;</span>
        <span className="preview-note">
          Component not available for live preview
        </span>
        <span className="preview-hint">
          Run <code>npm run copy-components</code> to enable live preview
        </span>
      </div>
    );
  }

  // Render the actual component
  try {
    return (
      <div className="live-preview-wrapper">
        <div className="live-preview-content">
          <Component {...props} />
        </div>
      </div>
    );
  } catch (err) {
    return (
      <div className="live-preview-error">
        <span className="error-icon">⚠️</span>
        <span className="error-message">
          Render error: {err instanceof Error ? err.message : 'Unknown error'}
        </span>
      </div>
    );
  }
};

export default LivePreview;
