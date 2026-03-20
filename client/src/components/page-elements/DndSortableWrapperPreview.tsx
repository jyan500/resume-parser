import React from "react"
import { CSS } from "@dnd-kit/utilities"
import { useSortable } from "@dnd-kit/sortable"

// ─── Sortable wrapper ─────────────────────────────────────────────────────────
// Thin shell that calls useSortable and passes drag handle props down.
type DragHandleProps = React.HTMLAttributes<HTMLButtonElement>;

type SortableWrapperProps<P extends object> = 
    {
        elementId: string
        childComponent: React.ComponentType<P & {dragHandleProps?: DragHandleProps}>
        childProps: P
    }

export const DndSortableWrapperPreview = <P extends object,>({childComponent: ChildComponent, elementId, childProps}: SortableWrapperProps<P>) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: elementId });
 
    const style: React.CSSProperties = {
        // translation only, ignoring scaleX/scaleY to avoid stretching when 
        // when dragging the element over variable sized elements)
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 10 : undefined,
        opacity: isDragging ? 0.5 : 1,
    };
 
    return (
        <div ref={setNodeRef} style={style}>
            <ChildComponent
                {...childProps}
                dragHandleProps={{ ...attributes, ...listeners } as DragHandleProps}
            />
        </div>
    );
};
