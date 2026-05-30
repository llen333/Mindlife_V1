import { NextRequest, NextResponse } from 'next/server';
import { executeToolByName } from '@/lib/ai-tools';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tool = searchParams.get('tool') || 'web_search';
  const query = searchParams.get('query') || 'test';
  const userId = searchParams.get('userId') || 'mindlife-user';

  try {
    const result = await executeToolByName(tool, { query }, userId);
    return NextResponse.json({ success: true, result: result.slice(0, 800) });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message, stack: e.stack?.slice(0, 500) });
  }
}

// Test XML parsing + second call to LLM
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId = 'mindlife-user' } = body;
  
  try {
    const { callOpenAICompatibleDirect } = await import('./call-ai-test');
    // Re-do the flow with a simple message
    return NextResponse.json({ status: 'use GET for tool tests' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
