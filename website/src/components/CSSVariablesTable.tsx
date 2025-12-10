import React, { useState, useEffect } from 'react';
import { CSSVariable } from '../types/metadata';
import './CSSVariablesTable.scss';

interface CSSVariablesTableProps {
  variables: CSSVariable[];
}

const CSSVariablesTable: React.FC<CSSVariablesTableProps> = ({ variables }) => {
  const [copiedVar, setCopiedVar] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [customValues, setCustomValues] = useState<Record<string, string>>({});

  // Apply CSS variables to the document root when customValues change
  useEffect(() => {
    if (!editMode) return;

    Object.entries(customValues).forEach(([varName, value]) => {
      if (value) {
        document.documentElement.style.setProperty(varName, value);
      }
    });

    // Cleanup function to reset variables when component unmounts
    return () => {
      if (!editMode) {
        variables.forEach((variable) => {
          document.documentElement.style.removeProperty(variable.name);
        });
      }
    };
  }, [customValues, editMode, variables]);

  if (variables.length === 0) {
    return null;
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedVar(text);
    setTimeout(() => setCopiedVar(null), 2000);
  };

  const handleValueChange = (varName: string, value: string) => {
    setCustomValues((prev) => ({
      ...prev,
      [varName]: value,
    }));
  };

  const resetVariable = (varName: string) => {
    document.documentElement.style.removeProperty(varName);
    setCustomValues((prev) => {
      const newValues = { ...prev };
      delete newValues[varName];
      return newValues;
    });
  };

  const resetAll = () => {
    variables.forEach((variable) => {
      document.documentElement.style.removeProperty(variable.name);
    });
    setCustomValues({});
  };

  const toggleEditMode = () => {
    if (editMode) {
      resetAll();
    }
    setEditMode(!editMode);
  };

  const getCurrentValue = (variable: CSSVariable): string => {
    return customValues[variable.name] || variable.default || '';
  };

  const isColorValue = (value: string): boolean => {
    return value.startsWith('#') || value.startsWith('rgb') || value.startsWith('hsl');
  };

  return (
    <div className="css-variables-section">
      <div className="section-header">
        <h2>Design Tokens (CSS Variables)</h2>
        <div className="section-actions">
          <button
            className={`edit-button ${editMode ? 'active' : ''}`}
            onClick={toggleEditMode}
            title={editMode ? 'Exit edit mode' : 'Enable live editing'}
          >
            {editMode ? '✓ Exit Edit Mode' : '✏️ Edit Live'}
          </button>
          {editMode && Object.keys(customValues).length > 0 && (
            <button className="reset-button" onClick={resetAll} title="Reset all values">
              ↺ Reset All
            </button>
          )}
        </div>
      </div>

      {editMode && (
        <div className="edit-mode-notice">
          <span className="notice-icon">💡</span>
          <span>Edit mode active - Changes will apply in real-time to all component previews on this page</span>
        </div>
      )}

      <div className="css-variables-table-container">
        <table className="css-variables-table">
          <thead>
            <tr>
              <th>Variable</th>
              <th>Description</th>
              <th>{editMode ? 'Current Value' : 'Default Value'}</th>
              {editMode && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {variables.map((variable) => {
              const currentValue = getCurrentValue(variable);
              const isModified = variable.name in customValues;

              return (
                <tr key={variable.name} className={isModified ? 'modified' : ''}>
                  <td className="var-name">
                    <code
                      onClick={() => copyToClipboard(variable.name)}
                      className={copiedVar === variable.name ? 'copied' : ''}
                      title="Click to copy"
                    >
                      {variable.name}
                    </code>
                  </td>
                  <td className="var-description">
                    {variable.description || <span className="no-description">No description</span>}
                  </td>
                  <td className="var-value">
                    {editMode ? (
                      <div className="value-editor">
                        {isColorValue(currentValue) && (
                          <input
                            type="color"
                            value={currentValue.startsWith('#') ? currentValue : '#000000'}
                            onChange={(e) => handleValueChange(variable.name, e.target.value)}
                            className="color-input"
                          />
                        )}
                        <input
                          type="text"
                          value={currentValue}
                          onChange={(e) => handleValueChange(variable.name, e.target.value)}
                          className="text-input"
                          placeholder={variable.default || 'Enter value...'}
                        />
                      </div>
                    ) : (
                      variable.default ? (
                        <span className="default-value">
                          <code>{variable.default}</code>
                          {isColorValue(variable.default) && (
                            <span
                              className="color-preview"
                              style={{ backgroundColor: variable.default }}
                            />
                          )}
                        </span>
                      ) : (
                        <span className="undefined">-</span>
                      )
                    )}
                  </td>
                  {editMode && (
                    <td className="var-actions">
                      {isModified && (
                        <button
                          className="reset-var-button"
                          onClick={() => resetVariable(variable.name)}
                          title="Reset to default"
                        >
                          ↺
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CSSVariablesTable;
