import { render, screen, fireEvent, act } from '@testing-library/react';
import { CharacterList } from '../components/CharacterList';
import { vi, describe, it, expect, beforeEach } from 'vitest';

const mockCharacters = {
  'char-1': { id: 'char-1', name: 'MyHero', job: 'Hero', level: 260 },
  'char-2': { id: 'char-2', name: 'MyBishop', job: 'Bishop', level: 275 },
};

const mockOrder = ['char-1', 'char-2'];

describe('CharacterList', () => {
  const defaultProps = {
    characters: mockCharacters,
    characterOrder: mockOrder,
    activeId: null,
    onSelect: vi.fn(),
    onDelete: vi.fn(),
    onSwap: vi.fn(),
    onAdd: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty state when no characters are present', () => {
    render(<CharacterList {...defaultProps} characters={{}} characterOrder={[]} />);
    expect(screen.getByText(/No characters tracked yet/i)).toBeInTheDocument();
    expect(screen.getByText(/Create Your First Character/i)).toBeInTheDocument();
  });

  it('renders character cards correctly', () => {
    render(<CharacterList {...defaultProps} />);
    expect(screen.getByText('MyHero')).toBeInTheDocument();
    expect(screen.getByText('Hero')).toBeInTheDocument();
    expect(screen.getByText('MyBishop')).toBeInTheDocument();
    expect(screen.getByText('Bishop')).toBeInTheDocument();
    expect(screen.getByText('Lv. 260')).toBeInTheDocument();
    expect(screen.getByText('Lv. 275')).toBeInTheDocument();
  });

  it('calls onAdd when "Add New" button is clicked', () => {
    render(<CharacterList {...defaultProps} />);
    const addButton = screen.getByRole('button', { name: /add new/i });
    fireEvent.click(addButton);
    expect(defaultProps.onAdd).toHaveBeenCalled();
  });

  it('calls onSelect when a character card is clicked', () => {
    render(<CharacterList {...defaultProps} />);
    const heroCard = screen.getByText('MyHero').closest('.char-card');
    fireEvent.click(heroCard);
    expect(defaultProps.onSelect).toHaveBeenCalledWith('char-1');
  });

  it('calls onDelete when delete button is clicked', () => {
    render(<CharacterList {...defaultProps} />);
    const deleteButtons = screen.getAllByTitle('Delete Character');
    fireEvent.click(deleteButtons[0]);
    expect(defaultProps.onDelete).toHaveBeenCalledWith('char-1');
    // Ensure onSelect was not called due to propagation
    expect(defaultProps.onSelect).not.toHaveBeenCalled();
  });

  it('highlights the active character', () => {
    render(<CharacterList {...defaultProps} activeId="char-2" />);
    const bishopCard = screen.getByText('MyBishop').closest('.char-card');
    expect(bishopCard).toHaveClass('active');
  });

  it('enters edit mode when edit button is clicked', () => {
    render(<CharacterList {...defaultProps} />);
    const editButtons = screen.getAllByTitle('Edit Character');
    fireEvent.click(editButtons[0]);

    expect(screen.getByPlaceholderText('Character Name')).toHaveValue('MyHero');
    expect(screen.getByPlaceholderText('Level')).toHaveValue(260);
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('calls onUpdate with new values when save is clicked', () => {
    const onUpdateMock = vi.fn();
    render(<CharacterList {...defaultProps} onUpdate={onUpdateMock} />);

    const editButtons = screen.getAllByTitle('Edit Character');
    fireEvent.click(editButtons[0]);

    const nameInput = screen.getByPlaceholderText('Character Name');
    const levelInput = screen.getByPlaceholderText('Level');

    fireEvent.change(nameInput, { target: { value: 'NewHeroName' } });
    fireEvent.change(levelInput, { target: { value: '265' } });

    const saveButton = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(saveButton);

    expect(onUpdateMock).toHaveBeenCalledWith('char-1', { name: 'NewHeroName', level: 265 });
  });

  it('cancels edit mode', () => {
    render(<CharacterList {...defaultProps} />);
    const editButtons = screen.getAllByTitle('Edit Character');
    fireEvent.click(editButtons[0]);

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);

    // Edit form should disappear
    expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument();
  });

  it('saves edit on Enter key', () => {
    const onUpdateMock = vi.fn();
    render(<CharacterList {...defaultProps} onUpdate={onUpdateMock} />);

    fireEvent.click(screen.getAllByTitle('Edit Character')[0]);

    const nameInput = screen.getByPlaceholderText('Character Name');
    fireEvent.change(nameInput, { target: { value: 'EnterSaved' } });

    fireEvent.keyDown(nameInput, { key: 'Enter' });

    expect(onUpdateMock).toHaveBeenCalledWith('char-1', { name: 'EnterSaved', level: 260 });
  });

  it('does not save with empty name', () => {
    const onUpdateMock = vi.fn();
    render(<CharacterList {...defaultProps} onUpdate={onUpdateMock} />);

    fireEvent.click(screen.getAllByTitle('Edit Character')[0]);

    const nameInput = screen.getByPlaceholderText('Character Name');
    fireEvent.change(nameInput, { target: { value: '   ' } }); // Empty after trim

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onUpdateMock).not.toHaveBeenCalled();
  });

  it('initiates drag reordering on long press', () => {
    vi.useFakeTimers();
    render(<CharacterList {...defaultProps} />);

    const card = screen.getByText('MyHero').closest('.char-card');

    fireEvent.pointerDown(card);

    // Fast forward past long press threshold (500ms)
    // Wrap state update in act
    act(() => {
      vi.advanceTimersByTime(600);
    });

    // Should now be in reorder mode (draggable=true)
    expect(card).toHaveAttribute('draggable', 'true');
    expect(screen.getByText('Drag to reorder')).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('cancels reorder mode on pointer up before timeout', () => {
    vi.useFakeTimers();
    render(<CharacterList {...defaultProps} />);

    const card = screen.getByText('MyHero').closest('.char-card');

    fireEvent.pointerDown(card);

    act(() => {
      vi.advanceTimersByTime(200); // Less than 500ms
    });

    fireEvent.pointerUp(card);

    act(() => {
      vi.advanceTimersByTime(400); // Exceed threshold in total time
    });

    expect(card).not.toHaveAttribute('draggable', 'true');

    vi.useRealTimers();
  });

  it('handles drag and drop to swap items', () => {
    // We need to enter reorder mode first
    vi.useFakeTimers();
    const onSwapMock = vi.fn();
    render(<CharacterList {...defaultProps} onSwap={onSwapMock} />);

    const cards = screen.getAllByText(/Lv\./).map((el) => el.closest('.char-card'));
    const sourceCard = cards[0]; // Hero
    const targetCard = cards[1]; // Bishop

    // Enter reorder mode
    fireEvent.pointerDown(sourceCard);

    act(() => {
      vi.advanceTimersByTime(600);
    });

    // Start drag
    // Define dataTransfer
    const dataTransfer = {
      effectAllowed: 'none',
      setData: vi.fn(),
    };

    fireEvent.dragStart(sourceCard, { dataTransfer });

    // Check if dragging class applied
    expect(sourceCard).toHaveClass('dragging');

    // Drag over target
    fireEvent.dragOver(targetCard, { dataTransfer });

    // Drop
    fireEvent.drop(targetCard, { dataTransfer });

    expect(onSwapMock).toHaveBeenCalledWith(0, 1);

    vi.useRealTimers();
  });

  it('cancels edit mode when cancel is clicked', () => {
    render(<CharacterList {...defaultProps} />);

    const editButtons = screen.getAllByTitle('Edit Character');
    fireEvent.click(editButtons[0]);

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);

    expect(screen.queryByPlaceholderText('Character Name')).not.toBeInTheDocument();
    expect(screen.getByText('MyHero')).toBeInTheDocument();
  });
});
