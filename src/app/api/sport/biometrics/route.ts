import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Récupérer les données biométriques
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default-user';
    const days = parseInt(searchParams.get('days') || '30');
    
    const profile = await db.sportProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return NextResponse.json({ biometrics: [] });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const biometrics = await db.biometricData.findMany({
      where: {
        profileId: profile.id,
        date: { gte: startDate }
      },
      orderBy: { date: 'desc' }
    });

    // Dernières données pour les KPIs
    const latest = biometrics[0] || null;

    return NextResponse.json({ biometrics, latest });
  } catch (error) {
    console.error('Error fetching biometrics:', error);
    return NextResponse.json({ error: 'Failed to fetch biometrics' }, { status: 500 });
  }
}

// POST - Ajouter des données biométriques
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = body.userId || 'default-user';
    
    let profile = await db.sportProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      profile = await db.sportProfile.create({
        data: { userId }
      });
    }

    const biometric = await db.biometricData.create({
      data: {
        profileId: profile.id,
        weight: body.weight,
        muscleMass: body.muscleMass,
        bodyFat: body.bodyFat,
        hydration: body.hydration,
        heartRateRest: body.heartRateRest,
        heartRateMax: body.heartRateMax,
        hrv: body.hrv,
        sleepScore: body.sleepScore,
        recoveryScore: body.recoveryScore,
        fatigueLevel: body.fatigueLevel,
        energyLevel: body.energyLevel,
        notes: body.notes
      }
    });

    return NextResponse.json({ biometric });
  } catch (error) {
    console.error('Error creating biometric:', error);
    return NextResponse.json({ error: 'Failed to create biometric' }, { status: 500 });
  }
}
