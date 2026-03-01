import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PriorityList } from '../components/PriorityList';

// Capture the onDragEnd handler
let capturedOnDragEnd;

vi.mock('@dnd-kit/core', async () => {
  const actual = await vi.importActual('@dnd-kit/core');
  return {
    ...actual,
    DndContext: ({ onDragEnd, children }) => {
      capturedOnDragEnd = onDragEnd;
      return <div>{children}</div>;
    },
    useSensor: vi.fn(),
    useSensors: vi.fn(),
    PointerSensor: vi.fn(),
    KeyboardSensor: vi.fn(),
    closestCenter: vi.fn(),
  };
});

// Mock sortable
vi.mock('@dnd-kit/sortable', async () => {
  const actual = await vi.importActual('@dnd-kit/sortable');
  return {
    ...actual,
    arrayMove: vi.fn((items, from, to) => {
      // Simple array move implementation for testing
      const newItems = [...items];
      const [removed] = newItems.splice(from, 1);
      newItems.splice(to, 0, removed);
      return newItems;
    }),
    SortableContext: ({ children }) => <div>{children}</div>,
  };
});

describe('PriorityList DnD', () => {
  const mockSequence = [
    { nodeId: 'a', targetLevel: 1 },
    { nodeId: 'b', targetLevel: 2 },
    { nodeId: 'c', targetLevel: 3 },
  ];
  const mockUpdateSequence = vi.fn();

  beforeEach(() => {
    capturedOnDragEnd = null;
    mockUpdateSequence.mockClear();
  });

  it('reorders sequence on drag end', () => {
    render(
      <PriorityList
        sequence={mockSequence}
        progress={{}}
        nodeMetadata={{
          a: { id: 'a', displayName: 'A' },
          b: { id: 'b', displayName: 'B' },
          c: { id: 'c', displayName: 'C' },
        }}
        onUpdateSequence={mockUpdateSequence}
        isCustom={true}
      />
    );

    // Enter Edit Mode
    // Need to find settings button.
    // Assuming Icons mock is NOT present here unless I mock it.
    // If real Icons are used, they render SVGs.
    // Screen.getByTitle('Sequence Options') should work if title is there.
    // PriorityList.jsx: <button className="settings-btn" onClick={() => setIsOpen(!isOpen)} title="Sequence Options">

    const settingsBtn = screen.getByTitle('Sequence Options');
    fireEvent.click(settingsBtn);

    const editBtn = screen.getByText('Edit Sequence');
    fireEvent.click(editBtn);

    expect(capturedOnDragEnd).toBeDefined();

    // Simulate drag end: Move 'a' (index 0) to 'b' (index 1)
    // IDs are formatted as `${s.nodeId}-${s.targetLevel}-${i}`
    capturedOnDragEnd({
      active: { id: 'a-1-0' },
      over: { id: 'b-2-1' },
    });

    // index 0 -> index 1
    // Expected result: [b, a, c]
    expect(mockUpdateSequence).toHaveBeenCalledWith([
      expect.objectContaining({ nodeId: 'b' }),
      expect.objectContaining({ nodeId: 'a' }),
      expect.objectContaining({ nodeId: 'c' }),
    ]);
  });
});
