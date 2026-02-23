import { useState, useRef, useEffect } from 'react';
import './CharacterList.css';
import { Icons } from './Icons';

export function CharacterList({ characters, characterOrder, activeId, onSelect, onDelete, onSwap, onAdd, onUpdate }) {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const longPressTimer = useRef(null);
  const [isReordering, setIsReordering] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', level: '' });

  useEffect(() => {
    return () => clearTimeout(longPressTimer.current);
  }, []);

  const order = characterOrder?.length > 0 ? characterOrder : Object.keys(characters);

  const list = order.map((id) => characters[id]).filter(Boolean);

  if (list.length === 0) {
    return (
      <div className="empty-state">
        <p>No characters tracked yet.</p>
        <button onClick={onAdd} className="btn-primary">
          Create Your First Character
        </button>
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

  const handleEditClick = (e, char) => {
    e.stopPropagation();
    setEditingId(char.id);
    setEditForm({ name: char.name, level: char.level });
  };

  const handleEditSave = (e, id) => {
    e.stopPropagation();
    if (editForm.name.trim() && editForm.level) {
      onUpdate(id, { name: editForm.name.trim(), level: Number(editForm.level) });
    }
    setEditingId(null);
  };

  const handleEditCancel = (e) => {
    e.stopPropagation();
    setEditingId(null);
  };

  return (
    <div className="character-list-container">
      <header className="list-header">
        <div>
          <h2>Your Characters</h2>
          {isReordering && <span className="reorder-hint">Drag to reorder</span>}
        </div>
        <button onClick={onAdd} className="btn-small">
          <Icons.Plus />
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
            {editingId === char.id ? (
              <div className="char-edit-form" onClick={(e) => e.stopPropagation()}>
                <label className="char-edit-field">
                  <span>Name</span>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && handleEditSave(e, char.id)}
                    placeholder="Character Name"
                    autoFocus
                  />
                </label>
                <label className="char-edit-field">
                  <span>Level</span>
                  <input
                    type="number"
                    value={editForm.level}
                    onChange={(e) => setEditForm({ ...editForm, level: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && handleEditSave(e, char.id)}
                    placeholder="Level"
                    min="260"
                    max="300"
                  />
                </label>
                <div className="char-edit-actions">
                  <button className="btn-small btn-primary" onClick={(e) => handleEditSave(e, char.id)}>
                    Save
                  </button>
                  <button className="btn-small" onClick={handleEditCancel}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="char-info">
                  <h3>{char.name}</h3>
                  <span className="char-job">{char.job}</span>
                </div>
                <div className="char-meta">
                  <span>Lv. {char.level}</span>
                  <button className="btn-edit" onClick={(e) => handleEditClick(e, char)} title="Edit Character">
                    <Icons.Edit size={14} />
                  </button>
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
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
