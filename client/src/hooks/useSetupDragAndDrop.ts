import {
    PointerSensor,
    useSensors,
    useSensor,
    type DragEndEvent
} from "@dnd-kit/core"

export const useSetupDragAndDrop = <T extends { id: string }>(
    action: (fromIndex: number, toIndex: number) => void,
    elements: Array<T>
) => {

    // PointerSensor requires the user to move 8px before a drag starts,
    // which prevents accidental drags when clicking buttons inside the card.
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );
    
    /* 
        When the user releases the mouseclick, get the new index based on the location
        where the user dropped the mouse click and update the indices internally
    */
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
 
        const oldIndex = elements.findIndex((e) => e.id === active.id);
        const newIndex = elements.findIndex((e) => e.id === over.id);
        if (oldIndex !== -1 && newIndex !== -1) {
            // dispatch(action({ fromIndex: oldIndex, toIndex: newIndex }));
            action(oldIndex, newIndex)
        }
    };

    return [sensors, handleDragEnd] as const;
}
