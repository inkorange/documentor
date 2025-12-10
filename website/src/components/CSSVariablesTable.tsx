import React, { useState } from 'react';
import { CSSVariable } from '../types/metadata';
import './CSSVariablesTable.scss';

interface CSSVariablesTableProps {
  variables: CSSVariable[];
}

const CSSVariablesTable: React.FC<CSSVariablesTableProps> = ({ variables }) => {
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  if (variables.length === 0) {
    return null;
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedVar(text);
    setTimeout(() => setCopiedVar(null), 2000);
  };

  return (
    <div className="css-variables-section">
      <h2>Design Tokens (CSS Variables)</h2>
      <div className="css-variables-table-container">
        <table className="css-variables-table">
          <thead>
            <tr>
              <th>Variable</th>
              <th>Description</th>
              <th>Default Value</th>
            </tr>
          </thead>
          <tbody>
            {variables.map((variable) => (
              <tr key={variable.name}>
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
                <td className="var-default">
                  {variable.default ? (
                    <span className="default-value">
                      <code>{variable.default}</code>
                      {variable.default.startsWith('#') && (
                        <span
                          className="color-preview"
                          style={{ backgroundColor: variable.default }}
                        />
                      )}
                    </span>
                  ) : (
                    <span className="undefined">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CSSVariablesTable;
