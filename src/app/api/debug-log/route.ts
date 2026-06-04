import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.error('🚨 [BROWSER ERROR]', body.error || '(no message)');
    if (body.stack) console.error('Stack:', body.stack);
    if (body.componentStack) console.error('Component:', body.componentStack);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false });
  }
}
