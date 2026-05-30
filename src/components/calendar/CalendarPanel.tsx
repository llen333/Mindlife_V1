'use client'

import { useState, useRef, useEffect, memo } from 'react'
import gsap from 'gsap'
import { Plus, ChevronLeft, ChevronRight, Clock, MapPin, Trash2 } from 'lucide-react'
import { 
  useEvents, useCategories, useEventActions,
  getCategoryColorClass 
} from '@/lib/store/selectors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const CalendarPanel = memo(function CalendarPanel() {
  const events = useEvents();
  const categories = useCategories();
  const { addEvent, deleteEvent } = useEventActions();
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startTime: '09:00',
    endTime: '10:00',
    categoryId: 'cat-professional',
  })

  // Refs pour animations GSAP
  const headerRef = useRef<HTMLDivElement>(null)
  const calendarRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const upcomingRef = useRef<HTMLDivElement>(null)
  const addFormRef = useRef<HTMLDivElement>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()
  
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }
  
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return events.filter(e => {
      const eventDate = new Date(e.date).toISOString().split('T')[0]
      return eventDate === dateStr
    })
  }

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(c => c.id === categoryId) || { name: 'Unknown', icon: '📋', color: 'slate' }
  }

  const handleAddEvent = () => {
    if (newEvent.title.trim() && selectedDate) {
      addEvent({
        ...newEvent,
        date: selectedDate.toISOString().split('T')[0],
        color: getCategoryInfo(newEvent.categoryId).color,
        startAt: new Date(selectedDate.toISOString().split('T')[0] + 'T' + newEvent.startTime).toISOString(),
      } as any)
      setNewEvent({
        title: '',
        description: '',
        startTime: '09:00',
        endTime: '10:00',
        categoryId: 'cat-professional',
      })
      setShowAddForm(false)
    }
  }

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : []

  const calendarDays: (Date | null)[] = []
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(year, month, day))
  }

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (date: Date) => {
    return selectedDate?.toDateString() === date.toDateString()
  }

  // Animations GSAP au montage
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headerRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.3 })
      gsap.fromTo(calendarRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3, delay: 0.1 })
      gsap.fromTo(sidebarRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3, delay: 0.2 })
      gsap.fromTo(upcomingRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3, delay: 0.3 })
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

  // Animation des événements de la date sélectionnée
  useEffect(() => {
    if (sidebarRef.current) {
      const items = sidebarRef.current.querySelectorAll('.event-item')
      gsap.fromTo(items,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out' }
      )
    }
  }, [selectedDateEvents.length])

  // Fonction pour les effets hover
  const handleButtonHover = (element: HTMLElement | null, isHover: boolean) => {
    if (element) {
      gsap.to(element, {
        scale: isHover ? 1.05 : 1,
        duration: 0.15,
        ease: 'power2.out'
      })
    }
  }

  const handleButtonTap = (element: HTMLElement | null, isPressed: boolean) => {
    if (element) {
      gsap.to(element, {
        scale: isPressed ? 0.95 : 1,
        duration: 0.1,
        ease: 'power2.out'
      })
    }
  }

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      {/* Header */}
      <div ref={headerRef} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Calendar</h1>
          <p className="text-white/60">Plan and organize your schedule</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div
          ref={calendarRef}
          className="lg:col-span-2 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
        >
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              {months[month]} {year}
            </h2>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={prevMonth} className="text-white/60 hover:text-white">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={nextMonth} className="text-white/60 hover:text-white">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {daysOfWeek.map(day => (
              <div key={day} className="text-center text-sm font-medium text-white/40 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="h-12" />
              }
              
              const dayEvents = getEventsForDate(date as Date)
              const hasEvents = dayEvents.length > 0
              
              return (
                <button
                  key={(date as Date).toISOString()}
                  onClick={() => {
                    setSelectedDate(date)
                    setShowAddForm(false)
                  }}
                  onMouseEnter={(e) => handleButtonHover(e.currentTarget, true)}
                  onMouseLeave={(e) => handleButtonHover(e.currentTarget, false)}
                  onMouseDown={(e) => handleButtonTap(e.currentTarget, true)}
                  onMouseUp={(e) => handleButtonTap(e.currentTarget, false)}
                  className={`
                    h-12 rounded-xl flex flex-col items-center justify-center relative transition-all
                    ${isToday(date) 
                      ? 'bg-gradient-to-br from-emerald-500 to-cyan-500 text-white font-bold' 
                      : isSelected(date)
                        ? 'bg-white/20 text-white'
                        : 'hover:bg-white/10 text-white/70'
                    }
                  `}
                >
                  <span>{(date as Date).getDate()}</span>
                  {hasEvents && (
                    <div className="flex gap-1 absolute bottom-1">
                      {dayEvents.slice(0, 3).map((e, i) => (
                        <div
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full ${
                            e.color === 'emerald' ? 'bg-emerald-400' :
                            e.color === 'cyan' ? 'bg-cyan-400' :
                            e.color === 'purple' ? 'bg-purple-400' :
                            e.color === 'amber' ? 'bg-amber-400' :
                            'bg-slate-400'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Selected Date Details */}
        <div
          ref={sidebarRef}
          className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
        >
          {selectedDate ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                <Button
                  onClick={() => setShowAddForm(!showAddForm)}
                  size="sm"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Event
                </Button>
              </div>

              {/* Add Event Form */}
              {showAddForm && (
                <div ref={addFormRef} className="mb-4 p-4 rounded-xl bg-white/5 border border-white/10 space-y-3 overflow-hidden">
                  <Input
                    placeholder="Event title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-white/40 mb-1 block">Start</label>
                      <Input
                        type="time"
                        value={newEvent.startTime}
                        onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/40 mb-1 block">End</label>
                      <Input
                        type="time"
                        value={newEvent.endTime}
                        onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                  </div>
                  <select
                    value={newEvent.categoryId}
                    onChange={(e) => setNewEvent({ ...newEvent, categoryId: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                  <Button onClick={handleAddEvent} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
                    Add Event
                  </Button>
                </div>
              )}

              {/* Events List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {selectedDateEvents.length > 0 ? (
                  selectedDateEvents.map((event) => {
                    const category = getCategoryInfo(event.categoryId)
                    return (
                      <div
                        key={event.id}
                        className={`event-item p-4 rounded-xl border ${getCategoryColorClass(category.color)} group`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-white">{event.title}</h4>
                            <div className="flex items-center gap-2 mt-1 text-sm text-white/60">
                              <Clock className="w-3 h-3" />
                              <span>{event.startTime} - {event.endTime}</span>
                            </div>
                            <p className="text-xs text-white/40 mt-1">
                              {category.icon} {category.name}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteEvent(event.id)}
                            className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-8 text-white/40">
                    <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No events scheduled</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-white/40">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Select a date to view events</p>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Events */}
      <div
        ref={upcomingRef}
        className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Upcoming Events</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events
            .filter(e => new Date(e.date) >= today)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 6)
            .map((event) => {
              const category = getCategoryInfo(event.categoryId)
              return (
                <div
                  key={event.id}
                  className={`p-4 rounded-xl border ${getCategoryColorClass(category.color)}`}
                >
                  <h4 className="font-medium text-white">{event.title}</h4>
                  <p className="text-sm text-white/60 mt-1">
                    {new Date(event.date).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p className="text-xs text-white/40 mt-1">
                    {event.startTime} - {event.endTime}
                  </p>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
})

export default CalendarPanel
