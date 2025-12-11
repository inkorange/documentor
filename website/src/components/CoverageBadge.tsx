import React from 'react';
import { ComponentCoverage } from '../types/metadata';
import './CoverageBadge.scss';

interface CoverageBadgeProps {
  coverage: ComponentCoverage | undefined;
}

const CoverageBadge: React.FC<CoverageBadgeProps> = ({ coverage }) => {
  if (!coverage) {
    return (
      <div className="coverage-badge no-coverage">
        <span className="badge-label">Coverage</span>
        <span className="badge-value">No Data</span>
      </div>
    );
  }

  if (!coverage.hasTests) {
    return (
      <div className="coverage-badge no-tests">
        <span className="badge-label">Tests</span>
        <span className="badge-value">No Tests</span>
      </div>
    );
  }

  const avgCoverage =
    (coverage.metrics.statements.percentage +
      coverage.metrics.branches.percentage +
      coverage.metrics.functions.percentage +
      coverage.metrics.lines.percentage) /
    4;

  const getCoverageLevel = (percentage: number): string => {
    if (percentage >= 80) return 'excellent';
    if (percentage >= 60) return 'good';
    if (percentage >= 40) return 'fair';
    return 'poor';
  };

  const level = getCoverageLevel(avgCoverage);

  return (
    <div className={`coverage-badge ${level}`}>
      <span className="badge-label">Coverage</span>
      <span className="badge-value">{avgCoverage.toFixed(0)}%</span>
    </div>
  );
};

export default CoverageBadge;
