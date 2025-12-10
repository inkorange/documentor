import React, { useState } from 'react';
import { VariantExample } from '../types/metadata';
import './VariantShowcase.scss';

interface VariantShowcaseProps {
  componentName: string;
  variants: VariantExample[];
}

const VariantShowcase: React.FC<VariantShowcaseProps> = ({ componentName, variants }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (variants.length === 0) {
    return (
      <div className="variant-showcase">
        <h2>Examples</h2>
        <p className="no-variants">No examples available for this component.</p>
      </div>
    );
  }

  return (
    <div className="variant-showcase">
      <h2>Examples ({variants.length})</h2>
      <div className="variants-grid">
        {variants.map((variant, index) => {
          const variantLabel = Object.entries(variant.props)
            .filter(([key]) => key !== 'children')
            .map(([key, value]) => `${key}="${value}"`)
            .join(' ') || 'Default';

          return (
            <div key={index} className="variant-card">
              <div className="variant-header">
                <h3 className="variant-title">{variantLabel}</h3>
                <button
                  className={`copy-button ${copiedIndex === index ? 'copied' : ''}`}
                  onClick={() => copyCode(variant.code, index)}
                  title="Copy code"
                >
                  {copiedIndex === index ? '✓ Copied' : 'Copy'}
                </button>
              </div>

              <div className="variant-preview">
                <div className="preview-label">Preview:</div>
                <div className="preview-content">
                  <div className="preview-placeholder">
                    <span className="component-tag">&lt;{componentName} /&gt;</span>
                    <span className="preview-note">
                      Live preview coming in Phase 3
                    </span>
                  </div>
                </div>
              </div>

              <div className="variant-code">
                <div className="code-label">Code:</div>
                <pre className="code-block">
                  <code>{variant.code}</code>
                </pre>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VariantShowcase;
