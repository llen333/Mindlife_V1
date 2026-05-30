'use client'

import { useState, useMemo, useRef, useEffect, memo } from 'react'
import gsap from 'gsap'
import { 
  Plus, CheckCircle2, Clock, Trash2, Search, TrendingUp, CheckSquare, 
  Edit3, Calendar, Target, Sparkles, ArrowUp, ArrowDown, Zap, ListTodo, Flame, Check
} from 'lucide-react'
import { 
  useTasks, useCategories, useTaskActions, useEventActions,
  Task, getCategoryColorClass 
} from '@/lib/store/selectors';
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import MindLifeHeader from '../MindLifeHeader'
import TaskModal from './TaskModal'

// Types de filtre disponibles
type FilterType = 'all' | 'pending' | 'in_progress' | 'completed' | 'priority'

// Configuration des badges de priorité
const PRIORITY_STYLES = {
  high: { 
    bg: 'bg-rose-500/20', 
    text: 'text-rose-400', 
    border: 'border-rose-500/30',
    glow: 'shadow-rose-500/20',
    icon: ArrowUp,
    label: 'Haute'
  },
  medium: { 
    bg: 'bg-amber-500/20', 
    text: 'text-amber-400', 
    border: 'border-amber-500/30',
    glow: 'shadow-amber-500/20',
    icon: ArrowDown,
    label: 'Moyenne'
  },
  low: { 
    bg: 'bg-emerald-500/20', 
    text: 'text-emerald-400', 
    border: 'border-emerald-500/30',
    glow: 'shadow-emerald-500/20',
    icon: ArrowDown,
    label: 'Basse'
  },
}

// Configuration des filtres
const FILTER_CONFIG: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'Toutes' },
  { key: 'pending', label: 'En attente' },
  { key: 'in_progress', label: 'En cours' },
  { key: 'completed', label: 'Terminées' },
  { key: 'priority', label: 'Priorité' },
]

// ⚠️ ANIMATED ORBS DÉSACTIVÉS - test performance
// Les animations CSS infinies + blur + will-change surchargent le GPU
const AnimatedOrbsCSS = () => null

// Composant pour le shimmer effect (CSS natif au lieu de JS)
const ShimmerBar = memo(function ShimmerBar({ progress, priority }: { progress: number; priority: string }) {
  const progressRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (progressRef.current) {
      gsap.to(progressRef.current, {
        width: `${progress}%`,
        duration: 0.8,
        ease: 'power2.out'
      })
    }
  }, [progress])
  
  const gradientClass = priority === 'high' 
    ? 'from-rose-500 via-rose-400 to-rose-500' 
    : priority === 'medium'
    ? 'from-amber-500 via-amber-400 to-amber-500'
    : 'from-emerald-500 via-cyan-400 to-emerald-500'

  return (
    <div className="relative w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      
      {/* Progress bar */}
      <div
        ref={progressRef}
        className={`h-full bg-gradient-to-r ${gradientClass} rounded-full relative overflow-hidden`}
        style={{ width: 0 }}
      >
        {/* Shimmer effect en CSS */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
          style={{ animation: 'shimmer 1.5s linear infinite' }}
        />
      </div>
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
})

