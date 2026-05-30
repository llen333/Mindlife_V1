'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Youtube, Sparkles, MessageSquare, FileText, Send, Loader2,
  Copy, Check, ChevronDown, Clock, User, Eye, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface TranscriptChunk {
  text: string;
  startTime: number;
  endTime: number;
  timestamp: string;
}

interface VideoMetadata {
  title: string;
  duration: string;
  author: string;
  views: string;
  thumbnail: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface TranscriptResponse {
  success: boolean;
  videoId: string;
  metadata: VideoMetadata;
  hasTranscript: boolean;
  transcript: TranscriptChunk[];
  fullText: string;
  transcriptLength: number;
  error?: string;
}

export function YouTubeAISection() {
  // State
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [videoData, setVideoData] = useState<TranscriptResponse | null>(null);
  const [summary, setSummary] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [activeTab, setActiveTab] = useState('summary');
  const [copied, setCopied] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Extract video ID for thumbnail
  const getVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
    return null;
  };

  // Fetch transcript
  const handleAnalyze = async () => {
    if (!url.trim()) return;

    setIsLoading(true);
    setVideoData(null);
    setSummary('');
    setChatMessages([]);

    try {
      const response = await fetch('/api/youtube/transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data: TranscriptResponse = await response.json();

      if (data.success) {
        setVideoData(data);
        // Auto-generate summary
        if (data.hasTranscript) {
          generateSummary(data.metadata, data.fullText);
        }
      } else {
        console.error('Error:', data.error);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate summary
  const generateSummary = async (metadata: VideoMetadata, transcript: string) => {
    setIsGeneratingSummary(true);
    try {
      const response = await fetch('/api/youtube/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metadata, transcript }),
      });

      const data = await response.json();
      if (data.success) {
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Summary error:', error);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // Send chat message
  const handleSendChat = async () => {
    if (!chatInput.trim() || !videoData) return;

    const userMessage: ChatMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsSendingChat(true);

    try {
      const response = await fetch('/api/youtube/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatMessages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          metadata: videoData.metadata,
          transcript: videoData.fullText,
        }),
      });

      const data = await response.json();
      if (data.success) {
        const assistantMessage: ChatMessage = { role: 'assistant', content: data.message };
        setChatMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsSendingChat(false);
    }
  };

  // Copy to clipboard
  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format number
  const formatViews = (views: string): string => {
    const num = parseInt(views);
    if (isNaN(num)) return views;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
          <Youtube className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">YouTube AI</h2>
          <p className="text-sm text-slate-400">Analysez et discutez avec n'importe quelle vidéo</p>
        </div>
      </div>

      {/* URL Input */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Input
              placeholder="Collez une URL YouTube ici..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-red-500/50"
            />
            <Button
              onClick={handleAnalyze}
              disabled={isLoading || !url.trim()}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span className="ml-2">Analyser</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Video Info */}
      {videoData && (
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex gap-4">
              {/* Thumbnail */}
              <div className="w-40 h-24 rounded-lg overflow-hidden bg-white/10 flex-shrink-0 relative">
                <img
                  src={videoData.metadata.thumbnail}
                  alt={videoData.metadata.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoData.videoId}/hqdefault.jpg`;
                  }}
                />
                <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                  {videoData.metadata.duration}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white line-clamp-2 mb-2">
                  {videoData.metadata.title}
                </h3>
                <div className="flex flex-wrap gap-3 text-sm text-slate-400">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {videoData.metadata.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {formatViews(videoData.metadata.views)} vues
                  </div>
                </div>
                {videoData.hasTranscript && (
                  <Badge variant="secondary" className="mt-2 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    Transcription disponible
                  </Badge>
                )}
              </div>

              {/* External link */}
              <a
                href={`https://youtube.com/watch?v=${videoData.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      {videoData && videoData.hasTranscript && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-white/5 border border-white/10 w-full grid grid-cols-3">
            <TabsTrigger value="summary" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400">
              <Sparkles className="w-4 h-4 mr-2" />
              Résumé
            </TabsTrigger>
            <TabsTrigger value="chat" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="transcript" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
              <FileText className="w-4 h-4 mr-2" />
              Transcription
            </TabsTrigger>
          </TabsList>

          {/* Summary Tab */}
          <TabsContent value="summary" className="mt-4">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-4">
                {isGeneratingSummary ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-red-500 mb-4" />
                    <p className="text-slate-400">Génération du résumé en cours...</p>
                  </div>
                ) : summary ? (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <div className="flex justify-end mb-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(summary)}
                        className="text-slate-400 hover:text-white"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <div
                      className="text-slate-300 whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{
                        __html: summary
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/^## (.*$)/gm, '<h2 class="text-lg font-bold text-white mt-4 mb-2">$1</h2>')
                          .replace(/^### (.*$)/gm, '<h3 class="text-base font-semibold text-white mt-3 mb-1">$1</h3>')
                          .replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>')
                          .replace(/^> (.*$)/gm, '<blockquote class="border-l-2 border-slate-600 pl-3 italic text-slate-400">$1</blockquote>')
                      }}
                    />
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    Aucun résumé disponible
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="mt-4">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="h-[400px] flex flex-col">
                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    {chatMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <MessageSquare className="w-12 h-12 text-slate-600 mb-4" />
                        <p className="text-slate-400 mb-2">Discutez avec cette vidéo</p>
                        <p className="text-sm text-slate-500">
                          Posez des questions sur le contenu, demandez des clarifications...
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {chatMessages.map((msg, i) => (
                          <div
                            key={i}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                                msg.role === 'user'
                                  ? 'bg-blue-500/20 text-blue-100'
                                  : 'bg-white/10 text-slate-200'
                              }`}
                            >
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                            </div>
                          </div>
                        ))}
                        <div ref={chatEndRef} />
                      </div>
                    )}
                  </ScrollArea>

                  {/* Input */}
                  <div className="p-4 border-t border-white/10">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Posez une question sur la vidéo..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendChat()}
                        className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                      />
                      <Button
                        onClick={handleSendChat}
                        disabled={isSendingChat || !chatInput.trim()}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        {isSendingChat ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transcript Tab */}
          <TabsContent value="transcript" className="mt-4">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-4">
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {videoData.transcript.map((chunk, i) => (
                      <div
                        key={i}
                        className="flex gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group"
                        onClick={() => window.open(`https://youtube.com/watch?v=${videoData.videoId}&t=${Math.floor(chunk.startTime / 1000)}s`, '_blank')}
                      >
                        <span className="text-xs text-red-400 font-mono w-12 flex-shrink-0 pt-0.5 group-hover:text-red-300">
                          {chunk.timestamp}
                        </span>
                        <p className="text-sm text-slate-300 group-hover:text-white transition-colors">
                          {chunk.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* No transcript warning */}
      {videoData && !videoData.hasTranscript && (
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="font-medium text-amber-200">Transcription non disponible</p>
                <p className="text-sm text-amber-400/80">
                  Cette vidéo n'a pas de sous-titres disponibles. Essayez une autre vidéo.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
