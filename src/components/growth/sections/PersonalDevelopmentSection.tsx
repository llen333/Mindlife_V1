// Section 2: Personal Development Resources - FIXED VERSION
// - Miniatures uniformes (aspect-[3/4] pour toutes)
// - Séparations entre catégories dans l'onglet "Tous"
// - Lecteur vidéo fonctionnel
'use client';

import { useState } from 'react';
import { 
  BookOpen, Video, Headphones, FileText, Star, Play, Plus, 
  Link, Check, AlertCircle, Maximize2, X, RefreshCw, Youtube, Search, Trash2
} from 'lucide-react';
import type { PersonalResource } from '../types';
import { statusColors, resourceTypeIcons } from '../constants';
import { getYouTubeThumbnail, isYouTubeUrl, generatePlaceholderImage } from '../utils';
import { JournalDeBord } from './JournalDeBord';
import { useMediaPlayer } from '@/contexts/MediaPlayerContext';
import { ResourceModal } from '../modals';

interface PersonalDevelopmentSectionProps {
  resources: PersonalResource[];
  onUpdateResource?: (id: string, data: Partial<PersonalResource>) => void;
  onCreateResource?: (resource: PersonalResource) => void;
  onDeleteResource?: (id: string) => void;
  onAddNewResource?: () => void;
}

