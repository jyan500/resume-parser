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

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
	);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;

		const oldIndex = elements.findIndex((e) => e.id === active.id);
		const newIndex = elements.findIndex((e) => e.id === over.id);
		if (oldIndex !== -1 && newIndex !== -1) {
			action(oldIndex, newIndex)
		}
	};

	return [sensors, handleDragEnd] as const;
}
