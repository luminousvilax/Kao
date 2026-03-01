import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GlobalSettingsMenu } from '../components/GlobalSettingsMenu';

vi.mock('../components/Icons', () => ({
  Icons: {
    Settings: () => <span data-testid="icon-settings">Settings</span>,
    Upload: () => <span data-testid="icon-upload">Upload</span>,
    Download: () => <span data-testid="icon-download">Download</span>,
  },
}));

describe('GlobalSettingsMenu', () => {
  const mockOnImport = vi.fn();
  const mockState = {
    characters: {
      1: { name: 'TestChar', job: 'Hero' },
    },
  };

  // FileReader mock
  const originalFileReader = window.FileReader;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock FileReader to control async behavior
    window.FileReader = vi.fn();
    window.FileReader.mockImplementation(function () {
      this.readAsText = vi.fn((file) => {
        // Read the file content and trigger onload
        file
          .text()
          .then((text) => {
            this.result = text;
            if (this.onload) this.onload({ target: { result: this.result } });
          })
          .catch((err) => {
            if (this.onerror) this.onerror(err);
          });
      });
      this.result = null;
      this.onload = null;
      this.onerror = null;
    });
  });

  afterEach(() => {
    window.FileReader = originalFileReader;
    vi.restoreAllMocks();
  });

  it('renders settings button but menu is hidden initially', () => {
    render(<GlobalSettingsMenu state={mockState} onImport={mockOnImport} />);
    expect(screen.getByTestId('icon-settings')).toBeInTheDocument();
    expect(screen.queryByText('Import Data')).not.toBeInTheDocument();
  });

  it('opens menu on click', () => {
    render(<GlobalSettingsMenu state={mockState} onImport={mockOnImport} />);
    fireEvent.click(screen.getByTestId('icon-settings').closest('button'));
    expect(screen.getByText('Import Data')).toBeInTheDocument();
    expect(screen.getByText('Export Data')).toBeInTheDocument();
  });

  it('closes menu on another click', () => {
    render(<GlobalSettingsMenu state={mockState} onImport={mockOnImport} />);
    const btn = screen.getByTestId('icon-settings').closest('button');
    fireEvent.click(btn); // Open
    expect(screen.getByText('Import Data')).toBeInTheDocument();
    fireEvent.click(btn); // Close
    expect(screen.queryByText('Import Data')).not.toBeInTheDocument();
  });

  it('closes menu when clicking outside', () => {
    render(
      <div>
        <div data-testid="outside">Outside</div>
        <GlobalSettingsMenu state={mockState} onImport={mockOnImport} />
      </div>
    );
    fireEvent.click(screen.getByTestId('icon-settings').closest('button')); // Open
    expect(screen.getByText('Import Data')).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(screen.queryByText('Import Data')).not.toBeInTheDocument();
  });

  it('handles export data', () => {
    // Mock URL.createObjectURL and URL.revokeObjectURL
    const mockCreateObjectURL = vi.fn(() => 'blob:url');
    const mockRevokeObjectURL = vi.fn();
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;

    // Mock document.createElement and body.appendChild logic for download
    const link = document.createElement('a');
    vi.spyOn(link, 'click');

    const originalCreateElement = document.createElement.bind(document);
    const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'a') return link;
      return originalCreateElement(tagName);
    });

    const appendChildSpy = vi.spyOn(document.body, 'appendChild');
    const removeChildSpy = vi.spyOn(document.body, 'removeChild');

    render(<GlobalSettingsMenu state={mockState} onImport={mockOnImport} />);
    fireEvent.click(screen.getByTestId('icon-settings').closest('button')); // Open
    fireEvent.click(screen.getByText('Export Data'));

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(link.download).toBe('maplestory-hexa-tracker-data.json');
    expect(link.click).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalled();

    expect(screen.queryByText('Export Data')).not.toBeInTheDocument(); // Should close menu

    // Cleanup mocks
    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });

  it('triggers file input click when Import Data is clicked', () => {
    render(<GlobalSettingsMenu state={mockState} onImport={mockOnImport} />);
    fireEvent.click(screen.getByTestId('icon-settings').closest('button')); // Open

    // Spy on the file input click
    const input = document.querySelector('input[type="file"]');
    const clickSpy = vi.spyOn(input, 'click');

    fireEvent.click(screen.getByText('Import Data'));
    expect(clickSpy).toHaveBeenCalled();
  });

  it('imports valid JSON data', async () => {
    const importData = { characters: { 2: { name: 'New' } } };
    const file = new File([JSON.stringify(importData)], 'data.json', { type: 'application/json' });

    render(<GlobalSettingsMenu state={mockState} onImport={mockOnImport} />);
    const input = document.querySelector('input[type="file"]');

    await waitFor(() => {
      fireEvent.change(input, { target: { files: [file] } });
    });

    await waitFor(() => {
      expect(mockOnImport).toHaveBeenCalledWith(importData);
    });
  });

  it('alerts on invalid JSON format', async () => {
    const file = new File(['{ invalid json }'], 'data.json', { type: 'application/json' });
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const consoleMock = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<GlobalSettingsMenu state={mockState} onImport={mockOnImport} />);
    const input = document.querySelector('input[type="file"]');

    await waitFor(() => {
      fireEvent.change(input, { target: { files: [file] } });
    });

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Failed to parse JSON file.');
      expect(mockOnImport).not.toHaveBeenCalled();
    });

    alertMock.mockRestore();
    consoleMock.mockRestore();
  });

  it('alerts on missing characters data', async () => {
    const invalidSchema = { foo: 'bar' };
    const file = new File([JSON.stringify(invalidSchema)], 'data.json', { type: 'application/json' });
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<GlobalSettingsMenu state={mockState} onImport={mockOnImport} />);
    const input = document.querySelector('input[type="file"]');

    await waitFor(() => {
      fireEvent.change(input, { target: { files: [file] } });
    });

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Invalid data format. Missing characters data.');
    });
    expect(mockOnImport).not.toHaveBeenCalled();

    alertMock.mockRestore();
  });
});
