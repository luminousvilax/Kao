import { useState, useEffect, useRef } from 'react';
import { Icons } from './Icons';

export function GlobalSettingsMenu({ state, onImport }) {
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
