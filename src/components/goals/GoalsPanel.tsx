'use client'

import { useState, useRef, useEffect, memo } from 'react'
import gsap from 'gsap'
import { Plus, Target, Trash2, CheckCircle2, Circle, TrendingUp, Calendar } from 'lucide-react'
import { 
  useGoals, useCategories, useGoalActions,
  getCategoryColorClass 
} from '@/lib/store/selectors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

const GoalsPanel = memo(function GoalsPanel() {
  const goals = useGoals();
  const categories = useCategories();
  const { addGoal, updateGoal, deleteGoal } = useGoalActions();
  const [showAddForm, setShowAddForm] = useState(false)
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    categoryId: 'personal',
    milestones: [] as { title: string; completed: boolean }[],
  })
  const [newMilestone, setNewMilestone] = useState('')

  // Refs pour animations GSAP
  const headerRef = useRef<HTMLDivElement>(null)
  const addFormRef = useRef<HTMLDivElement>(null)
  const goalsGridRef = useRef<HTMLDivElement>(null)
  const overviewRef = useRef<HTMLDivElement>(null)

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(c => c.id === categoryId) || { name: 'Unknown', icon: '📋', color: 'slate' }
  }

  const handleAddGoal = () => {
    if (newGoal.title.trim()) {
      addGoal({
        ...newGoal,
        id: `goal-${Date.now()}`,
        currentValue: 0,
        progress: 0,
        startDate: new Date().toISOString().split('T')[0],
        status: 'active',
        milestones: (newGoal.milestones || []).map(m => ({ ...m, id: `ms-${Date.now()}-${Math.random().toString(36).slice(2, 9)}` })),
      })
      setNewGoal({
        title: '',
        description: '',
        categoryId: 'personal',
        milestones: [],
      })
      setShowAddForm(false)
    }
  }

  const addMilestoneToGoal = () => {
    if (newMilestone.trim()) {
      setNewGoal({
        ...newGoal,
        milestones: [...newGoal.milestones, { title: newMilestone, completed: false }],
      })
      setNewMilestone('')
    }
  }

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    const goal = goals.find(g => g.id === goalId)
    if (goal) {
      const updatedMilestones = (goal.milestones || []).map(m => 
        m.id === milestoneId ? { ...m, completed: !m.completed } : m
      )
      const completedCount = updatedMilestones.filter(m => m.completed).length
      const progress = updatedMilestones.length > 0 
        ? Math.round((completedCount / updatedMilestones.length) * 100) 
        : 0
      updateGoal(goalId, { milestones: updatedMilestones, progress })
    }
  }

  const updateProgress = (goalId: string, progress: number) => {
    updateGoal(goalId, { progress })
  }

  // Animations GSAP au montage
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headerRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.3 })
      gsap.fromTo(overviewRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3, delay: 0.3 })
    })
    return () => ctx.revert()
  }, [])

  // Animation du formulaire d'ajout
  useEffect(() => {
    if (addFormRef.current) {
      if (showAddForm) {
        gsap.fromTo(addFormRef.current,
          { opacity: 0, height: 0 },
          { opacity: 1, height: 'auto', duration: 0.3, ease: 'power2.out' }
        )
      }
    }
  }, [showAddForm])

  // Animation stagger pour les goals
  useEffect(() => {
    if (goalsGridRef.current) {
      const items = goalsGridRef.current.querySelectorAll('.goal-card')
      gsap.fromTo(items,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.3, stagger: 0.1, ease: 'power2.out' }
      )
    }
  }, [goals.length])

  // Fonction pour les effets hover
  const handleButtonHover = (element: HTMLElement | null, isHover: boolean) => {
    if (element) {
      gsap.to(element, {
        scale: isHover ? 1.02 : 1,
        duration: 0.15,
        ease: 'power2.out'
      })
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <main className="pl-[70px] p-6 space-y-6 h-full overflow-y-auto">
      {/* Header */}
      <div ref={headerRef} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Goals</h1>
          <p className="text-white/60">Track your long-term goals and milestones</p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Goal
        </Button>
      </div>

      {/* Add Goal Form */}
      {showAddForm && (
        <div ref={addFormRef} className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 overflow-hidden">
          <h3 className="text-lg font-semibold text-white mb-4">New Goal</h3>
          <div className="space-y-4">
            <Input
              placeholder="Goal title"
              value={newGoal.title}
              onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
            <Input
              placeholder="Description (optional)"
              value={newGoal.description}
              onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
            <select
              value={newGoal.categoryId}
              onChange={(e) => setNewGoal({ ...newGoal, categoryId: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
              ))}
            </select>
            
            {/* Milestones */}
            <div className="space-y-2">
              <label className="text-sm text-white/60">Milestones</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a milestone"
                  value={newMilestone}
                  onChange={(e) => setNewMilestone(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addMilestoneToGoal()}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
                <Button type="button" onClick={addMilestoneToGoal} variant="outline" className="border-white/20 text-white">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {newGoal.milestones.map((m, i) => (
                  <Badge key={i} variant="outline" className="border-white/20 text-white/70">
                    {m.title}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" onClick={() => setShowAddForm(false)} className="text-white/60">
              Cancel
            </Button>
            <Button onClick={handleAddGoal} className="bg-purple-500 hover:bg-purple-600 text-white">
              Create Goal
            </Button>
          </div>
        </div>
      )}

      {/* Goals Grid */}
      <div ref={goalsGridRef} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {goals.map((goal) => {
          const category = getCategoryInfo(goal.categoryId)
          return (
            <GoalCard 
              key={goal.id} 
              goal={goal} 
              category={category} 
              onDelete={() => deleteGoal(goal.id)}
              onToggleMilestone={(milestoneId) => toggleMilestone(goal.id, milestoneId)}
              onUpdateProgress={(progress) => updateProgress(goal.id, progress)}
            />
          )
        })}
      </div>

      {/* Goals Overview */}
      <div ref={overviewRef} className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          Goals Overview
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-xl bg-white/5">
            <p className="text-3xl font-bold text-white">{goals.length}</p>
            <p className="text-sm text-white/40">Total Goals</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-white/5">
            <p className="text-3xl font-bold text-emerald-400">
              {goals.filter(g => g.progress === 100).length}
            </p>
            <p className="text-sm text-white/40">Completed</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-white/5">
            <p className="text-3xl font-bold text-amber-400">
              {goals.filter(g => g.progress >= 50 && g.progress < 100).length}
            </p>
            <p className="text-sm text-white/40">In Progress</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-white/5">
            <p className="text-3xl font-bold text-cyan-400">
              {Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length || 0)}%
            </p>
            <p className="text-sm text-white/40">Avg Progress</p>
          </div>
        </div>
      </div>
      </main>
    </div>
  )
})

// Composant GoalCard avec animation GSAP
const GoalCard = memo(function GoalCard({ 
  goal, 
  category, 
  onDelete, 
  onToggleMilestone, 
  onUpdateProgress 
}: { 
  goal: { id: string; title: string; description?: string; progress: number; categoryId: string; milestones?: { id: string; title: string; completed: boolean }[] }
  category: { name: string; icon: string; color: string }
  onDelete: () => void
  onToggleMilestone: (milestoneId: string) => void
  onUpdateProgress: (progress: number) => void
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (progressRef.current) {
      gsap.to(progressRef.current, {
        width: `${goal.progress}%`,
        duration: 0.5,
        ease: 'power2.out'
      })
    }
  }, [goal.progress])

  const handleButtonHover = (element: HTMLElement | null, isHover: boolean) => {
    if (element) {
      gsap.to(element, {
        scale: isHover ? 1.02 : 1,
        duration: 0.15,
        ease: 'power2.out'
      })
    }
  }

  return (
    <div
      ref={cardRef}
      className="goal-card bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${getCategoryColorClass(category.color)}`}>
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{goal.title}</h3>
            <p className="text-sm text-white/40">{category.icon} {category.name}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {goal.description && (
        <p className="text-sm text-white/60 mb-4">{goal.description}</p>
      )}

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white/60">Progress</span>
          <span className="text-sm font-medium text-white">{goal.progress}%</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            ref={progressRef}
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
            style={{ width: 0 }}
          />
        </div>
      </div>

      {/* Milestones */}
      {goal.milestones && goal.milestones.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-white/60">Milestones</h4>
          <div className="space-y-2">
            {goal.milestones.map((milestone) => (
              <button
                key={milestone.id}
                onClick={() => onToggleMilestone(milestone.id)}
                onMouseEnter={(e) => handleButtonHover(e.currentTarget, true)}
                onMouseLeave={(e) => handleButtonHover(e.currentTarget, false)}
                className="w-full flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                {milestone.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Circle className="w-5 h-5 text-white/40" />
                )}
                <span className={`text-sm ${milestone.completed ? 'text-white/40 line-through' : 'text-white'}`}>
                  {milestone.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Progress Update */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40">Update progress:</span>
          <div className="flex gap-1">
            {[25, 50, 75, 100].map(val => (
              <Button
                key={val}
                variant="ghost"
                size="sm"
                onClick={() => onUpdateProgress(val)}
                onMouseEnter={(e) => handleButtonHover(e.currentTarget, true)}
                onMouseLeave={(e) => handleButtonHover(e.currentTarget, false)}
                className="h-6 px-2 text-xs text-white/60 hover:text-white hover:bg-white/10"
              >
                {val}%
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
})

export default GoalsPanel
