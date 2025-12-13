import React, { useCallback } from 'react';
import { PropMetadata } from '../types/metadata';
import './PropsTable.scss';

interface PropsTableProps {
  props: Record<string, PropMetadata>;
  currentValues?: Record<string, any>;
  onValueChange?: (propName: string, value: any) => void;
  editable?: boolean;
}

const PropsTable: React.FC<PropsTableProps> = ({
  props,
  currentValues = {},
  onValueChange,
  editable = false
}) => {
  const visibleProps = Object.entries(props).filter(([_, meta]) => !meta.hideInDocs);

  const handleValueChange = useCallback((propName: string, value: any) => {
    if (onValueChange) {
      onValueChange(propName, value);
    }
  }, [onValueChange]);

  const renderValueInput = (propName: string, metadata: PropMetadata) => {
    if (!editable || !onValueChange) {
      return null;
    }

    const currentValue = currentValues[propName];
    const type = metadata.type.toLowerCase();

    // Boolean input
    if (type.includes('boolean')) {
      return (
        <input
          type="checkbox"
          checked={currentValue ?? false}
          onChange={(e) => handleValueChange(propName, e.target.checked)}
          className="value-input value-input--checkbox"
        />
      );
    }

    // Enum/Union type
    if (metadata.values && metadata.values.length > 0) {
      return (
        <select
          value={currentValue ?? ''}
          onChange={(e) => handleValueChange(propName, e.target.value)}
          className="value-input value-input--select"
        >
          {metadata.optional && <option value="">-- None --</option>}
          {metadata.values.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      );
    }

    // Number input
    if (type.includes('number')) {
      return (
        <input
          type="number"
          value={currentValue ?? ''}
          onChange={(e) => handleValueChange(propName, e.target.valueAsNumber)}
          className="value-input value-input--number"
          placeholder="Enter number"
        />
      );
    }

    // React.ReactNode (textarea for HTML/JSX)
    if (type.includes('reactnode') || type.includes('react.reactnode')) {
      return (
        <textarea
          value={currentValue ?? ''}
          onChange={(e) => handleValueChange(propName, e.target.value)}
          className="value-input value-input--textarea"
          rows={2}
          placeholder="Enter HTML/JSX"
        />
      );
    }

    // String input (default)
    return (
      <input
        type="text"
        value={currentValue ?? ''}
        onChange={(e) => handleValueChange(propName, e.target.value)}
        className="value-input value-input--text"
        placeholder={metadata.example || `Enter ${propName}`}
      />
    );
  };

  if (visibleProps.length === 0) {
    return <p className="no-props">This component has no configurable props.</p>;
  }

  return (
    <div className="props-table-container">
      <table className="props-table">
        <thead>
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>Default</th>
            <th>Description</th>
            {editable && <th>Value</th>}
          </tr>
        </thead>
        <tbody>
          {visibleProps.map(([propName, metadata]) => (
            <tr key={propName}>
              <td className="prop-name">
                <code>{propName}</code>
                {!metadata.optional && <span className="required">*</span>}
              </td>
              <td className="prop-type">
                <code>{metadata.type}</code>
                {metadata.values && metadata.values.length > 0 && (
                  <div className="type-values">
                    {metadata.values.map((value, idx) => (
                      <span key={idx} className="type-value">
                        {value}
                      </span>
                    ))}
                  </div>
                )}
              </td>
              <td className="prop-default">
                {metadata.default ? (
                  <div className="default-value-wrapper">
                    <code>{metadata.default}</code>
                    {metadata.defaultSource && (
                      <span className={`default-source default-source--${metadata.defaultSource}`}>
                        {metadata.defaultSource === 'inferred' ? 'inferred' : 'explicit'}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="undefined">-</span>
                )}
              </td>
              <td className="prop-description">
                {metadata.description || <span className="no-description">No description</span>}
              </td>
              {editable && (
                <td className="prop-value">
                  {renderValueInput(propName, metadata)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PropsTable;
