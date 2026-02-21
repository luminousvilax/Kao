import React, { useState } from 'react';
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { SKILL_NODES } from '../data/jobs';
import { PriorityItem } from './PriorityItem';
import { SortableItem } from './SortableItem';
import './PriorityList.css';

function InsertTrigger({ onInsert, isActive }) {
  return (
    <div 
      className={`insert-trigger ${isActive ? 'active' : ''}`} 
      onClick={onInsert}
      title="Insert Step Here"
    >
      <div className="insert-line"></div>
      <div className="insert-btn-icon">+</div>
    </div>
  );
}

function InlineAddForm({ availableNodes, onConfirm, onCancel, defaultNodeId, sequence, insertIndex, progress }) {
  // Use Helper to calculate min level for a given nodeId
  const calculateMinLevel = (targetNodeId) => {
    let minLevel = progress && progress[targetNodeId] ? progress[targetNodeId] : 0;
    
    // Check previous occurrences in sequence
    for (let i = insertIndex - 1; i >= 0; i--) {
        if (sequence[i].nodeId === targetNodeId) {
            minLevel = Math.max(minLevel, sequence[i].targetLevel);
            break;
        }
    }
    return Math.min(30, minLevel + 1);
  };

  // Initialize state using the helper function
  const [nodeId, setNodeId] = useState(defaultNodeId || 'common_1');
  
  // Use string state to allow empty input
  const [levelStr, setLevelStr] = useState(() => String(calculateMinLevel(defaultNodeId || 'common_1')));
  const [error, setError] = useState(null);

  const handleNodeChange = (e) => {
    const newNodeId = e.target.value;
    setNodeId(newNodeId);
    setLevelStr(String(calculateMinLevel(newNodeId)));
    setError(null);
  };

  const handleLevelChange = (e) => {
    const val = e.target.value;
    setLevelStr(val);
    setError(null);
  };

  const handleLevelBlur = () => {
    if (levelStr === '') {
        // If empty on blur, reset to default safe value
        setLevelStr(String(calculateMinLevel(nodeId)));
    } else {
        // Clamp and parse
        let val = parseInt(levelStr, 10);
        if (isNaN(val)) val = 1;
        if (val < 1) val = 1;
        if (val > 30) val = 30;
        setLevelStr(String(val));
    }
  };

  const handleSubmit = () => {
    const level = parseInt(levelStr, 10);
    if (isNaN(level)) {
        setError("Invalid level");
        return;
    }

    // Validate
    const currentProgress = progress && progress[nodeId] ? progress[nodeId] : 0;
    
    // Find neighbors for validation
    let prevLimit = 0;
    let nextLimit = 31; // Hexa max is 30, so < 31 is valid

    // Search backwards for same skill
    for (let i = insertIndex - 1; i >= 0; i--) {
      if (sequence[i].nodeId === nodeId) {
        prevLimit = sequence[i].targetLevel;
        break;
      }
    }

    // Search forwards for same skill (if inserting in middle)
    for (let i = insertIndex; i < sequence.length; i++) {
        if (sequence[i].nodeId === nodeId) {
            nextLimit = sequence[i].targetLevel;
            break;
        }
    }

    // 1. Must be higher than current progress
    if (level <= currentProgress) {
        setError(`Must be > Lv.${currentProgress} (Currently Reached)`);
        return;
    }

    // 2. Must be higher than previous plan step
    if (level <= prevLimit) {
        setError(`Must be > Lv.${prevLimit} (Previous Step)`);
        return;
    }

    // 3. Must be lower than next plan step (to maintain order)
    if (level >= nextLimit) {
        setError(`Must be < Lv.${nextLimit} (Next Step)`);
        return;
    }

    onConfirm(nodeId, level);
  };

  return (
    <div className="inline-add-row">
      <div className="inline-add-form">
        <select 
            value={nodeId} 
            onChange={handleNodeChange}
        >
            {availableNodes.map((node) => (
                <option key={node.id} value={node.id}>
                    {node.displayName || node.label}
                </option>
            ))}
        </select>
        <span className="level-prefix">Lv.</span>
        <input 
            type="number" 
            min="1" 
            max="30" 
            value={levelStr} 
            onChange={handleLevelChange}
            onBlur={handleLevelBlur}
        />
        <div className="inline-actions">
            <button className="confirm-btn" onClick={handleSubmit}>✓</button>
            <button className="cancel-btn" onClick={onCancel}>✕</button>
        </div>
      </div>
      {error && <div style={{color: '#ef4444', fontSize: '0.8rem', marginLeft: '0.5rem', marginTop: '0.25rem'}}>{error}</div>}
    </div>
  );
}

