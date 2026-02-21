import { useState, useRef, useEffect } from 'react';
import './CharacterList.css';

export function CharacterList({ characters, characterOrder, activeId, onSelect, onDelete, onSwap, onAdd }) {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const longPressTimer = useRef(null);
  const [isReordering, setIsReordering] = useState(false);

  useEffect(() => {
    return () => clearTimeout(longPressTimer.current);
  }, []);

  const order = characterOrder?.length > 0 
    ? characterOrder 
    : Object.keys(characters);
  
  const list = order.map(id => characters[id]).filter(Boolean);

  if (list.length === 0) {
    return (
      <div className="empty-state">
        <p>No characters tracked yet.</p>
        <button onClick={onAdd} className="btn-primary">Create Your First Character</button>
      </div>
    );
  }

  const handlePointerDown = () => {
    longPressTimer.current = setTimeout(() => {
      setIsReordering(true);
      // Optional: haptic feedback if available
      if (window.navigator.vibrate) window.navigator.vibrate(50);
    }, 500);
  };

  const handlePointerUp = () => {
    clearTimeout(longPressTimer.current);
  };

  const handleDragStart = (e, index) => {
    if (!isReordering) {
      e.preventDefault();
      return;
    }
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Use a blank image or similar to customize drag ghost if needed
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      onSwap(draggedIndex, index);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
    setIsReordering(false);
  };

  return (
    <div className="character-list-container">
      <header className="list-header">
        <div>
          <h2>Your Characters</h2>
          {isReordering && <span className="reorder-hint">Drag to reorder</span>}
        </div>
        <button onClick={onAdd} className="btn-small">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add New
        </button>
      </header>
      
      <div className="character-cards">
        {list.map((char, index) => (
          <div 
            key={char.id} 
            className={`char-card ${char.id === activeId ? 'active' : ''} ${draggedIndex === index ? 'dragging' : ''} ${dragOverIndex === index ? 'drag-over' : ''} ${isReordering ? 'reorder-mode' : ''}`}
            onClick={() => !isReordering && onSelect(char.id)}
            draggable={isReordering}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={() => {
              setDraggedIndex(null);
              setDragOverIndex(null);
              setIsReordering(false);
            }}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            <div className="char-info">
              <h3>{char.name}</h3>
              <span className="char-job">{char.job}</span>
            </div>
            <div className="char-meta">
              <span>Lv. {char.level}</span>
              <button 
                className="btn-delete" 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(char.id);
                }}
                title="Delete Character"
              >
                &times;
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
