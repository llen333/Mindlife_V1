// useSpiritChat - Hook for managing spirit chat conversations
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { ChatMessage, SavedConversation } from '../types';
import { archetypeWelcomeMessages } from '../constants';

// Helper to create a message
const createMessage = (
  role: 'user' | 'assistant',
  content: string,
  archetype?: string
): ChatMessage => ({
  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  role,
  content,
  archetype,
  timestamp: new Date(),
});

// Helper to create welcome message
const createWelcomeMessage = (archetype: string): ChatMessage => ({
  id: Date.now().toString(),
  role: 'assistant',
  content: archetypeWelcomeMessages[archetype] || archetypeWelcomeMessages.stoicien,
  archetype,
  timestamp: new Date(),
});

export function useSpiritChat(selectedArchetype: string) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => [createWelcomeMessage(selectedArchetype)]);
  const [chatInput, setChatInput] = useState('');
  const [savedConversations, setSavedConversations] = useState<SavedConversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const currentConversationIdRef = useRef<string | null>(null);
  const currentArchetypeRef = useRef(selectedArchetype);
  const mountedRef = useRef(false);

  // Load conversations from database
  const loadConversations = useCallback(async () => {
    try {
      const response = await fetch('/api/spirit-conversations');
      const data = await response.json();
      if (data.conversations) {
        setSavedConversations(data.conversations);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  }, []);

  // Load conversation by archetype
  const loadConversationByArchetype = useCallback(async (archetype: string) => {
    try {
      const response = await fetch(`/api/spirit-conversations?archetype=${archetype}&limit=1`);
      const data = await response.json();
      if (data.conversations && data.conversations.length > 0) {
        const conv = data.conversations[0];
        if (conv.messages && conv.messages.length > 0) {
          const loadedMessages: ChatMessage[] = conv.messages.map((msg: any) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            archetype: conv.archetype,
            timestamp: new Date(msg.createdAt),
          }));
          setChatMessages(loadedMessages);
          setCurrentConversationId(conv.id);
          currentConversationIdRef.current = conv.id;
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error loading conversation by archetype:', error);
      return false;
    }
  }, []);

  // Save conversation
  const saveConversation = useCallback(async (messages: ChatMessage[], archetype: string) => {
    try {
      const conversationId = currentConversationIdRef.current;

      if (conversationId) {
        const lastMessage = messages[messages.length - 1];
        await fetch('/api/spirit-conversations', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId,
            message: {
              role: lastMessage.role,
              content: lastMessage.content,
            }
          })
        });
      } else {
        const response = await fetch('/api/spirit-conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ archetype, messages })
        });
        const data = await response.json();
        if (data.conversation) {
          setCurrentConversationId(data.conversation.id);
          currentConversationIdRef.current = data.conversation.id;
        }
      }
      loadConversations();
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  }, [loadConversations]);

  // Send message to API via AgentService (Psyché)
  const spiritSessionId = useRef<string | null>(null);

  const ARCHETYPE_AGENT: Record<string, { name: string; role: string }> = {
    psychologue: { name: 'Psyché', role: 'psychologist' },
    ami: { name: 'Ami', role: 'psychologist' },
    stoicien: { name: 'Stoïcien', role: 'psychologist' },
  };

  const sendMessageToAPI = useCallback(async (message: string, archetype: string, history: ChatMessage[]): Promise<string> => {
    const agent = ARCHETYPE_AGENT[archetype] || { name: 'Psyché', role: 'psychologist' };
    const response = await fetch('/api/agent-service', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        agentName: agent.name,
        role: agent.role,
        archetype,
        sessionId: spiritSessionId.current,
      }),
    });
    const data = await response.json();
    if (data.sessionId) {
      spiritSessionId.current = data.sessionId;
    }
    return data.response || "Je suis là pour t'accompagner.";
  }, []);

  // Send chat message
  const sendChatMessage = useCallback(async () => {
    if (!chatInput.trim()) return;

    const userMessage = createMessage('user', chatInput);
    const newMessages = [...chatMessages, userMessage];
    setChatMessages(newMessages);
    setChatInput('');
    setIsLoading(true);

    try {
      const responseContent = await sendMessageToAPI(chatInput, selectedArchetype, chatMessages);
      const assistantMessage = createMessage('assistant', responseContent, selectedArchetype);
      const finalMessages = [...newMessages, assistantMessage];
      setChatMessages(finalMessages);
      saveConversation(finalMessages, selectedArchetype);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = createMessage('assistant', "Une perturbation cosmique s'est produite. Réessaie...", selectedArchetype);
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [chatInput, chatMessages, selectedArchetype, sendMessageToAPI, saveConversation]);

  // Initialize on mount
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      loadConversations();
    }
  }, [loadConversations]);

  // Handle archetype changes
  useEffect(() => {
    if (mountedRef.current && currentArchetypeRef.current !== selectedArchetype) {
      currentArchetypeRef.current = selectedArchetype;
      loadConversationByArchetype(selectedArchetype).then((loaded) => {
        if (!loaded) {
          setChatMessages([createWelcomeMessage(selectedArchetype)]);
          setCurrentConversationId(null);
          currentConversationIdRef.current = null;
        }
      });
    }
  }, [selectedArchetype, loadConversationByArchetype]);

  // Reset chat
  const resetChat = useCallback(() => {
    setChatMessages([createWelcomeMessage(selectedArchetype)]);
    setCurrentConversationId(null);
    currentConversationIdRef.current = null;
    spiritSessionId.current = null;
  }, [selectedArchetype]);

  // Load a specific conversation
  const loadConversation = useCallback((conv: SavedConversation) => {
    if (conv.messages && conv.messages.length > 0) {
      setChatMessages(conv.messages.map((msg: ChatMessage) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        archetype: conv.archetype,
        timestamp: new Date(msg.timestamp || Date.now()),
      })));
      setCurrentConversationId(conv.id);
      currentConversationIdRef.current = conv.id;
    }
  }, []);

  // Delete conversation
  const deleteConversation = useCallback(async (id: string) => {
    await fetch(`/api/spirit-conversations?id=${id}`, { method: 'DELETE' });
    loadConversations();
  }, [loadConversations]);

  return {
    chatMessages,
    chatInput,
    setChatInput,
    savedConversations,
    currentConversationId,
    isLoading,
    sendChatMessage,
    saveConversation,
    resetChat,
    loadConversation,
    deleteConversation,
  };
}