export function PriorityList({ 
  sequence = [], 
  progress, 
  onCompleteStep, 
  nodeMetadata,
  isCustom,
  onUpdateSequence,
  onResetSequence
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [insertIndex, setInsertIndex] = useState(null);
  const [showReached, setShowReached] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = sequence.findIndex((s, i) => `${s.nodeId}-${s.targetLevel}-${i}` === active.id);
      const newIndex = sequence.findIndex((s, i) => `${s.nodeId}-${s.targetLevel}-${i}` === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newSequence = arrayMove(sequence, oldIndex, newIndex);
        onUpdateSequence(newSequence);
      }
    }
  };

  const handleRemoveStep = (indexToRemove) => {
    const newSequence = sequence.filter((_, idx) => idx !== indexToRemove);
    onUpdateSequence(newSequence);
  };

  const handleInsertConfirm = (nodeId, level) => {
    if (insertIndex === null) return;
    
    const newStep = { nodeId, targetLevel: parseInt(level, 10) };
    const newSequence = [...sequence];
    newSequence.splice(insertIndex, 0, newStep);
    
    onUpdateSequence(newSequence);
    setInsertIndex(null);
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    setInsertIndex(null);
  };

  // Generate stable IDs for Drag and Drop
  const items = sequence.map((s, i) => `${s.nodeId}-${s.targetLevel}-${i}`);

  const availableNodes = nodeMetadata 
    ? Object.entries(nodeMetadata).map(([id, node]) => ({ id, ...node }))
    : Object.values(SKILL_NODES);

  // Helper to render the sortable list content
  const renderSortableList = () => {
    const combinedList = [];

    // 1. Initial Insert Trigger (at index 0)
    if (insertIndex === 0) {
      combinedList.push(
        <InlineAddForm 
            key="insert-form-0"
            availableNodes={availableNodes}
            onConfirm={handleInsertConfirm}
            onCancel={() => setInsertIndex(null)}
            defaultNodeId="common_1"
            sequence={sequence}
            insertIndex={0}
            progress={progress}
        />
      );
    } else {
      combinedList.push(
        <InsertTrigger 
            key="trigger-0" 
            onInsert={() => setInsertIndex(0)} 
            isActive={false}
        />
      );
    }

    // 2. Iterate Sequence Items
    sequence.forEach((step, idx) => {
        const uniqueId = `${step.nodeId}-${step.targetLevel}-${idx}`;
        const node = nodeMetadata ? nodeMetadata[step.nodeId] : availableNodes.find(n => n.id === step.nodeId);
        
        // Render current item
        combinedList.push(
            <SortableItem key={uniqueId} id={uniqueId}>
                <PriorityItem 
                    step={step}
                    node={node}
                    isDone={false}
                    onRemove={() => handleRemoveStep(idx)}
                />
            </SortableItem>
        );

        // Render trigger AFTER this item (index idx + 1)
        const nextIndex = idx + 1;
        if (insertIndex === nextIndex) {
            combinedList.push(
                <InlineAddForm 
                    key={`insert-form-${nextIndex}`}
                    availableNodes={availableNodes}
                    onConfirm={handleInsertConfirm}
                    onCancel={() => setInsertIndex(null)}
                    defaultNodeId="common_1"
                    sequence={sequence}
                    insertIndex={nextIndex}
                    progress={progress}
                />
            );
        } else {
            combinedList.push(
                <InsertTrigger 
                    key={`trigger-${nextIndex}`}
                    onInsert={() => setInsertIndex(nextIndex)} 
                    isActive={false}
                />
            );
        }
    });

    return combinedList;
  };

  return (
    <div className={`priority-list ${isEditing ? 'editing' : ''}`}>
      <div className="priority-header">
        <div className="priority-title-row">
            <h3>{isEditing ? 'Edit Sequence' : 'Planned Upgrades'}</h3>
            {!isEditing && (
                <label className="show-reached-toggle">
                    <input 
                        type="checkbox" 
                        checked={showReached} 
                        onChange={(e) => setShowReached(e.target.checked)} 
                    />
                    <span>Show Reached</span>
                </label>
            )}
        </div>
        <div className="header-actions">
            {isEditing && isCustom && (
                <button className="reset-btn" onClick={onResetSequence} title="Reset to default">
                    Reset
                </button>
            )}
            <button className="edit-btn" onClick={toggleEdit}>
                {isEditing ? 'Done' : 'Edit'}
            </button>
        </div>
      </div>

      <div className="sequence-scroll">
      {(!sequence || sequence.length === 0) && !isEditing ? (
         <div className="priority-empty">No upgrade sequence defined.</div>
      ) : (
        isEditing ? (
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={items}
              strategy={verticalListSortingStrategy}
            >
              {renderSortableList()}
            </SortableContext>
          </DndContext>
        ) : (
          sequence.map((step, idx) => {
             const uniqueId = `${step.nodeId}-${step.targetLevel}-${idx}`;
             const node = nodeMetadata ? nodeMetadata[step.nodeId] : availableNodes.find(n => n.id === step.nodeId);
             const isDone = progress && (progress[step.nodeId] || 0) >= step.targetLevel;

             if (isDone && !showReached) {
                 return null;
             }

             return (
               <PriorityItem 
                 key={uniqueId}
                 step={step}
                 node={node}
                 isDone={isDone}
                 onComplete={onCompleteStep}
               />
             );
          })
        )
      )}
      </div>
    </div>
  );
}
