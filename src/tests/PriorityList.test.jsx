import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { PriorityList } from '../components/PriorityList';
import { SKILL_NAME_TRUNCATE_LIMIT } from '../data/jobs';

// Mock dependencies
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }) => <div>{children}</div>,
  closestCenter: {},
  KeyboardSensor: {},
  PointerSensor: {},
  useSensor: () => ({}),
  useSensors: () => ({}),
}));

vi.mock('@dnd-kit/sortable', () => ({
  arrayMove: (items) => items,
  SortableContext: ({ children }) => <div>{children}</div>,
  sortableKeyboardCoordinates: {},
  verticalListSortingStrategy: {},
}));

// Mock child components if complex
vi.mock('../components/PriorityItem', () => ({
  PriorityItem: ({ step, onEdit }) => (
    <div>
      {step.nodeId} Lv.{step.targetLevel}
      {onEdit && <button onClick={onEdit}>Edit Step</button>}
    </div>
  ),
}));
vi.mock('../components/SortableItem', () => ({
  SortableItem: ({ children }) => <div>{children}</div>,
}));

describe('PriorityList InlineAddForm Logic', () => {
  const mockOnUpdateSequence = vi.fn();
  const mockItems = [
    { nodeId: 'origin', targetLevel: 1 },
    { nodeId: 'm1', targetLevel: 1 },
  ];
  const mockProgress = { origin: 1, m1: 0 };
  const mockNodeMetadata = {
    origin: { id: 'origin', name: 'Origin Skill', displayName: 'Origin Skill', type: 'skill' },
    m1: { id: 'm1', name: 'Mastery 1', displayName: 'Mastery 1', type: 'mastery' },
    common_1: { id: 'common_1', name: 'Coming Soon', displayName: 'Coming Soon', type: 'common' },
  };

  it('groups options by node type', () => {
    const { container } = render(
      <PriorityList
        sequence={mockItems}
        progress={mockProgress}
        onUpdateSequence={mockOnUpdateSequence}
        nodeMetadata={mockNodeMetadata}
        isCustom={true}
      />
    );

    fireEvent.click(screen.getByTitle('Sequence Options'));
    fireEvent.click(screen.getByText('Edit Sequence'));

    const triggers = screen.getAllByTitle('Insert Step Here');
    fireEvent.click(triggers[0]);

    // Check for optgroups directly
    // Note: getByLabelText typically looks for <label> tags, not optgroup label attributes
    // So we inspect the structure
    const skillGroup = container.querySelector('optgroup[label="Skill Nodes"]');
    const masteryGroup = container.querySelector('optgroup[label="Mastery Nodes"]');
    const commonGroup = container.querySelector('optgroup[label="Common Nodes"]');

    expect(skillGroup).toBeInTheDocument();
    expect(masteryGroup).toBeInTheDocument();
    expect(commonGroup).toBeInTheDocument();

    // Check content
    expect(skillGroup).toHaveTextContent('Origin Skill');
    expect(masteryGroup).toHaveTextContent('Mastery 1');
    expect(commonGroup).toHaveTextContent('Coming Soon');
  });

  it('truncates long skill names', () => {
    const longName =
      'This is a very long skill name that should definitely be truncated because it is over fifty chars';
    const longNameNode = {
      id: 'long',
      name: longName,
      displayName: longName,
      type: 'skill',
    };
    const metadataWithLongName = { ...mockNodeMetadata, long: longNameNode };

    render(
      <PriorityList
        sequence={mockItems}
        progress={mockProgress}
        onUpdateSequence={mockOnUpdateSequence}
        nodeMetadata={metadataWithLongName}
        isCustom={true}
      />
    );

    fireEvent.click(screen.getByTitle('Sequence Options'));
    fireEvent.click(screen.getByText('Edit Sequence'));

    const triggers = screen.getAllByTitle('Insert Step Here');
    fireEvent.click(triggers[0]);

    // Calculate expected truncated string
    // Logic: if length > limit, slice(0, limit-1) + '...'
    const limit = SKILL_NAME_TRUNCATE_LIMIT;
    const expectedTruncated = longName.slice(0, limit - 1) + '...';

    expect(screen.getByText(expectedTruncated)).toBeInTheDocument();

    // Full name should be in title attribute
    expect(screen.getByText(expectedTruncated)).toHaveAttribute('title', longName);
  });

  it('calculates default level correctly when inserting', () => {
    render(
      <PriorityList
        sequence={mockItems}
        progress={mockProgress}
        onUpdateSequence={mockOnUpdateSequence}
        nodeMetadata={mockNodeMetadata}
        isCustom={true} // Allow editing
      />
    );

    // Click Edit to show insert triggers
    fireEvent.click(screen.getByTitle('Sequence Options'));
    fireEvent.click(screen.getByText('Edit Sequence'));

    // Click the first insert trigger (at index 0)
    // The trigger renders as a div with class insert-trigger.
    // We can find by title "Insert Step Here"
    const triggers = screen.getAllByTitle('Insert Step Here');
    fireEvent.click(triggers[0]);

    // Now InlineAddForm should be visible.
    // It defaults to 'common_1' node.
    // And level?
    // Progress for common_1 is 0 (undefined).
    // No previous steps.
    // Default level should be 1.
    expect(screen.getByRole('spinbutton')).toHaveValue(1);
  });

  it('updates level when changing skill selection', () => {
    render(
      <PriorityList
        sequence={mockItems}
        progress={mockProgress}
        onUpdateSequence={mockOnUpdateSequence}
        nodeMetadata={mockNodeMetadata}
        isCustom={true}
      />
    );

    fireEvent.click(screen.getByTitle('Sequence Options'));
    fireEvent.click(screen.getByText('Edit Sequence'));

    const triggers = screen.getAllByTitle('Insert Step Here');
    fireEvent.click(triggers[0]); // Insert at start

    // Change select to 'origin'.
    // Origin current progress is 1.
    // No previous origin occurrence before index 0.
    // Min level = 1.
    // Default = min + 1 = 2.

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'origin' } });

    expect(screen.getByRole('spinbutton')).toHaveValue(2);
  });

  it('enforces max level 20 for stat nodes', () => {
    const statMetadata = {
      ...mockNodeMetadata,
      stat_1: { id: 'stat_1', type: 'stat', name: 'Hexa Stat 1' },
    };
    render(
      <PriorityList
        sequence={[]}
        progress={{}}
        onUpdateSequence={mockOnUpdateSequence}
        nodeMetadata={statMetadata}
        isCustom={true}
      />
    );

    fireEvent.click(screen.getByTitle('Sequence Options'));
    fireEvent.click(screen.getByText('Edit Sequence'));
    fireEvent.click(screen.getByTitle('Insert Step Here'));

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'stat_1' } });

    const input = screen.getByRole('spinbutton');
    // Check HTML attribute
    expect(input).toHaveAttribute('max', '20');

    // Test clamping on blur
    fireEvent.change(input, { target: { value: '25' } });
    fireEvent.blur(input);
    expect(input).toHaveValue(20);

    // Test validation error for values above 20
    // We need to bypass the browser's number input restriction for the test to check application logic
    fireEvent.change(input, { target: { value: '21' } });
    fireEvent.click(screen.getByText('✓'));
    expect(screen.getByText(/Must be < Lv.21/)).toBeInTheDocument();
  });

  it('allows editing an existing node', () => {
    render(
      <PriorityList
        sequence={mockItems}
        progress={mockProgress}
        onUpdateSequence={mockOnUpdateSequence}
        nodeMetadata={mockNodeMetadata}
        isCustom={true}
      />
    );

    fireEvent.click(screen.getByTitle('Sequence Options'));
    fireEvent.click(screen.getByText('Edit Sequence'));

    // Click edit on the first item (origin Lv.1)
    const editButtons = screen.getAllByText('Edit Step');
    fireEvent.click(editButtons[0]);

    // The form should appear with the current values
    const select = screen.getByRole('combobox');
    const input = screen.getByRole('spinbutton');

    expect(select).toHaveValue('origin');
    expect(input).toHaveValue(1);

    // Change the level to 2
    fireEvent.change(input, { target: { value: '2' } });
    fireEvent.click(screen.getByText('✓'));

    // Should call onUpdateSequence with the updated sequence
    expect(mockOnUpdateSequence).toHaveBeenCalledWith([
      { nodeId: 'origin', targetLevel: 2 },
      { nodeId: 'm1', targetLevel: 1 },
    ]);
  });

  it('validates level constraints when editing an existing node', () => {
    const sequenceWithMultiple = [
      { nodeId: 'origin', targetLevel: 1 },
      { nodeId: 'm1', targetLevel: 1 },
      { nodeId: 'origin', targetLevel: 10 },
    ];

    render(
      <PriorityList
        sequence={sequenceWithMultiple}
        progress={{ origin: 2, m1: 0 }}
        onUpdateSequence={mockOnUpdateSequence}
        nodeMetadata={mockNodeMetadata}
        isCustom={true}
      />
    );

    fireEvent.click(screen.getByTitle('Sequence Options'));
    fireEvent.click(screen.getByText('Edit Sequence'));

    // Edit the first origin node
    const editButtons = screen.getAllByText('Edit Step');
    fireEvent.click(editButtons[0]);

    const input = screen.getByRole('spinbutton');

    // Try to set level lower than current progress (2)
    fireEvent.change(input, { target: { value: '1' } });
    fireEvent.click(screen.getByText('✓'));
    expect(screen.getByText(/Must be > Lv.2/)).toBeInTheDocument();

    // Try to set level higher than next occurrence (10)
    fireEvent.change(input, { target: { value: '11' } });
    fireEvent.click(screen.getByText('✓'));
    expect(screen.getByText(/Must be < Lv.10/)).toBeInTheDocument();
  });
});

