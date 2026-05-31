import { NextRequest, NextResponse } from 'next/server';
import { getAllProviders, getProvider, addCustomProvider, removeCustomProvider, testProviderConnection, fetchProviderModels } from '@/lib/provider-registry';

export async function GET() {
  try {
    const providers = await getAllProviders();
    return NextResponse.json({ success: true, providers: providers.map(p => ({
      ...p,
      apiKey: p.isBuiltin && !p.keyEnv ? undefined : undefined,
      hasKey: !!(p.isBuiltin ? process.env[`PROVIDER_${p.id.toUpperCase()}_KEY`] || '' : false),
    }))});
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'add': {
        const { id, name, baseUrl, models, defaultModel, apiKey } = body;
        if (!id || !name || !baseUrl) {
          return NextResponse.json({ success: false, error: 'id, name et baseUrl requis' }, { status: 400 });
        }
        await addCustomProvider({ id, name, baseUrl, models: models || [], defaultModel, isBuiltin: false, apiKey });
        return NextResponse.json({ success: true, message: `Provider "${name}" ajouté` });
      }

      case 'remove': {
        const { id } = body;
        if (!id) return NextResponse.json({ success: false, error: 'id requis' }, { status: 400 });
        await removeCustomProvider(id);
        return NextResponse.json({ success: true, message: `Provider "${id}" supprimé` });
      }

      case 'test': {
        const { baseUrl, apiKey, model } = body;
        if (!baseUrl || !apiKey) {
          return NextResponse.json({ success: false, error: 'baseUrl et apiKey requis' }, { status: 400 });
        }
        const result = await testProviderConnection(baseUrl, apiKey, model);
        return NextResponse.json({ success: true, ...result });
      }

      case 'models': {
        const { baseUrl, apiKey } = body;
        if (!baseUrl || !apiKey) {
          return NextResponse.json({ success: false, error: 'baseUrl et apiKey requis' }, { status: 400 });
        }
        const result = await fetchProviderModels(baseUrl, apiKey);
        return NextResponse.json({ success: true, ...result });
      }

      default:
        return NextResponse.json({ success: false, error: 'Action inconnue' }, { status: 400 });
    }
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
