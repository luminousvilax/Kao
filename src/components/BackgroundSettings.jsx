import { useState, useEffect, useRef } from 'react';
import { BACKGROUND_CONFIG } from '../data/constants';
import { Icons } from './Icons';
import { compressImage } from '../lib/imageUtils';

export function BackgroundSettings({ background, onUpdate }) {
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
