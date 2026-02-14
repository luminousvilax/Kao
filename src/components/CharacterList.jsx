import './CharacterList.css';

export function CharacterList({ characters, activeId, onSelect, onAdd }) {
  const list = Object.values(characters);

  if (list.length === 0) {
    return (
      <div className="empty-state">
        <p>No characters tracked yet.</p>
        <button onClick={onAdd} className="btn-primary">Create Your First Character</button>
      </div>
    );
  }

  return (
    <div className="character-list-container">
      <header className="list-header">
        <h2>Your Characters</h2>
        <button onClick={onAdd} className="btn-small">+ Add New</button>
      </header>
      
      <div className="character-cards">
        {list.map(char => (
          <div 
            key={char.id} 
            className={`char-card ${char.id === activeId ? 'active' : ''}`}
            onClick={() => onSelect(char.id)}
          >
            <div className="char-info">
              <h3>{char.name}</h3>
              <span className="char-job">{char.job}</span>
            </div>
            <div className="char-meta">
              Lv. {char.level}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
