import React from 'react';
import './PriorityList.css';

export function PriorityItem({ step, node, isDone, onComplete, onRemove, listeners, attributes, style }) {
  if (!node) return null;

  return (
    <div 
      className={`sequence-item ${isDone ? 'done' : 'pending'}`}
      {...attributes} 
      {...listeners}
      style={{
        ...style,
        cursor: listeners ? 'grab' : 'default',
        touchAction: listeners ? 'none' : 'auto',
        position: 'relative' // For absolute positioning if needed
      }}
    >
      <div className="step-info">
        <span className="step-label">
          {node.icon && (
            <span className="step-icon-container">
              {/* Check if icon is likely an URL or emoji */}
              {node.icon.length > 4 ? (
                <img src={node.icon} alt="" className="step-icon-img" />
              ) : (
                node.icon
              )}
            </span>
          )}
          {node.displayName || node.label}
        </span>
        <span className="step-target">Lv. {step.targetLevel}</span>
      </div>

      <div className="step-actions">
        {onComplete && (
          <button 
            className={`check-btn ${isDone ? 'checked' : ''}`}
            onClick={(e) => {
              e.stopPropagation(); // Prevent drag start if clicking button
              onComplete(step.nodeId, step.targetLevel);
            }}
            disabled={isDone}
            onPointerDown={(e) => e.stopPropagation()} // Important for dnd-kit
          >
            {isDone ? '✓' : 'Do'}
          </button>
        )}

        {onRemove && (
          <button 
            className="delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            title="Remove Step"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
