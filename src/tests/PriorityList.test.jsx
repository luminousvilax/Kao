import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PriorityList } from '../components/PriorityList';

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
  PriorityItem: ({ step }) => <div>{step.nodeId} Lv.{step.targetLevel}</div>
}));
vi.mock('../components/SortableItem', () => ({
  SortableItem: ({ children }) => <div>{children}</div>
}));

describe('PriorityList InlineAddForm Logic', () => {
    const mockOnUpdateSequence = vi.fn();
    const mockItems = [
        { nodeId: 'origin', targetLevel: 1 },
        { nodeId: 'm1', targetLevel: 1 }
    ];
    const mockProgress = { origin: 1, m1: 0 };
    const mockNodeMetadata = {
        origin: { id: 'origin', name: 'Origin Skill' },
        m1: { id: 'm1', name: 'Mastery 1' },
        common_1: { id: 'common_1', name: 'Coming Soon' }
    };

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
        fireEvent.click(screen.getByText('Edit'));

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

        fireEvent.click(screen.getByText('Edit'));
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
            stat_1: { id: 'stat_1', type: 'stat', name: 'Hexa Stat 1' }
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

        fireEvent.click(screen.getByText('Edit'));
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
});
