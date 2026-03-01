import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SortableItem } from '../components/SortableItem';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Mock dnd-kit modules
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: vi.fn(),
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: vi.fn() } },
}));

describe('SortableItem', () => {
  it('renders and passes props to children', () => {
    // Setup mock return values
    const mockAttributes = { role: 'button' };
    const mockListeners = { onPointerDown: vi.fn() };

    useSortable.mockReturnValue({
      attributes: mockAttributes,
      listeners: mockListeners,
      setNodeRef: vi.fn(),
      transform: { x: 10, y: 20, scaleX: 1, scaleY: 1 },
      transition: 'transform 200ms',
      isDragging: false,
    });

    CSS.Transform.toString.mockReturnValue('translate(10px, 20px)');

    const { container } = render(
      <SortableItem id="item-1">
        <div data-testid="child">Info</div>
      </SortableItem>
    );

    // Check hook called with correct id
    expect(useSortable).toHaveBeenCalledWith({ id: 'item-1' });

    // Check ref/style on wrapper
    // The implementation wraps child in a div with ref={setNodeRef}
    const wrapper = container.firstChild;
    expect(wrapper).toHaveStyle({
      transform: 'translate(10px, 20px)',
      transition: 'transform 200ms',
      zIndex: '1',
      opacity: '1',
    });

    // Check props passed to child
    // Implementation: {React.cloneElement(props.children, { listeners, attributes })}
    // Child is the div with testid="child".
    // It's inside wrapper.
    // Wait, cloneElement adds props to the child.
    // But if child is a DOM element (div), will it receive listeners/attributes as DOM attributes?
    // Attributes like role='button' yes. Listeners functions?
    // React handles listeners on DOM nodes if they match event names.

    // Let's check the presence of attributes on the child logic.
    // Wait, render will render the whole tree.
    // `wrapper` is the outer `div` from `SortableItem`. Inside it is the child.

    // Actually looking at component:
    // return <div ref={setNodeRef} style={style}>{React.cloneElement(props.children, { listeners, attributes })}</div>

    // So the child div should have attributes spread onto it? No, passed as props: `listeners={...} attributes={...}`.
    // A native `<div>` doesn't know what to do with `listeners` prop. It's not a valid HTML attribute.
    // But if the child is a React Component (like PriorityItem), it can accept them.
    // If the child is a DOM element, passing non-standard props might cause React warning or be ignored?
    // Ah, `PriorityList.jsx` passes `<PriorityItem>` as child. `PriorityItem` accepts `listeners, attributes` as props.

    // So I should render a mock component as child to verify it receives props.
  });

  it('passes dnd props to component child', () => {
    const MockChild = vi.fn(() => <div>Child</div>);

    const mockAttributes = { 'aria-roledescription': 'sortable' };
    const mockListeners = { onKeyDown: vi.fn() };

    useSortable.mockReturnValue({
      attributes: mockAttributes,
      listeners: mockListeners,
      setNodeRef: vi.fn(),
      transform: null,
      transition: null,
      isDragging: true,
    });

    CSS.Transform.toString.mockReturnValue('');

    render(
      <SortableItem id="item-1">
        <MockChild />
      </SortableItem>
    );

    // Verify mock child received logical props
    expect(MockChild).toHaveBeenCalledWith(
      expect.objectContaining({
        attributes: mockAttributes,
        listeners: mockListeners,
      }),
      expect.anything()
    );
  });

  it('styles when dragging', () => {
    useSortable.mockReturnValue({
      attributes: {},
      listeners: {},
      setNodeRef: vi.fn(),
      transform: null,
      transition: null,
      isDragging: true,
    });

    const { container } = render(
      <SortableItem id="item-1">
        <div />
      </SortableItem>
    );

    const wrapper = container.firstChild;
    expect(wrapper).toHaveStyle({
      zIndex: '2',
      opacity: '0.8',
    });
  });
});
