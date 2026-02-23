import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function SortableItem(props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : 1, // Ensure dragging item is on top
    opacity: isDragging ? 0.8 : 1,
  };

  // We clone the child element to inject the sortable props
  // Specifically, we pass listeners/attributes to the child so it can apply them to the DOM node
  return (
    <div ref={setNodeRef} style={style}>
      {React.cloneElement(props.children, { listeners, attributes })}
    </div>
  );
}
