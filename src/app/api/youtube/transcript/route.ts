import { NextRequest, NextResponse } from 'next/server';

// Regex to parse the player response from YouTube page
const YT_INITIAL_PLAYER_RESPONSE_RE =
  /ytInitialPlayerResponse\s*=\s*({.+?})\s*;\s*(?:var\s+(?:meta|head)|<\/script|\n)/;

interface TranscriptEvent {
  tStartMs: number;
  dDurationMs?: number;
  segs?: Array<{
    utf8: string;
    tOffsetMs?: number;
  }>;
}

interface TranscriptData {
  events: TranscriptEvent[];
}

interface VideoMetadata {
  title: string;
  duration: string;
  author: string;
  views: string;
  thumbnail: string;
}

interface TranscriptChunk {
  text: string;
  startTime: number;
  endTime: number;
  timestamp: string;
}

/**
 * Comparison function used to sort tracks by priority
 */
function compareTracks(track1: { languageCode: string; kind?: string }, track2: { languageCode: string; kind?: string }) {
  const langCode1 = track1.languageCode;
  const langCode2 = track2.languageCode;

  if (langCode1 === "fr" && langCode2 !== "fr") return -1;
  if (langCode1 !== "fr" && langCode2 === "fr") return 1;
  if (langCode1 === "en" && langCode2 !== "en") return -1;
  if (langCode1 !== "en" && langCode2 === "en") return 1;
  if (track1.kind !== "asr" && track2.kind === "asr") return -1;
  if (track1.kind === "asr" && track2.kind !== "asr") return 1;

  return 0;
}

/**
 * Extract video ID from YouTube URL
 */
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  // If it's already just an ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;

  return null;
}

/**
 * Format seconds to HH:MM:SS
 */
function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format milliseconds to timestamp
 */
function formatTimestamp(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Clean and structure transcript
 */
function cleanJsonTranscript(transcript: TranscriptData): TranscriptChunk[] {
  const chunks: TranscriptChunk[] = [];
  let currentChunk = "";
  let currentStartTime = transcript.events[0]?.tStartMs || 0;
  let currentEndTime = currentStartTime;

  transcript.events.forEach((event) => {
    event.segs?.forEach((seg) => {
      const segmentText = seg.utf8.replace(/\n/g, " ");
      currentEndTime = event.tStartMs + (seg.tOffsetMs || 0);
      if ((currentChunk + segmentText).length > 300) {
        chunks.push({
          text: currentChunk.trim(),
          startTime: currentStartTime,
          endTime: currentEndTime,
          timestamp: formatTimestamp(currentStartTime),
        });
        currentChunk = segmentText;
        currentStartTime = currentEndTime;
      } else {
        currentChunk += segmentText;
      }
    });
  });

  if (currentChunk) {
    chunks.push({
      text: currentChunk.trim(),
      startTime: currentStartTime,
      endTime: currentEndTime,
      timestamp: formatTimestamp(currentStartTime),
    });
  }

  return chunks;
}

/**
 * Get full transcript as plain text
 */
function getFullTextTranscript(chunks: TranscriptChunk[]): string {
  return chunks.map(chunk => chunk.text).join(" ");
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: "URL YouTube requise" },
        { status: 400 }
      );
    }

    const videoId = extractVideoId(url);

    if (!videoId) {
      return NextResponse.json(
        { error: "URL YouTube invalide" },
        { status: 400 }
      );
    }

    // Fetch YouTube page
    const pageData = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });

    const body = await pageData.text();
    const playerResponseMatch = body.match(YT_INITIAL_PLAYER_RESPONSE_RE);

    if (!playerResponseMatch) {
      return NextResponse.json(
        { error: "Impossible de parser la page YouTube" },
        { status: 500 }
      );
    }

    const player = JSON.parse(playerResponseMatch[1]);

    // Extract metadata
    const metadata: VideoMetadata = {
      title: player.videoDetails?.title || "Titre inconnu",
      duration: formatDuration(parseInt(player.videoDetails?.lengthSeconds || "0")),
      author: player.videoDetails?.author || "Auteur inconnu",
      views: player.videoDetails?.viewCount || "0",
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    };

    // Try to get transcript
    let transcript: TranscriptChunk[] = [];
    let fullText = "";
    let hasTranscript = false;

    if (player.captions?.playerCaptionsTracklistRenderer?.captionTracks) {
      const tracks = player.captions.playerCaptionsTracklistRenderer.captionTracks;

      if (tracks && tracks.length > 0) {
        tracks.sort(compareTracks);

        try {
          const transcriptResponse = await fetch(tracks[0].baseUrl + "&fmt=json3");
          const transcriptData: TranscriptData = await transcriptResponse.json();

          transcript = cleanJsonTranscript(transcriptData);
          fullText = getFullTextTranscript(transcript);
          hasTranscript = true;
        } catch (e) {
          console.error("Error fetching transcript:", e);
        }
      }
    }

    return NextResponse.json({
      success: true,
      videoId,
      metadata,
      hasTranscript,
      transcript,
      fullText,
      transcriptLength: fullText.length,
    });

  } catch (error) {
    console.error("YouTube transcript error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'extraction de la transcription" },
      { status: 500 }
    );
  }
}
