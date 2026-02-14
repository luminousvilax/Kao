import { useState, useEffect } from 'react';
import { loadState, saveState } from './lib/storage';

function App() {
  const [data, setData] = useState(() => loadState());
  const [lastSaved, setLastSaved] = useState(null);

  const handleUpdate = (field, value) => {
    setData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setLastSaved(new Date());
  };

  const handleResourceUpdate = (resource, value) => {
    setData((prev) => ({
      ...prev,
      [resource]: parseInt(value) || 0,
    }));
    setLastSaved(new Date());
  };

  // Auto-save whenever data changes
  useEffect(() => {
    saveState(data);
  }, [data]);

  return (
    <div className='app-container'>
      <header>
        <h1>MapleStory Hexa Tracker</h1>
        <p>Track your Sol Erda and Fragment progress</p>
      </header>

      <main>
        <section className='tracker-card'>
          <h2>Character Info</h2>
          <div className='form-group'>
            <label>Character Name</label>
            <input
              type='text'
              value={data.characterName}
              onChange={(e) => handleUpdate('characterName', e.target.value)}
            />
          </div>
          <div className='form-group'>
            <label>Level</label>
            <input
              type='number'
              value={data.level}
              onChange={(e) => handleUpdate('level', parseInt(e.target.value) || 0)}
            />
          </div>
        </section>

        <section className='tracker-card'>
          <h2>Resources</h2>
          <div className='resources-grid'>
            <div className='form-group'>
              <label>Sol Erda Fragments</label>
              <input
                type='number'
                value={data.fragments}
                onChange={(e) => handleResourceUpdate('fragments', e.target.value)}
              />
            </div>
            <div className='form-group'>
              <label>Sol Erda Energy</label>
              <input
                type='number'
                value={data.dreamSolErda}
                onChange={(e) => handleResourceUpdate('dreamSolErda', e.target.value)}
              />
            </div>
          </div>
        </section>

        <div className='save-status'>
          {lastSaved && `Auto-saved at ${lastSaved.toLocaleTimeString()}`}
        </div>
      </main>
    </div>
  );
}

export default App;
