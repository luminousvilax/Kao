// Overwrite App.jsx with clean V2 version
import { useState, useEffect } from 'react';
import { loadState, saveState } from './lib/storage';
import { CharacterList } from './components/CharacterList';
import { CharacterCreator } from './components/CharacterCreator';
import { HexaGrid } from './components/HexaGrid';
import { PriorityList } from './components/PriorityList';
import { createCharacter } from './lib/stateSchema';
// CSS imports are global in main.jsx usually, or we can import local styles here if we move them
import './styles/app.css';

function App() {
  const [state, setState] = useState(() => loadState());
  const [showCreator, setShowCreator] = useState(false);

  // Auto-save
  useEffect(() => {
    saveState(state);
  }, [state]);

  // -- Handlers --

  const handleCreateChar = ({ name, job, level }) => {
    const newChar = createCharacter(name, job, level);
    setState(prev => ({
      ...prev,
      characters: {
        ...prev.characters,
        [newChar.id]: newChar
      },
      characterOrder: [...(prev.characterOrder || []), newChar.id],
      activeCharacterId: newChar.id
    }));
    setShowCreator(false);
  };

  const handleSelectChar = (id) => {
    setState(prev => ({ ...prev, activeCharacterId: id }));
  };

  const handleDeleteChar = (id) => {
    const charName = state.characters[id]?.name;
    if (window.confirm(`Are you sure you want to delete ${charName}?\nAll progress will be lost.`)) {
      setState(prev => {
        const nextChars = { ...prev.characters };
        delete nextChars[id];
        return {
          ...prev,
          characters: nextChars,
          characterOrder: (prev.characterOrder || []).filter(cid => cid !== id),
          activeCharacterId: prev.activeCharacterId === id ? null : prev.activeCharacterId
        };
      });
    }
  };

  const handleSwapChars = (fromIndex, toIndex) => {
    setState(prev => {
      const order = prev.characterOrder?.length 
        ? [...prev.characterOrder] 
        : Object.keys(prev.characters);
      
      const newOrder = [...order];
      const [moved] = newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, moved);
      return { ...prev, characterOrder: newOrder };
    });
  };

  const activeChar = state.activeCharacterId ? state.characters[state.activeCharacterId] : null;

  const handleHexaUpdate = (nodeId, level) => {
    if (!activeChar) return;
    const safeLevel = Math.max(0, Math.min(30, Number(level) || 0));

    setState(prev => ({
      ...prev,
      characters: {
        ...prev.characters,
        [activeChar.id]: {
          ...activeChar,
          skillProgress: {
            ...activeChar.skillProgress,
            [nodeId]: safeLevel
          }
        }
      }
    }));
  };

  const handleBack = () => {
    setState(prev => ({ ...prev, activeCharacterId: null }));
  };

  // -- Render --

  if (showCreator) {
    return (
      <CharacterCreator 
        onCancel={() => setShowCreator(false)} 
        onCreate={handleCreateChar} 
      />
    );
  }

  // If we have characters but no active one selected, show list
  // If we have NO characters at all, CharacterList handles the empty state
  if (!activeChar) {
    return (
      <div className="app-container">
        <header>
          <div className="header-content">
            <h1>MapleStory Hexa Tracker</h1>
          </div>
        </header>
        <main>
          <CharacterList 
            characters={state.characters}
            characterOrder={state.characterOrder}
            activeId={state.activeCharacterId}
            onSelect={handleSelectChar}
            onDelete={handleDeleteChar}
            onSwap={handleSwapChars}
            onAdd={() => setShowCreator(true)}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header>
        <div className="header-content">
          <h1>MapleStory Hexa Tracker</h1>
          <button onClick={handleBack} className="btn-secondary">← Back to List</button>
        </div>
      </header>

      <main>
        <div className="dashboard-header">
          <h2>{activeChar.name} <span className="job-tag">({activeChar.job})</span></h2>
        </div>
        
        <section className="tracker-card">
          <h3>Hexa Matrix Progress</h3>
          <p className="hint">Enter your current level (0-30) for each node.</p>
          <HexaGrid 
            progress={activeChar.skillProgress} 
            onUpdate={handleHexaUpdate} 
          />
        </section>

        <section className="tracker-card">
          <PriorityList 
            sequence={activeChar.prioritySequence} 
            progress={activeChar.skillProgress}
            onCompleteStep={handleHexaUpdate} 
          />
        </section>
      </main>
    </div>
  );
}

export default App;
