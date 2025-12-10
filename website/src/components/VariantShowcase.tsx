import React, { useState } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import jsx from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { VariantExample } from '../types/metadata';
import LivePreview from './LivePreview';
import './VariantShowcase.scss';

// Register JSX language
SyntaxHighlighter.registerLanguage('jsx', jsx);

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
          return (
            <div key={index} className="variant-card">
              <div className="variant-header">
                <h3 className="variant-title">{variant.title}</h3>
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
                  <LivePreview
                    componentName={componentName}
                    props={variant.props}
                  />
                </div>
              </div>

              <div className="variant-code">
                <div className="code-label">Code:</div>
                <SyntaxHighlighter
                  language="jsx"
                  style={atomOneDark}
                  customStyle={{
                    margin: 0,
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    padding: '1rem',
                  }}
                  showLineNumbers={false}
                >
                  {variant.code}
                </SyntaxHighlighter>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VariantShowcase;
