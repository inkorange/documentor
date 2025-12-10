import React from 'react';
import { ComponentCoverage } from '../types/metadata';
import './CoveragePanel.scss';

interface CoveragePanelProps {
  coverage: ComponentCoverage | undefined;
}

const CoveragePanel: React.FC<CoveragePanelProps> = ({ coverage }) => {
  if (!coverage) {
    return null;
  }

  if (!coverage.hasTests) {
    return (
      <div className="coverage-panel no-tests-panel">
        <h2>Test Coverage</h2>
        <div className="no-tests-message">
          <span className="icon">⚠️</span>
          <div>
            <p className="message-title">No tests found for this component</p>
            <p className="message-hint">
              Create a test file at <code>{coverage.componentName}.test.tsx</code> to see coverage data
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getCoverageClass = (percentage: number): string => {
    if (percentage >= 80) return 'excellent';
    if (percentage >= 60) return 'good';
    if (percentage >= 40) return 'fair';
    return 'poor';
  };

  const renderCoverageBar = (label: string, metric: { covered: number; total: number; percentage: number }) => {
    return (
      <div className="coverage-item">
        <div className="coverage-header">
          <span className="coverage-label">{label}</span>
          <span className="coverage-stats">
            {metric.covered}/{metric.total}
            <span className={`coverage-percentage ${getCoverageClass(metric.percentage)}`}>
              {metric.percentage.toFixed(0)}%
            </span>
          </span>
        </div>
        <div className="coverage-bar">
          <div
            className={`coverage-fill ${getCoverageClass(metric.percentage)}`}
            style={{ width: `${metric.percentage}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="coverage-panel">
      <h2>Test Coverage</h2>

      {coverage.testFilePath && (
        <div className="test-file-info">
          <span className="label">Test file:</span>
          <code className="file-path">{coverage.testFilePath.split('/').slice(-1)[0]}</code>
        </div>
      )}

      <div className="coverage-metrics">
        {renderCoverageBar('Statements', coverage.metrics.statements)}
        {renderCoverageBar('Branches', coverage.metrics.branches)}
        {renderCoverageBar('Functions', coverage.metrics.functions)}
        {renderCoverageBar('Lines', coverage.metrics.lines)}
      </div>

      <div className="coverage-legend">
        <div className="legend-item">
          <span className="legend-color excellent"></span>
          <span className="legend-label">Excellent (≥80%)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color good"></span>
          <span className="legend-label">Good (60-79%)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color fair"></span>
          <span className="legend-label">Fair (40-59%)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color poor"></span>
          <span className="legend-label">Poor (&lt;40%)</span>
        </div>
      </div>
    </div>
  );
};

export default CoveragePanel;
