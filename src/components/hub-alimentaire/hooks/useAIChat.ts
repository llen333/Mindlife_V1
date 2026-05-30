'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { ChatMessage, UserProfile, ComputedMetrics, GoalMappingEntry } from '../types';

interface UseAIChatProps {
  profile: UserProfile;
  metrics: ComputedMetrics;
  goalInfo: GoalMappingEntry;
}

interface UseAIChatReturn {
  chatMessages: ChatMessage[];
  chatInput: string;
  isAITyping: boolean;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  chatMessagesRef: React.RefObject<HTMLDivElement | null>;
  setChatInput: (value: string) => void;
  sendChatMessage: () => Promise<void>;
}

/**
 * Hook personnalisé pour gérer le chat IA nutritionnel
 */
export function useAIChat({ profile, metrics, goalInfo }: UseAIChatProps): UseAIChatReturn {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAITyping, setIsAITyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, scrollToBottom]);

  // Send message to AI
  const sendChatMessage = useCallback(async () => {
    if (!chatInput.trim() || isAITyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsAITyping(true);

    try {
      const response = await fetch('/api/nutrition-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: chatInput,
          profile: {
            weight: profile.weight,
            height: profile.height,
            age: metrics.age,
            gender: profile.gender,
            goal: goalInfo.id,
            dietaryPreferences: profile.dietaryPreferences,
            allergies: profile.allergies,
            targetCalories: metrics.targetCalories,
            protein: metrics.protein,
            carbs: metrics.carbs,
            fat: metrics.fat,
          },
          history: chatMessages.slice(-10)
        })
      });

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || "Je suis là pour vous aider avec vos questions nutritionnelles. N'hésitez pas à me demander des conseils sur votre alimentation !",
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, assistantMessage]);
    } catch {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Désolé, je rencontre un problème technique. Veuillez réessayer dans un instant.",
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAITyping(false);
    }
  }, [chatInput, isAITyping, profile, metrics, goalInfo, chatMessages]);

  return {
    chatMessages,
    chatInput,
    isAITyping,
    chatEndRef,
    chatMessagesRef,
    setChatInput,
    sendChatMessage,
  };
}
