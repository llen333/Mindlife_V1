'use client'

import { memo } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Task } from '@/lib/stores/types'
import { ArrowUp, ArrowDown, Clock } from 'lucide-react'

// Utilitaire pour extraire la couleur de priorité
const PRIORITY_STYLES: Record<string, any> = {
  high: {
    bg: 'bg-rose-500/20',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
    glow: 'shadow-rose-500/20',
    icon: ArrowUp,
  },
  medium: {
    bg: 'bg-amber-500/20',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    glow: 'shadow-amber-500/20',
    icon: ArrowDown,
  },
  low: {
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    glow: 'shadow-emerald-500/20',
    icon: ArrowDown,
  }
}

interface TimelineCardProps {
  task: Task
  height: number // Height based on duration (e.g. 1 hour = 60px)
}

export const TimelineCard = memo(function TimelineCard({ task, height }: TimelineCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    height: `${height}px`,
    zIndex: isDragging ? 50 : 10,
  }

  const priorityStyle = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium
  const PriorityIcon = priorityStyle.icon

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        absolute w-full left-0 right-0 
        rounded-xl p-3 
        backdrop-blur-md border cursor-grab active:cursor-grabbing
        transition-shadow duration-200
        ${priorityStyle.bg} ${priorityStyle.border}
        ${isDragging ? 'shadow-2xl opacity-80 scale-105 ' + priorityStyle.glow : 'hover:shadow-lg'}
      `}
    >
      <div className="flex items-start justify-between">
        <h4 className="text-sm font-medium text-white truncate pr-2">
          {task.title}
        </h4>
        <div className={`p-1 rounded-full bg-black/20 ${priorityStyle.text}`}>
          <PriorityIcon className="w-3 h-3" />
        </div>
      </div>
      
      {height >= 60 && (
        <div className="flex items-center gap-1.5 mt-2 text-xs text-white/60">
          <Clock className="w-3 h-3" />
          <span>{task.time || 'Non défini'}</span>
        </div>
      )}
    </div>
  )
})
