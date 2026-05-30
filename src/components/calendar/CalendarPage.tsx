'use client';

import { useState, useMemo, Fragment, useEffect, useRef, forwardRef } from 'react';
import gsap from 'gsap';
import {
  ChevronLeft, ChevronRight, Plus, Clock, MapPin,
  Calendar, Zap, TrendingUp
} from 'lucide-react';
import { useStore, Event, Goal, Task } from '@/lib/store';
import MindLifeHeader from '../MindLifeHeader';
import EventDetailModal from './EventDetailModal';
import CreateEventModal from './CreateEventModal';
import GoalModal from '../goals/GoalModal';
import TaskModal from '../goals/TaskModal';
import { COLOR_BG_CLASS, COLOR_BG_TRANSPARENT_CLASS, GOAL_CATEGORIES } from '@/lib/data/constants';

const DAYS = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];
const DAYS_FULL = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

const PRIORITY_CONFIG = {
  low: { label: 'Basse', color: 'text-slate-400', bg: 'bg-slate-500/20', border: 'border-slate-500/30' },
  medium: { label: 'Moyenne', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30' },
  high: { label: 'Haute', color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/30' },
  urgent: { label: 'Urgente', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' },
};

// Event illustrations for different categories
const EVENT_ILLUSTRATIONS: Record<string, { emoji: string; gradient: string }> = {
  'cat-sport': { emoji: '🏃', gradient: 'from-emerald-500/20 to-cyan-500/20' },
  'cat-education': { emoji: '📚', gradient: 'from-blue-500/20 to-violet-500/20' },
  'cat-personal': { emoji: '🧠', gradient: 'from-violet-500/20 to-purple-500/20' },
  'cat-spirituality': { emoji: '🧘', gradient: 'from-amber-500/20 to-orange-500/20' },
  'cat-professional': { emoji: '💼', gradient: 'from-slate-500/20 to-gray-500/20' },
};

// GlassCard Component
const GlassCard = ({
  children,
  className = '',
  glowColor = 'emerald',
  hover = true
}: {
  children: React.ReactNode
  className?: string
  glowColor?: string
  hover?: boolean
}) => {
  const glowColors: Record<string, string> = {
    emerald: 'hover:shadow-emerald-500/10',
    amber: 'hover:shadow-amber-500/10',
    rose: 'hover:shadow-rose-500/10',
    cyan: 'hover:shadow-cyan-500/10',
    violet: 'hover:shadow-violet-500/10',
  };

  return (
    <div
      className={`
        relative overflow-hidden
        bg-white/[0.03] backdrop-blur-xl
        border border-white/[0.08]
        rounded-2xl
        shadow-xl shadow-black/20
        ${hover ? `hover:shadow-2xl ${glowColors[glowColor]} hover:border-white/[0.15] hover:scale-[1.01] hover:-translate-y-0.5 transition-transform duration-200 ease-out` : ''}
        before:absolute before:inset-0
        before:bg-gradient-to-b before:from-white/[0.07] before:via-transparent before:to-transparent
        before:pointer-events-none
        ${className}
      `}
    >
      {children}
    </div>
  );
};

// Time slot component for week/day views
const TimeSlot = ({
  time,
  events,
  goals,
  isToday,
  isCurrentHour,
  onSlotClick,
  onEventClick
}: {
  time: string;
  events: Event[];
  goals: Goal[];
  isToday: boolean;
  isCurrentHour: boolean;
  onSlotClick: () => void;
  onEventClick: (event: Event, e: React.MouseEvent) => void;
}) => {
  const hour = parseInt(time.split(':')[0]);
  const isWorkHour = hour >= 9 && hour <= 18;
  const eventsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (eventsContainerRef.current) {
      const eventEls = eventsContainerRef.current.querySelectorAll('.event-item');
      gsap.fromTo(eventEls,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.3, stagger: 0.05, ease: 'power2.out' }
      );
    }
  }, [events]);

  return (
    <div
      onClick={onSlotClick}
      className={`
        relative min-h-[70px] border-b border-white/[0.05]
        ${isCurrentHour ? 'bg-cyan-500/5' : isWorkHour ? 'bg-white/[0.01]' : ''}
        hover:bg-white/[0.04] transition-colors cursor-pointer
        group
      `}
    >
      {isCurrentHour && isToday && (
        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gradient-to-r from-cyan-500 to-transparent z-10">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-500 shadow-lg shadow-cyan-500/50" />
        </div>
      )}

      <div ref={eventsContainerRef} className="p-1 space-y-1">
        {events.map((event) => {
          const eventColor = getEventColor(event, goals);
          return (
            <div
              key={event.id}
              onClick={(e) => onEventClick(event, e)}
              className={`
                event-item px-2 py-1 rounded-lg text-xs truncate cursor-pointer
                ${COLOR_BG_TRANSPARENT_CLASS[eventColor] || 'bg-white/5'}
                border border-white/10 hover:border-white/20
                backdrop-blur-sm
                transition-all hover:scale-[1.02]
              `}
            >
              <span className="text-white/90">{event.title}</span>
              <span className="text-white/50 ml-1">{event.startTime}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Animated button component
const AnimatedButton = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & {
  whileHover?: { scale?: number };
  whileTap?: { scale?: number };
  variant?: 'default' | 'primary';
}>(({ children, whileHover, whileTap, variant = 'default', className, ...props }, ref) => {
  const hoverScale = whileHover?.scale ?? 1.02;
  const tapScale = whileTap?.scale ?? 0.98;

  return (
    <button
      ref={ref}
      className={`${className} transition-transform duration-150 ease-out hover:scale-[${hoverScale}] active:scale-[${tapScale}]`}
      style={{
        '--hover-scale': hoverScale,
        '--tap-scale': tapScale,
      } as React.CSSProperties}
      {...props}
    >
      {children}
    </button>
  );
});
AnimatedButton.displayName = 'AnimatedButton';

// Helper pour résoudre la couleur d'un événement
// Si l'événement est lié à un objectif (milestone), utiliser la couleur de l'objectif parent
const getEventColor = (event: Event, goals: Goal[]): string => {
  // Si l'événement a déjà une couleur définie et n'est pas une milestone
  if (event.color && !event.goalId) {
    return event.color;
  }
  
  // Si l'événement est une milestone (lié à un objectif)
  if (event.goalId) {
    const parentGoal = goals.find(g => g.id === event.goalId);
    if (parentGoal) {
      // Résoudre la couleur depuis la catégorie de l'objectif
      const category = GOAL_CATEGORIES.find(c => c.id === parentGoal.categoryId);
      if (category?.color) {
        return category.color;
      }
    }
  }
  
  // Fallback vers la couleur de l'événement ou emerald
  return event.color || 'emerald';
};

export default function CalendarPage() {
  const { events, categories, goals, tasks, addEvent, updateEvent, deleteEvent, addTask, updateGoal, updateTask } = useStore();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedView, setSelectedView] = useState<'month' | 'week' | 'day'>('month');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  
  // États pour les modales unifiées (objectifs et tâches)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  const navigationRef = useRef<HTMLDivElement>(null);
  const calendarGridRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Get calendar data
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDay = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1;

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Animation for navigation and grid
  useEffect(() => {
    if (navigationRef.current) {
      gsap.fromTo(navigationRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
    }
    if (calendarGridRef.current) {
      gsap.fromTo(calendarGridRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0.1, ease: 'power2.out' }
      );
    }
    if (sidebarRef.current) {
      const sections = sidebarRef.current.querySelectorAll('.sidebar-section');
      gsap.fromTo(sections,
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, delay: 0.2, ease: 'power2.out' }
      );
    }
  }, []);

  // Get week boundaries
  const getWeekDates = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // Generate time slots from 8am to 8pm
  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    for (let i = 8; i <= 20; i++) {
      slots.push(`${i.toString().padStart(2, '0')}:00`);
    }
    return slots;
  }, []);

  // Get events for a specific date
  const getEventsForDate = (dateStr: string) => {
    return events.filter(e => e.date === dateStr).sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  // Get events for a specific time slot
  const getEventsForTimeSlot = (dateStr: string, time: string) => {
    const hour = parseInt(time.split(':')[0]);
    return events.filter(e => {
      if (e.date !== dateStr) return false;
      const eventHour = parseInt(e.startTime.split(':')[0]);
      return eventHour === hour;
    });
  };

  // Navigate
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevWeek = () => setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000));
  const nextWeek = () => setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000));
  const prevDay = () => setCurrentDate(new Date(currentDate.getTime() - 24 * 60 * 60 * 1000));
  const nextDay = () => setCurrentDate(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000));
  const goToToday = () => setCurrentDate(new Date());

  // Handle day click
  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setShowCreateModal(true);
  };

  // Handle time slot click
  const handleTimeSlotClick = (dateStr: string, time: string) => {
    setSelectedDate(dateStr);
    setShowCreateModal(true);
  };

  // Handle event click - Smart switching entre les 3 modales
  const handleEventClick = (event: Event, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // DEBUG: Log pour comprendre la détection
    console.log('🔍 handleEventClick - Event:', event.title, 'Date:', event.date);
    console.log('📋 Tasks disponibles:', tasks.map(t => ({ id: t.id, title: t.title, eventId: t.eventId, dueDate: t.dueDate, addToCalendar: t.addToCalendar })));

    // Fermer toutes les modales d'abord
    setShowEventModal(false);
    setShowGoalModal(false);
    setShowTaskModal(false);

    // 1. Si l'event est lié à un objectif (goalId ou milestoneId) → GoalModal
    if (event.goalId || event.milestoneId) {
      const relatedGoal = goals.find(g => g.id === event.goalId);
      if (relatedGoal) {
        setSelectedGoal(relatedGoal);
        setShowGoalModal(true);
        return;
      }
    }

    // 2. Si l'event est lié à une tâche (task.eventId === event.id) → TaskModal
    const relatedTask = tasks.find(t => t.eventId === event.id);
    if (relatedTask) {
      console.log('✅ Tâche trouvée via eventId:', relatedTask.title);
      setSelectedTask(relatedTask);
      setShowTaskModal(true);
      return;
    }

    // 2b. FALLBACK: Chercher une tâche avec addToCalendar et titre/date correspondants
    const matchingTask = tasks.find(t =>
      t.addToCalendar &&
      t.title === event.title &&
      t.dueDate && event.date && t.dueDate.split('T')[0] === event.date
    );
    if (matchingTask) {
      console.log('✅ Tâche trouvée via addToCalendar + titre/date:', matchingTask.title);
      setSelectedTask(matchingTask);
      setShowTaskModal(true);
      return;
    }

    // 2c. FALLBACK 2: Chercher une tâche par titre similaire et date
    // (pour les tâches créées manuellement sans addToCalendar)
    const taskByTitleAndDate = tasks.find(t => {
      if (!t.dueDate || !event.date) return false;
      const taskDate = t.dueDate.split('T')[0];
      const eventDate = event.date;
      // Titre identique ou très similaire (insensible à la casse)
      const titleMatch = t.title.toLowerCase().trim() === event.title.toLowerCase().trim();
      return titleMatch && taskDate === eventDate;
    });
    if (taskByTitleAndDate) {
      console.log('✅ Tâche trouvée via titre + date:', taskByTitleAndDate.title);
      setSelectedTask(taskByTitleAndDate);
      setShowTaskModal(true);
      return;
    }

    // 2d. FALLBACK 3: Chercher une tâche par titre seul (sans date)
    // (pour les tâches où la date ne correspond pas exactement)
    const taskByTitleOnly = tasks.find(t => {
      const titleMatch = t.title.toLowerCase().trim() === event.title.toLowerCase().trim();
      return titleMatch;
    });
    if (taskByTitleOnly) {
      console.log('✅ Tâche trouvée via titre seul:', taskByTitleOnly.title);
      setSelectedTask(taskByTitleOnly);
      setShowTaskModal(true);
      return;
    }

    // 2e. FALLBACK 4: Chercher une tâche par startDate (au lieu de dueDate)
    const taskByStartDate = tasks.find(t => {
      if (!t.startDate || !event.date) return false;
      const taskDate = t.startDate.split('T')[0];
      const eventDate = event.date;
      const titleMatch = t.title.toLowerCase().trim() === event.title.toLowerCase().trim();
      return titleMatch && taskDate === eventDate;
    });
    if (taskByStartDate) {
      console.log('✅ Tâche trouvée via startDate:', taskByStartDate.title);
      setSelectedTask(taskByStartDate);
      setShowTaskModal(true);
      return;
    }

    // 2f. FALLBACK 5: Correspondance partielle du titre (la tâche contient le titre de l'event ou vice versa)
    // Mais seulement si la correspondance est significative (au moins 4 caractères ou 70% du titre le plus court)
    const taskByPartialTitle = tasks.find(t => {
      const taskTitleLower = t.title.toLowerCase().trim();
      const eventTitleLower = event.title.toLowerCase().trim();
      const shorterLength = Math.min(taskTitleLower.length, eventTitleLower.length);
      // Éviter les correspondances trop courtes (moins de 4 caractères)
      if (shorterLength < 4) return false;
      // Vérifier si l'un contient l'autre
      if (taskTitleLower.includes(eventTitleLower) || eventTitleLower.includes(taskTitleLower)) {
        // Vérifier que le titre le plus court fait au moins 70% de la longueur du plus long
        const longerLength = Math.max(taskTitleLower.length, eventTitleLower.length);
        return shorterLength / longerLength >= 0.7;
      }
      return false;
    });
    if (taskByPartialTitle) {
      console.log('✅ Tâche trouvée via titre partiel:', taskByPartialTitle.title);
      setSelectedTask(taskByPartialTitle);
      setShowTaskModal(true);
      return;
    }

    // 2g. FALLBACK 6: Comparaison sans accents (normalisation Unicode)
    const normalizeString = (str: string) => str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    const eventTitleNorm = normalizeString(event.title);
    const taskByNormalizedTitle = tasks.find(t => {
      const taskTitleNorm = normalizeString(t.title);
      // Titre exact après normalisation
      if (taskTitleNorm === eventTitleNorm) return true;
      // Ou correspondance significative
      const shorterLength = Math.min(taskTitleNorm.length, eventTitleNorm.length);
      if (shorterLength < 4) return false;
      const longerLength = Math.max(taskTitleNorm.length, eventTitleNorm.length);
      if (taskTitleNorm.includes(eventTitleNorm) || eventTitleNorm.includes(taskTitleNorm)) {
        return shorterLength / longerLength >= 0.7;
      }
      return false;
    });
    if (taskByNormalizedTitle) {
      console.log('✅ Tâche trouvée via titre normalisé:', taskByNormalizedTitle.title);
      setSelectedTask(taskByNormalizedTitle);
      setShowTaskModal(true);
      return;
    }

    // 3. Sinon, c'est un événement calendrier classique → EventDetailModal
    console.log('❌ Aucune tâche trouvée, ouverture EventDetailModal');
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  // Create new event
  const handleCreateEvent = async (eventData: Partial<Event> & { createTask?: boolean }) => {
    addEvent({
      title: eventData.title || 'Nouvel événement',
      date: selectedDate || todayStr,
      startTime: eventData.startTime || '09:00',
      endTime: eventData.endTime || '10:00',
      isAllDay: eventData.isAllDay || false,
      categoryId: eventData.categoryId || 'cat-professional',
      color: eventData.color || 'emerald',
      priority: eventData.priority || 'medium',
      description: eventData.description,
      location: eventData.location,
      participants: eventData.participants,
      reminder: eventData.reminder,
      reminderEnabled: eventData.reminderEnabled,
      tags: eventData.tags,
      createdBy: 'user',
    });

    if (eventData.createTask) {
      await addTask({
        title: eventData.title || 'Nouvelle tâche',
        description: eventData.description,
        status: 'pending',
        priority: eventData.priority || 'medium',
        dueDate: selectedDate || todayStr,
        categoryId: eventData.categoryId || 'cat-professional',
        createdBy: 'user',
        addToCalendar: false,
      });
    }

    setShowCreateModal(false);
    setSelectedDate(null);
  };

  // Update event
  const handleUpdateEvent = (eventData: Partial<Event>) => {
    if (editingEvent) {
      updateEvent(editingEvent.id, eventData);
      setEditingEvent(null);
    }
    setShowEventModal(false);
    setSelectedEvent(null);
  };

  // Delete event
  const handleDeleteEvent = (id: string) => {
    deleteEvent(id);
    setShowEventModal(false);
    setSelectedEvent(null);
  };

  // Get category info
  const getCategoryInfo = (categoryId: string) => {
    return categories.find(c => c.id === categoryId) || { name: 'Autre', icon: '📌', color: 'slate' };
  };

  // Get current hour
  const currentHour = today.getHours();

  // Render month view
  const renderMonthView = () => {
    const days: React.ReactNode[] = [];

    for (let i = 0; i < startingDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-32 rounded-2xl bg-white/[0.02] border border-white/[0.03]" />
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = getEventsForDate(dateStr);
      const isToday = dateStr === todayStr;
      const hasEvents = dayEvents.length > 0;

      days.push(
        <DayCell
          key={day}
          day={day}
          dayEvents={dayEvents}
          goals={goals}
          isToday={isToday}
          hasEvents={hasEvents}
          onDayClick={() => handleDayClick(day)}
          onEventClick={handleEventClick}
        />
      );
    }

    return days;
  };

  // Render week view
  const renderWeekView = () => {
    const weekDates = getWeekDates();

    return (
      <div className="bg-white/[0.03] rounded-xl overflow-hidden">
        <div className="grid grid-cols-[80px_repeat(7,1fr)] gap-px">
          <div className="bg-slate-900/50 p-3 border-b border-white/[0.05] min-h-[52px] flex items-center justify-end">
            <div className="text-xs text-slate-500">Heure</div>
          </div>

          {weekDates.map((date, idx) => {
            const dateStr = date.toISOString().split('T')[0];
            const isToday = dateStr === todayStr;
            const dayEvents = getEventsForDate(dateStr);

            return (
              <div
                key={idx}
                className={`
                  bg-slate-900/50 p-3 border-b border-white/[0.05] text-center
                  min-h-[52px] flex flex-col justify-center
                  ${isToday ? 'bg-emerald-500/10' : ''}
                `}
              >
                <div className={`text-xs ${isToday ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {DAYS[idx]} {date.getDate()}
                </div>
                {dayEvents.length > 0 && (
                  <div className="text-[10px] text-cyan-400/70 mt-0.5">
                    {dayEvents.length} event{dayEvents.length > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-[80px_repeat(7,1fr)] gap-px">
          {timeSlots.map((time) => {
            const hour = parseInt(time.split(':')[0]);
            const isCurrentHour = hour === currentHour;

            return (
              <Fragment key={time}>
                <div className="bg-slate-900/30 px-3 py-3 border-b border-white/[0.03] text-sm text-slate-500 text-right flex items-start">
                  {time}
                </div>

                {weekDates.map((date, idx) => {
                  const dateStr = date.toISOString().split('T')[0];
                  const isToday = dateStr === todayStr;
                  const slotEvents = getEventsForTimeSlot(dateStr, time);

                  return (
                    <TimeSlot
                      key={`${dateStr}-${time}`}
                      time={time}
                      events={slotEvents}
                      goals={goals}
                      isToday={isToday}
                      isCurrentHour={isCurrentHour}
                      onSlotClick={() => handleTimeSlotClick(dateStr, time)}
                      onEventClick={handleEventClick}
                    />
                  );
                })}
              </Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  // Render day view
  const renderDayView = () => {
    const dateStr = currentDate.toISOString().split('T')[0];
    const isToday = dateStr === todayStr;
    const dayOfWeek = currentDate.getDay();
    const dayName = DAYS_FULL[dayOfWeek === 0 ? 6 : dayOfWeek - 1];
    const dayEvents = getEventsForDate(dateStr);

    return (
      <div className="grid grid-cols-[80px_1fr] gap-px bg-white/[0.03] rounded-xl overflow-hidden">
        <div className="col-span-2 bg-slate-900/50 p-3 border-b border-white/[0.05] min-h-[52px]">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center gap-2">
              <span className={`text-sm ${isToday ? 'text-emerald-400' : 'text-slate-500'}`}>
                {dayName} {currentDate.getDate()} {MONTHS[currentDate.getMonth()]}
              </span>
              {isToday && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">Aujourd'hui</span>}
            </div>
            <div className="text-sm text-slate-500">{dayEvents.length} événement{dayEvents.length > 1 ? 's' : ''}</div>
          </div>
        </div>

        {timeSlots.map((time) => {
          const hour = parseInt(time.split(':')[0]);
          const isCurrentHour = hour === currentHour;
          const slotEvents = getEventsForTimeSlot(dateStr, time);

          return (
            <DayViewSlot
              key={time}
              time={time}
              dateStr={dateStr}
              goals={goals}
              isToday={isToday}
              isCurrentHour={isCurrentHour}
              slotEvents={slotEvents}
              onTimeSlotClick={handleTimeSlotClick}
              onEventClick={handleEventClick}
            />
          );
        })}
      </div>
    );
  };

  // Get navigation title
  const getNavigationTitle = () => {
    if (selectedView === 'month') {
      return `${MONTHS[month]} ${year}`;
    } else if (selectedView === 'week') {
      const weekDates = getWeekDates();
      const start = weekDates[0];
      const end = weekDates[6];
      return `${start.getDate()} ${MONTHS[start.getMonth()]} - ${end.getDate()} ${MONTHS[end.getMonth()]} ${end.getFullYear()}`;
    } else {
      return `${DAYS_FULL[currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1]} ${currentDate.getDate()} ${MONTHS[currentDate.getMonth()]}`;
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] pl-[70px] relative overflow-hidden pt-20">
      {/* Grain overlay subtil */}
      <div className="fixed inset-0 opacity-[0.015] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')]" />

      {/* Header Unifié */}
      <MindLifeHeader
        title="Calendrier"
        subtitle="Gérez votre temps et vos événements"
        icon={Calendar}
        theme="cyan"
        rightContent={
          <AnimatedButton
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setSelectedDate(todayStr); setShowCreateModal(true); }}
            className="relative group flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm
                       bg-gradient-to-r from-cyan-500 to-emerald-500 text-white
                       shadow-lg shadow-cyan-500/25
                       hover:shadow-xl hover:shadow-cyan-500/30
                       transition-all duration-300"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nouvel événement</span>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300" />
          </AnimatedButton>
        }
      />

      <div className="flex relative z-10">
        {/* Main Content */}
        <main className="flex-1 p-6">

          {/* Navigation */}
          <div ref={navigationRef} className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              {[
                { key: 'month', label: 'Mois' },
                { key: 'week', label: 'Semaine' },
                { key: 'day', label: 'Jour' },
              ].map(({ key, label }) => (
                <AnimatedButton
                  key={key}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedView(key as 'month' | 'week' | 'day')}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    selectedView === key
                      ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10'
                      : 'bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] text-slate-400 hover:bg-white/[0.06] hover:text-white hover:border-white/20'
                  }`}
                >
                  {label}
                </AnimatedButton>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <AnimatedButton
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={goToToday}
                className="px-4 py-2 rounded-xl bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20 text-sm transition-all"
              >
                Aujourd'hui
              </AnimatedButton>
              <div className="flex items-center gap-2">
                <AnimatedButton
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={selectedView === 'month' ? prevMonth : selectedView === 'week' ? prevWeek : prevDay}
                  className="p-2.5 rounded-xl bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] hover:bg-white/[0.06] text-slate-400 hover:text-white transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </AnimatedButton>
                <h2 className="text-lg font-semibold text-white min-w-[220px] text-center">
                  {getNavigationTitle()}
                </h2>
                <AnimatedButton
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={selectedView === 'month' ? nextMonth : selectedView === 'week' ? nextWeek : nextDay}
                  className="p-2.5 rounded-xl bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] hover:bg-white/[0.06] text-slate-400 hover:text-white transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </AnimatedButton>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div ref={calendarGridRef}>
            {selectedView === 'month' && (
              <GlassCard hover={false} className="p-4">
                <div className="grid grid-cols-7 gap-2 mb-3">
                  {DAYS.map((day) => (
                    <div key={day} className="text-center text-xs font-semibold text-slate-500 py-2 uppercase tracking-wider">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {renderMonthView()}
                </div>
              </GlassCard>
            )}

            {selectedView === 'week' && renderWeekView()}
            {selectedView === 'day' && renderDayView()}
          </div>
        </main>

        {/* Right Sidebar */}
        <aside ref={sidebarRef} className="w-[320px] p-6 border-l border-white/[0.05]">
          {/* Today's Events */}
          <div className="sidebar-section mb-4">
            <GlassCard glowColor="cyan" className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  Aujourd'hui
                </h3>
                <span className="text-xs text-slate-500">{today.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })}</span>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                {getEventsForDate(todayStr).length === 0 ? (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/[0.03] flex items-center justify-center border border-white/[0.05]">
                      <Calendar className="w-6 h-6 text-slate-600" />
                    </div>
                    <p className="text-sm text-slate-500">Aucun événement aujourd'hui</p>
                  </div>
                ) : (
                  <TodayEventsList
                    events={getEventsForDate(todayStr)}
                    goals={goals}
                    onEventClick={(event) => handleEventClick(event)}
                  />
                )}
              </div>
            </GlassCard>
          </div>

          {/* Upcoming Events */}
          <div className="sidebar-section">
            <GlassCard glowColor="emerald" className="p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                À venir
              </h3>
              <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                <UpcomingEventsList
                  events={events}
                  goals={goals}
                  today={today}
                  onEventClick={(event) => handleEventClick(event)}
                />
                {events.filter(e => new Date(e.date) > today).length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-sm text-slate-500">Aucun événement à venir</p>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        </aside>
      </div>

      {/* Event Detail Modal */}
      {showEventModal && selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          category={getCategoryInfo(selectedEvent.categoryId)}
          onClose={() => { setShowEventModal(false); setSelectedEvent(null); }}
          onEdit={() => { setEditingEvent(selectedEvent); setShowEventModal(false); setShowCreateModal(true); }}
          onDelete={() => handleDeleteEvent(selectedEvent.id)}
        />
      )}

      {/* Create/Edit Event Modal */}
      {showCreateModal && (
        <CreateEventModal
          date={selectedDate || todayStr}
          event={editingEvent}
          categories={categories}
          onClose={() => { setShowCreateModal(false); setSelectedDate(null); setEditingEvent(null); }}
          onSave={editingEvent ? handleUpdateEvent : handleCreateEvent}
        />
      )}

      {/* Goal Modal - Pour les objectifs et étapes d'objectifs */}
      <GoalModal
        goal={selectedGoal}
        isOpen={showGoalModal}
        onClose={() => { setShowGoalModal(false); setSelectedGoal(null); }}
        onUpdate={async (goalId, updates) => {
          await updateGoal(goalId, updates);
        }}
      />

      {/* Task Modal - Pour les tâches */}
      <TaskModal
        isOpen={showTaskModal}
        onClose={() => { setShowTaskModal(false); setSelectedTask(null); }}
        onSave={async (taskData) => {
          if (taskData.id) {
            await updateTask(taskData.id, taskData);
          }
        }}
        task={selectedTask}
      />

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}

// Day Cell Component
function DayCell({
  day,
  dayEvents,
  goals,
  isToday,
  hasEvents,
  onDayClick,
  onEventClick
}: {
  day: number;
  dayEvents: Event[];
  goals: Goal[];
  isToday: boolean;
  hasEvents: boolean;
  onDayClick: () => void;
  onEventClick: (event: Event, e: React.MouseEvent) => void;
}) {
  return (
    <div
      onClick={onDayClick}
      className={`
        group relative h-32 rounded-2xl p-2.5 cursor-pointer overflow-hidden
        transition-all duration-200 ease-out
        bg-gradient-to-br from-white/[0.05] to-white/[0.02]
        backdrop-blur-xl
        border border-white/[0.06]
        hover:border-cyan-500/30
        hover:shadow-xl hover:shadow-cyan-500/5
        hover:scale-[1.03] hover:-translate-y-1
        active:scale-[0.98]
        ${isToday ? 'ring-2 ring-emerald-500/60 shadow-emerald-500/30 shadow-xl bg-gradient-to-br from-emerald-500/10 to-white/[0.02]' : ''}
        ${hasEvents ? 'hover:shadow-lg' : ''}
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] via-transparent to-transparent pointer-events-none rounded-2xl" />
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-emerald-500/0 group-hover:from-cyan-500/5 group-hover:to-emerald-500/5 transition-all duration-500 rounded-2xl pointer-events-none" />

      {isToday && <TodayIndicator />}

      <div className={`
        relative z-10 text-sm font-bold mb-2 transition-colors duration-300
        ${isToday
          ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]'
          : 'text-slate-400 group-hover:text-white'}
      `}>
        {day}
      </div>

      <div className="relative z-10 space-y-1 overflow-hidden">
        {dayEvents.slice(0, 3).map((event) => {
          const eventColor = getEventColor(event, goals);
          return (
            <div
              key={event.id}
              onClick={(e) => onEventClick(event, e)}
              className={`
                day-event-item flex items-center gap-1.5 px-2 py-1 rounded-lg
                ${COLOR_BG_TRANSPARENT_CLASS[eventColor] || 'bg-white/5'}
                backdrop-blur-md border border-white/[0.08]
                hover:border-white/20 hover:scale-[1.02]
                transition-all cursor-pointer shadow-sm
                group/event
              `}
            >
              <div className={`w-1.5 h-1.5 rounded-full shadow-sm ${COLOR_BG_CLASS[eventColor] || 'bg-slate-500'}`} />
              <span className="text-[10px] text-white/90 truncate font-medium">{event.title}</span>
            </div>
          );
        })}
        {dayEvents.length > 3 && (
          <span className="text-[10px] text-cyan-400/80 pl-2 font-medium">
            +{dayEvents.length - 3} autres
          </span>
        )}
      </div>

      {dayEvents.length > 2 && (
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-[#030712]/80 to-transparent pointer-events-none rounded-b-2xl" />
      )}
    </div>
  );
}

// Today Indicator Component
function TodayIndicator() {
  return (
    <div
      className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/60 ring-2 ring-emerald-500/30 animate-scale-in"
    />
  );
}

// Day View Slot Component
function DayViewSlot({
  time,
  dateStr,
  goals,
  isToday,
  isCurrentHour,
  slotEvents,
  onTimeSlotClick,
  onEventClick
}: {
  time: string;
  dateStr: string;
  goals: Goal[];
  isToday: boolean;
  isCurrentHour: boolean;
  slotEvents: Event[];
  onTimeSlotClick: (dateStr: string, time: string) => void;
  onEventClick: (event: Event, e: React.MouseEvent) => void;
}) {
  const eventsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (eventsContainerRef.current && slotEvents.length > 0) {
      const eventEls = eventsContainerRef.current.querySelectorAll('.day-view-event');
      gsap.fromTo(eventEls,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.3, stagger: 0.05, ease: 'power2.out' }
      );
    }
  }, [slotEvents]);

  return (
    <>
      <div className="bg-slate-900/30 px-3 py-3 border-b border-white/[0.03] text-sm text-slate-500 text-right flex items-start">
        {time}
      </div>

      <div
        onClick={() => onTimeSlotClick(dateStr, time)}
        className={`
          relative min-h-[70px] border-b border-white/[0.03] p-2
          ${isCurrentHour && isToday ? 'bg-cyan-500/10' : 'bg-slate-900/20'}
          hover:bg-white/[0.03] transition-colors cursor-pointer
        `}
      >
        {isCurrentHour && isToday && (
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gradient-to-r from-cyan-500 to-transparent z-10">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-lg shadow-cyan-500/50 animate-pulse" />
          </div>
        )}

        <div ref={eventsContainerRef} className="space-y-1.5">
          {slotEvents.map((event) => {
            const eventColor = getEventColor(event, goals);
            return (
              <div
                key={event.id}
                onClick={(e) => onEventClick(event, e)}
                className={`
                  day-view-event p-3 rounded-xl cursor-pointer
                  ${COLOR_BG_TRANSPARENT_CLASS[eventColor] || 'bg-white/5'}
                  backdrop-blur-sm border border-white/10
                  hover:border-white/20 hover:scale-[1.01]
                  transition-all
                `}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${COLOR_BG_CLASS[eventColor] || 'bg-slate-500'}`} />
                  <span className="text-sm font-medium text-white">{event.title}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-white/50">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {event.startTime} - {event.endTime || '?'}
                  </span>
                {event.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {event.location}
                  </span>
                )}
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

// Today Events List Component
function TodayEventsList({
  events,
  goals,
  onEventClick
}: {
  events: Event[];
  goals: Goal[];
  onEventClick: (event: Event) => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      const items = listRef.current.querySelectorAll('.today-event-item');
      gsap.fromTo(items,
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out' }
      );
    }
  }, [events]);

  return (
    <>
      {events.map((event, idx) => {
        const eventColor = getEventColor(event, goals);
        return (
          <div
            key={event.id}
            ref={idx === 0 ? listRef : undefined}
            className={`
              today-event-item p-3 rounded-xl cursor-pointer
              ${COLOR_BG_TRANSPARENT_CLASS[eventColor] || 'bg-white/5'}
              border border-white/10
              hover:border-white/20
              transition-all hover:translate-x-1
            `}
            onClick={() => onEventClick(event)}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${COLOR_BG_CLASS[eventColor] || 'bg-slate-500'}`} />
              <span className="text-sm font-medium text-white">{event.title}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/50">
              <Clock className="w-3 h-3" />
              {event.startTime} - {event.endTime || '?'}
            </div>
          </div>
        );
      })}
    </>
  );
}

// Upcoming Events List Component
function UpcomingEventsList({
  events,
  goals,
  today,
  onEventClick
}: {
  events: Event[];
  goals: Goal[];
  today: Date;
  onEventClick: (event: Event) => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const upcomingEvents = events
    .filter(e => new Date(e.date) > today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  useEffect(() => {
    if (listRef.current) {
      const items = listRef.current.querySelectorAll('.upcoming-event-item');
      gsap.fromTo(items,
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out' }
      );
    }
  }, [upcomingEvents]);

  return (
    <div ref={listRef}>
      {upcomingEvents.map((event) => {
        const eventColor = getEventColor(event, goals);
        return (
          <div
            key={event.id}
            className="upcoming-event-item flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.03] cursor-pointer transition-all group"
            onClick={() => onEventClick(event)}
          >
            <div className={`w-10 h-10 rounded-xl ${COLOR_BG_TRANSPARENT_CLASS[eventColor] || 'bg-white/5'} flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-all`}>
              <span className="text-sm">{EVENT_ILLUSTRATIONS[event.categoryId]?.emoji || '📌'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{event.title}</p>
              <p className="text-xs text-slate-500">
                {new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
              </p>
            </div>
            {event.priority && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${PRIORITY_CONFIG[event.priority].bg} ${PRIORITY_CONFIG[event.priority].color} border ${PRIORITY_CONFIG[event.priority].border}`}>
                {PRIORITY_CONFIG[event.priority].label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
