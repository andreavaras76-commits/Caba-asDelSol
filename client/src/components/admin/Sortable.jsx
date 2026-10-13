import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy, verticalListSortingStrategy, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/**
 * Lista/grilla reordenable con drag & drop (mouse, touch y teclado).
 * - items: [{ id, ... }]
 * - onReorder(newItems): recibe el array ya reordenado
 * - children(item, handleProps, isDragging)
 */
export default function Sortable({ items, onReorder, children, layout = 'grid', className = '' }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const onDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const from = items.findIndex((i) => i.id === active.id);
    const to = items.findIndex((i) => i.id === over.id);
    onReorder(arrayMove(items, from, to));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={layout === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}>
        <ul className={className}>
          {items.map((item) => (
            <SortableItem key={item.id} id={item.id}>
              {(handleProps, isDragging) => children(item, handleProps, isDragging)}
            </SortableItem>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function SortableItem({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 20 : undefined }}
      className={isDragging ? 'opacity-80 drop-shadow-2xl' : ''}
    >
      {children({ ...attributes, ...listeners }, isDragging)}
    </li>
  );
}