describe('Sequence Settings Menu', () => {
  const mockOnUpdateSequence = vi.fn();
  const mockOnResetSequence = vi.fn();
  const mockJob = 'Hayato';
  const mockSequence = [{ nodeId: 'origin', targetLevel: 1 }];

  // Mock URL methods
  beforeAll(() => {
    global.URL.createObjectURL = vi.fn();
    global.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('opens and closes the settings menu', () => {
    render(
      <PriorityList
        sequence={mockSequence}
        progress={{}}
        nodeMetadata={{}}
        job={mockJob}
        onUpdateSequence={mockOnUpdateSequence}
        onResetSequence={mockOnResetSequence}
        isCustom={false}
      />
    );

    const settingsButton = screen.getByTitle('Sequence Options');
    fireEvent.click(settingsButton);
    expect(screen.getByText('Edit Sequence')).toBeInTheDocument();
    expect(screen.getByText('Import Sequence')).toBeInTheDocument();
    expect(screen.getByText('Export Sequence')).toBeInTheDocument();

    // Close
    fireEvent.click(settingsButton);
    expect(screen.queryByText('Edit Sequence')).not.toBeInTheDocument();
  });

  it('triggers edit mode', () => {
    render(
      <PriorityList
        sequence={mockSequence}
        progress={{}}
        nodeMetadata={{}}
        job={mockJob}
        onUpdateSequence={mockOnUpdateSequence}
      />
    );

    const settingsButton = screen.getByTitle('Sequence Options');
    fireEvent.click(settingsButton);
    fireEvent.click(screen.getByText('Edit Sequence'));

    // PriorityList internal state handles toggleEdit, checks if "Done" button appears or header changes
    expect(screen.getByText('Edit Sequence')).toBeInTheDocument(); // Title changes to 'Edit Sequence'
    expect(screen.queryByTitle('Sequence Options')).not.toBeInTheDocument(); // Settings button hidden in edit mode
  });

  it('handles export sequence', () => {
    render(
      <PriorityList
        sequence={mockSequence}
        progress={{}}
        nodeMetadata={{}}
        job={mockJob}
        onUpdateSequence={mockOnUpdateSequence}
      />
    );

    const settingsButton = screen.getByTitle('Sequence Options');
    fireEvent.click(settingsButton);

    // Mock anchor click
    const link = { click: vi.fn(), href: '' };
    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(link);
    const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
    const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});

    fireEvent.click(screen.getByText('Export Sequence'));

    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(link.click).toHaveBeenCalled();

    // Restore mocks strictly within this test to avoid polluting others
    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });

  it('handles reset sequence', () => {
    // Need isCustom=true to show Reset button
    render(
      <PriorityList
        sequence={mockSequence}
        progress={{}}
        nodeMetadata={{}}
        job={mockJob}
        onUpdateSequence={mockOnUpdateSequence}
        onResetSequence={mockOnResetSequence}
        isCustom={true}
      />
    );

    const settingsButton = screen.getByTitle('Sequence Options');
    fireEvent.click(settingsButton);

    fireEvent.click(screen.getByText('Restore Default'));
    expect(mockOnResetSequence).toHaveBeenCalled();
  });
});
