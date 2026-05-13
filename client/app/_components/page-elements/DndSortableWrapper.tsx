"use client"

import React from "react"
import {
    DndContext,
    closestCenter,
} from "@dnd-kit/core"
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { useSetupDragAndDrop } from "../../_lib/hooks/useSetupDragAndDrop"

interface Props<T> {
    elements: Array<T>
    dragEndAction: (fromIndex: number, toIndex: number) => void
    children: React.ReactNode
}

export const DndSortableWrapper = <T extends {id: string}, >({elements, dragEndAction, children}: Props<T>) => {
    const [ sensors, handleDragEnd ] = useSetupDragAndDrop<T>(
        dragEndAction,
        elements,
    )
    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={elements.map((e) => e.id)}
                /* 
                    verticalListSortingStrategy means
                    items are shifted up/down as swapping happens after
                    an item is dragged and dropped
                */
                strategy={verticalListSortingStrategy}
            >
                <div className="flex flex-col gap-3">
                    {children}
                </div>
            </SortableContext>
        </DndContext>
    )
}
