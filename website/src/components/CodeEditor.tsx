import React, { useState, useEffect } from 'react';
import './CodeEditor.scss';

interface CodeEditorProps {
  componentName: string;
  initialProps: Record<string, any>;
  onApply: (props: Record<string, any>) => void;
}

/**
 * CodeEditor Component
 *
 * Provides a simple code editor for editing component props as JSX
 */
const CodeEditor: React.FC<CodeEditorProps> = ({
  componentName,
  initialProps,
  onApply,
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Generate initial JSX from props
  useEffect(() => {
    setCode(generateJSXFromProps(componentName, initialProps));
  }, [componentName, initialProps]);

  const handleApply = () => {
    try {
      const props = parsePropsFromJSX(code, componentName);
      setError(null);
      onApply(props);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse JSX');
    }
  };

  const handleReset = () => {
    setCode(generateJSXFromProps(componentName, initialProps));
    setError(null);
  };

  return (
    <div className="code-editor">
      <div className="code-editor-header">
        <h3>JSX Code Editor</h3>
        <div className="editor-actions">
          <button onClick={handleReset} className="reset-btn" title="Reset to current props">
            Reset
          </button>
          <button onClick={handleApply} className="apply-btn" title="Apply changes">
            Apply
          </button>
        </div>
      </div>

      <div className="code-editor-body">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="code-textarea"
          spellCheck={false}
          placeholder={`<${componentName} />`}
        />
      </div>

      {error && (
        <div className="code-editor-error">
          <span className="error-icon">⚠️</span>
          <span className="error-message">{error}</span>
        </div>
      )}

      <div className="code-editor-hint">
        Edit the JSX code above and click "Apply" to update the preview
      </div>
    </div>
  );
};

/**
 * Generate JSX string from component props
 */
function generateJSXFromProps(componentName: string, props: Record<string, any>): string {
  // Separate children from other props
  const { children, ...otherProps } = props;
  const entries = Object.entries(otherProps).filter(([_, value]) => value !== undefined && value !== null);

  // Generate prop attributes
  const propsString = entries
    .map(([key, value]) => {
      if (typeof value === 'boolean') {
        return value ? key : `${key}={false}`;
      }
      if (typeof value === 'string') {
        return `${key}="${value}"`;
      }
      if (typeof value === 'number') {
        return `${key}={${value}}`;
      }
      if (typeof value === 'object') {
        return `${key}={${JSON.stringify(value)}}`;
      }
      return `${key}={${JSON.stringify(value)}}`;
    })
    .join('\n  ');

  // Handle different cases
  if (children !== undefined && children !== null) {
    // Component has children - use opening and closing tags
    const childrenContent = typeof children === 'string' ? children : JSON.stringify(children);

    if (propsString) {
      return `<${componentName}\n  ${propsString}\n>\n  ${childrenContent}\n</${componentName}>`;
    } else {
      return `<${componentName}>\n  ${childrenContent}\n</${componentName}>`;
    }
  } else if (propsString) {
    // No children, but has other props - use self-closing tag
    return `<${componentName}\n  ${propsString}\n/>`;
  } else {
    // No props at all - simple self-closing tag
    return `<${componentName} />`;
  }
}

/**
 * Parse props from JSX string
 * This is a simple parser - in production you might want to use a proper JSX parser
 */
function parsePropsFromJSX(jsx: string, componentName: string): Record<string, any> {
  const props: Record<string, any> = {};

  // Check if this is a self-closing tag or has children
  const selfClosing = jsx.includes('/>');

  if (selfClosing) {
    // Self-closing tag: <Component prop="value" />
    const openTagMatch = jsx.match(new RegExp(`<${componentName}([^/]*)/>`));
    if (!openTagMatch) return props;

    const propsContent = openTagMatch[1].trim();
    if (propsContent) {
      parseAttributes(propsContent, props);
    }
  } else {
    // Has children: <Component prop="value">children</Component>
    const openTagMatch = jsx.match(new RegExp(`<${componentName}([^>]*)>`, 's'));
    const closeTagMatch = jsx.match(new RegExp(`</${componentName}>`));

    if (!openTagMatch || !closeTagMatch) return props;

    const propsContent = openTagMatch[1].trim();
    if (propsContent) {
      parseAttributes(propsContent, props);
    }

    // Extract children content between opening and closing tags
    const openTagEnd = openTagMatch[0].length;
    const closeTagStart = jsx.lastIndexOf(`</${componentName}>`);
    const childrenContent = jsx.substring(openTagEnd, closeTagStart).trim();

    if (childrenContent) {
      props.children = childrenContent;
    }
  }

  return props;
}

/**
 * Parse attributes from prop string
 */
function parseAttributes(propsContent: string, props: Record<string, any>): void {
  // Match prop="value" or prop={value} or prop (boolean)
  // This regex handles quoted strings with any characters including >
  const propRegex = /(\w+)(?:=(?:{([^}]+)}|"([^"]*)"))?/g;
  let match;

  while ((match = propRegex.exec(propsContent)) !== null) {
    const propName = match[1];
    const jsValue = match[2]; // {...} value
    const stringValue = match[3]; // "..." value

    if (jsValue !== undefined) {
      // Handle curly brace values
      try {
        if (jsValue === 'true') {
          props[propName] = true;
        } else if (jsValue === 'false') {
          props[propName] = false;
        } else if (!isNaN(Number(jsValue)) && jsValue.trim() !== '') {
          props[propName] = Number(jsValue);
        } else {
          // Try to parse as JSON
          props[propName] = JSON.parse(jsValue);
        }
      } catch {
        // If parsing fails, use as string
        props[propName] = jsValue;
      }
    } else if (stringValue !== undefined) {
      // Handle quoted string values
      props[propName] = stringValue;
    } else {
      // Boolean prop without value (e.g., disabled)
      props[propName] = true;
    }
  }
}

export default CodeEditor;
