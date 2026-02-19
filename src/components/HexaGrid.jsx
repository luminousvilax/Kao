import { SKILL_NODES } from '../data/jobs';
import './HexaGrid.css';

export function HexaGrid({ progress, onUpdate, nodeMetadata }) {
  const nodes = nodeMetadata ? Object.values(nodeMetadata) : Object.values(SKILL_NODES);

  const groupedByType = nodes.reduce((acc, n) => {
    if (!acc[n.type]) acc[n.type] = [];
    acc[n.type].push(n);
    return acc;
  }, {});

  const handleLevelChange = (nodeId, valStr) => {
    let val = parseInt(valStr, 10);
    if (isNaN(val)) val = 0;
    
    // Clamp 0-30
    if (val < 0) val = 0;
    if (val > 30) val = 30;

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
                <span className="node-label">
                  {node.icon && (
                    <span className="node-icon-container">
                      {node.icon.length > 4 ? (
                        <img src={node.icon} alt={node.displayName} className="node-icon-img" />
                      ) : (
                        node.icon
                      )}
                    </span>
                  )}
                  {node.displayName || node.label}
                </span>
                <div className="node-input-wrapper">
                  <input
                    type="number"
                    min="0" max="30"
                    value={currentLevel}
                    onChange={(e) => handleLevelChange(node.id, e.target.value)}
                  />
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${(currentLevel / 30) * 100}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
