'use client'

import { useState, useRef, useEffect, memo } from 'react'
import gsap from 'gsap'
import { Plus, FileText, Trash2, Search, Clock, Edit2, X, Check } from 'lucide-react'
import { 
  useNotes, useCategories, useNoteActions,
  getCategoryColorClass 
} from '@/lib/store/selectors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

const NotesPanel = memo(function NotesPanel() {
  const notes = useNotes();
  const categories = useCategories();
  const { addNote, updateNote, deleteNote } = useNoteActions();
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedNote, setSelectedNote] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    categoryId: 'personal',
  })

  // Refs pour animations GSAP
  const headerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const addFormRef = useRef<HTMLDivElement>(null)
  const notesListRef = useRef<HTMLDivElement>(null)
  const detailRef = useRef<HTMLDivElement>(null)

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(c => c.id === categoryId) || { name: 'Unknown', icon: '📋', color: 'slate' }
  }

  const handleAddNote = () => {
    if (newNote.title.trim()) {
      addNote(newNote as any)
      setNewNote({
        title: '',
        content: '',
        categoryId: 'personal',
      })
      setShowAddForm(false)
    }
  }

  const selectedNoteData = notes.find(n => n.id === selectedNote)

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Animations GSAP au montage
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headerRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.3 })
      gsap.fromTo(searchRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3, delay: 0.1 })
      gsap.fromTo(notesListRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3, delay: 0.2 })
      gsap.fromTo(detailRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3, delay: 0.3 })
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

  // Animation stagger pour les notes
  useEffect(() => {
    if (notesListRef.current) {
      const items = notesListRef.current.querySelectorAll('.note-item')
      gsap.fromTo(items,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out' }
      )
    }
  }, [filteredNotes.length])

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <main className="p-6 space-y-6 h-full overflow-y-auto">
      {/* Header */}
      <div ref={headerRef} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Notes</h1>
          <p className="text-white/60">Capture your thoughts and ideas</p>
        </div>
        <Button
          onClick={() => {
            setShowAddForm(!showAddForm)
            setSelectedNote(null)
          }}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Note
        </Button>
      </div>

      {/* Search */}
      <div ref={searchRef} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
        <Input
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-amber-500/50"
        />
      </div>

      {/* Add Note Form */}
      {showAddForm && (
        <div ref={addFormRef} className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 overflow-hidden">
          <h3 className="text-lg font-semibold text-white mb-4">New Note</h3>
          <div className="space-y-4">
            <Input
              placeholder="Note title"
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
            <Textarea
              placeholder="Write your note here..."
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              rows={6}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40 resize-none"
            />
            <select
              value={newNote.categoryId}
              onChange={(e) => setNewNote({ ...newNote, categoryId: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" onClick={() => setShowAddForm(false)} className="text-white/60">
              Cancel
            </Button>
            <Button onClick={handleAddNote} className="bg-amber-500 hover:bg-amber-600 text-white">
              Save Note
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notes List */}
        <div ref={notesListRef} className="lg:col-span-1 space-y-3 max-h-[600px] overflow-y-auto pr-2">
          {filteredNotes.map((note) => {
            const category = getCategoryInfo(note.categoryId)
            const isSelected = selectedNote === note.id
            
            return (
              <button
                key={note.id}
                onClick={() => {
                  setSelectedNote(note.id)
                  setShowAddForm(false)
                  setEditMode(false)
                }}
                className={`
                  note-item w-full text-left p-4 rounded-xl border transition-all
                  ${isSelected 
                    ? 'bg-white/10 border-amber-500/30' 
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                  }
                `}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-white truncate">{note.title}</h3>
                  <Badge className={`ml-2 shrink-0 ${getCategoryColorClass(category.color)}`}>
                    {category.icon}
                  </Badge>
                </div>
                <p className="text-sm text-white/40 line-clamp-2 mb-2">
                  {note.content || 'No content'}
                </p>
                <div className="flex items-center gap-2 text-xs text-white/30">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate((note as any).updatedAt || note.createdAt)}</span>
                </div>
              </button>
            )
          })}

          {filteredNotes.length === 0 && (
            <div className="text-center py-8 text-white/40">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No notes found</p>
            </div>
          )}
        </div>

        {/* Note Detail */}
        <div ref={detailRef} className="lg:col-span-2 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 min-h-[400px]">
          {selectedNoteData ? (
            <div className="h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Badge className={getCategoryColorClass(getCategoryInfo(selectedNoteData.categoryId).color)}>
                    {getCategoryInfo(selectedNoteData.categoryId).icon} {getCategoryInfo(selectedNoteData.categoryId).name}
                  </Badge>
                  <span className="text-sm text-white/40">
                    Updated {formatDate((selectedNoteData as any).updatedAt || selectedNoteData.createdAt)}
                  </span>
                </div>
                <div className="flex gap-2">
                  {editMode ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditMode(false)}
                        className="text-white/60"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setEditMode(false)
                        }}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditMode(true)}
                        className="text-white/60 hover:text-white"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          deleteNote(selectedNoteData.id)
                          setSelectedNote(null)
                        }}
                        className="text-rose-400 hover:text-rose-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {editMode ? (
                <div className="space-y-4">
                  <Input
                    value={selectedNoteData.title}
                    onChange={(e) => updateNote(selectedNoteData.id, { title: e.target.value })}
                    className="bg-white/5 border-white/10 text-white text-xl font-semibold"
                  />
                  <Textarea
                    value={selectedNoteData.content}
                    onChange={(e) => updateNote(selectedNoteData.id, { content: e.target.value })}
                    rows={15}
                    className="bg-white/5 border-white/10 text-white resize-none"
                  />
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-white mb-4">{selectedNoteData.title}</h2>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-white/70 whitespace-pre-wrap">{selectedNoteData.content}</p>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-white/40">
              <div className="text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Select a note to view</p>
              </div>
            </div>
          )}
        </div>
      </div>
      </main>
    </div>
  )
})

export default NotesPanel
