'use client'

import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core'
import { Task } from '@/lib/stores/types'
import { TimelineCard } from './TimelineCard'
import { TimelineGrid } from './TimelineGrid'

interface TimelineContainerProps {
  tasks: Task[]
  onTaskMove: (taskId: string, newTime: string, newDate?: string) => void
}

export function TimelineContainer({ tasks, onTaskMove }: TimelineContainerProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    if (active.data.current?.type === 'Task') {
      setActiveTask(active.data.current.task as Task)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null)
    const { active, over } = event

    if (over && over.id !== active.id) {
      // over.id should be the drop zone ID, e.g., 'slot-10:00'
      const dropZoneId = over.id as string
      if (dropZoneId.startsWith('slot-')) {
        const newTime = dropZoneId.replace('slot-', '')
        onTaskMove(active.id as string, newTime)
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="w-full h-full relative overflow-y-auto custom-scrollbar p-4">
        <TimelineGrid tasks={tasks} />
      </div>

      <DragOverlay>
        {activeTask ? (
          <TimelineCard task={activeTask} height={60} />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
