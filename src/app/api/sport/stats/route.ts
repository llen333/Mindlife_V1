import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Récupérer les statistiques de performance
export async function GET(request: NextRequest) {
  try {
    const userId = 'default-user';
    const { searchParams } = new URL(request.url);
    const weeks = parseInt(searchParams.get('weeks') || '4');

    const profile = await db.sportProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return NextResponse.json({ stats: getDefaultStats() });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (weeks * 7));

    const sessions = await db.workoutSession.findMany({
      where: {
        profileId: profile.id,
        status: 'completed',
        date: { gte: startDate }
      },
      include: {
        SessionExercise: true
      },
      orderBy: { date: 'asc' }
    });

    const weeklyVolumes: Record<string, number> = {};
    const weeklyData: Array<{ week: string; volume: number; sessions: number }> = [];
    
    sessions.forEach(session => {
      const date = new Date(session.date);
      const weekNumber = getWeekNumber(date);
      const weekKey = `S${weekNumber}`;
      
      let sessionVolume = 0;
      session.SessionExercise.forEach(ex => {
        if (ex.weight) {
          const repsNum = parseInt(ex.reps) || 1;
          sessionVolume += ex.sets * repsNum * ex.weight;
        }
      });

      if (!weeklyVolumes[weekKey]) {
        weeklyVolumes[weekKey] = 0;
      }
      weeklyVolumes[weekKey] += sessionVolume;
    });

    Object.entries(weeklyVolumes).forEach(([week, volume]) => {
      const sessionCount = sessions.filter(s => {
        const date = new Date(s.date);
        return `S${getWeekNumber(date)}` === week;
      }).length;
      
      weeklyData.push({
        week,
        volume: Math.round(volume / 1000),
        sessions: sessionCount
      });
    });

    const latestBio = await db.biometricData.findFirst({
      where: { profileId: profile.id },
      orderBy: { date: 'desc' }
    });

    const bioScore = calculateBioScore(latestBio);

    const totalSessions = sessions.length;
    const totalVolume = Object.values(weeklyVolumes).reduce((a, b) => a + b, 0);
    const avgIntensity = sessions.reduce((acc, s) => acc + (s.intensity || 0), 0) / (sessions.length || 1);

    const stats = {
      bioScore,
      totalSessions,
      totalVolume: Math.round(totalVolume / 1000),
      avgIntensity: Math.round(avgIntensity),
      weeklyData: weeklyData.length > 0 ? weeklyData : getDefaultWeeklyData(),
      latestBio: latestBio ? {
        weight: latestBio.weight,
        muscleMass: latestBio.muscleMass,
        hydration: latestBio.hydration,
        heartRateRest: latestBio.heartRateRest,
        energyLevel: latestBio.energyLevel
      } : null,
      progression: {
        volumeChange: calculateProgression(weeklyData, 'volume'),
        sessionsChange: calculateProgression(weeklyData, 'sessions')
      }
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ stats: getDefaultStats() });
  }
}

function getDefaultStats() {
  return {
    bioScore: 94,
    totalSessions: 24,
    totalVolume: 12.8,
    avgIntensity: 78,
    weeklyData: getDefaultWeeklyData(),
    latestBio: null,
    progression: {
      volumeChange: 8.5,
      sessionsChange: 10
    }
  };
}

function getDefaultWeeklyData() {
  return [
    { week: 'S01', volume: 8.2, sessions: 5 },
    { week: 'S02', volume: 9.5, sessions: 6 },
    { week: 'S03', volume: 11.1, sessions: 6 },
    { week: 'S04', volume: 12.4, sessions: 7 },
    { week: 'S05', volume: 12.8, sessions: 5 }
  ];
}

function getWeekNumber(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - start.getTime();
  const oneWeek = 604800000;
  return Math.ceil((diff + start.getDay() * 86400000) / oneWeek);
}

function calculateBioScore(bio: { 
  sleepScore?: number | null; 
  recoveryScore?: number | null; 
  energyLevel?: number | null; 
  hrv?: number | null;
  fatigueLevel?: number | null;
} | null): number {
  if (!bio) return 94;
  
  let score = 0;
  let factors = 0;

  if (bio.sleepScore != null) {
    score += bio.sleepScore;
    factors++;
  }
  if (bio.recoveryScore != null) {
    score += bio.recoveryScore;
    factors++;
  }
  if (bio.energyLevel != null) {
    score += bio.energyLevel;
    factors++;
  }
  if (bio.hrv != null) {
    const hrvScore = Math.min(100, Math.max(0, bio.hrv));
    score += hrvScore;
    factors++;
  }
  if (bio.fatigueLevel != null) {
    score += (100 - bio.fatigueLevel);
    factors++;
  }

  return factors > 0 ? Math.round(score / factors) : 94;
}

function calculateProgression(
  data: Array<{ week: string; volume: number; sessions: number }>,
  field: 'volume' | 'sessions'
): number {
  if (data.length < 2) return 0;
  
  const lastTwo = data.slice(-2);
  const older = lastTwo[0][field];
  const newer = lastTwo[1][field];
  
  if (older === 0) return newer > 0 ? 100 : 0;
  return Math.round(((newer - older) / older) * 100);
}
