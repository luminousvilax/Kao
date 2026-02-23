import React, { useState, useEffect } from 'react';
import { SKILL_NODES } from '../data/jobs';
import './HexaGrid.css';

// Helper component for managing input state independently
const HexaInput = ({ value, onChange, min, max }) => {
  const [localValue, setLocalValue] = useState(value.toString());

  // Sync local state if prop value changes (e.g. switching characters)
  useEffect(() => {
    setLocalValue(value.toString());
  }, [value]);

  const handleChange = (e) => {
    const newVal = e.target.value;
    setLocalValue(newVal);

    // Only bubble up valid changes immediately if they are within bounds
    // But don't force update if empty string (allow clear)
    if (newVal === '') return;

    const numVal = parseInt(newVal, 10);
    if (!isNaN(numVal) && numVal >= min && numVal <= max) {
      onChange(numVal);
    }
  };

  const handleBlur = () => {
    let numVal = parseInt(localValue, 10);
    if (isNaN(numVal)) numVal = 0;

    // Clamp
    if (numVal < min) numVal = min;
    if (numVal > max) numVal = max;

    // Update parent and reset local display to valid number
    onChange(numVal);
    setLocalValue(numVal.toString());
  };

  return <input type="number" min={min} max={max} value={localValue} onChange={handleChange} onBlur={handleBlur} />;
};

export function HexaGrid({ progress, onUpdate, nodeMetadata }) {
  const nodes = (nodeMetadata ? Object.values(nodeMetadata) : Object.values(SKILL_NODES)).filter(
    (n) => n.type !== 'stat'
  );

  const groupedByType = nodes.reduce((acc, n) => {
    if (!acc[n.type]) acc[n.type] = [];
    acc[n.type].push(n);
    return acc;
  }, {});

  const handleLevelChange = (nodeId, val) => {
    onUpdate(nodeId, val);
  };

  return (
    <div className="hexa-grid-container">
      {Object.entries(groupedByType).map(([type, typeNodes]) => (
        <div key={type} className={`hexa-row type-${type}`}>
          {typeNodes.map((node) => {
            const currentLevel = progress[node.id] || 0;

            return (
              <div key={node.id} className={`hexa-node-card type-${node.type}`}>
                <span
                  className={`node-label ${node.icon && node.icon.length > 4 ? 'has-image-only' : ''}`}
                  title={node.displayName || node.label}
                >
                  {node.icon && node.icon.length > 4 ? (
                    <span className="node-icon-container image-only">
                      <img
                        src={node.icon}
                        alt={node.displayName || node.label}
                        className="node-icon-img"
                        decoding="async"
                      />
                    </span>
                  ) : (
                    <>
                      {node.icon && <span className="node-icon-container">{node.icon}</span>}
                      {node.displayName || node.label}
                    </>
                  )}
                </span>
                <div className="node-input-wrapper">
                  <HexaInput
                    min={0}
                    max={30}
                    value={currentLevel}
                    onChange={(val) => handleLevelChange(node.id, val)}
                  />
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(currentLevel / 30) * 100}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
