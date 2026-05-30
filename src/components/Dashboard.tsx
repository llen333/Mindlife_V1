'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Calendar, Clock, Target, TrendingUp, CheckCircle2, Sparkles, Loader2 } from 'lucide-react'
import { useStore, getCategoryColorClass, Goal } from '@/lib/store'
import StatsCards from './dashboard/StatsCards'
import ProgressChart from './dashboard/ProgressChart'
import GoalModal from './goals/GoalModal'

export default function Dashboard() {
  const { tasks, goals, habits, events, categories, translate, isLoading, dataLoaded } = useStore()
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  
  // Refs pour les animations GSAP
  const headerRef = useRef<HTMLDivElement>(null)
  const tasksSectionRef = useRef<HTMLDivElement>(null)
  const eventsSectionRef = useRef<HTMLDivElement>(null)
  const habitsSectionRef = useRef<HTMLDivElement>(null)
  const goalsSectionRef = useRef<HTMLDivElement>(null)
  const statsSectionRef = useRef<HTMLDivElement>(null)

  // Animations GSAP au montage - TOUJOURS appelé, avant les early returns
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(headerRef.current, 
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
      )
      
      // Tasks section
      gsap.fromTo(tasksSectionRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.3, delay: 0.1, ease: 'power2.out' }
      )
      
      // Events section
      gsap.fromTo(eventsSectionRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.3, delay: 0.2, ease: 'power2.out' }
      )
      
      // Habits section
      gsap.fromTo(habitsSectionRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.3, delay: 0.3, ease: 'power2.out' }
      )
      
      // Goals section
      gsap.fromTo(goalsSectionRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.3, delay: 0.4, ease: 'power2.out' }
      )
      
      // Stats section
      gsap.fromTo(statsSectionRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.3, delay: 0.5, ease: 'power2.out' }
      )
    })
    
    return () => ctx.revert()
  }, [])
  
  // Show loading state - APRÈS les hooks
  if (isLoading || !dataLoaded) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-white/60">Chargement des données...</p>
        </div>
      </div>
    )
  }
  
  const todayStr = new Date().toISOString().split('T')[0]
  const todayEvents = events.filter(e => 
    new Date(e.date).toISOString().split('T')[0] === todayStr
  )
  
  const todayHabits = habits.filter(h => !h.completedDates.includes(todayStr))
  
  const pendingTasks = tasks.filter(t => t.status !== 'completed').slice(0, 5)
  
  const getCategoryInfo = (categoryId: string) => {
    return categories.find(c => c.id === categoryId) || { name: 'Unknown', icon: '📋', color: 'slate' }
  }

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      {/* Header */}
      <div ref={headerRef} className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          {translate('welcomeBack')} 
          <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
        </h1>
        <p className="text-white/60">
          {translate('welcomeMessage')}
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Quick Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <div
          ref={tasksSectionRef}
          className="lg:col-span-2 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              {translate('pendingTasks')}
            </h3>
            <span className="text-sm text-white/40">
              {tasks.filter(t => t.status !== 'completed').length} {translate('pending').toLowerCase()}
            </span>
          </div>
          
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {pendingTasks.map((task) => {
              const category = getCategoryInfo(task.categoryId)
              return (
                <div
                  key={task.id}
                  className="list-item flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                >
                  <div className={`w-3 h-3 rounded-full ${
                    task.priority === 'high' ? 'bg-rose-500' :
                    task.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-white font-medium">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm">
                        {category.icon} {category.name}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    task.status === 'in_progress' 
                      ? 'bg-amber-500/20 text-amber-400' 
                      : 'bg-white/10 text-white/60'
                  }`}>
                    {task.status === 'in_progress' ? translate('inProgress') : translate('pending')}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Today's Schedule */}
        <div
          ref={eventsSectionRef}
          className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
        >
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
            <Calendar className="w-5 h-5 text-purple-400" />
            {translate('todayEvents')}
          </h3>
          
          <div className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar">
            {todayEvents.length > 0 ? (
              todayEvents.map((event) => {
                const category = getCategoryInfo(event.categoryId)
                return (
                  <div
                    key={event.id}
                    className="list-item flex items-center gap-3 p-3 rounded-xl bg-white/5"
                  >
                    <div className="text-center">
                      <p className="text-sm text-white/60">{event.startTime}</p>
                      <p className="text-xs text-white/40">{event.endTime}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{event.title}</p>
                      <p className="text-sm text-white/40">{category.icon} {category.name}</p>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8 text-white/40">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{translate('noEvents')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Habits & Goals Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Habits to Complete */}
        <div
          ref={habitsSectionRef}
          className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
        >
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
            <Target className="w-5 h-5 text-amber-400" />
            {translate('habits')} - {translate('today')}
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {todayHabits.map((habit) => {
              const category = getCategoryInfo(habit.categoryId)
              return (
                <div
                  key={habit.id}
                  className={`
                    list-item p-4 rounded-xl border text-center cursor-pointer hover:scale-105 transition-transform
                    ${getCategoryColorClass(category.color)}
                  `}
                >
                  <span className="text-2xl mb-2 block">{habit.icon}</span>
                  <p className="text-sm font-medium">{habit.title}</p>
                  <p className="text-xs opacity-60 mt-1">🔥 {habit.streak} {translate('day')} {translate('streak')}</p>
                </div>
              )
            })}
          </div>
          
          {todayHabits.length === 0 && (
            <div className="text-center py-8 text-white/40">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-400 opacity-50" />
              <p>{translate('habitsCompleted')} 🎉</p>
            </div>
          )}
        </div>

        {/* Goals Progress */}
        <div
          ref={goalsSectionRef}
          className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
        >
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            {translate('activeGoals')}
          </h3>

          <div className="space-y-4">
            {goals.slice(0, 4).map((goal) => {
              const category = getCategoryInfo(goal.categoryId)
              return (
                <GoalProgressBar
                  key={goal.id}
                  goal={goal}
                  category={category}
                  onClick={() => setSelectedGoal(goal)}
                />
              )
            })}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <ProgressChart />

      {/* Quick Stats */}
      <div ref={statsSectionRef} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: translate('totalTasks'), value: tasks.length, icon: CheckCircle2, color: 'text-emerald-400' },
          { label: translate('activeGoals'), value: goals.length, icon: Target, color: 'text-purple-400' },
          { label: translate('dailyHabits'), value: habits.length, icon: Clock, color: 'text-amber-400' },
          { label: translate('categories'), value: categories.length, icon: TrendingUp, color: 'text-cyan-400' },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 text-center hover:bg-white/10 transition-colors"
            >
              <Icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-white/40">{stat.label}</p>
            </div>
          )
        })}
      </div>

      {/* Goal Modal */}
      <GoalModal
        goal={selectedGoal}
        isOpen={!!selectedGoal}
        onClose={() => setSelectedGoal(null)}
      />
    </div>
  )
}

// Composant séparé pour la barre de progression des objectifs avec animation GSAP
function GoalProgressBar({
  goal,
  category,
  onClick
}: {
  goal: { id: string; title: string; progress: number; categoryId: string };
  category: { icon: string; name: string };
  onClick: () => void;
}) {
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (progressRef.current) {
      gsap.fromTo(progressRef.current,
        { width: '0%' },
        { width: `${goal.progress}%`, duration: 0.8, delay: 0.5, ease: 'power2.out' }
      )
    }
  }, [goal.progress])

  return (
    <div
      className="list-item cursor-pointer hover:bg-white/5 rounded-lg p-2 -mx-2 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-white font-medium">{goal.title}</p>
        <span className="text-sm text-white/60">{goal.progress}%</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          ref={progressRef}
          className={`h-full rounded-full ${
            goal.progress >= 75 ? 'bg-gradient-to-r from-emerald-400 to-cyan-400' :
            goal.progress >= 50 ? 'bg-gradient-to-r from-amber-400 to-orange-400' :
            'bg-gradient-to-r from-rose-400 to-pink-400'
          }`}
          style={{ width: 0 }}
        />
      </div>
      <p className="text-xs text-white/40 mt-1">{category.icon} {category.name}</p>
    </div>
  )
}
