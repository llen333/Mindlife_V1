'use client'

import { useState, useRef, useEffect, memo } from 'react'
import gsap from 'gsap'
import { Plus, Flame, Check, Trash2, Calendar, Target, TrendingUp } from 'lucide-react'
import { 
  useHabits, useCategories, useHabitActions,
  getCategoryColorClass 
} from '@/lib/store/selectors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const HabitsPanel = memo(function HabitsPanel() {
  const habits = useHabits();
  const categories = useCategories();
  const { toggleHabitComplete } = useHabitActions();
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null)

  // Refs pour animations GSAP
  const headerRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const weekHeaderRef = useRef<HTMLDivElement>(null)
  const habitsListRef = useRef<HTMLDivElement>(null)
  const categorySectionRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  const todayStr = new Date().toISOString().split('T')[0]
  const weekDays = getLast7Days()

  function getLast7Days() {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      days.push({
        date: date.toISOString().split('T')[0],
        dayName: daysOfWeek[date.getDay() === 0 ? 6 : date.getDay() - 1],
        dayNum: date.getDate(),
        isToday: i === 0,
      })
    }
    return days
  }

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(c => c.id === categoryId) || { name: 'Unknown', icon: '📋', color: 'slate' }
  }

  const isHabitCompleted = (habitId: string, date: string) => {
    const habit = habits.find(h => h.id === habitId)
    return habit?.completedDates.includes(date) || false
  }

  const getCompletionRate = (habitId: string) => {
    const habit = habits.find(h => h.id === habitId)
    if (!habit) return 0
    const last30Days = 30
    const completed = habit.completedDates.slice(-last30Days).length
    return Math.round((completed / last30Days) * 100)
  }

  // Stats
  const todayCompleted = habits.filter(h => h.completedDates.includes(todayStr)).length
  const totalStreak = habits.reduce((acc, h) => acc + h.streak, 0)
  const bestStreak = Math.max(...habits.map(h => h.streak), 0)
  const avgCompletionRate = Math.round(
    habits.reduce((acc, h) => acc + getCompletionRate(h.id), 0) / habits.length || 0
  )

  // Animations GSAP au montage
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headerRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.3 })
      gsap.fromTo(statsRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3, delay: 0.1 })
      gsap.fromTo(weekHeaderRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3, delay: 0.2 })
      gsap.fromTo(categorySectionRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3, delay: 0.3 })
      gsap.fromTo(progressRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3, delay: 0.4 })
    })
    return () => ctx.revert()
  }, [])

  // Animation stagger pour les habitudes
  useEffect(() => {
    if (habitsListRef.current) {
      const items = habitsListRef.current.querySelectorAll('.habit-item')
      gsap.fromTo(items,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out' }
      )
    }
  }, [habits.length])

  // Fonction pour les effets hover sur les boutons
  const handleButtonHover = (element: HTMLElement | null, isHover: boolean) => {
    if (element) {
      gsap.to(element, {
        scale: isHover ? 1.1 : 1,
        duration: 0.15,
        ease: 'power2.out'
      })
    }
  }

  const handleButtonTap = (element: HTMLElement | null, isPressed: boolean) => {
    if (element) {
      gsap.to(element, {
        scale: isPressed ? 0.9 : 1,
        duration: 0.1,
        ease: 'power2.out'
      })
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a] pl-[70px]">
      <main className="p-6 space-y-6 h-full overflow-y-auto">
      {/* Header */}
      <div ref={headerRef} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Habits</h1>
          <p className="text-white/60">Build consistent habits for a better life</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div ref={statsRef} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 text-center">
          <Check className="w-6 h-6 mx-auto mb-2 text-emerald-400" />
          <p className="text-2xl font-bold text-white">{todayCompleted}/{habits.length}</p>
          <p className="text-xs text-white/40">Today</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 text-center">
          <Flame className="w-6 h-6 mx-auto mb-2 text-amber-400" />
          <p className="text-2xl font-bold text-white">{totalStreak}</p>
          <p className="text-xs text-white/40">Total Streak</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 text-center">
          <Target className="w-6 h-6 mx-auto mb-2 text-purple-400" />
          <p className="text-2xl font-bold text-white">{bestStreak}</p>
          <p className="text-xs text-white/40">Best Streak</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 text-center">
          <TrendingUp className="w-6 h-6 mx-auto mb-2 text-cyan-400" />
          <p className="text-2xl font-bold text-white">{avgCompletionRate}%</p>
          <p className="text-xs text-white/40">Avg Rate</p>
        </div>
      </div>

      {/* Week Days Header */}
      <div ref={weekHeaderRef} className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
        <div className="grid grid-cols-8 gap-2 mb-4">
          <div className="text-center">
            <span className="text-sm font-medium text-white/40">Habit</span>
          </div>
          {weekDays.map((day) => (
            <div key={day.date} className="text-center">
              <span className={`text-xs ${day.isToday ? 'text-emerald-400 font-bold' : 'text-white/40'}`}>
                {day.dayName}
              </span>
              <div className={`text-sm mt-1 ${day.isToday ? 'text-emerald-400 font-bold' : 'text-white/60'}`}>
                {day.dayNum}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Habits List */}
      <div ref={habitsListRef} className="space-y-3">
        {habits.map((habit) => {
          const category = getCategoryInfo(habit.categoryId)
          
          return (
            <div
              key={habit.id}
              className="habit-item bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 hover:border-white/20 transition-all"
            >
              <div className="grid grid-cols-8 gap-2 items-center">
                {/* Habit Info */}
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getCategoryColorClass(category.color)}`}>
                    <span className="text-xl">{habit.icon}</span>
                  </div>
                  <div className="hidden sm:block">
                    <p className="font-medium text-white text-sm">{habit.title}</p>
                    <div className="flex items-center gap-1 text-xs text-white/40">
                      <Flame className="w-3 h-3 text-amber-400" />
                      <span>{habit.streak} days</span>
                    </div>
                  </div>
                </div>

                {/* Week Days */}
                {weekDays.map((day) => {
                  const isCompleted = isHabitCompleted(habit.id, day.date)
                  return (
                    <button
                      key={day.date}
                      onClick={() => toggleHabitComplete(habit.id, day.date)}
                      onMouseEnter={(e) => handleButtonHover(e.currentTarget, true)}
                      onMouseLeave={(e) => handleButtonHover(e.currentTarget, false)}
                      onMouseDown={(e) => handleButtonTap(e.currentTarget, true)}
                      onMouseUp={(e) => handleButtonTap(e.currentTarget, false)}
                      disabled={!day.isToday}
                      className={`
                        aspect-square rounded-lg flex items-center justify-center transition-all
                        ${isCompleted 
                          ? 'bg-emerald-500 text-white' 
                          : day.isToday 
                            ? 'bg-white/10 hover:bg-white/20 border border-white/20 cursor-pointer'
                            : 'bg-white/5 cursor-not-allowed'
                        }
                      `}
                    >
                      {isCompleted && <Check className="w-4 h-4" />}
                    </button>
                  )
                })}
              </div>

              {/* Mobile: Show habit title */}
              <div className="sm:hidden mt-3 flex items-center justify-between">
                <p className="font-medium text-white">{habit.title}</p>
                <Badge className={getCategoryColorClass(category.color)}>
                  <Flame className="w-3 h-3 mr-1" />
                  {habit.streak}
                </Badge>
              </div>
            </div>
          )
        })}
      </div>

      {/* Habits by Category */}
      <div ref={categorySectionRef} className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-cyan-400" />
          Habits by Category
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {categories.map((category) => {
            const categoryHabits = habits.filter(h => h.categoryId === category.id)
            const completedToday = categoryHabits.filter(h => h.completedDates.includes(todayStr)).length
            
            return (
              <div
                key={category.id}
                onMouseEnter={(e) => handleButtonHover(e.currentTarget, true)}
                onMouseLeave={(e) => handleButtonHover(e.currentTarget, false)}
                className={`p-4 rounded-xl border ${getCategoryColorClass(category.color)}`}
              >
                <div className="text-2xl mb-2">{category.icon}</div>
                <p className="font-medium text-sm">{category.name}</p>
                <p className="text-xs opacity-60 mt-1">
                  {completedToday}/{categoryHabits.length} today
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Progress Overview */}
      <div ref={progressRef} className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Weekly Progress</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {habits.map((habit) => {
            const completionRate = getCompletionRate(habit.id)
            const category = getCategoryInfo(habit.categoryId)
            
            return (
              <HabitProgressBar key={habit.id} habit={habit} completionRate={completionRate} category={category} />
            )
          })}
        </div>
      </div>
      </main>
    </div>
  )
})

// Composant séparé pour la barre de progression avec animation GSAP
function HabitProgressBar({ habit, completionRate, category }: { 
  habit: { id: string; icon: string; title: string; categoryId: string }
  completionRate: number
  category: { icon: string; name: string }
}) {
  const progressRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (progressRef.current) {
      gsap.fromTo(progressRef.current,
        { width: '0%' },
        { width: `${completionRate}%`, duration: 0.5, delay: 0.5, ease: 'power2.out' }
      )
    }
  }, [completionRate])
  
  return (
    <div className="p-4 rounded-xl bg-white/5">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xl">{habit.icon}</span>
        <div className="flex-1">
          <p className="text-sm font-medium text-white">{habit.title}</p>
          <p className="text-xs text-white/40">{category.icon} {category.name}</p>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-white/60">
          <span>Completion rate</span>
          <span>{completionRate}%</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            ref={progressRef}
            className={`h-full rounded-full ${
              completionRate >= 80 ? 'bg-emerald-500' :
              completionRate >= 50 ? 'bg-amber-500' : 'bg-rose-500'
            }`}
            style={{ width: 0 }}
          />
        </div>
      </div>
    </div>
  )
}

export default HabitsPanel
