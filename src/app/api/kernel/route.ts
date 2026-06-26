import { NextRequest, NextResponse } from 'next/server';
import { kernel } from '@/lib/kernel';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const section = searchParams.get('section') || 'stats';

  switch (section) {
    case 'stats': {
      const stats = kernel.getStats();
      return NextResponse.json({ success: true, stats });
    }
    case 'events': {
      const limit = parseInt(searchParams.get('limit') || '50');
      const events = kernel.getEvents(limit);
      return NextResponse.json({ success: true, events });
    }
    case 'handlers': {
      const handlers = kernel.registeredHandlers;
      return NextResponse.json({ success: true, handlers });
    }
    default:
      return NextResponse.json(
        { error: 'Unknown section. Use: stats, events, handlers' },
        { status: 400 }
      );
  }
}
