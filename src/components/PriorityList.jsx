import { SKILL_NODES } from '../data/jobs';
import './PriorityList.css';

export function PriorityList({ sequence = [], progress, onCompleteStep }) {
  // If sequence is empty or undefined, handle gracefully
  if (!sequence || sequence.length === 0) {
    return <div className="priority-empty">No upgrade sequence defined.</div>;
  }

  // Helper to check if a step is "Done"
  const isDone = (nodeId, targetLevel) => {
    const current = progress[nodeId] || 0;
    return current >= targetLevel;
  };

  return (
    <div className="priority-list">
      <h3>Recommended Upgrades</h3>
      <div className="sequence-scroll">
        {sequence.map((step, idx) => {
          const node = Object.values(SKILL_NODES).find(n => n.id === step.nodeId);
          const done = isDone(step.nodeId, step.targetLevel);
          if (!node) return null;

          return (
            <div 
              key={`${step.nodeId}-${step.targetLevel}-${idx}`} 
              className={`sequence-item ${done ? 'done' : 'pending'}`}
            >
              <div className="step-info">
                <span className="step-label">{node.label}</span>
                <span className="step-target">Lv. {step.targetLevel}</span>
              </div>
              <button 
                className={`check-btn ${done ? 'checked' : ''}`}
                onClick={() => onCompleteStep(step.nodeId, step.targetLevel)}
                disabled={done}
              >
                {done ? '✓' : 'Do'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
