'use client'

import { useState, useRef, useEffect, memo } from 'react'
import gsap from 'gsap'
import { Plus, BookOpen, Calendar, Search, Edit2, Trash2, Save } from 'lucide-react'
import { 
  useJournalEntries, useJournalActions
} from '@/lib/store/selectors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

const moodOptions = [
  { value: 'great', label: 'Great', emoji: '😄', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { value: 'good', label: 'Good', emoji: '🙂', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  { value: 'neutral', label: 'Neutral', emoji: '😐', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
  { value: 'bad', label: 'Bad', emoji: '😕', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { value: 'terrible', label: 'Terrible', emoji: '😢', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
] as const

const JournalPanel = memo(function JournalPanel() {
  const journalEntries = useJournalEntries();
  const { addJournalEntry, deleteJournalEntry } = useJournalActions();
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    mood: 'good' as const,
  })

  // Refs pour animations GSAP
  const headerRef = useRef<HTMLDivElement>(null)
  const addFormRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const entriesListRef = useRef<HTMLDivElement>(null)
  const detailRef = useRef<HTMLDivElement>(null)
  const moodStatsRef = useRef<HTMLDivElement>(null)

  const filteredEntries = journalEntries.filter(entry =>
    entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddEntry = () => {
    if (newEntry.title.trim() && newEntry.content.trim()) {
      addJournalEntry({
        ...newEntry,
        date: new Date(),
      })
      setNewEntry({
        title: '',
        content: '',
        mood: 'good',
      })
      setShowAddForm(false)
    }
  }

  const selectedEntryData = journalEntries.find(e => e.id === selectedEntry)

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatShortDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  // Get mood stats
  const moodCounts = journalEntries.reduce((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Animations GSAP au montage
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headerRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.3 })
      gsap.fromTo(searchRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3, delay: 0.1 })
      gsap.fromTo(entriesListRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3, delay: 0.2 })
      gsap.fromTo(detailRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3, delay: 0.3 })
      gsap.fromTo(moodStatsRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3, delay: 0.4 })
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

  // Animation stagger pour les entrées
  useEffect(() => {
    if (entriesListRef.current) {
      const items = entriesListRef.current.querySelectorAll('.entry-item')
      gsap.fromTo(items,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out' }
      )
    }
  }, [filteredEntries.length])

  // Fonction pour les effets hover sur les boutons
  const handleButtonHover = (element: HTMLElement | null, isHover: boolean) => {
    if (element) {
      gsap.to(element, {
        scale: isHover ? 1.05 : 1,
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
          <h1 className="text-3xl font-bold text-white mb-2">Journal</h1>
          <p className="text-white/60">Reflect on your thoughts and experiences</p>
        </div>
        <Button
          onClick={() => {
            setShowAddForm(!showAddForm)
            setSelectedEntry(null)
          }}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Entry
        </Button>
      </div>

      {/* Add Entry Form */}
      {showAddForm && (
        <div ref={addFormRef} className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 overflow-hidden">
          <h3 className="text-lg font-semibold text-white mb-4">New Journal Entry</h3>
          <div className="space-y-4">
            <Input
              placeholder="Entry title"
              value={newEntry.title}
              onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
            
            {/* Mood Selection */}
            <div>
              <label className="text-sm text-white/60 mb-2 block">How are you feeling?</label>
              <div className="flex flex-wrap gap-2">
                {moodOptions.map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => setNewEntry({ ...newEntry, mood: mood.value })}
                    onMouseEnter={(e) => handleButtonHover(e.currentTarget, true)}
                    onMouseLeave={(e) => handleButtonHover(e.currentTarget, false)}
                    className={`
                      px-4 py-2 rounded-xl border flex items-center gap-2 transition-all
                      ${newEntry.mood === mood.value 
                        ? mood.color 
                        : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                      }
                    `}
                  >
                    <span className="text-xl">{mood.emoji}</span>
                    <span className="text-sm">{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <Textarea
              placeholder="Write your thoughts..."
              value={newEntry.content}
              onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
              rows={8}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40 resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" onClick={() => setShowAddForm(false)} className="text-white/60">
              Cancel
            </Button>
            <Button onClick={handleAddEntry} className="bg-purple-500 hover:bg-purple-600 text-white">
              <Save className="w-4 h-4 mr-2" />
              Save Entry
            </Button>
          </div>
        </div>
      )}

      {/* Search */}
      <div ref={searchRef} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
        <Input
          placeholder="Search journal entries..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-purple-500/50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entries List */}
        <div ref={entriesListRef} className="lg:col-span-1 space-y-3 max-h-[600px] overflow-y-auto pr-2">
          {filteredEntries.map((entry) => {
            const mood = moodOptions.find(m => m.value === entry.mood)
            const isSelected = selectedEntry === entry.id
            
            return (
              <button
                key={entry.id}
                onClick={() => {
                  setSelectedEntry(entry.id)
                  setShowAddForm(false)
                }}
                className={`
                  entry-item w-full text-left p-4 rounded-xl border transition-all
                  ${isSelected 
                    ? 'bg-white/10 border-purple-500/30' 
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                  }
                `}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-white truncate">{entry.title}</h3>
                  <span className="text-xl ml-2">{mood?.emoji}</span>
                </div>
                <p className="text-sm text-white/40 line-clamp-2 mb-2">
                  {entry.content}
                </p>
                <div className="flex items-center gap-2 text-xs text-white/30">
                  <Calendar className="w-3 h-3" />
                  <span>{formatShortDate(entry.date)}</span>
                </div>
              </button>
            )
          })}

          {filteredEntries.length === 0 && (
            <div className="text-center py-8 text-white/40">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No journal entries yet</p>
            </div>
          )}
        </div>

        {/* Entry Detail */}
        <div ref={detailRef} className="lg:col-span-2 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 min-h-[400px]">
          {selectedEntryData ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{moodOptions.find(m => m.value === selectedEntryData.mood)?.emoji || '😐'}</span>
                  <div>
                    <Badge className={moodOptions.find(m => m.value === selectedEntryData.mood)?.color || ''}>
                      Feeling {moodOptions.find(m => m.value === selectedEntryData.mood)?.label}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white/40">
                    {formatDate(selectedEntryData.date)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      deleteJournalEntry(selectedEntryData.id)
                      setSelectedEntry(null)
                    }}
                    className="text-rose-400 hover:text-rose-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-4">{selectedEntryData.title}</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-white/70 whitespace-pre-wrap leading-relaxed">{selectedEntryData.content}</p>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-white/40">
              <div className="text-center">
                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Select an entry to read</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mood Stats */}
      <div ref={moodStatsRef} className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="text-xl">📊</span>
          Mood Overview
        </h3>
        <div className="grid grid-cols-5 gap-4">
          {moodOptions.map((mood) => {
            const count = moodCounts[mood.value] || 0
            const percentage = journalEntries.length > 0 
              ? Math.round((count / journalEntries.length) * 100) 
              : 0
            
            return (
              <div
                key={mood.value}
                onMouseEnter={(e) => handleButtonHover(e.currentTarget, true)}
                onMouseLeave={(e) => handleButtonHover(e.currentTarget, false)}
                className={`p-4 rounded-xl border ${mood.color} text-center`}
              >
                <span className="text-2xl block mb-2">{mood.emoji}</span>
                <p className="text-sm font-medium">{mood.label}</p>
                <p className="text-2xl font-bold mt-1">{count}</p>
                <p className="text-xs opacity-60">{percentage}%</p>
              </div>
            )
          })}
        </div>
      </div>
      </main>
    </div>
  )
})

export default JournalPanel
