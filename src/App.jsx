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
import { BACKGROUND_CONFIG } from './data/constants';
import { Icons } from './components/Icons';
import { compressImage } from './lib/imageUtils';
// CSS imports are global in main.jsx usually, or we can import local styles here if we move them
import './styles/app.css';

function BackgroundSettings({ background, onUpdate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const menuRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking the FAB itself
      if (menuRef.current && !menuRef.current.contains(event.target) && !event.target.closest('.bg-settings-fab')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > BACKGROUND_CONFIG.FILE_SIZE_LIMIT) {
      alert(`File is too large. Please pick an image under ${BACKGROUND_CONFIG.FILE_SIZE_LIMIT / (1024 * 1024)}MB.`);
      return;
    }

    try {
      const compressedDataUrl = await compressImage(file);
      onUpdate({ ...background, url: compressedDataUrl });
      setIsOpen(false);
    } catch (err) {
      console.error('Failed to process image', err);
      alert('Failed to process image.');
    } finally {
      event.target.value = '';
    }
  };

  const handleOpacityChange = (e) => {
    onUpdate({ ...background, opacity: Number(e.target.value) });
  };

  const handleBlurChange = (e) => {
    onUpdate({ ...background, blur: Number(e.target.value) });
  };

  const handleReset = () => {
    if (window.confirm('Reset background to default?')) {
      onUpdate({ url: null, opacity: BACKGROUND_CONFIG.DEFAULT_OPACITY, blur: BACKGROUND_CONFIG.DEFAULT_BLUR });
      setIsOpen(false);
    }
  };

  return (
    <>
      <button className="bg-settings-fab" onClick={() => setIsOpen(!isOpen)} title="Customize Background">
        <Icons.Image />
      </button>

      {isOpen && (
        <div className="bg-settings-menu" ref={menuRef}>
          <div className="bg-menu-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>Background Settings</span>
              <button
                className="help-button"
                onClick={() => setShowHelp(!showHelp)}
                title={showHelp ? 'Hide Help' : 'Show Help'}
              >
                <Icons.HelpCircle size={16} />
              </button>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4 }}
            >
              <Icons.Close size={16} />
            </button>
          </div>

          {showHelp && (
            <div className="help-text">
              <p>Customize your dashboard background:</p>
              <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
                <li>
                  <strong>Image:</strong> Upload a custom image (max {BACKGROUND_CONFIG.FILE_SIZE_LIMIT / (1024 * 1024)}
                  MB). 1920x1080, &lt;2MB recommended.
                </li>
                <li>
                  <strong>Opacity:</strong> Adjust background brightness.
                </li>
                <li>
                  <strong>Blur:</strong> Soften the background image.
                </li>
              </ul>
            </div>
          )}

          <div className="bg-menu-section">
            <button className="bg-action-btn" onClick={() => fileInputRef.current?.click()}>
              <Icons.Upload size={16} />
              Set Background Image
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>

          <div className="bg-menu-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <label className="bg-menu-label">Opacity</label>
              <span className="opacity-value">
                {Math.round((background?.opacity ?? BACKGROUND_CONFIG.DEFAULT_OPACITY) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={background?.opacity ?? BACKGROUND_CONFIG.DEFAULT_OPACITY}
              onChange={handleOpacityChange}
              className="opacity-slider"
            />
          </div>

          <div className="bg-menu-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <label className="bg-menu-label">Blur Radius</label>
              <span className="opacity-value">{background?.blur ?? BACKGROUND_CONFIG.DEFAULT_BLUR}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={background?.blur ?? BACKGROUND_CONFIG.DEFAULT_BLUR}
              onChange={handleBlurChange}
              className="opacity-slider"
            />
          </div>
          {background?.url && (
            <div className="bg-menu-section" style={{ marginTop: '0.5rem' }}>
              <button className="bg-action-btn danger" onClick={handleReset}>
                <Icons.Trash size={16} />
                Remove Background
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

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

// Helper to generate URL-safe slugs
// Format: Job-CharacterName (e.g., #Hero-Mapler)
const getSlug = (char) => {
  if (!char) return '';
  const safeJob = char.job.replace(/\s+/g, '-');
  const safeName = char.name.replace(/\s+/g, '-');
  return `${safeJob}-${safeName}`;
};

// Helper to find ID from slug
const findIdBySlug = (slug, characters) => {
  if (!slug) return null;

  const targetSlug = decodeURIComponent(slug).toLowerCase();

  return (
    Object.values(characters).find((char) => {
      const charSlug = getSlug(char).toLowerCase();
      return charSlug === targetSlug;
    })?.id || null
  );
};

function App() {
  const [state, setState] = useState(() => loadState());
  const [showCreator, setShowCreator] = useState(false);

  // Auto-save
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Sync hash with activeCharacterId
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const foundId = findIdBySlug(hash, state.characters);

      setState((prev) => {
        if (prev.activeCharacterId !== foundId) {
          return {
            ...prev,
            activeCharacterId: foundId,
          };
        }
        return prev;
      });
    };

    window.addEventListener('hashchange', handleHashChange);

    // Sync initial hash on load
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash) {
      handleHashChange();
      // Validate immediate outcome for initial load:
      // If the hash didn't resolve to a valid ID, clear it to avoid confusing state
      const resolvedId = findIdBySlug(initialHash, state.characters);
      if (!resolvedId) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    } else if (state.activeCharacterId) {
      // If we have an active ID from state but no hash, set the hash
      const char = state.characters[state.activeCharacterId];
      if (char) {
        window.history.replaceState(null, '', `#${getSlug(char)}`);
      }
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [state.characters, state.activeCharacterId]);

  // Cleanup active ID if it no longer exists
  useEffect(() => {
    if (state.activeCharacterId && !state.characters[state.activeCharacterId]) {
      // Character was deleted or invalid state
      // Clear hash if it matches the (now deleted) character's slug OR id
      // Since we can't easily regenerate slug for deleted char, we check if current hash resolves to nothing
      const hash = window.location.hash.replace('#', '');
      const foundId = findIdBySlug(hash, state.characters);

      if (!foundId && hash) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }

      const timer = setTimeout(() => {
        setState((prev) => ({ ...prev, activeCharacterId: null }));
      }, 0);
      return () => clearTimeout(timer);
    } else if (state.activeCharacterId) {
      // Ensure URL hash matches current active character (e.g. after rename or load)
      const char = state.characters[state.activeCharacterId];
      const correctHash = `#${getSlug(char)}`;
      if (window.location.hash !== correctHash) {
        window.history.replaceState(null, '', correctHash);
      }
    }
  }, [state.activeCharacterId, state.characters]);

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
    window.location.hash = getSlug(newChar);
    setShowCreator(false);
  };

  const handleSelectChar = (id) => {
    const char = state.characters[id];
    if (char) {
      window.location.hash = getSlug(char);
    }
  };

  const handleDeleteChar = (id) => {
    const charName = state.characters[id]?.name;
    if (window.confirm(`Are you sure you want to delete ${charName}?\nAll progress will be lost.`)) {
      setState((prev) => {
        const nextChars = { ...prev.characters };
        delete nextChars[id];

        const isActive = prev.activeCharacterId === id;
        if (isActive) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }

        return {
          ...prev,
          characters: nextChars,
          characterOrder: (prev.characterOrder || []).filter((cid) => cid !== id),
          activeCharacterId: isActive ? null : prev.activeCharacterId,
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

  // -- Background Management --
  useEffect(() => {
    const bgUrl = state.background?.url;
    const opacity = state.background?.opacity ?? BACKGROUND_CONFIG.DEFAULT_OPACITY;
    const blur = state.background?.blur ?? BACKGROUND_CONFIG.DEFAULT_BLUR;

    if (bgUrl) {
      document.body.style.backgroundImage = `url(${bgUrl})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundAttachment = 'fixed';
      document.body.style.backgroundPosition = 'center';
    } else {
      document.body.style.backgroundImage = 'none';
    }

    // Apply transparency and blur
    document.documentElement.style.setProperty('--bg-opacity', opacity);
    document.documentElement.style.setProperty('--bg-blur', `${blur}px`);

    return () => {
      document.body.style.backgroundImage = '';
      document.documentElement.style.removeProperty('--bg-opacity');
      document.documentElement.style.removeProperty('--bg-blur');
    };
  }, [state.background]);

  const handleBackgroundUpdate = (newSettings) => {
    setState((prev) => ({
      ...prev,
      background: {
        ...prev.background,
        ...newSettings,
      },
    }));
  };

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

  const hasChars = Object.keys(state.characters || {}).length > 0;

  const handleImportData = (importedState) => {
    if (hasChars) {
      if (!window.confirm('Importing data will OVERWRITE your current data.\nAre you sure you want to continue?'))
        return;
    }
    setState(importedState);
  };

  const handleBack = () => {
    // Clear the hash cleanly without leaving a trailing '#' in the URL
    window.history.pushState(null, '', window.location.pathname + window.location.search);
    setState((prev) => ({ ...prev, activeCharacterId: null }));
  };

  // If we have characters but no active one selected, show list
  // If we have NO characters at all, CharacterList handles the empty state
  if (!activeChar) {
    return (
      <>
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
          {showCreator && <CharacterCreator onCancel={() => setShowCreator(false)} onCreate={handleCreateChar} />}
        </div>
        <BackgroundSettings background={state.background} onUpdate={handleBackgroundUpdate} />
      </>
    );
  }

  return (
    <>
      <div className="app-container">
        <header>
          <div className="header-content">
            <h1>MapleStory Hexa Tracker</h1>
            <div className="header-actions-right">
              <button onClick={handleBack} className="btn-secondary">
                ← Back to List
              </button>
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
        {showCreator && <CharacterCreator onCancel={() => setShowCreator(false)} onCreate={handleCreateChar} />}
      </div>
      <BackgroundSettings background={state.background} onUpdate={handleBackgroundUpdate} />
    </>
  );
}

export default App;
