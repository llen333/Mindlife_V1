// useSpiritNotes - Hook for managing spirit notes
'use client';

import { useState, useCallback } from 'react';
import type { SpiritNote, SpiritCard } from '../types';
import { initialNotes, initialCards } from '../constants';

export function useSpiritNotes() {
  const [notes, setNotes] = useState<SpiritNote[]>(initialNotes);
  const [cards] = useState<SpiritCard[]>(initialCards);
  const [showNewNoteModal, setShowNewNoteModal] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');

  // Add new note
  const addNote = useCallback(() => {
    if (!newNoteContent.trim()) return;

    const note: SpiritNote = {
      id: Date.now().toString(),
      content: newNoteContent,
      tag: 'Nouveau',
      type: 'text',
      createdAt: new Date(),
    };

    setNotes(prev => [note, ...prev]);
    setNewNoteContent('');
    setShowNewNoteModal(false);
  }, [newNoteContent]);

  // Get cards by status
  const getCardsByStatus = useCallback((status: SpiritCard['status']) =>
    cards.filter(card => card.status === status),
  [cards]);

  // Open new note modal
  const openNewNoteModal = useCallback(() => {
    setShowNewNoteModal(true);
  }, []);

  // Close new note modal
  const closeNewNoteModal = useCallback(() => {
    setShowNewNoteModal(false);
    setNewNoteContent('');
  }, []);

  return {
    notes,
    cards,
    showNewNoteModal,
    newNoteContent,
    setNewNoteContent,
    addNote,
    getCardsByStatus,
    openNewNoteModal,
    closeNewNoteModal,
  };
}
