// src/tests/PriorityList.ImportExport.test.jsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PriorityList } from '../components/PriorityList';

// Mock DndContext & related props to keep test simple
vi.mock('@dnd-kit/core', () => ({
    DndContext: ({ children }) => <div>{children}</div>,
    closestCenter: vi.fn(),
    KeyboardSensor: vi.fn(),
    PointerSensor: vi.fn(),
    useSensor: vi.fn(),
    useSensors: vi.fn(),
}));

vi.mock('@dnd-kit/sortable', () => ({
    arrayMove: vi.fn(),
    SortableContext: ({ children }) => <div>{children}</div>,
    sortableKeyboardCoordinates: vi.fn(),
    verticalListSortingStrategy: vi.fn(),
}));

// Mock Icons to simplify verification
vi.mock('../components/Icons', () => ({
    Icons: {
        Settings: () => <div data-testid="icon-settings" />,
        Edit: () => <div data-testid="icon-edit" />,
        Upload: () => <div data-testid="icon-upload" />,
        Download: () => <div data-testid="icon-download" />,
        Reset: () => <div data-testid="icon-reset" />,
    }
}));

describe('PriorityList Import/Export', () => {
    
    const mockSequence = [
        { nodeId: 'origin', targetLevel: 10 }
    ];
    
    let originalFileReader;

    beforeEach(() => {
        vi.clearAllMocks();
        global.URL.createObjectURL.mockClear();
        global.URL.revokeObjectURL.mockClear();
        originalFileReader = global.FileReader;
    });
    
    afterEach(() => {
        global.FileReader = originalFileReader;
    });

    it('exports sequence correctly', async () => {
        const handleReset = vi.fn();

        render(
            <PriorityList 
                sequence={mockSequence} 
                progress={{}} 
                nodeMetadata={{ origin: { displayName: 'Origin Skill' } }}
                isCustom={true} 
                job="Hero" 
                onResetSequence={handleReset}
                onUpdateSequence={() => {}}
            />
        );

        // 1. Open Settings
        const settingsBtn = screen.getByTestId('icon-settings').parentElement; // find button wrapping icon
        fireEvent.click(settingsBtn);

        // 2. Click Export
        const exportBtn = screen.getByText('Export Sequence');
        fireEvent.click(exportBtn);

        // 3. Verify Mock calls
        expect(global.URL.createObjectURL).toHaveBeenCalled();
        expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });

    it('imports compatible sequence correctly', async () => {
        const handleUpdate = vi.fn();
        const mockImportData = {
            job: 'Hero',
            sequence: [{ nodeId: 'm1', targetLevel: 5 }]
        };
        const fileContent = JSON.stringify(mockImportData);

        class MockFileReader {
            constructor() { this.onload = null; }
            readAsText() {
                if (this.onload) this.onload({ target: { result: fileContent } });
            }
        }
        global.FileReader = MockFileReader;

        render(
            <PriorityList 
                sequence={mockSequence} 
                progress={{}} 
                nodeMetadata={{}}
                isCustom={false} // Currently default sequence
                job="Hero" 
                onUpdateSequence={handleUpdate}
            />
        );

        // 1. Open Settings
        const settingsBtn = screen.getByTitle('Sequence Options');
        fireEvent.click(settingsBtn);

        // 2. Trigger Import
        const fileInput = screen.getByDisplayValue(''); // hidden file input
        const file = new File([fileContent], 'seq.json', { type: 'application/json' });
        
        fireEvent.change(fileInput, { target: { files: [file] } });

        // 3. Verify Update called
        expect(handleUpdate).toHaveBeenCalledWith(mockImportData.sequence);
    });

    it('blocks sequence import for mismatched job', async () => {
        const handleUpdate = vi.fn();
        const mockImportData = {
            job: 'Bishop', // Different Job
            sequence: []
        };
        const fileContent = JSON.stringify(mockImportData);
        
        // Mock alert
        vi.spyOn(window, 'alert').mockImplementation(() => {});

        class MockFileReader {
            constructor() { this.onload = null; }
            readAsText() {
                if (this.onload) this.onload({ target: { result: fileContent } });
            }
        }
        global.FileReader = MockFileReader;

        render(
            <PriorityList 
                sequence={mockSequence} 
                job="Hero" 
                onUpdateSequence={handleUpdate}
            />
        );

        // 1. Trigger Import
        const settingsBtn = screen.getByTitle('Sequence Options');
        fireEvent.click(settingsBtn);
        const fileInput = screen.getByDisplayValue(''); 
        const file = new File([fileContent], 'seq.json', { type: 'application/json' });
        
        fireEvent.change(fileInput, { target: { files: [file] } });

        // 2. Verify Alert and No Update
        await waitFor(() => {
             expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Cannot import sequence'));
        });
        expect(handleUpdate).not.toHaveBeenCalled();
    });

    it('prompts overwrite when importing over custom sequence', async () => {
        const handleUpdate = vi.fn();
        const mockImportData = { job: 'Hero', sequence: [] };
        const fileContent = JSON.stringify(mockImportData);
        
        // Mock confirm to cancel
        vi.spyOn(window, 'confirm').mockReturnValue(false);

        class MockFileReader {
            constructor() { this.onload = null; }
            readAsText() {
                if (this.onload) this.onload({ target: { result: fileContent } });
            }
        }
        global.FileReader = MockFileReader;

        render(
            <PriorityList 
                sequence={mockSequence} 
                job="Hero" 
                isCustom={true} // Has existing custom sequence
                onUpdateSequence={handleUpdate}
            />
        );

        // 1. Trigger Import
        const settingsBtn = screen.getByTitle('Sequence Options');
        fireEvent.click(settingsBtn);
        const fileInput = screen.getByDisplayValue(''); 
        const file = new File([], 'seq.json', { type: 'application/json' });
        
        fireEvent.change(fileInput, { target: { files: [file] } });

        // 2. Verify Confirm
        expect(window.confirm).toHaveBeenCalled();
        expect(handleUpdate).not.toHaveBeenCalled(); // Cancelled
    });
});