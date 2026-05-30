import { NextRequest, NextResponse } from 'next/server';

// Regex to find ytInitialData in YouTube page
const YT_INITIAL_DATA_RE = /var\s+ytInitialData\s*=\s*({.+?});/;

interface YouTubeSearchResult {
  id: string;
  title: string;
  author: string;
  url: string;
  imageUrl: string;
  duration: string;
  views: string;
  description: string;
}

// Curated high-quality development resources to serve as fallback or default
const curatedFallbacks: YouTubeSearchResult[] = [
  {
    id: 'UNP03fDSj1U',
    title: 'Try Something New for 30 Days',
    author: 'Matt Cutts',
    url: 'https://www.youtube.com/watch?v=UNP03fDSj1U',
    imageUrl: 'https://img.youtube.com/vi/UNP03fDSj1U/hqdefault.jpg',
    duration: '3:27',
    views: '15M',
    description: 'TED Talk culte sur le pouvoir de créer de petites habitudes saines sur 30 jours.'
  },
  {
    id: 'arj7oStGLkU',
    title: 'Inside the Mind of a Master Procrastinator',
    author: 'Tim Urban',
    url: 'https://www.youtube.com/watch?v=arj7oStGLkU',
    imageUrl: 'https://img.youtube.com/vi/arj7oStGLkU/hqdefault.jpg',
    duration: '14:03',
    views: '68M',
    description: 'Comprendre et dompter le cerveau du procrastinateur dans un exposé drôle et profond.'
  },
  {
    id: 'hiiEeMN7vbQ',
    title: 'The Power of Believing You Can Improve',
    author: 'Carol Dweck',
    url: 'https://www.youtube.com/watch?v=hiiEeMN7vbQ',
    imageUrl: 'https://img.youtube.com/vi/hiiEeMN7vbQ/hqdefault.jpg',
    duration: '10:20',
    views: '14M',
    description: 'La célèbre psychologue Carol Dweck introduit le concept de "Growth Mindset" (état d\'esprit de croissance).'
  },
  {
    id: 'qp0HIF3SfI4',
    title: 'How Great Leaders Inspire Action',
    author: 'Simon Sinek',
    url: 'https://www.youtube.com/watch?v=qp0HIF3SfI4',
    imageUrl: 'https://img.youtube.com/vi/qp0HIF3SfI4/hqdefault.jpg',
    duration: '18:04',
    views: '62M',
    description: 'Simon Sinek présente son modèle du "Cercle d\'Or" et explique comment inspirer les autres.'
  },
  {
    id: 'Ks-_Mh1QhMc',
    title: 'Your Body Language May Shape Who You Are',
    author: 'Amy Cuddy',
    url: 'https://www.youtube.com/watch?v=Ks-_Mh1QhMc',
    imageUrl: 'https://img.youtube.com/vi/Ks-_Mh1QhMc/hqdefault.jpg',
    duration: '21:02',
    views: '65M',
    description: 'Amy Cuddy démontre comment notre posture physique affecte notre confiance et nos hormones.'
  },
  {
    id: '8y1w9QoO5h4',
    title: 'Neville Goddard: L\'Art de la Manifestation',
    author: 'Neville Goddard',
    url: 'https://www.youtube.com/watch?v=8y1w9QoO5h4',
    imageUrl: 'https://img.youtube.com/vi/8y1w9QoO5h4/hqdefault.jpg',
    duration: '12:45',
    views: '1.2M',
    description: 'Explication magistrale des lois spirituelles de Neville Goddard sur l\'imagination créatrice.'
  },
  {
    id: 'f8NOf19_SS8',
    title: 'Carl Jung: Comprendre son Ombre et son Inconscient',
    author: 'Psychologie Intégrative',
    url: 'https://www.youtube.com/watch?v=f8NOf19_SS8',
    imageUrl: 'https://img.youtube.com/vi/f8NOf19_SS8/hqdefault.jpg',
    duration: '15:30',
    views: '850K',
    description: 'Une analyse psychologique de l\'ombre de Jung et comment l\'intégrer pour grandir.'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('query') || '';

    if (!query.trim()) {
      // If no query, return the default curated high-quality list
      return NextResponse.json({
        success: true,
        source: 'curated',
        results: curatedFallbacks
      });
    }

    try {
      // Scrape YouTube search page
      const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        },
        next: { revalidate: 3600 } // Cache results for 1 hour
      });

      const html = await response.text();
      const match = html.match(YT_INITIAL_DATA_RE);

      if (!match) {
        throw new Error('Could not parse ytInitialData from YouTube response');
      }

      const ytData = JSON.parse(match[1]);
      
      // Navigate deep into the JSON tree to extract video items
      const contents = ytData.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents;
      if (!contents || contents.length === 0) {
        throw new Error('Empty search content structure');
      }

      // Search for the itemSectionRenderer in the contents
      let items: any[] = [];
      for (const outerItem of contents) {
        if (outerItem.itemSectionRenderer?.contents) {
          items = outerItem.itemSectionRenderer.contents;
          break;
        }
      }

      const results: YouTubeSearchResult[] = [];

      for (const item of items) {
        const video = item.videoRenderer;
        if (!video || !video.videoId) continue;

        const id = video.videoId;
        const title = video.title?.runs?.[0]?.text || 'Vidéo YouTube';
        const author = video.ownerText?.runs?.[0]?.text || video.longBylineText?.runs?.[0]?.text || 'Chaîne YouTube';
        const url = `https://www.youtube.com/watch?v=${id}`;
        const imageUrl = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
        const duration = video.lengthText?.simpleText || '0:00';
        const views = video.viewCountText?.simpleText || '0 vues';
        const description = video.detailedMetadataSnippets?.[0]?.snippetText?.runs?.map((r: any) => r.text).join('') || '';

        results.push({
          id,
          title,
          author,
          url,
          imageUrl,
          duration,
          views,
          description
        });

        // Limit results to top 8
        if (results.length >= 8) break;
      }

      if (results.length === 0) {
        throw new Error('No video items found in YouTube response');
      }

      return NextResponse.json({
        success: true,
        source: 'youtube-scrape',
        results
      });

    } catch (scrapeError) {
      console.warn('YouTube scraping failed, using curated fallbacks:', scrapeError);
      
      // Fallback: Filter curated list by keywords matching the query
      const lowerQuery = query.toLowerCase();
      const filtered = curatedFallbacks.filter(
        v => v.title.toLowerCase().includes(lowerQuery) || 
             v.author.toLowerCase().includes(lowerQuery) ||
             v.description.toLowerCase().includes(lowerQuery)
      );

      // If no match in curated, return all curated items
      const fallbackResults = filtered.length > 0 ? filtered : curatedFallbacks;

      return NextResponse.json({
        success: true,
        source: 'curated-fallback',
        results: fallbackResults,
        message: 'Recherche YouTube en mode sécurisé. Voici des vidéos recommandées.'
      });
    }

  } catch (error) {
    console.error('YouTube search API major error:', error);
    return NextResponse.json(
      { error: 'Failed to search YouTube videos' },
      { status: 500 }
    );
  }
}
