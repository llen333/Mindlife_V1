'use client';

import { useState, useCallback, useRef } from 'react';

// Types
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  persona?: string;
}

export interface Persona {
  id: string;
  name: string;
}

export interface AIAgentState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  currentPersona: string;
  personas: Persona[];
}

export interface AIAgentActions {
  sendMessage: (message: string) => Promise<void>;
  clearHistory: () => void;
  setPersona: (personaId: string) => void;
  loadPersonas: () => Promise<void>;
}

const DEFAULT_PERSONAS: Persona[] = [
  { id: 'assistant', name: 'Assistant MindLife' },
  { id: 'coach', name: 'Coach Sportif' },
  { id: 'nutrition', name: 'Nutritionniste' },
  { id: 'productivity', name: 'Coach Productivité' },
  { id: 'wellness', name: 'Coach Bien-être' }
];

export function useAIAgent(): AIAgentState & AIAgentActions {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPersona, setCurrentPersona] = useState<string>('assistant');
  const [personas, setPersonas] = useState<Persona[]>(DEFAULT_PERSONAS);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  // Charger les personas disponibles
  const loadPersonas = useCallback(async () => {
    try {
      const response = await fetch('/api/ai-agent');
      if (response.ok) {
        const data = await response.json();
        if (data.personas) {
          setPersonas(data.personas);
        }
      }
    } catch (err) {
      console.error('Failed to load personas:', err);
    }
  }, []);

  // Envoyer un message
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isLoading) return;

    // Annuler la requête précédente si en cours
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();

    // Ajouter le message utilisateur
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message.trim(),
          persona: currentPersona,
          history: messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error('Erreur de communication avec l\'IA');
      }

      const data = await response.json();

      if (data.success && data.response) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
          persona: data.personaName
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'Erreur inconnue');
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Requête annulée, ne pas afficher d'erreur
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      
      // Message d'erreur comme réponse
      const errorMessageObj: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Je suis désolé, je n'ai pas pu traiter ta demande. Peux-tu réessayer ?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessageObj]);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [messages, currentPersona, isLoading]);

  // Effacer l'historique
  const clearHistory = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  // Changer de persona
  const setPersona = useCallback((personaId: string) => {
    setCurrentPersona(personaId);
  }, []);

  return {
    messages,
    isLoading,
    error,
    currentPersona,
    personas,
    sendMessage,
    clearHistory,
    setPersona,
    loadPersonas
  };
}
