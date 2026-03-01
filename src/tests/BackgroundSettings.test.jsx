import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BackgroundSettings } from '../components/BackgroundSettings';
import { BACKGROUND_CONFIG } from '../data/constants';
import * as imageUtils from '../lib/imageUtils';

// Mock Icons
vi.mock('../components/Icons', () => ({
  Icons: {
    Image: () => <span data-testid="icon-image">Image</span>,
    HelpCircle: () => <span data-testid="icon-help">Help</span>,
    Close: () => <span data-testid="icon-close">Close</span>,
    Upload: () => <span data-testid="icon-upload">Upload</span>,
    Trash: () => <span data-testid="icon-trash">Trash</span>,
  },
}));

// Mock compressImage
vi.mock('../lib/imageUtils', () => ({
  compressImage: vi.fn(),
}));

describe('BackgroundSettings', () => {
  const mockOnUpdate = vi.fn();
  const defaultBackground = {
    url: null,
    opacity: BACKGROUND_CONFIG.DEFAULT_OPACITY,
    blur: BACKGROUND_CONFIG.DEFAULT_BLUR,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the floating action button (FAB) initially', () => {
    render(<BackgroundSettings background={defaultBackground} onUpdate={mockOnUpdate} />);
    expect(screen.getByTestId('icon-image')).toBeInTheDocument();
    expect(screen.queryByText('Background Settings')).not.toBeInTheDocument();
  });

  it('opens the menu when FAB is clicked', () => {
    render(<BackgroundSettings background={defaultBackground} onUpdate={mockOnUpdate} />);
    fireEvent.click(screen.getByTestId('icon-image').closest('button'));
    expect(screen.getByText('Background Settings')).toBeInTheDocument();
  });

  it('closes the menu when close button is clicked', () => {
    render(<BackgroundSettings background={defaultBackground} onUpdate={mockOnUpdate} />);
    fireEvent.click(screen.getByTestId('icon-image').closest('button')); // Open
    fireEvent.click(screen.getByTestId('icon-close').closest('button')); // Close
    expect(screen.queryByText('Background Settings')).not.toBeInTheDocument();
  });

  it('toggles help text', () => {
    render(<BackgroundSettings background={defaultBackground} onUpdate={mockOnUpdate} />);
    fireEvent.click(screen.getByTestId('icon-image').closest('button')); // Open

    expect(screen.queryByText('Customize your dashboard background:')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('icon-help').closest('button')); // Toggle Help
    expect(screen.getByText('Customize your dashboard background:')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('icon-help').closest('button')); // Toggle Help off
    expect(screen.queryByText('Customize your dashboard background:')).not.toBeInTheDocument();
  });

  it('updates opacity', () => {
    render(<BackgroundSettings background={defaultBackground} onUpdate={mockOnUpdate} />);
    fireEvent.click(screen.getByTestId('icon-image').closest('button')); // Open

    const opacitySlider = screen.getAllByRole('slider')[0]; // First slider is opacity based on order
    fireEvent.change(opacitySlider, { target: { value: '0.5' } });

    expect(mockOnUpdate).toHaveBeenCalledWith({ ...defaultBackground, opacity: 0.5 });
  });

  it('updates blur', () => {
    render(<BackgroundSettings background={defaultBackground} onUpdate={mockOnUpdate} />);
    fireEvent.click(screen.getByTestId('icon-image').closest('button')); // Open

    const blurSlider = screen.getAllByRole('slider')[1]; // Second slider is blur
    fireEvent.change(blurSlider, { target: { value: '5' } });

    expect(mockOnUpdate).toHaveBeenCalledWith({ ...defaultBackground, blur: 5 });
  });

  it('handles file upload successfully', async () => {
    const file = new File(['(⌐□_□)'], 'cool-bg.png', { type: 'image/png' });
    const compressedUrl = 'data:image/png;base64,compressed';
    imageUtils.compressImage.mockResolvedValue(compressedUrl);

    render(<BackgroundSettings background={defaultBackground} onUpdate={mockOnUpdate} />);
    fireEvent.click(screen.getByTestId('icon-image').closest('button')); // Open

    // Find the hidden input
    // Since it has display: none, it's not accessible via normal queries easily without hidden: true
    // Adding data-testid would be best, but for now we can find by display value or selector
    const input = document.querySelector('input[type="file"][accept="image/*"]');

    // Simulate user upload
    await waitFor(() => {
      fireEvent.change(input, { target: { files: [file] } });
    });

    expect(imageUtils.compressImage).toHaveBeenCalledWith(file);
    expect(mockOnUpdate).toHaveBeenCalledWith({ ...defaultBackground, url: compressedUrl });
  });

  it('handles file upload rejection (too large)', async () => {
    const largeFile = { size: BACKGROUND_CONFIG.FILE_SIZE_LIMIT + 1 };
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<BackgroundSettings background={defaultBackground} onUpdate={mockOnUpdate} />);
    fireEvent.click(screen.getByTestId('icon-image').closest('button')); // Open

    const input = document.querySelector('input[type="file"][accept="image/*"]');

    // We can't easily create a real large file in jsdom, so we mock the event target property access in a simplified way or just pass a mock object if possible.
    // However, fireEvent.change takes a target object that overrides properties.
    fireEvent.change(input, { target: { files: [largeFile] } });

    expect(alertMock).toHaveBeenCalledWith(expect.stringContaining('File is too large'));
    expect(imageUtils.compressImage).not.toHaveBeenCalled();
    alertMock.mockRestore();
  });

  it('handles image compression failure', async () => {
    const file = new File(['bad'], 'bad.png', { type: 'image/png' });
    imageUtils.compressImage.mockRejectedValue(new Error('Compression failed'));
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const consoleMock = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<BackgroundSettings background={defaultBackground} onUpdate={mockOnUpdate} />);
    fireEvent.click(screen.getByTestId('icon-image').closest('button')); // Open

    const input = document.querySelector('input[type="file"][accept="image/*"]');
    await waitFor(() => {
      fireEvent.change(input, { target: { files: [file] } });
    });

    expect(imageUtils.compressImage).toHaveBeenCalled();
    expect(alertMock).toHaveBeenCalledWith('Failed to process image.');

    alertMock.mockRestore();
    consoleMock.mockRestore();
  });

  it('resets background', () => {
    const bgWithImage = { ...defaultBackground, url: 'some-url' };
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<BackgroundSettings background={bgWithImage} onUpdate={mockOnUpdate} />);
    fireEvent.click(screen.getByTestId('icon-image').closest('button')); // Open

    fireEvent.click(screen.getByText('Remove Background'));

    expect(mockOnUpdate).toHaveBeenCalledWith({
      url: null,
      opacity: BACKGROUND_CONFIG.DEFAULT_OPACITY,
      blur: BACKGROUND_CONFIG.DEFAULT_BLUR,
    });
  });

  it('cancels reset background', () => {
    const bgWithImage = { ...defaultBackground, url: 'some-url' };
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(<BackgroundSettings background={bgWithImage} onUpdate={mockOnUpdate} />);
    fireEvent.click(screen.getByTestId('icon-image').closest('button')); // Open

    fireEvent.click(screen.getByText('Remove Background'));

    expect(mockOnUpdate).not.toHaveBeenCalled();
  });
});
