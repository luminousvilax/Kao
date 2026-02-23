import { useState } from 'react';
import { JOB_GROUPS } from '../data/jobs';
import './CharacterCreator.css';

export function CharacterCreator({ onCreate, onCancel }) {
  const [name, setName] = useState('');
  const [jobGroup, setJobGroup] = useState('All');
  const [job, setJob] = useState(Object.values(JOB_GROUPS)[0][0]);
  const [level, setLevel] = useState(260);

  const handleGroupChange = (e) => {
    const group = e.target.value;
    setJobGroup(group);
    if (group === 'All') {
      setJob(Object.values(JOB_GROUPS)[0][0]);
    } else {
      setJob(JOB_GROUPS[group][0]);
    }
  };

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
            <label>Job Group</label>
            <select value={jobGroup} onChange={handleGroupChange}>
              <option value="All">All Groups</option>
              {Object.keys(JOB_GROUPS).map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Job / Class</label>
            <select value={job} onChange={e => setJob(e.target.value)}>
              {jobGroup === 'All' ? (
                Object.entries(JOB_GROUPS).map(([groupName, jobs]) => (
                  <optgroup key={groupName} label={groupName}>
                    {jobs.map(j => (
                      <option key={j} value={j}>{j}</option>
                    ))}
                  </optgroup>
                ))
              ) : (
                JOB_GROUPS[jobGroup].map(j => (
                  <option key={j} value={j}>{j}</option>
                ))
              )}
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