export function PersonalDevelopmentSection({ resources, onUpdateResource, onCreateResource, onDeleteResource, onAddNewResource }: PersonalDevelopmentSectionProps) {
  const [selectedResource, setSelectedResource] = useState<PersonalResource | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'book' | 'video' | 'article' | 'audio'>('all');
  const [editingUrl, setEditingUrl] = useState<string | null>(null);
  const [newUrl, setNewUrl] = useState('');
  const [urlValidation, setUrlValidation] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [videoToTag, setVideoToTag] = useState<any | null>(null);
  
  // États pour la recherche YouTube
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Global media player
  const { playMedia } = useMediaPlayer();

  const handleSearch = async (queryToUse?: string) => {
    const q = queryToUse || searchQuery;
    if (!q.trim()) return;

    setIsSearching(true);
    setSearchError('');
    setSearchResults([]);

    try {
      const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSearchResults(data.results);
        } else {
          setSearchError('Impossible de charger les vidéos YouTube.');
        }
      } else {
        setSearchError('Erreur de communication avec le serveur de recherche.');
      }
    } catch (e) {
      console.error(e);
      setSearchError('Erreur lors de la recherche.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleOpenTagModal = (video: any) => {
    const title = video.title.toLowerCase();
    const author = video.author ? video.author.toLowerCase() : '';
    const autoTags: string[] = [];
    
    if (title.includes('music') || title.includes('musique') || title.includes('mix') || title.includes('ost') || title.includes('album') || title.includes('live')) {
      autoTags.push('musique');
    }
    if (title.includes('jung') || author.includes('jung') || title.includes('conscience') || title.includes('spirituel') || title.includes('âme') || title.includes('éveil')) {
      autoTags.push('spiritualité');
      if (title.includes('jung') || author.includes('jung')) autoTags.push('carl jung');
    }
    if (title.includes('tuto') || title.includes('comment') || title.includes('how to')) {
      autoTags.push('tutos');
    }
    
    if (author && author.trim() !== '') {
      autoTags.push(author.trim().toLowerCase());
    }
    
    const uniqueTags = Array.from(new Set(autoTags));
    const isAudio = uniqueTags.includes('musique') || title.includes('podcast');

    setVideoToTag({
      ...video,
      targetType: isAudio ? 'audio' : 'video',
      tempTags: uniqueTags.length > 0 ? uniqueTags : []
    });
  };

  const handleIntegrateVideo = (video: any, selectedTags: string[], targetType: 'video' | 'audio' | 'book' | 'article' = 'video') => {
    if (onCreateResource) {
      const newResource: PersonalResource = {
        id: `video-${video.id}`,
        title: video.title,
        author: video.author,
        type: targetType,
        status: 'to-watch',
        category: 'mindset',
        url: video.url,
        imageUrl: video.imageUrl,
        description: video.description || `Média YouTube : ${video.title}`,
        progress: 0,
        tags: selectedTags,
        createdAt: new Date(),
      };
      onCreateResource(newResource);
    }
    setVideoToTag(null);
  };

  const currentTypeResources = activeFilter === 'all' ? resources : resources.filter(r => r.type === activeFilter);
  const availableTags = Array.from(new Set(currentTypeResources.flatMap(r => r.tags || []))).sort();

  const filteredResources = selectedTag 
    ? currentTypeResources.filter(r => r.tags?.includes(selectedTag))
    : currentTypeResources;

  const videos = filteredResources.filter(r => r.type === 'video');
  const audios = filteredResources.filter(r => r.type === 'audio');
  const books = filteredResources.filter(r => r.type === 'book');
  const articles = filteredResources.filter(r => r.type === 'article');

  // Stats
  const completed = resources.filter(r => r.status === 'completed').length;
  const inProgress = resources.filter(r => ['reading', 'watching', 'listening'].includes(r.status)).length;
  const toStart = resources.filter(r => ['to-read', 'to-watch', 'to-listen'].includes(r.status)).length;

  // Handle playing media (video or audio)
  const handlePlayMedia = (resource: PersonalResource) => {
    if ((resource.type === 'video' || resource.type === 'audio') && resource.url) {
      playMedia({
        id: resource.id,
        title: resource.title,
        author: resource.author,
        type: resource.type === 'audio' ? 'audio' : 'video',
        url: resource.url,
        imageUrl: resource.imageUrl,
        description: resource.description,
      });
    } else {
      setSelectedResource(resource);
    }
  };

  // Validate and update URL
  const handleValidateUrl = async (resourceId: string) => {
    if (!newUrl.trim()) return;
    
    setUrlValidation('checking');
    const isValidYouTube = isYouTubeUrl(newUrl);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (isValidYouTube) {
      setUrlValidation('valid');
      if (onUpdateResource) {
        const thumbnail = getYouTubeThumbnail(newUrl) || undefined;
        onUpdateResource(resourceId, { url: newUrl, imageUrl: thumbnail });
      }
      setTimeout(() => {
        setEditingUrl(null);
        setNewUrl('');
        setUrlValidation('idle');
      }, 1000);
    } else {
      setUrlValidation('invalid');
    }
  };

  return (
    <section className="mb-16">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center backdrop-blur-sm border border-white/10">
            <BookOpen className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-light text-white tracking-wide">Développement Personnel</h2>
            <p className="text-white/40 text-sm">Lectures, vidéos et ressources de croissance</p>
          </div>
        </div>
        <button
          onClick={onAddNewResource}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm hover:bg-blue-500/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {/* Journal de Bord */}
      <div className="mb-8">
        <JournalDeBord />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
          <div className="text-3xl font-light text-emerald-400">{completed}</div>
          <div className="text-white/40 text-xs uppercase tracking-wider mt-1">Complétés</div>
        </div>
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
          <div className="text-3xl font-light text-amber-400">{inProgress}</div>
          <div className="text-white/40 text-xs uppercase tracking-wider mt-1">En cours</div>
        </div>
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
          <div className="text-3xl font-light text-white">{toStart}</div>
          <div className="text-white/40 text-xs uppercase tracking-wider mt-1">À commencer</div>
        </div>
      </div>

      {/* YouTube Discovery Hub - Moteur de recherche YouTube Premium */}
      <div className="mb-8 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md relative overflow-hidden group">
        {/* Subtle background glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-red-500/15 transition-all duration-500" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/15 transition-all duration-500" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
              <Youtube className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-light text-white tracking-wide flex items-center gap-2">
                YouTube Discovery Hub
                <span className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-medium uppercase tracking-wider">Recherche AI</span>
              </h3>
              <p className="text-white/40 text-xs mt-0.5">Recherchez et intégrez instantanément des vidéos de croissance personnelle dans votre bibliothèque</p>
            </div>
          </div>
          
          {/* Mots clés recommandés */}
          <div className="flex flex-wrap gap-2">
            {['Neville Goddard', 'Carl Jung', 'Atomic Habits', 'TED Talk', 'Discipline'].map((kw) => (
              <button
                key={kw}
                onClick={() => {
                  setSearchQuery(kw);
                  handleSearch(kw);
                }}
                className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-white/55 text-xs hover:bg-white/10 hover:text-white hover:border-white/20 transition-all font-light"
              >
                #{kw}
              </button>
            ))}
          </div>
        </div>

        {/* Input de recherche */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Rechercher des vidéos inspirantes (ex: Méditation profonde, Lois de l'Assomption...)"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-red-500/40 focus:bg-white/10 focus:outline-none transition-all font-light text-sm"
            />
            <Search className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={isSearching || !searchQuery.trim()}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500/20 to-purple-500/20 border border-red-500/30 text-red-400 hover:from-red-500/30 hover:to-purple-500/30 transition-all font-light text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? (
              <RefreshCw className="w-4 h-4 animate-spin text-red-400" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Rechercher
          </button>
        </div>

        {/* Conteneur des résultats */}
        {searchResults.length > 0 && (
          <div className="mt-6 border-t border-white/10 pt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/50 text-xs uppercase tracking-wider font-light">Résultats ({searchResults.length})</span>
              <button
                onClick={() => setSearchResults([])}
                className="text-white/30 hover:text-white/60 text-xs font-light transition-colors"
              >
                Effacer les résultats
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {searchResults.map((video) => {
                const isAlreadyIntegrated = resources.some(r => r.url === video.url || r.id === `video-${video.id}`);
                return (
                  <div
                    key={video.id}
                    className="group/card relative overflow-hidden rounded-xl bg-white/5 border border-white/15 hover:border-white/30 transition-all hover:bg-white/10 backdrop-blur-sm flex flex-col h-full"
                  >
                    <div className="aspect-video relative overflow-hidden bg-black">
                      <img
                        src={video.imageUrl}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                      <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/75 text-[10px] text-white font-mono">
                        {video.duration}
                      </div>
                      
                      <button
                        onClick={() => {
                          playMedia({
                            id: `video-${video.id}`,
                            title: video.title,
                            author: video.author,
                            type: 'video',
                            url: video.url,
                            imageUrl: video.imageUrl,
                            description: video.description,
                          });
                        }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all hover:scale-110"
                      >
                        <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                      </button>
                    </div>
                    
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-white font-light text-sm line-clamp-2 mb-1 group-hover/card:text-red-400 transition-colors" title={video.title}>
                          {video.title}
                        </h4>
                        <p className="text-white/40 text-xs truncate mb-2">par {video.author}</p>
                        {video.description && (
                          <p className="text-white/30 text-[10px] line-clamp-2 leading-relaxed mb-3">
                            {video.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex gap-2 mt-auto">
                        <button
                          onClick={() => {
                            playMedia({
                              id: `video-${video.id}`,
                              title: video.title,
                              author: video.author,
                              type: 'video',
                              url: video.url,
                              imageUrl: video.imageUrl,
                              description: video.description,
                            });
                          }}
                          className="flex-1 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white transition-colors text-xs flex items-center justify-center gap-1 font-light"
                        >
                          <Play className="w-3.5 h-3.5" />
                          Lire
                        </button>
                        
                        <button
                          onClick={() => handleOpenTagModal(video)}
                          disabled={isAlreadyIntegrated}
                          className={`flex-1 py-1.5 rounded-lg text-xs flex items-center justify-center gap-1 font-light border transition-all ${
                            isAlreadyIntegrated
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 cursor-default'
                              : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-white'
                          }`}
                        >
                          {isAlreadyIntegrated ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              Intégré
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              Intégrer
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Animation de chargement */}
        {isSearching && (
          <div className="mt-8 flex flex-col items-center justify-center py-12 border-t border-white/10">
            <RefreshCw className="w-8 h-8 text-red-500 animate-spin mb-3" />
            <p className="text-white/40 text-sm font-light">Recherche en cours dans la base de données YouTube...</p>
          </div>
        )}

        {/* Message d'erreur */}
        {searchError && (
          <div className="mt-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-light text-center">
            {searchError}
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: 'all', label: 'Tous', count: resources.length, icon: BookOpen },
          { id: 'video', label: 'Vidéos', count: videos.length, icon: Video },
          { id: 'audio', label: 'Audio', count: audios.length, icon: Headphones },
          { id: 'book', label: 'Livres', count: books.length, icon: BookOpen },
          { id: 'article', label: 'Articles', count: articles.length, icon: FileText },
        ].map((filter) => {
          const Icon = filter.icon;
          return (
            <button
              key={filter.id}
              onClick={() => {
                setActiveFilter(filter.id as typeof activeFilter);
                setSelectedTag(null); // Réinitialiser le tag quand on change de catégorie
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all whitespace-nowrap backdrop-blur-sm ${
                activeFilter === filter.id
                  ? 'bg-white/10 border-white/30 text-white'
                  : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{filter.label}</span>
              <span className="text-white/30 text-xs">({filter.count})</span>
            </button>
          );
        })}
      </div>

      {/* Tags Filter (Glassmorphism Pills) */}
      {availableTags.length > 0 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1.5 rounded-full text-xs transition-all whitespace-nowrap border backdrop-blur-sm ${
              selectedTag === null
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'
            }`}
          >
            Tous les tags
          </button>
          {availableTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-full text-xs transition-all whitespace-nowrap border backdrop-blur-sm capitalize ${
                selectedTag === tag
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Resources Display */}
      {activeFilter === 'all' ? (
        // MODE "TOUS" - Affichage par catégories avec séparations
        <div className="space-y-8">
          {/* Vidéos */}
          {videos.length > 0 && (
            <CategorySection
              title="Vidéos"
              icon={Video}
              iconColor="text-red-400"
              count={videos.length}
            >
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory custom-scrollbar">
                {videos.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    isCarousel={true}
                    onPlay={() => handlePlayMedia(resource)}
                    onDelete={onDeleteResource ? () => onDeleteResource(resource.id) : undefined}
                    onEditUrl={() => { setEditingUrl(resource.id); setNewUrl(resource.url || ''); }}
                    isEditingUrl={editingUrl === resource.id}
                    newUrl={newUrl}
                    setNewUrl={setNewUrl}
                    urlValidation={urlValidation}
                    onValidateUrl={() => handleValidateUrl(resource.id)}
                    onCancelEdit={() => { setEditingUrl(null); setNewUrl(''); setUrlValidation('idle'); }}
                  />
                ))}
              </div>
            </CategorySection>
          )}

          {/* Audio */}
          {audios.length > 0 && (
            <CategorySection
              title="Audio"
              icon={Headphones}
              iconColor="text-purple-400"
              count={audios.length}
            >
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory custom-scrollbar">
                {audios.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    isCarousel={true}
                    onPlay={() => handlePlayMedia(resource)}
                    onDelete={onDeleteResource ? () => onDeleteResource(resource.id) : undefined}
                    onEditUrl={() => { setEditingUrl(resource.id); setNewUrl(resource.url || ''); }}
                    isEditingUrl={editingUrl === resource.id}
                    newUrl={newUrl}
                    setNewUrl={setNewUrl}
                    urlValidation={urlValidation}
                    onValidateUrl={() => handleValidateUrl(resource.id)}
                    onCancelEdit={() => { setEditingUrl(null); setNewUrl(''); setUrlValidation('idle'); }}
                  />
                ))}
              </div>
            </CategorySection>
          )}

          {/* Livres */}
          {books.length > 0 && (
            <CategorySection
              title="Livres"
              icon={BookOpen}
              iconColor="text-blue-400"
              count={books.length}
            >
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory custom-scrollbar">
                {books.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    isCarousel={true}
                    onClick={() => setSelectedResource(resource)}
                    onDelete={onDeleteResource ? () => onDeleteResource(resource.id) : undefined}
                    onEditUrl={() => { setEditingUrl(resource.id); setNewUrl(resource.url || ''); }}
                    isEditingUrl={editingUrl === resource.id}
                    newUrl={newUrl}
                    setNewUrl={setNewUrl}
                    urlValidation={urlValidation}
                    onValidateUrl={() => handleValidateUrl(resource.id)}
                    onCancelEdit={() => { setEditingUrl(null); setNewUrl(''); setUrlValidation('idle'); }}
                  />
                ))}
              </div>
            </CategorySection>
          )}

          {/* Articles */}
          {articles.length > 0 && (
            <CategorySection
              title="Articles"
              icon={FileText}
              iconColor="text-emerald-400"
              count={articles.length}
            >
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory custom-scrollbar">
                {articles.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    isCarousel={true}
                    onClick={() => setSelectedResource(resource)}
                    onDelete={onDeleteResource ? () => onDeleteResource(resource.id) : undefined}
                    onEditUrl={() => { setEditingUrl(resource.id); setNewUrl(resource.url || ''); }}
                    isEditingUrl={editingUrl === resource.id}
                    newUrl={newUrl}
                    setNewUrl={setNewUrl}
                    urlValidation={urlValidation}
                    onValidateUrl={() => handleValidateUrl(resource.id)}
                    onCancelEdit={() => { setEditingUrl(null); setNewUrl(''); setUrlValidation('idle'); }}
                  />
                ))}
              </div>
            </CategorySection>
          )}

          {resources.length === 0 && (
            <div className="text-center py-12 text-white/30">
              Aucune ressource
            </div>
          )}
        </div>
      ) : (
        // MODE FILTRÉ - Affichage horizontal aussi
        <div className="flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory custom-scrollbar">
          {(activeFilter === 'video' ? videos :
            activeFilter === 'audio' ? audios :
            activeFilter === 'book' ? books : articles
          ).map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              isCarousel={true}
              onPlay={() => handlePlayMedia(resource)}
              onClick={() => setSelectedResource(resource)}
              onDelete={onDeleteResource ? () => onDeleteResource(resource.id) : undefined}
              onEditUrl={() => { setEditingUrl(resource.id); setNewUrl(resource.url || ''); }}
              isEditingUrl={editingUrl === resource.id}
              newUrl={newUrl}
              setNewUrl={setNewUrl}
              urlValidation={urlValidation}
              onValidateUrl={() => handleValidateUrl(resource.id)}
              onCancelEdit={() => { setEditingUrl(null); setNewUrl(''); setUrlValidation('idle'); }}
            />
          ))}
          {((activeFilter === 'video' ? videos.length :
             activeFilter === 'audio' ? audios.length :
             activeFilter === 'book' ? books.length : articles.length) === 0) && (
            <div className="col-span-full text-center py-12 text-white/30">
              Aucune ressource dans cette catégorie
            </div>
          )}
        </div>
      )}

      {/* Resource Modal for books/articles */}
      <ResourceModal
        isVisible={!!selectedResource}
        onClose={() => setSelectedResource(null)}
        resource={selectedResource}
        onUpdate={onUpdateResource}
      />
      {/* Tag Selection Modal */}
      {videoToTag && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-white text-lg font-medium mb-2">Intégrer à la bibliothèque</h3>
            <p className="text-white/50 text-sm mb-6">Personnalisez l'ajout de "{videoToTag.title}".</p>
            
            <div className="flex gap-6 mb-6 p-3 bg-white/5 rounded-xl border border-white/10">
               <label className="flex items-center gap-2 text-white/80 text-sm cursor-pointer hover:text-white transition-colors">
                 <input 
                   type="radio" 
                   name="mediaType" 
                   className="accent-emerald-500"
                   checked={videoToTag.targetType === 'video' || !videoToTag.targetType} 
                   onChange={() => setVideoToTag({...videoToTag, targetType: 'video'})} 
                 />
                 Vidéo
               </label>
               <label className="flex items-center gap-2 text-white/80 text-sm cursor-pointer hover:text-white transition-colors">
                 <input 
                   type="radio" 
                   name="mediaType" 
                   className="accent-emerald-500"
                   checked={videoToTag.targetType === 'audio'} 
                   onChange={() => setVideoToTag({...videoToTag, targetType: 'audio'})} 
                 />
                 Audio (Musique / Podcast)
               </label>
            </div>

            <div className="mb-4">
               <input 
                 type="text" 
                 placeholder="Ajouter un tag personnalisé (ex: Carl Jung) + Entrée"
                 className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 transition-colors"
                 onKeyDown={(e) => {
                   if (e.key === 'Enter' && e.currentTarget.value.trim() !== '') {
                     const newTag = e.currentTarget.value.trim().toLowerCase();
                     const tags = videoToTag.tempTags || [];
                     if (!tags.includes(newTag)) {
                       setVideoToTag({...videoToTag, tempTags: [...tags, newTag]});
                     }
                     e.currentTarget.value = '';
                   }
                 }}
               />
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {Array.from(new Set(['Développement Personnel', 'Tech', 'Tutos', 'Spiritualité', 'Info', 'Musique', 'Science', 'Histoire', ...(videoToTag.tempTags || []).map((t: string) => t.charAt(0).toUpperCase() + t.slice(1))])).map(tag => {
                const isSelected = (videoToTag.tempTags || []).map((t: string) => t.toLowerCase()).includes((tag as string).toLowerCase());
                return (
                  <button
                    key={tag as string}
                    onClick={() => {
                      const lowerTag = (tag as string).toLowerCase();
                      const tags = videoToTag.tempTags || [];
                      setVideoToTag({
                        ...videoToTag,
                        tempTags: isSelected ? tags.filter((t: string) => t.toLowerCase() !== lowerTag) : [...tags, lowerTag]
                      });
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs transition-all border ${
                      isSelected 
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                        : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                    }`}
                  >
                    {tag as string}
                  </button>
                );
              })}
            </div>
            
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setVideoToTag(null)}
                className="px-4 py-2 rounded-xl text-white/50 hover:text-white transition-colors text-sm"
              >
                Annuler
              </button>
              <button 
                onClick={() => handleIntegrateVideo(videoToTag, videoToTag.tempTags && videoToTag.tempTags.length > 0 ? videoToTag.tempTags : ['A Classer'], videoToTag.targetType || 'video')}
                className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors text-sm font-medium border border-emerald-500/30"
              >
                Valider l'intégration
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ============================================
// CATEGORY SECTION - Séparation entre catégories
// ============================================

interface CategorySectionProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  count: number;
  children: React.ReactNode;
}

function CategorySection({ title, icon: Icon, iconColor, count, children }: CategorySectionProps) {
  return (
    <div>
      {/* Separator Header */}
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <h3 className="text-white/80 font-light">{title}</h3>
        <span className="text-white/30 text-sm">({count})</span>
      </div>
      {children}
    </div>
  );
}

// ============================================
// RESOURCE CARD - Taille uniforme pour tous
// ============================================

interface ResourceCardProps {
  resource: PersonalResource;
  isCarousel?: boolean;
  onClick?: () => void;
  onPlay?: () => void;
  onDelete?: () => void;
  onEditUrl: () => void;
  isEditingUrl: boolean;
  newUrl: string;
  setNewUrl: (url: string) => void;
  urlValidation: 'idle' | 'checking' | 'valid' | 'invalid';
  onValidateUrl: () => void;
  onCancelEdit: () => void;
}

function ResourceCard({ 
  resource, 
  isCarousel = false,
  onClick, 
  onPlay,
  onDelete,
  onEditUrl,
  isEditingUrl,
  newUrl,
  setNewUrl,
  urlValidation,
  onValidateUrl,
  onCancelEdit
}: ResourceCardProps) {
  const statusColor = statusColors[resource.status] || '#64748b';
  const [imageError, setImageError] = useState(false);
  const isPlayable = resource.type === 'video' || resource.type === 'audio';
  const hasBrokenUrl = isPlayable && (!resource.url || resource.url.trim() === '');

  const getThumbnail = (): string => {
    if ((resource.type === 'video' || resource.type === 'audio') && resource.url && isYouTubeUrl(resource.url)) {
      const thumbnail = getYouTubeThumbnail(resource.url);
      if (thumbnail) return thumbnail;
    }
    if (resource.imageUrl && !imageError) {
      return resource.imageUrl;
    }
    return generatePlaceholderImage(resource.type, resource.title, resource.author);
  };

  const handleClick = () => {
    if (hasBrokenUrl) return;
    if (isPlayable && onPlay) {
      onPlay();
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative overflow-hidden rounded-xl bg-white/5 border border-white/10 hover:border-white/30 cursor-pointer transition-all hover:bg-white/10 backdrop-blur-sm ${
        isCarousel ? 'w-[280px] sm:w-[320px] shrink-0 snap-start flex flex-col' : 'w-full flex flex-col h-full'
      }`}
    >
      {/* Cover - Format YouTube / Paysage (16:9) */}
      <div className="aspect-video relative overflow-hidden bg-black">
        <img 
          src={getThumbnail()}
          alt={resource.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={() => setImageError(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        
        {/* Play Button for Video/Audio */}
        {isPlayable && !hasBrokenUrl && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay?.();
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
          >
            {resource.type === 'audio' ? (
              <Headphones className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
            )}
          </button>
        )}

        {/* Broken URL */}
        {hasBrokenUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditUrl();
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 text-sm hover:bg-amber-500/30 transition-colors"
            >
              <Link className="w-4 h-4" />
              Ajouter lien
            </button>
          </div>
        )}

        {/* Type Badge */}
        <div className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider backdrop-blur-sm ${
          resource.type === 'video' ? 'bg-red-500/30 text-red-300' :
          resource.type === 'audio' ? 'bg-purple-500/30 text-purple-300' :
          resource.type === 'book' ? 'bg-blue-500/30 text-blue-300' :
          'bg-emerald-500/30 text-emerald-300'
        }`}>
          {resource.type === 'video' ? '▶ Vidéo' :
           resource.type === 'audio' ? '🎧 Audio' :
           resource.type === 'book' ? '📖 Livre' : '📄 Article'}
        </div>

        {/* Fullscreen Button for playable */}
        {isPlayable && !hasBrokenUrl && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay?.();
            }}
            className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-white transition-colors"
            title="Lire"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Delete Button */}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if(confirm("Es-tu sûr de vouloir supprimer cette ressource ?")) {
                onDelete();
              }
            }}
            className="absolute bottom-2 right-2 w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30 backdrop-blur-md flex items-center justify-center text-red-400 opacity-60 group-hover:opacity-100 transition-all hover:bg-red-500/40 hover:text-white hover:scale-105 z-10"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex-1 flex flex-col">
        <h4 className="text-white font-light text-sm line-clamp-2 mb-1">{resource.title}</h4>
        {resource.author && (
          <p className="text-white/40 text-xs truncate">{resource.author}</p>
        )}

        {/* Progress */}
        {resource.progress > 0 && (
          <div className="mt-auto pt-3">
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all"
                style={{ width: `${resource.progress}%`, backgroundColor: statusColor }}
              />
            </div>
            <div className="flex justify-between mt-1 text-white/30 text-[10px]">
              <span>{resource.progress}%</span>
              {resource.rating && (
                <div className="flex items-center gap-0.5">
                  <Star className="w-2.5 h-2.5 fill-yellow-500 text-yellow-500" />
                  {resource.rating}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit URL Modal */}
      {isEditingUrl && (
        <div 
          className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-full space-y-2">
            <div className="text-white/60 text-xs mb-2 flex items-center gap-1">
              <Link className="w-3 h-3" />
              Coller un nouveau lien
            </div>
            <input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full px-2 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm placeholder:text-white/30 focus:border-blue-500/50 focus:outline-none"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={onValidateUrl}
                disabled={urlValidation === 'checking' || !newUrl.trim()}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
              >
                {urlValidation === 'checking' ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : urlValidation === 'valid' ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Check className="w-3 h-3" />
                )}
                {urlValidation === 'valid' ? 'Validé !' : 'Valider'}
              </button>
              <button
                onClick={onCancelEdit}
                className="px-2 py-1 rounded-lg bg-white/10 border border-white/20 text-white/60 text-xs hover:bg-white/20 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            {urlValidation === 'invalid' && (
              <div className="flex items-center gap-1 text-red-400 text-xs">
                <AlertCircle className="w-3 h-3" />
                URL invalide
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
