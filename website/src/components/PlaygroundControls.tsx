import React from 'react';
import './PlaygroundControls.scss';

export type PlaygroundMode = 'interactive' | 'code' | 'split';

interface PlaygroundControlsProps {
  mode: PlaygroundMode;
  onModeChange: (mode: PlaygroundMode) => void;
  onExportCode: () => void;
  onResetProps: () => void;
}

const PlaygroundControls: React.FC<PlaygroundControlsProps> = ({
  mode,
  onModeChange,
  onExportCode,
  onResetProps,
}) => {
  return (
    <div className="playground-controls">
      <div className="mode-switcher">
        <button
          className={`mode-button ${mode === 'interactive' ? 'active' : ''}`}
          onClick={() => onModeChange('interactive')}
          title="Interactive mode with prop controls"
        >
          <span className="icon">🎛️</span>
          <span className="label">Interactive</span>
        </button>
        <button
          className={`mode-button ${mode === 'code' ? 'active' : ''}`}
          onClick={() => onModeChange('code')}
          title="Code-first mode with JSX editor"
        >
          <span className="icon">📝</span>
          <span className="label">Code</span>
        </button>
        <button
          className={`mode-button ${mode === 'split' ? 'active' : ''}`}
          onClick={() => onModeChange('split')}
          title="Split view mode"
        >
          <span className="icon">⚡</span>
          <span className="label">Split View</span>
        </button>
      </div>

      <div className="action-buttons">
        <button
          className="action-button reset-button"
          onClick={onResetProps}
          title="Reset all props to defaults"
        >
          <span className="icon">🔄</span>
          <span className="label">Reset</span>
        </button>
        <button
          className="action-button export-button"
          onClick={onExportCode}
          title="Export component code"
        >
          <span className="icon">📋</span>
          <span className="label">Export Code</span>
        </button>
      </div>
    </div>
  );
};

export default PlaygroundControls;
