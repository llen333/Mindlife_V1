'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import gsap from 'gsap'
import { 
  MessageCircle, Send, X, Bot, User, Sparkles, Minimize2, Maximize2,
  Mic, MicOff, Volume2, VolumeX, Loader2, Search, Calendar, Target,
  Lightbulb, FileText, CheckSquare, Bell, ChefHat, ExternalLink, CheckCircle2,
  Dumbbell, Apple, Brain, Heart, ChevronDown
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getAIConfig } from '@/lib/ai-config'

// Mapping persona → AgentService
const PERSONA_AGENTS: Record<string, { name: string; role: string }> = {
  assistant: { name: 'Somnia', role: 'assistant' },
  coach: { name: 'Atlas', role: 'coach' },
  nutrition: { name: 'Miam', role: 'nutrition' },
  productivity: { name: 'Zéphyr', role: 'organization' },
  wellness: { name: 'Psyché', role: 'psychologist' },
};

// Personas disponibles
const PERSONAS = [
  { id: 'assistant', name: 'Assistant', icon: Sparkles, color: 'from-emerald-500 to-cyan-500' },
  { id: 'coach', name: 'Coach Sport', icon: Dumbbell, color: 'from-orange-500 to-red-500' },
  { id: 'nutrition', name: 'Nutrition', icon: Apple, color: 'from-green-500 to-emerald-500' },
  { id: 'productivity', name: 'Productivité', icon: Brain, color: 'from-blue-500 to-indigo-500' },
  { id: 'wellness', name: 'Bien-être', icon: Heart, color: 'from-pink-500 to-rose-500' },
] as const

type PersonaId = typeof PERSONAS[number]['id']

// Types
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  requestType?: string
  sources?: { title: string; url: string }[]
  suggestDeepSearch?: boolean
  eventCreated?: boolean
  persona?: string
}

interface EventData {
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime?: string;
  location?: string;
  categoryId: string;
  color: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  participants?: string[];
  tags?: string[];
}

const quickActions = [
  { icon: Calendar, label: "Planifier un rendez-vous", prompt: "J'aimerais planifier un rendez-vous pour" },
  { icon: Target, label: "Définir un objectif", prompt: "J'aimerais définir un nouvel objectif:" },
  { icon: Lightbulb, label: "Noter une idée", prompt: "J'ai une idée à noter:" },
  { icon: ChefHat, label: "Trouver une recette", prompt: "Trouve-moi une recette pour" },
  { icon: FileText, label: "Prendre une note", prompt: "Note ceci:" },
  { icon: CheckSquare, label: "Ajouter une tâche", prompt: "Ajoute à ma liste de tâches:" },
  { icon: Bell, label: "Créer un rappel", prompt: "Rappelle-moi de" },
  { icon: Search, label: "Recherche approfondie", prompt: "Fais une recherche détaillée sur" },
]

