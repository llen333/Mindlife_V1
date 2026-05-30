'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  Legend
} from 'recharts'
import { useStore } from '@/lib/store'

// Weekly progress data
const weeklyData = [
  { day: 'Mon', tasks: 5, habits: 3, progress: 60 },
  { day: 'Tue', tasks: 8, habits: 4, progress: 75 },
  { day: 'Wed', tasks: 6, habits: 5, progress: 65 },
  { day: 'Thu', tasks: 9, habits: 4, progress: 85 },
  { day: 'Fri', tasks: 7, habits: 5, progress: 70 },
  { day: 'Sat', tasks: 4, habits: 6, progress: 55 },
  { day: 'Sun', tasks: 3, habits: 4, progress: 45 },
]

// Category distribution data
const categoryColors: Record<string, string> = {
  sport: '#10b981',
  education: '#06b6d4',
  personal: '#a855f7',
  mind: '#f59e0b',
  professional: '#64748b',
}

export function WeeklyProgressChart() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      )
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="h-80 w-full bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-4">Weekly Progress</h3>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={weeklyData}>
          <defs>
            <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorHabits" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" fontSize={12} />
          <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(0,0,0,0.8)', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              color: '#fff'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="tasks" 
            stroke="#10b981" 
            fillOpacity={1} 
            fill="url(#colorTasks)" 
            strokeWidth={2}
          />
          <Area 
            type="monotone" 
            dataKey="habits" 
            stroke="#f59e0b" 
            fillOpacity={1} 
            fill="url(#colorHabits)" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function CategoryDistribution() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { tasks, categories } = useStore()

  // Calculate task count per category
  const categoryData = categories.map(cat => {
    const count = tasks.filter(t => t.categoryId === cat.id).length
    return {
      name: cat.name,
      value: count,
      color: categoryColors[cat.id] || '#64748b',
    }
  }).filter(d => d.value > 0)

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0.1, ease: 'power2.out' }
      )
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="h-80 w-full bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-4">Tasks by Category</h3>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={categoryData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
          >
            {categoryData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(0,0,0,0.8)', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              color: '#fff'
            }}
          />
          <Legend 
            wrapperStyle={{ color: '#fff' }}
            formatter={(value) => <span className="text-white/70 text-sm">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export function GoalsProgressChart() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { goals } = useStore()

  const goalData = goals.map(goal => ({
    name: goal.title.substring(0, 15) + (goal.title.length > 15 ? '...' : ''),
    progress: goal.progress,
    fill: categoryColors[goal.categoryId] || '#64748b',
  }))

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0.2, ease: 'power2.out' }
      )
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="h-80 w-full bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-4">Goals Progress</h3>
      <ResponsiveContainer width="100%" height="85%">
        <RadialBarChart 
          cx="50%" 
          cy="50%" 
          innerRadius="20%" 
          outerRadius="90%" 
          data={goalData} 
          startAngle={180} 
          endAngle={0}
        >
          <RadialBar
            background
            dataKey="progress"
            cornerRadius={10}
          />
          <Legend 
            iconSize={10} 
            layout="vertical" 
            verticalAlign="middle" 
            align="right"
            wrapperStyle={{ color: '#fff' }}
            formatter={(value) => <span className="text-white/70 text-xs">{value}</span>}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(0,0,0,0.8)', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              color: '#fff'
            }}
            formatter={(value: number) => [`${value}%`, 'Progress']}
          />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  )
}

// Memoized version for better performance
import React from 'react'
const MemoizedProgressChart = React.memo(function ProgressChart() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <WeeklyProgressChart />
      <div className="space-y-6">
        <CategoryDistribution />
        <GoalsProgressChart />
      </div>
    </div>
  )
})

export default MemoizedProgressChart
