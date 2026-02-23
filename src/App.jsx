// Overwrite App.jsx with clean V2 version
import { useState, useEffect, useRef } from 'react';
import { loadState, saveState } from './lib/storage';
import { CharacterList } from './components/CharacterList';
import { CharacterCreator } from './components/CharacterCreator';
import { HexaGrid } from './components/HexaGrid';
import { PriorityList } from './components/PriorityList';
import { createCharacter } from './lib/stateSchema';
import { getJobNodeData, SKILL_NODES } from './data/jobs';
import { getSequence } from './data/sequences';
import { Icons } from './components/Icons';
// CSS imports are global in main.jsx usually, or we can import local styles here if we move them
import './styles/app.css';

function GlobalSettingsMenu({ state, onImport }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'maplestory-hexa-tracker-data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
    setIsOpen(false);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedState = JSON.parse(e.target.result);
        if (importedState && importedState.characters) {
          onImport(importedState);
        } else {
          alert('Invalid data format. Missing characters data.');
        }
      } catch (err) {
        console.error(err);
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    // Reset input so the same file can be selected again if needed
    event.target.value = '';
  };

  return (
    <div className="settings-menu-container" ref={menuRef}>
      <button className="settings-btn" onClick={() => setIsOpen(!isOpen)} title="Settings">
        <Icons.Settings />
      </button>
      {isOpen && (
        <div className="settings-dropdown">
          <button onClick={handleImportClick}>
            <Icons.Upload />
            Import Data
          </button>
          <button onClick={handleExport}>
            <Icons.Download />
            Export Data
          </button>
        </div>
      )}
      <input type="file" accept=".json" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
    </div>
  );
}

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
    setState((prev) => ({
      ...prev,
      characters: {
        ...prev.characters,
        [newChar.id]: newChar,
      },
      characterOrder: [...(prev.characterOrder || []), newChar.id],
      activeCharacterId: newChar.id,
    }));
    setShowCreator(false);
  };

  const handleSelectChar = (id) => {
    setState((prev) => ({ ...prev, activeCharacterId: id }));
  };

  const handleDeleteChar = (id) => {
    const charName = state.characters[id]?.name;
    if (window.confirm(`Are you sure you want to delete ${charName}?\nAll progress will be lost.`)) {
      setState((prev) => {
        const nextChars = { ...prev.characters };
        delete nextChars[id];
        return {
          ...prev,
          characters: nextChars,
          characterOrder: (prev.characterOrder || []).filter((cid) => cid !== id),
          activeCharacterId: prev.activeCharacterId === id ? null : prev.activeCharacterId,
        };
      });
    }
  };

  const handleSwapChars = (fromIndex, toIndex) => {
    setState((prev) => {
      const order = prev.characterOrder?.length ? [...prev.characterOrder] : Object.keys(prev.characters);

      const newOrder = [...order];
      const [moved] = newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, moved);
      return { ...prev, characterOrder: newOrder };
    });
  };

  const handleUpdateChar = (id, updates) => {
    setState((prev) => ({
      ...prev,
      characters: {
        ...prev.characters,
        [id]: {
          ...prev.characters[id],
          ...updates,
        },
      },
    }));
  };

  const activeChar = state.activeCharacterId ? state.characters[state.activeCharacterId] : null;

  // Derive job-specific data
  const nodeMetadata = activeChar
    ? Object.keys(SKILL_NODES).reduce((acc, key) => {
        const node = SKILL_NODES[key];
        acc[node.id] = getJobNodeData(activeChar.job, node.id);
        return acc;
      }, {})
    : {};

  const activeSequence = activeChar ? activeChar.prioritySequence || getSequence(activeChar.job) : [];
  const isCustomSequence = activeChar && !!activeChar.prioritySequence;

  const handleHexaUpdate = (nodeId, level) => {
    if (!activeChar) return;
    const safeLevel = Math.max(0, Math.min(30, Number(level) || 0));

    setState((prev) => ({
      ...prev,
      characters: {
        ...prev.characters,
        [activeChar.id]: {
          ...activeChar,
          skillProgress: {
            ...activeChar.skillProgress,
            [nodeId]: safeLevel,
          },
        },
      },
    }));
  };

  const handleSequenceUpdate = (newSequence) => {
    if (!activeChar) return;
    setState((prev) => ({
      ...prev,
      characters: {
        ...prev.characters,
        [activeChar.id]: {
          ...activeChar,
          prioritySequence: newSequence,
        },
      },
    }));
  };

  const handleResetSequence = () => {
    if (!activeChar) return;
    // Remove the custom sequence so it falls back to default
    setState((prev) => {
      const nextChar = { ...activeChar };
      delete nextChar.prioritySequence;

      return {
        ...prev,
        characters: {
          ...prev.characters,
          [activeChar.id]: nextChar,
        },
      };
    });
  };

  const handleImportData = (importedState) => {
    if (window.confirm('Importing data will overwrite your current data. Are you sure you want to continue?')) {
      setState(importedState);
    }
  };

  const handleBack = () => {
    setState((prev) => ({ ...prev, activeCharacterId: null }));
  };

  // -- Render --

  if (showCreator) {
    return <CharacterCreator onCancel={() => setShowCreator(false)} onCreate={handleCreateChar} />;
  }

  // If we have characters but no active one selected, show list
  // If we have NO characters at all, CharacterList handles the empty state
  if (!activeChar) {
    return (
      <div className="app-container">
        <header>
          <div className="header-content">
            <h1>MapleStory Hexa Tracker</h1>
            <GlobalSettingsMenu state={state} onImport={handleImportData} />
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
            onUpdate={handleUpdateChar}
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
          <div className="header-actions-right">
            <button onClick={handleBack} className="btn-secondary">
              ← Back to List
            </button>
            {/* Remove global settings menu from here */}
          </div>
        </div>
      </header>

      <main>
        <div className="dashboard-header">
          <h2>
            {activeChar.name} <span className="job-tag">({activeChar.job})</span>
          </h2>
        </div>

        <section className="tracker-card">
          <h3>Hexa Matrix Progress</h3>
          <p className="hint">Enter your current level (0-30) for each node.</p>
          <HexaGrid progress={activeChar.skillProgress} onUpdate={handleHexaUpdate} nodeMetadata={nodeMetadata} />
        </section>

        <section className="tracker-card">
          <PriorityList
            sequence={activeSequence}
            progress={activeChar.skillProgress}
            onCompleteStep={handleHexaUpdate}
            nodeMetadata={nodeMetadata}
            isCustom={isCustomSequence}
            onUpdateSequence={handleSequenceUpdate}
            onResetSequence={handleResetSequence}
            job={activeChar.job}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
