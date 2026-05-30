// useVoiceRecording - Hook for managing voice recording
'use client';

declare var SpeechRecognition: any;
declare var webkitSpeechRecognition: any;
declare var SpeechRecognitionEvent: any;
declare var SpeechRecognitionErrorEvent: any;

type SpeechRecognitionType = typeof SpeechRecognition;
type SpeechRecognitionEventType = typeof SpeechRecognitionEvent;
type SpeechRecognitionErrorEventType = typeof SpeechRecognitionErrorEvent;

import { useState, useRef, useCallback } from 'react';
import type { ChatMessage } from '../types';

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

export function useVoiceRecording(
  selectedArchetype: string,
  chatMessages: ChatMessage[],
  sendMessageToAPI: (message: string, archetype: string, history: ChatMessage[]) => Promise<string>,
  saveConversation: (messages: ChatMessage[], archetype: string) => void,
  setIsLoading: (loading: boolean) => void
) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const isRecordingActiveRef = useRef(false);
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);
  const transcriptRef = useRef<string>('');
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if running on localhost
  const isLocalhost = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    const hostname = window.location.hostname;
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
  }, []);

  // Check if Web Speech API is available
  const hasWebSpeechAPI = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    const w = window as typeof window & {
      SpeechRecognition?: new () => SpeechRecognitionType;
      webkitSpeechRecognition?: new () => SpeechRecognitionType;
    };
    return !!(w.SpeechRecognition || w.webkitSpeechRecognition);
  }, []);

  // Send voice message
  const sendVoiceMessage = useCallback(async (transcript: string) => {
    if (!transcript.trim()) return;

    const userMessage = createMessage('user', transcript);
    const newMessages = [...chatMessages, userMessage];
    setIsLoading(true);

    try {
      const responseContent = await sendMessageToAPI(transcript, selectedArchetype, chatMessages);
      const assistantMessage = createMessage('assistant', responseContent, selectedArchetype);
      const finalMessages = [...newMessages, assistantMessage];
      saveConversation(finalMessages, selectedArchetype);
    } catch (error) {
      console.error('Voice message error:', error);
    } finally {
      setIsLoading(false);
      transcriptRef.current = '';
    }
  }, [chatMessages, selectedArchetype, sendMessageToAPI, saveConversation, setIsLoading]);

  // Process recording (ASR) - defined before it's used
  const processRecording = useCallback(async (audioBlob: Blob) => {
    setIsProcessing(true);
    setIsLoading(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onload = async () => {
        const base64Audio = (reader.result as string).split(',')[1];

        const asrResponse = await fetch('/api/asr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audioBase64: base64Audio })
        });

        const asrData = await asrResponse.json();
        const transcript = asrData.transcription || '';

        if (!transcript.trim()) {
          setIsProcessing(false);
          setIsLoading(false);
          return;
        }

        await sendVoiceMessage(transcript);

        setIsProcessing(false);
        setIsLoading(false);
      };
    } catch (error) {
      console.error('Recording processing error:', error);
      setIsProcessing(false);
      setIsLoading(false);
    }
  }, [sendVoiceMessage, setIsLoading]);

  // Stop recording - defined before it's used
  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    if (silenceTimeoutRef.current) {
      clearInterval(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }

    isRecordingActiveRef.current = false;
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
    setAudioLevel(0);
  }, []);

  // Web Speech API recording
  const startWebSpeechRecording = useCallback(() => {
    const w = window as typeof window & {
      SpeechRecognition?: new () => SpeechRecognitionType;
      webkitSpeechRecognition?: new () => SpeechRecognitionType;
    };

    const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Web Speech API non disponible. Utilisez Chrome ou Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'fr-FR';

    let lastTranscriptTime = Date.now();
    let finalTranscript = '';

    recognition.onstart = () => {
      setIsRecording(true);
      isRecordingActiveRef.current = true;
      setAudioLevel(50);

      silenceTimeoutRef.current = setInterval(() => {
        const now = Date.now();
        if (now - lastTranscriptTime > 3000 && finalTranscript.trim()) {
          recognition.stop();
        }
      }, 500);
    };

    recognition.onresult = (event: SpeechRecognitionEventType) => {
      lastTranscriptTime = Date.now();
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      const fullText = finalTranscript + interimTranscript;
      transcriptRef.current = fullText;
      setAudioLevel(30 + Math.random() * 40);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEventType) => {
      console.error('Web Speech error:', event.error);
      if (silenceTimeoutRef.current) {
        clearInterval(silenceTimeoutRef.current);
      }
      setIsRecording(false);
      isRecordingActiveRef.current = false;
      setAudioLevel(0);

      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        alert(`Erreur: ${event.error}. Réessayez.`);
      }
    };

    recognition.onend = () => {
      if (silenceTimeoutRef.current) {
        clearInterval(silenceTimeoutRef.current);
      }
      setIsRecording(false);
      isRecordingActiveRef.current = false;
      setAudioLevel(0);

      if (transcriptRef.current.trim()) {
        sendVoiceMessage(transcriptRef.current.trim());
      }
    };

    recognition.start();
  }, [sendVoiceMessage]);

  // MediaRecorder + ASR
  const startMediaRecorderRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setIsRecording(true);
      isRecordingActiveRef.current = true;

      const audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        await processRecording(audioBlob);
      };

      mediaRecorder.start();

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let silenceStart: number | null = null;

      const checkAudioLevel = () => {
        if (!analyserRef.current || !isRecordingActiveRef.current) return;

        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAudioLevel(average);

        if (average > 25) {
          silenceStart = null;
        } else {
          if (!silenceStart) silenceStart = Date.now();
          const silenceDuration = Date.now() - silenceStart;
          if (silenceDuration >= 3000) {
            stopRecording();
            return;
          }
        }
        requestAnimationFrame(checkAudioLevel);
      };
      checkAudioLevel();
    } catch (error) {
      console.error('Microphone access denied:', error);
      setIsRecording(false);
      alert('Accès au microphone refusé. Autorisez le microphone dans les paramètres.');
    }
  }, [processRecording, stopRecording]);

  // Start recording
  const startRecording = useCallback(async () => {
    transcriptRef.current = '';

    if (isLocalhost() && hasWebSpeechAPI()) {
      startWebSpeechRecording();
      return;
    }

    await startMediaRecorderRecording();
  }, [isLocalhost, hasWebSpeechAPI, startWebSpeechRecording, startMediaRecorderRecording]);

  return {
    isRecording,
    audioLevel,
    isProcessing,
    startRecording,
    stopRecording,
  };
}