// Composant GlassCard avec GSAP pour hover
const GlassCard = memo(function GlassCard({ 
  children, 
  className = '', 
  glowColor = 'emerald',
  hover = true,
  onClick
}: { 
  children: React.ReactNode
  className?: string
  glowColor?: string
  hover?: boolean
  onClick?: () => void
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  
  const glowColors: Record<string, string> = {
    emerald: 'hover:shadow-emerald-500/10 group-hover:shadow-emerald-500/20',
    amber: 'hover:shadow-amber-500/10 group-hover:shadow-amber-500/20',
    rose: 'hover:shadow-rose-500/10 group-hover:shadow-rose-500/20',
    cyan: 'hover:shadow-cyan-500/10 group-hover:shadow-cyan-500/20',
    violet: 'hover:shadow-violet-500/10 group-hover:shadow-violet-500/20',
  }

  const handleMouseEnter = () => {
    if (hover && cardRef.current) {
      gsap.to(cardRef.current, { scale: 1.01, y: -2, duration: 0.2, ease: 'power2.out' })
    }
  }
  
  const handleMouseLeave = () => {
    if (cardRef.current) {
      gsap.to(cardRef.current, { scale: 1, y: 0, duration: 0.2, ease: 'power2.out' })
    }
  }

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`
        relative overflow-hidden
        bg-white/[0.03] backdrop-blur-xl
        border border-white/[0.08]
        rounded-2xl
        shadow-xl shadow-black/20
        ${hover ? `hover:shadow-2xl ${glowColors[glowColor]} hover:border-white/[0.15]` : ''}
        before:absolute before:inset-0 
        before:bg-gradient-to-b before:from-white/[0.07] before:via-transparent before:to-transparent
        before:pointer-events-none
        ${className}
      `}
    >
      {children}
    </div>
  )
})

