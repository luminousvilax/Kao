import { useState } from 'react';
import { JOBS } from '../data/jobs'; // array of strings
import './CharacterCreator.css';

export function CharacterCreator({ onCreate, onCancel }) {
  const [name, setName] = useState('');
  const [job, setJob] = useState(JOBS[0]);
  const [level, setLevel] = useState(260);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({ name, job, level: Number(level) });
  };

  return (
    <div className="char-creator-modal">
      <div className="char-creator-content">
        <h2>Create New Character</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Character Name</label>
            <input 
              autoFocus
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="e.g. Mapler"
              required 
            />
          </div>

          <div className="form-group">
            <label>Job / Class</label>
            <select value={job} onChange={e => setJob(e.target.value)}>
              {JOBS.map(j => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Current Level</label>
            <input 
              type="number" 
              min={260} 
              max={300} 
              value={level} 
              onChange={e => setLevel(e.target.value)} 
            />
          </div>

          <div className="actions">
            <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Create Character</button>
          </div>
        </form>
      </div>
    </div>
  );
}
