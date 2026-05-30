// Growth Utilities
import { BookOpen, Video, Headphones, FileText, Zap } from 'lucide-react';

// Generate placeholder image based on type and title
export function generatePlaceholderImage(type: string, title: string, author?: string): string {
  // Using DiceBear API for generating consistent placeholder images
  const seed = encodeURIComponent(title.toLowerCase().replace(/\s+/g, '-'));
  
  const typeColors: Record<string, string> = {
    book: '3b82f6', // blue
    video: 'ef4444', // red
    article: '10b981', // green
    audio: '8b5cf6', // purple
    course: 'f59e0b', // amber
  };
  
  const color = typeColors[type] || '64748b';
  
  // Return a placeholder service URL with book-like design
  return `https://ui-avatars.com/api/?name=${seed}&background=${color}&color=fff&size=400&font-size=0.33&bold=true`;
}

// Extract YouTube video ID from URL
export function getYouTubeId(url: string): string | null {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

// Get YouTube thumbnail URL from video ID or URL
export function getYouTubeThumbnail(urlOrId: string): string | null {
  const videoId = urlOrId.length === 11 ? urlOrId : getYouTubeId(urlOrId);
  if (!videoId) return null;
  
  // Use hqdefault - more reliable than maxresdefault
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

// Check if URL is a YouTube video
export function isYouTubeUrl(url: string): boolean {
  if (!url) return false;
  return url.includes('youtube.com') || url.includes('youtu.be');
}

// Check if URL is a YouTube channel (can't be embedded)
export function isYouTubeChannel(url: string): boolean {
  if (!url) return false;
  return url.includes('youtube.com/@') || url.includes('youtube.com/c/') || url.includes('youtube.com/channel/');
}

// Get book cover from OpenLibrary
export async function getBookCover(isbn: string): Promise<string | null> {
  try {
    const response = await fetch(`https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`);
    if (response.ok) {
      return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
    }
  } catch (error) {
    console.error('Error fetching book cover:', error);
  }
  return null;
}

// Resource type icons mapping
export const resourceTypeIcons = {
  book: BookOpen,
  video: Video,
  audio: Headphones,
  article: FileText,
  course: Zap,
};

// Status colors
export const statusColorsUtil: Record<string, string> = {
  'to-read': '#64748b',
  'reading': '#3b82f6',
  'completed': '#10b981',
  'to-watch': '#64748b',
  'watching': '#f59e0b',
  'to-listen': '#64748b',
  'listening': '#ec4899',
  'to-explore': '#64748b',
  'exploring': '#8b5cf6',
  'integrated': '#10b981',
};

// Generate gradient for placeholder
export function getPlaceholderGradient(type: string): string {
  const gradients: Record<string, string> = {
    book: 'from-blue-500/30 to-purple-500/30',
    video: 'from-red-500/30 to-orange-500/30',
    article: 'from-green-500/30 to-teal-500/30',
    audio: 'from-pink-500/30 to-purple-500/30',
    course: 'from-amber-500/30 to-orange-500/30',
  };
  
  return gradients[type] || 'from-white/10 to-white/5';
}

// Book preview data
export const bookPreviews: Record<string, { summary: string; keyTakeaways: string[] }> = {
  'Atomic Habits': {
    summary: 'Les habitudes atomiques expliquent comment de petits changements dans nos habitudes quotidiennes peuvent mener à des résultats remarquables. James Clear présente un système pour créer de bonnes habitudes et éliminer les mauvaises.',
    keyTakeaways: [
      'Les habitudes sont le compound interest de l\'amélioration personnelle',
      'Ne pas viser le résultat, mais le système',
      'L\'identité précède le comportement: "Je suis quelqu\'un qui..."',
      'Les 4 lois: Rendre évident, attrayant, facile, satisfaisant',
      '1% d\'amélioration chaque jour = 37x mieux par an',
    ],
  },
  'The Compound Effect': {
    summary: 'L\'effet cumulé montre comment de petites décisions quotidiennes, apparemment insignifiantes, s\'accumulent pour créer des résultats massifs dans la vie.',
    keyTakeaways: [
      'Les petites actions quotidiennes comptent plus que les gros efforts occasionnels',
      'La consistance bat l\'intensité',
      'Vos choix définissent votre destin',
      'L\'environnement influence vos décisions',
      'La responsabilité accélère la progression',
    ],
  },
  'Deep Work': {
    summary: 'Le travail profond explore comment réussir dans un monde distrait en cultivant la capacité de se concentrer intensément sur des tâches cognitivement exigeantes.',
    keyTakeaways: [
      'Le travail profond est de plus en plus rare et précieux',
      'Les travaux superficiels tuent la productivité',
      'Créer des rituels et routines de concentration',
      'S\'ennuyer est bénéfique pour la créativité',
      'Quitter les réseaux sociaux ou les utiliser stratégiquement',
    ],
  },
  'The 5AM Club': {
    summary: 'Le club des 5h du matin révèle comment se lever tôt et avoir une routine matinale peut transformer votre productivité et votre vie.',
    keyTakeaways: [
      'La première heure de la journée détermine le reste',
      '20/20/20: 20 min exercice, 20 min réflexion, 20 min croissance',
      'Se lever à 5h donne un avantage compétitif',
      'La volonté est plus forte le matin',
      'La solitude matinale favorise la créativité',
    ],
  },
  'Mindset': {
    summary: 'Carol Dweck explique la différence entre le mindset fixe et le mindset de croissance, et comment cela influence notre réussite.',
    keyTakeaways: [
      'Mindset fixe: les capacités sont innées',
      'Mindset de croissance: les capacités se développent',
      'L\'effort est le chemin vers la maîtrise',
      'Les échecs sont des opportunités d\'apprentissage',
      'Le feedback est un cadeau, pas une attaque',
    ],
  },
  'Le Pouvoir de l\'Imagination': {
    summary: 'Neville Goddard enseigne que l\'imagination est la capacité créatrice ultime. En visualisant et ressentant notre désir comme déjà accompli, nous le manifestons dans notre réalité.',
    keyTakeaways: [
      'L\'imagination crée la réalité',
      'Le sentiment est le secret de la manifestation',
      'Vivre dans l\'état désiré comme s\'il était déjà réalisé',
      'La révision: réécrire le passé dans l\'imagination',
      'L\'imagination est le seul Dieu',
    ],
  },
  'L\'Homme et ses Symboles': {
    summary: 'Carl Jung explore l\'inconscient collectif et les archétypes universels qui apparaissent dans nos rêves et mythologies.',
    keyTakeaways: [
      'L\'inconscient collectif contient des archétypes universels',
      'Les rêves sont des messages de l\'inconscient',
      'L\'ombre: la partie refoulée de nous-mêmes',
      'L\'individuation: devenir soi-même',
      'Les symboles sont le langage de l\'âme',
    ],
  },
  'La Table d\'Émeraude': {
    summary: 'Le texte fondateur de l\'alchimie spirituelle attribué à Hermès Trismégiste, contenant les principes de transformation intérieure.',
    keyTakeaways: [
      'Comme en haut, ainsi en bas',
      'Le macrocosme reflète le microcosme',
      'La transmutation spirituelle',
      'Tout est Un',
      'Le pouvoir mental crée la réalité',
    ],
  },
};
