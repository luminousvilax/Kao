import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HexaGrid } from '../components/HexaGrid';

describe('HexaGrid', () => {
  const mockOnUpdate = vi.fn();
  const mockProgress = {
    origin: 10,
    mastery: 5,
  };

  const mockNodes = {
    origin: {
      id: 'origin',
      type: 'skill',
      label: 'Origin',
      icon: 'http://example.com/origin.png',
      displayName: 'Origin Skill',
    },
    mastery: { id: 'mastery', type: 'mastery', label: 'Mastery', icon: '⚔️', displayName: 'Mastery Core' },
    stat: { id: 'stat', type: 'stat', label: 'Stat', icon: 'S' }, // Should be filtered out
  };

  it('renders nodes grouped by type', () => {
    render(<HexaGrid progress={mockProgress} onUpdate={mockOnUpdate} nodeMetadata={mockNodes} />);

    // Stat node should be filtered out
    expect(screen.queryByText('Stat')).not.toBeInTheDocument();

    // Origin and Mastery should be present
    expect(screen.getByText('Mastery Core')).toBeInTheDocument();

    // Check for Origin image
    const img = screen.getByAltText('Origin Skill');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'http://example.com/origin.png');
  });

  it('displays current progress levels', () => {
    render(<HexaGrid progress={mockProgress} onUpdate={mockOnUpdate} nodeMetadata={mockNodes} />);

    // Inputs should have values
    const inputs = screen.getAllByRole('spinbutton');

    // There are 2 rendered nodes.
    // Origin (10), Mastery (5)

    // Find input for Mastery (closest to the text)
    // Since we can't easily associate input to label without more generic selectors or aria-labels in component,
    // we can check if values exist in any input.

    const value10 = inputs.find((i) => i.value === '10');
    const value5 = inputs.find((i) => i.value === '5');

    expect(value10).toBeInTheDocument();
    expect(value5).toBeInTheDocument();
  });

  it('updates level on valid input change', () => {
    render(<HexaGrid progress={mockProgress} onUpdate={mockOnUpdate} nodeMetadata={mockNodes} />);

    const inputs = screen.getAllByRole('spinbutton');
    const input = inputs[0]; // Just pick one

    fireEvent.change(input, { target: { value: '20' } });

    expect(mockOnUpdate).toHaveBeenCalled();
    // Since we don't know which node inputs[0] corresponds to (order in object values),
    // we check calledWith signature generally.
    // But likely it is Origin or Mastery.
  });

  it('clamps values on blur', () => {
    render(<HexaGrid progress={mockProgress} onUpdate={mockOnUpdate} nodeMetadata={mockNodes} />);

    const inputs = screen.getAllByRole('spinbutton');
    const input = inputs[0];

    // Clear mock
    mockOnUpdate.mockClear();

    // Type too high value
    fireEvent.change(input, { target: { value: '50' } });
    // onChange logic: checks if <= max. 50 > 30, so onChange callback is NOT fired?
    // Let's check logic: if (!isNaN(numVal) && numVal >= min && numVal <= max) onChange(numVal);
    // So 50 is ignored by immediate onChange updates.
    expect(mockOnUpdate).not.toHaveBeenCalled();

    // Setup mock for blur

    // Blur
    fireEvent.blur(input);

    // On blur: Clamps to max (30) and calls onChange
    expect(mockOnUpdate).toHaveBeenCalledWith(expect.any(String), 30);
  });

  it('clamps negative values on blur', () => {
    render(<HexaGrid progress={mockProgress} onUpdate={mockOnUpdate} nodeMetadata={mockNodes} />);

    const inputs = screen.getAllByRole('spinbutton');
    const input = inputs[0];
    mockOnUpdate.mockClear();

    fireEvent.change(input, { target: { value: '-5' } });
    expect(mockOnUpdate).not.toHaveBeenCalled(); // invalid range

    fireEvent.blur(input);
    expect(mockOnUpdate).toHaveBeenCalledWith(expect.any(String), 0); // min is 0
  });

  it('handles empty input', () => {
    render(<HexaGrid progress={mockProgress} onUpdate={mockOnUpdate} nodeMetadata={mockNodes} />);

    const input = screen.getAllByRole('spinbutton')[0];
    mockOnUpdate.mockClear();

    fireEvent.change(input, { target: { value: '' } });
    // onChange allows empty string to update local state but NOT parent
    expect(mockOnUpdate).not.toHaveBeenCalled();

    fireEvent.blur(input);
    // On blur, empty string (NaN) -> 0 -> clamped to 0 -> update parent
    expect(mockOnUpdate).toHaveBeenCalledWith(expect.any(String), 0);
  });
});
