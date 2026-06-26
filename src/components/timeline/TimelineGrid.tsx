'use client'

import { memo } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { Task } from '@/lib/stores/types'
import { TimelineCard } from './TimelineCard'

interface TimelineGridProps {
  tasks: Task[]
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)

// A single droppable time slot
const TimeSlot = memo(function TimeSlot({ hour, tasksInSlot }: { hour: number, tasksInSlot: Task[] }) {
  const timeString = `${hour.toString().padStart(2, '0')}:00`
  const { isOver, setNodeRef } = useDroppable({
    id: `slot-${timeString}`,
  })

  return (
    <div 
      ref={setNodeRef}
      className={`
        relative h-20 border-b border-white/[0.05] 
        transition-colors duration-200
        ${isOver ? 'bg-white/[0.05]' : 'hover:bg-white/[0.02]'}
      `}
    >
      {/* Time Label */}
      <div className="absolute -left-16 top-0 text-xs text-white/40 w-12 text-right py-2">
        {timeString}
      </div>

      {/* Render tasks for this slot */}
      <div className="absolute inset-0 p-1">
        {tasksInSlot.map((task) => (
          <TimelineCard key={task.id} task={task} height={70} />
        ))}
      </div>
    </div>
  )
})

export const TimelineGrid = memo(function TimelineGrid({ tasks }: TimelineGridProps) {
  // Simple grouping by hour for the prototype
  const tasksByHour = (hour: number) => {
    return tasks.filter(t => {
      if (!t.time) return false;
      const taskHour = parseInt(t.time.split(':')[0], 10);
      return taskHour === hour;
    });
  };

  return (
    <div className="ml-16 mr-4 relative border-l border-white/[0.05]">
      {HOURS.map((hour) => (
        <TimeSlot 
          key={hour} 
          hour={hour} 
          tasksInSlot={tasksByHour(hour)} 
        />
      ))}
    </div>
  )
})