export default function AssistantChat() {
  const { 
    isAssistantOpen, setIsAssistantOpen, tasks, goals, events, habits, addEvent,
    loadEvents, loadTasks, loadGoals
  } = useStore()
  const [currentPersona, setCurrentPersona] = useState<PersonaId>('assistant')
  const [showPersonaMenu, setShowPersonaMenu] = useState(false)
  const sessionIds = useRef<Record<PersonaId, string | null>>({
    assistant: null,
    coach: null,
    nutrition: null,
    productivity: null,
    wellness: null,
  })

  const [messagesByPersona, setMessagesByPersona] = useState<Record<PersonaId, Message[]>>({
    assistant: [],
    coach: [],
    nutrition: [],
    productivity: [],
    wellness: [],
  })
  const messages = messagesByPersona[currentPersona] || []
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [deepSearchRequested, setDeepSearchRequested] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showButton, setShowButton] = useState(true)
  const [initialized, setInitialized] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // GSAP refs
  const floatingButtonRef = useRef<HTMLButtonElement>(null)
  const chatWindowRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const quickActionsRef = useRef<HTMLDivElement>(null)
  const prevMessagesLengthRef = useRef(0)

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when opened
  useEffect(() => {
    if (isAssistantOpen) {
      requestAnimationFrame(() => {
        inputRef.current?.focus()
      })
    }
  }, [isAssistantOpen])

  // Simple show/hide without GSAP issues
  useEffect(() => {
    if (isAssistantOpen) {
      setShowButton(false)
      setShowChat(true)
    } else {
      setShowButton(true)
      setShowChat(false)
    }
  }, [isAssistantOpen])

  // Quick actions stagger animation - GSAP
  useEffect(() => {
    if (isAssistantOpen && messages.length === 0 && quickActionsRef.current) {
      const buttons = quickActionsRef.current.querySelectorAll('button')
      gsap.fromTo(buttons,
        { opacity: 0, y: 10 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.3, 
          stagger: 0.05,
          ease: 'power2.out' 
        }
      )
    }
  }, [isAssistantOpen, messages.length])

  // Animate new messages - GSAP
  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current && messagesContainerRef.current) {
      const messageElements = messagesContainerRef.current.querySelectorAll('[data-message-id]')
      const newMessage = messageElements[messageElements.length - 1]
      
      if (newMessage) {
        gsap.fromTo(newMessage,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
        )
      }
    }
    prevMessagesLengthRef.current = messages.length
  }, [messages])

  // Get user context for AI
  const getUserContext = useCallback(() => {
    const today = new Date().toLocaleDateString('fr-FR')
    const pendingTasks = tasks.filter(t => t.status !== 'completed').length
    const activeGoals = goals.filter(g => g.status === 'active').length
    const upcomingEvents = events.filter(e => new Date(e.date) >= new Date()).length
    
    return `Date: ${today}. Tâches en cours: ${pendingTasks}. Objectifs actifs: ${activeGoals}. Événements à venir: ${upcomingEvents}.`
  }, [tasks, goals, events])

  // Send message to AI Agent
  const sendMessage = async (text: string, forceSearch: boolean = false) => {
    if (!text.trim() || isTyping) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date()
    }

    setMessagesByPersona(prev => ({
      ...prev,
      [currentPersona]: [...(prev[currentPersona] || []), userMessage]
    }))
    setInput('')
    setIsTyping(true)

    try {
      const agent = PERSONA_AGENTS[currentPersona]
      const response = await fetch('/api/agent-service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          agentName: agent.name,
          role: agent.role,
          sessionId: sessionIds.current[currentPersona],
        })
      })

      const data = await response.json()

      if (data.success && data.response) {
        // Store sessionId for subsequent messages
        if (data.sessionId) {
          sessionIds.current[currentPersona] = data.sessionId
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
          persona: PERSONAS.find(p => p.id === currentPersona)?.name
        }
        setMessagesByPersona(prev => ({
          ...prev,
          [currentPersona]: [...(prev[currentPersona] || []), assistantMessage]
        }))
      } else {
        throw new Error(data.error || 'Erreur de réponse')
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Désolé, une erreur est survenue. Veuillez réessayer.',
        timestamp: new Date()
      }
      setMessagesByPersona(prev => ({
        ...prev,
        [currentPersona]: [...(prev[currentPersona] || []), errorMessage]
      }))
    } finally {
      setIsTyping(false)
      setDeepSearchRequested(false)
      requestAnimationFrame(() => {
        inputRef.current?.focus()
      })
    }
  }

  // Handle text input
  const handleSend = () => {
    sendMessage(input, deepSearchRequested)
  }

  // Handle quick action
  const handleQuickAction = (prompt: string) => {
    setInput(prompt + ' ')
    inputRef.current?.focus()
  }

  // Start voice recording
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

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop())
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        
        // Convert to base64 and transcribe
        const reader = new FileReader()
        reader.onload = async () => {
          const base64 = (reader.result as string).split(',')[1]
          
          try {
            const response = await fetch('/api/asr', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audioBase64: base64 })
            })
            
            const data = await response.json()
            
            if (data.success && data.transcription) {
              setInput(data.transcription)
              // Auto-send after transcription
              setTimeout(() => {
                sendMessage(data.transcription, false)
              }, 300)
            } else {
              setInput('Erreur de transcription. Veuillez réessayer.')
            }
          } catch (error) {
            console.error('ASR error:', error)
            setInput('Erreur de transcription. Veuillez réessayer.')
          }
        }
        reader.readAsDataURL(audioBlob)
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Microphone access error:', error)
      alert('Impossible d\'accéder au microphone. Vérifiez les permissions de votre navigateur.')
    }
  }

  // Stop voice recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  // Speak message (TTS)
  const speakMessage = async (message: Message) => {
    if (isSpeaking && speakingMessageId === message.id) {
      // Stop speaking
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      setIsSpeaking(false)
      setSpeakingMessageId(null)
      return
    }

    // Stop any current audio
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    setIsSpeaking(true)
    setSpeakingMessageId(message.id)

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message.content.slice(0, 1000), speed: 1.0 })
      })

      if (!response.ok) throw new Error('TTS failed')

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      
      const audio = new Audio(audioUrl)
      audioRef.current = audio
      
      audio.onended = () => {
        setIsSpeaking(false)
        setSpeakingMessageId(null)
        URL.revokeObjectURL(audioUrl)
      }

      audio.onerror = () => {
        setIsSpeaking(false)
        setSpeakingMessageId(null)
      }

      await audio.play()
    } catch (error) {
      console.error('TTS error:', error)
      setIsSpeaking(false)
      setSpeakingMessageId(null)
    }
  }

  // Request deep search
  const requestDeepSearch = (originalMessage: string) => {
    setDeepSearchRequested(true)
    sendMessage(`Veuillez faire une recherche approfondie sur: ${originalMessage}`, true)
  }

  // Clear conversation
  const clearConversation = () => {
    setMessagesByPersona(prev => ({
      ...prev,
      [currentPersona]: []
    }))
    sessionIds.current[currentPersona] = null
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setIsSpeaking(false)
    setSpeakingMessageId(null)
  }

  return (
    <>
      {/* Floating Button */}
      {showButton && (
        <button
          ref={floatingButtonRef}
          onClick={() => setIsAssistantOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-violet-500 text-white shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all z-50 flex items-center justify-center hover:scale-110 active:scale-95"
        >
          <Sparkles className="w-7 h-7" />
        </button>
      )}

      {/* Chat Window */}
      {showChat && (
        <div
          ref={chatWindowRef}
          className={`fixed z-50 overflow-hidden shadow-2xl transition-all ${
            isExpanded 
              ? 'inset-4 md:inset-8 lg:inset-16' 
              : 'bottom-6 right-6 w-[420px] max-w-[calc(100vw-48px)] h-[600px] max-h-[calc(100vh-48px)]'
          } bg-[#0f172a]/98 backdrop-blur-xl rounded-2xl border border-white/10 flex flex-col`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-violet-500/20 border-b border-white/10 p-4 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${PERSONAS.find(p => p.id === currentPersona)?.color || 'from-emerald-500 to-cyan-500'} flex items-center justify-center`}>
                  {(() => {
                    const PersonaIcon = PERSONAS.find(p => p.id === currentPersona)?.icon || Bot
                    return <PersonaIcon className="w-5 h-5 text-white" />
                  })()}
                </div>
                <div className="relative">
                  <button 
                    onClick={() => setShowPersonaMenu(!showPersonaMenu)}
                    className="flex items-center gap-2 hover:bg-white/10 rounded-lg px-2 py-1 transition-colors"
                  >
                    <h3 className="font-bold text-white flex items-center gap-2">
                      {PERSONAS.find(p => p.id === currentPersona)?.name || 'Assistant IA'}
                      <ChevronDown className="w-3 h-3 text-white/60" />
                    </h3>
                  </button>
                  
                  {/* Persona Menu */}
                  {showPersonaMenu && (
                    <div className="absolute top-full left-0 mt-2 bg-slate-800/95 backdrop-blur-lg rounded-xl border border-white/10 shadow-xl z-10 min-w-[180px] overflow-hidden">
                      {PERSONAS.map((persona) => {
                        const Icon = persona.icon
                        return (
                          <button
                            key={persona.id}
                            onClick={() => {
                              setCurrentPersona(persona.id)
                              setShowPersonaMenu(false)
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-left ${
                              currentPersona === persona.id ? 'bg-white/5' : ''
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${persona.color} flex items-center justify-center shrink-0`}>
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-white/90 text-sm font-medium">{persona.name}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                  
                  <p className="text-xs text-white/60 ml-2">Agent IA intelligent</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearConversation}
                  className="text-white/40 hover:text-white hover:bg-white/10"
                  title="Nouvelle conversation"
                >
                  <X className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-white/40 hover:text-white hover:bg-white/10"
                  title={isExpanded ? 'Réduire' : 'Agrandir'}
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsAssistantOpen(false)}
                  className="text-white/40 hover:text-white hover:bg-white/10"
                  title="Fermer"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div 
            ref={messagesContainerRef}
            className={`flex-1 overflow-y-auto p-4 space-y-4 ${isExpanded ? '' : 'h-80'}`}
          >
            {messages.length === 0 && (
              <div className="text-center py-6">
                <div className="animate-float-y">
                  <Bot className="w-16 h-16 mx-auto mb-4 text-emerald-400" />
                </div>
                <p className="text-white text-lg font-medium mb-2">Bonjour ! Je suis votre assistant MindLife.</p>
                <p className="text-white/50 text-sm mb-6">Parlez-moi ou écrivez votre demande. Je peux vous aider avec tout !</p>
                
                {/* Quick Actions */}
                <div ref={quickActionsRef} className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickAction(action.prompt)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sm text-white/80 hover:text-white transition-all text-left"
                    >
                      <action.icon className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="truncate">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                data-message-id={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-r from-violet-500 to-purple-600' 
                    : 'bg-gradient-to-r from-emerald-500 to-cyan-500'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                
                <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                  <div className={`inline-block rounded-2xl px-4 py-3 max-w-[90%] ${
                    message.role === 'user' 
                      ? 'bg-violet-500/20 text-white rounded-tr-md' 
                      : 'bg-white/5 text-white/90 rounded-tl-md'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  
                  {/* Sources */}
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {message.sources.map((source, i) => (
                        <a
                          key={i}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 text-[10px] text-white/50 hover:text-white/80 transition-colors"
                        >
                          <ExternalLink className="w-2.5 h-2.5" />
                          {source.title.slice(0, 20)}...
                        </a>
                      ))}
                    </div>
                  )}
                  
                  {/* Deep Search Suggestion */}
                  {message.suggestDeepSearch && message.role === 'assistant' && (
                    <button
                      onClick={() => {
                        const originalQuery = messages.find(m => m.id === String(parseInt(message.id) - 1))?.content
                        if (originalQuery) requestDeepSearch(originalQuery)
                      }}
                      className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/20 text-violet-300 text-xs hover:bg-violet-500/30 transition-colors"
                    >
                      <Search className="w-3 h-3" />
                      Recherche approfondie ?
                    </button>
                  )}
                  
                  {/* Event Created Indicator */}
                  {message.eventCreated && (
                    <div className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs animate-fade-in">
                      <CheckCircle2 className="w-3 h-3" />
                      Événement ajouté au calendrier
                    </div>
                  )}
                  
                  {/* Speaker button */}
                  {message.role === 'assistant' && (
                    <button
                      onClick={() => speakMessage(message)}
                      className={`mt-2 p-2 rounded-full transition-colors ${
                        isSpeaking && speakingMessageId === message.id
                          ? 'bg-emerald-500/30 text-emerald-400'
                          : 'hover:bg-white/10 text-white/30 hover:text-white/60'
                      }`}
                      title={isSpeaking && speakingMessageId === message.id ? 'Arrêter' : 'Écouter'}
                    >
                      {isSpeaking && speakingMessageId === message.id ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 animate-fade-in">
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white/5 rounded-2xl rounded-tl-md px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-typing-dot" style={{ animationDelay: '0s' }} />
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-typing-dot" style={{ animationDelay: '0.2s' }} />
                    <span className="w-2 h-2 rounded-full bg-violet-400 animate-typing-dot" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-white/10 p-4 bg-[#0f172a]/80 shrink-0">
            {/* Recording indicator */}
            {isRecording && (
              <div className="mb-3 text-center animate-slide-up">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/30">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse-scale" />
                  <span className="text-sm text-red-400 font-medium">Enregistrement en cours...</span>
                </div>
              </div>
            )}
            
            <div className="flex gap-2">
              {/* Voice Button */}
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isTyping}
                className={`shrink-0 w-12 h-12 rounded-xl transition-all ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700'
                } text-white`}
                title={isRecording ? 'Arrêter' : 'Parler'}
              >
                {isRecording ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </Button>
              
              {/* Text Input */}
              <Input
                ref={inputRef}
                placeholder={isRecording ? "Je vous écoute..." : "Écrivez ou parlez..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                disabled={isRecording || isTyping}
                className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-emerald-500/50 h-12"
              />
              
              {/* Send Button */}
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isTyping || isRecording}
                className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white disabled:opacity-50"
              >
                {isTyping ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
            
            {/* Hint */}
            <p className="text-[10px] text-white/30 text-center mt-2">
              🎤 Cliquez sur le micro pour parler • 🔊 Cliquez sur le haut-parleur pour écouter
            </p>
          </div>
        </div>
      )}
    </>
  )
}
