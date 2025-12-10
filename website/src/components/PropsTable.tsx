import React from 'react';
import { PropMetadata } from '../types/metadata';
import './PropsTable.scss';

interface PropsTableProps {
  props: Record<string, PropMetadata>;
}

const PropsTable: React.FC<PropsTableProps> = ({ props }) => {
  const visibleProps = Object.entries(props).filter(([_, meta]) => !meta.hideInDocs);

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
                  <code>{metadata.default}</code>
                ) : (
                  <span className="undefined">-</span>
                )}
              </td>
              <td className="prop-description">
                {metadata.description || <span className="no-description">No description</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PropsTable;
