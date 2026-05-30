'use client'

import { useState, useRef, useEffect } from 'react'
import gsap from 'gsap'
import { Mic, Square, Play, Pause, Trash2, Save, FileText, Lightbulb, Bell, CheckSquare, Loader2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStore, VoiceMemo } from '@/lib/store'

export default function VoiceRecorder() {
  const { voiceMemos, addVoiceMemo, deleteVoiceMemo, updateVoiceMemo } = useStore()
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [showRecorder, setShowRecorder] = useState(false)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [newMemoTitle, setNewMemoTitle] = useState('')
  const [newMemoCategory, setNewMemoCategory] = useState<'note' | 'idea' | 'reminder' | 'task'>('note')
  const [transcribingId, setTranscribingId] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // GSAP refs
  const recorderPanelRef = useRef<HTMLDivElement>(null)
  const saveModalRef = useRef<HTMLDivElement>(null)
  const saveModalContentRef = useRef<HTMLDivElement>(null)
  const timerRefGsap = useRef<HTMLDivElement>(null)
  const visualizerBarsRef = useRef<HTMLDivElement[]>([])
  const memoItemsRef = useRef<HTMLDivElement[]>([])

  // Animate recorder panel
  useEffect(() => {
    if (recorderPanelRef.current) {
      if (showRecorder) {
        gsap.fromTo(recorderPanelRef.current, 
          { opacity: 0, y: 100, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'power2.out' }
        )
      }
    }
  }, [showRecorder])

  // Animate save modal
  useEffect(() => {
    if (saveModalRef.current && saveModalContentRef.current) {
      if (showSaveModal) {
        gsap.fromTo(saveModalRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 })
        gsap.fromTo(saveModalContentRef.current, 
          { scale: 0.95, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.2, ease: 'power2.out' }
        )
      }
    }
  }, [showSaveModal])

  // Animate timer pulse
  useEffect(() => {
    if (timerRefGsap.current && isRecording) {
      const pulse = () => {
        gsap.to(timerRefGsap.current, { scale: 1.02, duration: 0.25, yoyo: true, repeat: 1 })
      }
      const interval = setInterval(pulse, 500)
      return () => clearInterval(interval)
    }
  }, [isRecording])

  // Animate visualizer bars
  useEffect(() => {
    if (isRecording && visualizerBarsRef.current.length > 0) {
      visualizerBarsRef.current.forEach((bar, i) => {
        if (bar) {
          const anim = gsap.to(bar, {
            height: Math.random() * 40 + 10,
            duration: 0.5,
            repeat: -1,
            yoyo: true,
            delay: i * 0.05,
            ease: 'power1.inOut'
          })
          return () => anim.kill()
        }
      })
    }
  }, [isRecording])

  // Animate memo items
  useEffect(() => {
    memoItemsRef.current.forEach((item, index) => {
      if (item) {
        gsap.fromTo(item, 
          { opacity: 0, x: -10 },
          { opacity: 1, x: 0, duration: 0.3, delay: index * 0.05 }
        )
      }
    })
  }, [voiceMemos])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop())
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        setShowSaveModal(true)
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Microphone access error:', error)
      alert('Impossible d\'accéder au microphone. Vérifiez les permissions de votre navigateur.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      setAudioBlob(null)
    }
  }

  const saveMemo = async () => {
    if (!audioBlob || !newMemoTitle.trim()) return

    setIsSaving(true)

    try {
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1]

        const memo: VoiceMemo = {
          id: Date.now().toString(),
          title: newMemoTitle.trim(),
          audioData: base64,
          duration: recordingTime,
          category: newMemoCategory,
          createdAt: new Date().toISOString(),
        }

        addVoiceMemo(memo)

        try {
          const response = await fetch('/api/asr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audioBase64: base64 })
          })
          const data = await response.json()
          if (data.success && data.transcription) {
            updateVoiceMemo(memo.id, { transcription: data.transcription })
          }
        } catch (e) {
          // Transcription failed, but memo saved
        }

        setAudioBlob(null)
        setNewMemoTitle('')
        setNewMemoCategory('note')
        setRecordingTime(0)
        setShowSaveModal(false)
        setIsSaving(false)
      }
      reader.readAsDataURL(audioBlob)
    } catch (error) {
      console.error('Save error:', error)
      setIsSaving(false)
    }
  }

  const transcribeMemo = async (memo: VoiceMemo) => {
    setTranscribingId(memo.id)
    try {
      const response = await fetch('/api/asr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioBase64: memo.audioData })
      })
      const data = await response.json()
      if (data.success && data.transcription) {
        updateVoiceMemo(memo.id, { transcription: data.transcription })
      }
    } catch (error) {
      console.error('Transcription error:', error)
    }
    setTranscribingId(null)
  }

  const playMemo = (memo: VoiceMemo) => {
    if (playingId === memo.id) {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      setPlayingId(null)
      return
    }

    if (audioRef.current) {
      audioRef.current.pause()
    }

    const audio = new Audio(`data:audio/webm;base64,${memo.audioData}`)
    audioRef.current = audio
    setPlayingId(memo.id)

    audio.onended = () => {
      setPlayingId(null)
      audioRef.current = null
    }

    audio.play()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'note': return FileText
      case 'idea': return Lightbulb
      case 'reminder': return Bell
      case 'task': return CheckSquare
      default: return FileText
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'note': return 'text-emerald-400 bg-emerald-500/20'
      case 'idea': return 'text-amber-400 bg-amber-500/20'
      case 'reminder': return 'text-violet-400 bg-violet-500/20'
      case 'task': return 'text-cyan-400 bg-cyan-500/20'
      default: return 'text-slate-400 bg-slate-500/20'
    }
  }

  return (
    <>
      {/* Floating Voice Button */}
      <button
        onClick={() => setShowRecorder(!showRecorder)}
        className={`
          fixed bottom-6 left-6 w-14 h-14 rounded-full shadow-lg z-40
          flex items-center justify-center transition-all
          ${isRecording 
            ? 'bg-red-500 animate-pulse' 
            : 'bg-gradient-to-r from-violet-500 to-purple-600'
          }
          text-white hover:scale-110 active:scale-90
        `}
      >
        <Mic className="w-6 h-6" />
      </button>

      {/* Recorder Panel */}
      {showRecorder && (
        <div
          ref={recorderPanelRef}
          className="fixed bottom-24 left-6 w-96 max-w-[calc(100vw-48px)] bg-[#1e293b]/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl z-40 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-500/20 to-purple-500/20 border-b border-white/10 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isRecording ? 'bg-red-500 animate-pulse' : 'bg-violet-500'
                }`}>
                  <Mic className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Notes Vocales</h3>
                  <p className="text-xs text-white/60">
                    {voiceMemos.length} note{voiceMemos.length !== 1 ? 's' : ''} enregistrée{voiceMemos.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowRecorder(false)}
                className="text-white/40 hover:text-white hover:bg-white/10"
              >
                <Square className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Recording UI */}
          <div className="p-6">
            <div className="flex flex-col items-center mb-6">
              {/* Timer */}
              <div
                ref={timerRefGsap}
                className={`
                  text-4xl font-mono font-bold mb-4
                  ${isRecording ? 'text-red-400' : 'text-white/80'}
                `}
              >
                {formatTime(recordingTime)}
              </div>

              {/* Visualizer */}
              {isRecording && (
                <div className="flex items-center gap-1 h-12 mb-4">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      ref={el => { if (el) visualizerBarsRef.current[i] = el }}
                      className="w-1.5 bg-gradient-to-t from-red-500 to-pink-400 rounded-full"
                      style={{ height: 10 }}
                    />
                  ))}
                </div>
              )}

              {/* Record/Stop Buttons */}
              <div className="flex gap-3">
                {isRecording && (
                  <button
                    onClick={cancelRecording}
                    className="px-6 py-3 rounded-full bg-slate-700 hover:bg-slate-600 text-white transition-all hover:scale-105 active:scale-95"
                  >
                    Annuler
                  </button>
                )}
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`
                    w-16 h-16 rounded-full flex items-center justify-center transition-all
                    ${isRecording 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700'
                    }
                    text-white shadow-lg hover:scale-105 active:scale-95
                  `}
                >
                  {isRecording ? (
                    <Square className="w-6 h-6" />
                  ) : (
                    <Mic className="w-6 h-6" />
                  )}
                </button>
              </div>
              <p className="text-xs text-white/50 mt-3">
                {isRecording ? 'Cliquez pour arrêter' : 'Cliquez pour enregistrer'}
              </p>
            </div>

            {/* Voice Memos List */}
            {voiceMemos.length > 0 && (
              <div className="border-t border-white/10 pt-4">
                <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
                  Notes récentes
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                  {voiceMemos.map((memo) => {
                    const CategoryIcon = getCategoryIcon(memo.category)
                    return (
                      <div
                        key={memo.id}
                        ref={el => { if (el) memoItemsRef.current.push(el) }}
                        className="p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors group"
                      >
                        <div className="flex items-start gap-3">
                          {/* Play Button */}
                          <button
                            onClick={() => playMemo(memo)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                              playingId === memo.id
                                ? 'bg-violet-500 text-white'
                                : 'bg-slate-700 text-white/70 hover:bg-violet-500/30 hover:text-violet-400'
                            }`}
                          >
                            {playingId === memo.id ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4 ml-0.5" />
                            )}
                          </button>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${getCategoryColor(memo.category)}`}>
                                <CategoryIcon className="w-3 h-3 inline mr-1" />
                                {memo.category.charAt(0).toUpperCase() + memo.category.slice(1)}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-white truncate">{memo.title}</p>
                            <p className="text-xs text-white/40">
                              {formatTime(memo.duration)} • {formatDate(memo.createdAt)}
                            </p>

                            {/* Transcription */}
                            {memo.transcription && (
                              <p className="text-xs text-white/60 mt-2 p-2 bg-slate-900/50 rounded-lg">
                                📝 {memo.transcription}
                              </p>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2 mt-2">
                              {!memo.transcription && (
                                <button
                                  onClick={() => transcribeMemo(memo)}
                                  disabled={transcribingId === memo.id}
                                  className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
                                >
                                  {transcribingId === memo.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <FileText className="w-3 h-3" />
                                  )}
                                  Transcrire
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Delete Button */}
                          <button
                            onClick={() => deleteVoiceMemo(memo.id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Save Modal */}
      {showSaveModal && (
        <div
          ref={saveModalRef}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowSaveModal(false)}
        >
          <div
            ref={saveModalContentRef}
            className="bg-[#1e293b] rounded-2xl p-6 w-full max-w-md border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Save className="w-5 h-5 text-violet-400" />
              Sauvegarder la note
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Titre</label>
                <input
                  type="text"
                  value={newMemoTitle}
                  onChange={(e) => setNewMemoTitle(e.target.value)}
                  placeholder="Ex: Idée pour le projet..."
                  className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'note', label: 'Note', icon: FileText },
                    { id: 'idea', label: 'Idée', icon: Lightbulb },
                    { id: 'reminder', label: 'Rappel', icon: Bell },
                    { id: 'task', label: 'Tâche', icon: CheckSquare },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setNewMemoCategory(cat.id as any)}
                      className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                        newMemoCategory === cat.id
                          ? 'border-violet-500 bg-violet-500/20'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <cat.icon className={`w-4 h-4 ${newMemoCategory === cat.id ? 'text-violet-400' : 'text-slate-400'}`} />
                      <span className={`text-xs ${newMemoCategory === cat.id ? 'text-violet-400' : 'text-slate-400'}`}>
                        {cat.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-white/50 p-3 bg-slate-800/30 rounded-lg">
                <span>Durée: {formatTime(recordingTime)}</span>
                <span>✨ Transcription automatique activée</span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowSaveModal(false)
                    setAudioBlob(null)
                    setRecordingTime(0)
                  }}
                  className="flex-1 px-4 py-3 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={saveMemo}
                  disabled={!newMemoTitle.trim() || isSaving}
                  className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium hover:from-violet-600 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Sauvegarder
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