// Composant StatCard avec GSAP
const StatCard = memo(function StatCard({ 
  value, 
  label, 
  icon: Icon, 
  color = 'emerald',
  delay = 0 
}: { 
  value: number | string
  label: string
  icon?: typeof CheckSquare
  color?: string
  delay?: number
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(cardRef.current,
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, delay, ease: 'power2.out' }
      )
    }
  }, [delay])
  
  const colorStyles: Record<string, { text: string; bg: string; border: string }> = {
    emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    amber: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    rose: { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
    cyan: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
    slate: { text: 'text-slate-300', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
  }
  
  const style = colorStyles[color] || colorStyles.emerald

  return (
    <div ref={cardRef}>
      <GlassCard glowColor={color} className="p-5 group">
        <div className="relative z-10">
          {Icon && (
            <div className={`w-10 h-10 rounded-xl ${style.bg} ${style.border} border flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
              <Icon className={`w-5 h-5 ${style.text}`} />
            </div>
          )}
          <div className={`text-3xl font-bold ${style.text} tracking-tight`}>{value}</div>
          <div className="text-xs text-slate-500 mt-1 font-medium uppercase tracking-wider">{label}</div>
        </div>
      </GlassCard>
    </div>
  )
})

const TasksPanel = memo(function TasksPanel() {
  const tasks = useTasks();
  const categories = useCategories();
  const { addTask, updateTask, deleteTask, loadTasks } = useTaskActions();
  const { addEvent, deleteEvent } = useEventActions();
  const [filter, setFilter] = useState<FilterType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  // Refs pour animations GSAP
  const searchRef = useRef<HTMLDivElement>(null)
  const filtersRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const tasksListRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)

  // Filtrage et tri des tâches
  const filteredTasks = useMemo(() => {
    let result = [...tasks]
    
    // Filtre par statut
    if (filter === 'pending') {
      result = result.filter(t => t.status === 'pending')
    } else if (filter === 'in_progress') {
      result = result.filter(t => t.status === 'in_progress')
    } else if (filter === 'completed') {
      result = result.filter(t => t.status === 'completed')
    } else if (filter === 'priority') {
      // Tri par priorité : high > medium > low
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      result = result.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    }
    
    // Filtre par recherche
    if (searchQuery) {
      result = result.filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    return result
  }, [tasks, filter, searchQuery])

  // Stats calculées
  const stats = useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    highPriority: tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length,
  }), [tasks])

  // Gestion de la sauvegarde (création ou mise à jour)
  const handleSaveTask = async (taskData: Partial<Task>) => {
    try {
      if (taskData.id) {
        // === MISE À JOUR ===
        const existingTask = tasks.find(t => t.id === taskData.id)
        
        await updateTask(taskData.id, {
          title: taskData.title || '',
          description: taskData.description,
          status: taskData.status || 'pending',
          priority: taskData.priority || 'medium',
          categoryId: taskData.categoryId || 'cat-professional',
          startDate: taskData.startDate,
          dueDate: taskData.dueDate,
          progress: taskData.progress || 0,
          chapters: taskData.chapters,
          observations: taskData.observations,
          addToCalendar: taskData.addToCalendar || false,
          createdBy: 'user',
        })

        // Gestion synchronisation calendrier
        if (taskData.addToCalendar && taskData.startDate) {
          // Si pas déjà d'événement lié, en créer un
          if (!existingTask?.eventId) {
            const category = categories.find(c => c.id === taskData.categoryId)
            const startDateStr = new Date(taskData.startDate).toISOString().split('T')[0]
            await addEvent({
              title: `📋 ${taskData.title}`,
              description: taskData.description,
              date: startDateStr,
              startTime: '09:00',
              endTime: '10:00',
              isAllDay: false,
              categoryId: taskData.categoryId || 'cat-professional',
              color: category?.color || 'emerald',
            })
          }
        } else if (!taskData.addToCalendar && existingTask?.eventId) {
          // Si on désactive le calendrier, supprimer l'événement lié
          await deleteEvent(existingTask.eventId)
        }
        
        // Recharger les tâches pour s'assurer que les données sont à jour
        await loadTasks()
      } else {
        // === CRÉATION ===
        const newTaskId = `task-${Date.now()}`
        const newTask: Task = {
          id: newTaskId,
          title: taskData.title || '',
          description: taskData.description,
          status: taskData.status || 'pending',
          priority: taskData.priority || 'medium',
          categoryId: taskData.categoryId || 'cat-professional',
          startDate: taskData.startDate,
          dueDate: taskData.dueDate,
          progress: taskData.progress || 0,
          chapters: taskData.chapters,
          observations: taskData.observations,
          addToCalendar: taskData.addToCalendar || false,
          createdBy: 'user',
          createdAt: new Date().toISOString(),
        }
        
        await addTask(newTask)

        // Synchronisation calendrier pour nouvelle tâche
        if (taskData.addToCalendar && taskData.startDate) {
          const category = categories.find(c => c.id === taskData.categoryId)
          const startDateStr = new Date(taskData.startDate).toISOString().split('T')[0]
          const createdEvent = await addEvent({
            title: `📋 ${taskData.title}`,
            description: taskData.description,
            date: startDateStr,
            startTime: '09:00',
            endTime: '10:00',
            isAllDay: false,
            categoryId: taskData.categoryId || 'cat-professional',
            color: category?.color || 'emerald',
          })
          // Stocker l'eventId sur la tâche
          if (createdEvent?.id) {
            await updateTask(newTaskId, { eventId: createdEvent.id })
          }
        }
        
        // Recharger les tâches
        await loadTasks()
      }
    } catch (error) {
      console.error('Error saving task:', error)
    }
  }

  // Toggle du statut de la tâche
  const toggleTaskStatus = (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 
                     currentStatus === 'pending' ? 'in_progress' : 'completed'
    updateTask(taskId, { status: newStatus as 'pending' | 'in_progress' | 'completed' })
    
    if (newStatus === 'completed') {
      updateTask(taskId, { progress: 100 })
    }
  }

  // Ouverture de la modale d'édition
  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setShowModal(true)
  }

  // Fermeture de la modale
  const handleCloseModal = () => {
    setShowModal(false)
    setEditingTask(null)
  }

  // Récupération des infos de catégorie
  const getCategoryInfo = (categoryId: string) => {
    return categories.find(c => c.id === categoryId) || { name: 'Autre', icon: '📌', color: 'slate' }
  }

  // Calcul du pourcentage de progression global
  const completionPercent = stats.total > 0 
    ? Math.round((stats.completed / stats.total) * 100) 
    : 0

  // Animations GSAP au montage
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(searchRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3 })
      gsap.fromTo(filtersRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3, delay: 0.1 })
      gsap.fromTo(sidebarRef.current, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.3, delay: 0.2 })
    })
    return () => ctx.revert()
  }, [])

  // Animation stagger pour les tâches
  useEffect(() => {
    if (tasksListRef.current) {
      const items = tasksListRef.current.querySelectorAll('.task-item')
      gsap.fromTo(items,
        { opacity: 0, y: 20, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.3, stagger: 0.03, ease: 'power2.out' }
      )
    }
  }, [filteredTasks.length])

  // Fonction pour les effets hover sur les boutons
  const handleButtonHover = (element: HTMLElement | null, isHover: boolean) => {
    if (element) {
      gsap.to(element, {
        scale: isHover ? 1.02 : 1,
        duration: 0.15,
        ease: 'power2.out'
      })
    }
  }

  const handleButtonTap = (element: HTMLElement | null, isPressed: boolean) => {
    if (element) {
      gsap.to(element, {
        scale: isPressed ? 0.98 : 1,
        duration: 0.1,
        ease: 'power2.out'
      })
    }
  }

  return (
    <div className="min-h-screen bg-[#030712] pl-[70px] relative overflow-hidden pt-20">
      {/* Background animé - CSS NATIF au lieu de Framer Motion */}
      <AnimatedOrbsCSS />
      
      {/* Grain overlay subtil */}
      <div className="fixed inset-0 opacity-[0.015] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')]" />

      {/* Header Unifié */}
      <MindLifeHeader
        title="Tâches"
        subtitle="Organisez et suivez vos tâches"
        icon={CheckSquare}
        theme="emerald"
        rightContent={
          <button
            onClick={() => { setEditingTask(null); setShowModal(true); }}
            onMouseEnter={(e) => handleButtonHover(e.currentTarget, true)}
            onMouseLeave={(e) => handleButtonHover(e.currentTarget, false)}
            onMouseDown={(e) => handleButtonTap(e.currentTarget, true)}
            onMouseUp={(e) => handleButtonTap(e.currentTarget, false)}
            className="relative group flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm
                       bg-gradient-to-r from-emerald-500 to-cyan-500 text-white
                       shadow-lg shadow-emerald-500/25
                       hover:shadow-xl hover:shadow-emerald-500/30
                       transition-all duration-300"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nouvelle Tâche</span>
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300" />
          </button>
        }
      />

      <main className="relative z-10 p-6 pt-24 space-y-6">
        {/* === BARRE DE RECHERCHE ET FILTRES === */}
        <div ref={searchRef} className="flex flex-col lg:flex-row gap-4">
          {/* Recherche glassmorphism */}
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
            <Input
              placeholder="Rechercher une tâche..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 
                         bg-white/[0.03] backdrop-blur-xl
                         border border-white/[0.08]
                         text-white placeholder:text-slate-600
                         focus:border-emerald-500/50 focus:bg-white/[0.05]
                         rounded-xl shadow-lg shadow-black/10
                         transition-all duration-300"
            />
          </div>
          
          {/* Filtres avec effet glass */}
          <div ref={filtersRef} className="flex gap-2 flex-wrap">
            {FILTER_CONFIG.map(({ key, label }, idx) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                onMouseEnter={(e) => handleButtonHover(e.currentTarget, true)}
                onMouseLeave={(e) => handleButtonHover(e.currentTarget, false)}
                onMouseDown={(e) => handleButtonTap(e.currentTarget, true)}
                onMouseUp={(e) => handleButtonTap(e.currentTarget, false)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  filter === key
                    ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                    : 'bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] text-slate-400 hover:bg-white/[0.06] hover:text-white hover:border-white/20'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* === STATS RAPIDES === */}
        <div ref={statsRef} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard value={stats.total} label="Total" icon={ListTodo} color="slate" delay={0.1} />
          <StatCard value={stats.inProgress} label="En cours" icon={Zap} color="amber" delay={0.15} />
          <StatCard value={stats.highPriority} label="Priorité haute" icon={Flame} color="rose" delay={0.2} />
          <StatCard value={stats.completed} label="Terminées" icon={CheckCircle2} color="emerald" delay={0.25} />
        </div>

        {/* === LISTE DES TÂCHES === */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Liste principale */}
          <div ref={tasksListRef} className="lg:col-span-2 space-y-3">
            {filteredTasks.map((task) => {
              const category = getCategoryInfo(task.categoryId)
              const priorityStyle = PRIORITY_STYLES[task.priority]
              const PriorityIcon = priorityStyle.icon
              const isHighPriority = task.priority === 'high' && task.status !== 'completed'
              
              return (
                <div
                  key={task.id}
                  onClick={() => handleEditTask(task)}
                  className="task-item group cursor-pointer"
                >
                  <GlassCard 
                    glowColor={task.priority === 'high' ? 'rose' : task.status === 'in_progress' ? 'amber' : 'emerald'}
                    className={`p-4 ${isHighPriority ? 'animate-pulse-subtle' : ''}`}
                  >
                    {/* High priority glow effect */}
                    {isHighPriority && (
                      <div className="absolute inset-0 rounded-2xl bg-rose-500/5 animate-pulse" />
                    )}
                    
                    <div className="relative z-10 grid grid-cols-[auto_220px_85px_100px_120px_auto] items-center gap-4 w-full">
                      {/* Col 1: Checkbox */}
                      <div onClick={(e) => e.stopPropagation()}>
                        <div
                          onClick={() => toggleTaskStatus(task.id, task.status)}
                          onMouseEnter={(e) => handleButtonHover(e.currentTarget, true)}
                          onMouseLeave={(e) => handleButtonHover(e.currentTarget, false)}
                          onMouseDown={(e) => handleButtonTap(e.currentTarget, true)}
                          onMouseUp={(e) => handleButtonTap(e.currentTarget, false)}
                          className="h-5 w-5 rounded border border-white/30 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 transition-all duration-300 cursor-pointer flex items-center justify-center"
                        >
                          {task.status === 'completed' && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                      
                      {/* Col 2: Titre */}
                      <h3 className={`font-medium truncate transition-all duration-300 ${
                        task.status === 'completed' 
                          ? 'text-slate-600 line-through' 
                          : 'text-white group-hover:text-emerald-100'
                      }`}>
                        {task.title}
                      </h3>
                      
                      {/* Col 3: Priorité */}
                      <span className={`text-[10px] px-2.5 py-1 rounded-full ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.border} border flex items-center justify-center gap-1 w-fit shadow-sm ${isHighPriority ? 'shadow-rose-500/20' : ''}`}>
                        <PriorityIcon className="w-2.5 h-2.5" />
                        {priorityStyle.label}
                      </span>
                      
                      {/* Col 4: Badges secondaires */}
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded ${getCategoryColorClass(category.color)}`}>
                          {category.icon}
                        </span>
                        
                        {task.addToCalendar && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5" />
                          </span>
                        )}
                        
                        {task.status === 'in_progress' && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 flex items-center gap-1 animate-pulse">
                            <Clock className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                      
                      {/* Col 5: Progression + Date */}
                      <div className="flex items-center gap-2">
                        {task.progress !== undefined && task.progress > 0 && (
                          <div className="flex items-center gap-1.5 w-16">
                            <ShimmerBar progress={task.progress} priority={task.priority} />
                          </div>
                        )}
                        
                        {task.dueDate && (
                          <span className="text-[10px] text-slate-500 whitespace-nowrap">
                            📅 {new Date(task.dueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                      </div>
                      
                      {/* Col 6: Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 justify-end">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEditTask(task); }}
                          onMouseEnter={(e) => handleButtonHover(e.currentTarget, true)}
                          onMouseLeave={(e) => handleButtonHover(e.currentTarget, false)}
                          className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                          title="Modifier"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                          onMouseEnter={(e) => handleButtonHover(e.currentTarget, true)}
                          onMouseLeave={(e) => handleButtonHover(e.currentTarget, false)}
                          className="p-2 rounded-lg text-rose-400 transition-all hover:bg-rose-500/20"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                </div>
              )
            })}
            
            {/* État vide */}
            {filteredTasks.length === 0 && (
              <GlassCard hover={false} className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 flex items-center justify-center border border-white/5">
                  <Target className="w-10 h-10 text-slate-600" />
                </div>
                <p className="text-slate-300 text-lg font-medium">Aucune tâche trouvée</p>
                <p className="text-slate-600 text-sm mt-2">Créez une nouvelle tâche pour commencer</p>
                <button
                  onClick={() => { setEditingTask(null); setShowModal(true); }}
                  onMouseEnter={(e) => handleButtonHover(e.currentTarget, true)}
                  onMouseLeave={(e) => handleButtonHover(e.currentTarget, false)}
                  className="mt-6 px-5 py-2.5 rounded-xl 
                             bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 
                             text-emerald-400 border border-emerald-500/30
                             hover:from-emerald-500/30 hover:to-cyan-500/30
                             transition-all text-sm font-medium"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Créer une tâche
                </button>
              </GlassCard>
            )}
          </div>

          {/* === SIDEBAR STATS === */}
          <div ref={sidebarRef} className="space-y-4">
            {/* Cercle de progression */}
            <ProgressCircle completionPercent={completionPercent} stats={stats} />

            {/* Détails par statut */}
            <GlassCard className="p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Répartition
              </h3>
              <div className="space-y-2">
                {[
                  { label: 'En attente', value: stats.pending, color: 'slate' },
                  { label: 'En cours', value: stats.inProgress, color: 'amber' },
                  { label: 'Terminées', value: stats.completed, color: 'emerald' },
                  { label: 'Priorité haute', value: stats.highPriority, color: 'rose' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300
                      ${item.color === 'slate' ? 'bg-white/[0.02] hover:bg-white/[0.04]' : `bg-${item.color}-500/10 hover:bg-${item.color}-500/15`}
                    `}
                  >
                    <span className={`text-sm ${item.color === 'slate' ? 'text-slate-400' : `text-${item.color}-400`}`}>
                      {item.label}
                    </span>
                    <span className={`font-bold ${item.color === 'slate' ? 'text-slate-300' : `text-${item.color}-400`}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Conseil */}
            <GlassCard glowColor="emerald" className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0 border border-emerald-500/20">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-white font-medium">Astuce</p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Cliquez sur une tâche pour la modifier. Utilisez les filtres pour organiser votre vue.
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </main>

      {/* Task Modal */}
      <TaskModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSave={handleSaveTask}
        task={editingTask}
      />
    </div>
  )
})

// Composant cercle de progression avec GSAP
function ProgressCircle({ completionPercent, stats }: { completionPercent: number; stats: { completed: number; total: number } }) {
  const circleRef = useRef<SVGCircleElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const circumference = 2 * Math.PI * 60 // 377
  
  useEffect(() => {
    if (circleRef.current) {
      const strokeDasharray = (completionPercent / 100) * circumference
      gsap.to(circleRef.current, {
        strokeDasharray: `${strokeDasharray} ${circumference}`,
        duration: 1.5,
        ease: 'power2.out'
      })
    }
    if (textRef.current) {
      gsap.fromTo(textRef.current,
        { opacity: 0, scale: 0.5 },
        { opacity: 1, scale: 1, duration: 0.5, delay: 0.5 }
      )
    }
  }, [completionPercent, circumference])
  
  return (
    <GlassCard glowColor="emerald" className="p-6">
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-emerald-400" />
        Progression globale
      </h3>
      
      <div className="flex justify-center mb-4">
        <div className="relative w-36 h-36">
          {/* Background glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 blur-xl" />
          
          <svg width="144" height="144" className="transform -rotate-90 relative z-10">
            <defs>
              <linearGradient id="progressGradientTasks" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <circle
              cx="72" cy="72" r="60"
              stroke="rgba(51, 65, 85, 0.2)"
              strokeWidth="8"
              fill="none"
            />
            <circle
              ref={circleRef}
              cx="72" cy="72" r="60"
              stroke="url(#progressGradientTasks)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              filter="url(#glow)"
              strokeDasharray={`0 ${circumference}`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span 
              ref={textRef}
              className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"
            >
              {completionPercent}%
            </span>
            <span className="text-xs text-slate-500 mt-1">Complété</span>
          </div>
        </div>
      </div>
      
      <div className="text-center text-sm text-emerald-400/80">
        {stats.completed} sur {stats.total} tâches
      </div>
    </GlassCard>
  )
}

export default TasksPanel
