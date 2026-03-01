import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CharacterCreator } from '../components/CharacterCreator';

// Mock specific jobs
vi.mock('../data/jobs', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    JOB_GROUPS: {
      Explorers: ['Hero', 'Paladin'],
      Sengoku: ['Hayato', 'Kanna'],
    },
  };
});

describe('CharacterCreator', () => {
  const mockOnCreate = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<CharacterCreator onCreate={mockOnCreate} onCancel={mockOnCancel} />);
    expect(screen.getByText('Create New Character')).toBeInTheDocument();
    expect(screen.getByLabelText('Character Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Job Group')).toBeInTheDocument();
    expect(screen.getByLabelText('Job / Class')).toBeInTheDocument();
    expect(screen.getByLabelText('Current Level')).toBeInTheDocument();
  });

  it('updates inputs correctly', () => {
    render(<CharacterCreator onCreate={mockOnCreate} onCancel={mockOnCancel} />);

    const nameInput = screen.getByLabelText('Character Name');
    fireEvent.change(nameInput, { target: { value: 'TestChar' } });
    expect(nameInput.value).toBe('TestChar');

    const groupSelect = screen.getByLabelText('Job Group');
    fireEvent.change(groupSelect, { target: { value: 'Sengoku' } });
    expect(groupSelect.value).toBe('Sengoku');

    // Verify job list updates to Sengoku jobs (Hayato, Kanna)
    // And defaults to first one (Hayato)
    const jobSelect = screen.getByLabelText('Job / Class');
    expect(jobSelect.value).toBe('Hayato');

    // Change job within group
    fireEvent.change(jobSelect, { target: { value: 'Kanna' } });
    expect(jobSelect.value).toBe('Kanna');

    const levelInput = screen.getByLabelText('Current Level');
    fireEvent.change(levelInput, { target: { value: '280' } });
    expect(levelInput.value).toBe('280');
  });

  it('submits form with valid data', () => {
    render(<CharacterCreator onCreate={mockOnCreate} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByLabelText('Character Name'), { target: { value: 'MyHero' } });
    // Default group is 'All', default job is 'Hero' (first in Explorers)
    // But mock has Explorers first? Object.values might not guarantee order of mocked object keys
    // Let's force selection to be sure

    fireEvent.change(screen.getByLabelText('Job Group'), { target: { value: 'Explorers' } });
    fireEvent.change(screen.getByLabelText('Job / Class'), { target: { value: 'Hero' } });
    fireEvent.change(screen.getByLabelText('Current Level'), { target: { value: '265' } });

    const submitBtn = screen.getByText('Create Character');
    fireEvent.click(submitBtn);

    expect(mockOnCreate).toHaveBeenCalledWith({
      name: 'MyHero',
      job: 'Hero', // Should be 'Hero' based on mock
      level: 265,
    });
  });

  it('prevents submission with empty name', () => {
    render(<CharacterCreator onCreate={mockOnCreate} onCancel={mockOnCancel} />);

    const submitBtn = screen.getByText('Create Character');
    fireEvent.click(submitBtn);

    // Logic check: if (!name.trim()) return;
    expect(mockOnCreate).not.toHaveBeenCalled();
  });

  it('cancels creation', () => {
    render(<CharacterCreator onCreate={mockOnCreate} onCancel={mockOnCancel} />);

    const cancelBtn = screen.getByText('Cancel');
    fireEvent.click(cancelBtn);

    expect(mockOnCancel).toHaveBeenCalled();
  });
});
