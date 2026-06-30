import { NextRequest, NextResponse } from 'next/server';
import { getAllProviders, getProvider, addCustomProvider, removeCustomProvider, testProviderConnection, fetchProviderModels, updateProviderModel, saveApiKeys, getStoredApiKeys } from '@/lib/provider-registry';

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
        const { providerId, baseUrl, apiKey, model } = body;
        // Built-in provider: look up env key server-side
        if (providerId && !apiKey) {
          const envName = `PROVIDER_${providerId.toUpperCase().replace(/-/g, '_')}_KEY`;
          const envKey = process.env[envName];
          if (!envKey) {
            return NextResponse.json({ success: false, message: 'Aucune clé configurée dans .env.local' }, { status: 400 });
          }
          const provider = (await getAllProviders()).find(p => p.id === providerId);
          if (!provider) {
            return NextResponse.json({ success: false, message: 'Provider inconnu' }, { status: 400 });
          }
          const result = await testProviderConnection(provider.baseUrl, envKey, model || provider.defaultModel);
          return NextResponse.json(result);
        }
        if (!baseUrl || !apiKey) {
          return NextResponse.json({ success: false, error: 'baseUrl et apiKey requis' }, { status: 400 });
        }
        const result = await testProviderConnection(baseUrl, apiKey, model);
        return NextResponse.json(result);
      }

      case 'models': {
        const { providerId, baseUrl, apiKey } = body;
        // Built-in provider: look up env key server-side
        if (providerId && !apiKey) {
          const envName = `PROVIDER_${providerId.toUpperCase().replace(/-/g, '_')}_KEY`;
          const envKey = process.env[envName];
          if (!envKey) {
            return NextResponse.json({ success: false, models: [], message: 'Aucune clé configurée' });
          }
          const provider = (await getAllProviders()).find(p => p.id === providerId);
          if (!provider) {
            return NextResponse.json({ success: false, models: [], message: 'Provider inconnu' });
          }
          const result = await fetchProviderModels(provider.baseUrl, envKey);
          return NextResponse.json(result);
        }
        if (!baseUrl || !apiKey) {
          return NextResponse.json({ success: false, error: 'baseUrl et apiKey requis' }, { status: 400 });
        }
        const result = await fetchProviderModels(baseUrl, apiKey);
        return NextResponse.json(result);
      }

      case 'set-model': {
        const { id: providerId, model } = body;
        if (!providerId || !model) {
          return NextResponse.json({ success: false, error: 'id et model requis' }, { status: 400 });
        }
        await updateProviderModel(providerId, model);
        return NextResponse.json({ success: true, message: `Modèle changé pour ${model}` });
      }

      case 'sync-keys': {
        const { apiKeys } = body;
        if (!apiKeys || typeof apiKeys !== 'object') {
          return NextResponse.json({ success: false, error: 'apiKeys requis (objet)' }, { status: 400 });
        }
        await saveApiKeys(apiKeys as Record<string, string>);
        return NextResponse.json({ success: true, message: `${Object.keys(apiKeys).length} clés synchronisées` });
      }

      case 'get-keys': {
        const keys = await getStoredApiKeys();
        return NextResponse.json({ success: true, apiKeys: keys });
      }

      default:
        return NextResponse.json({ success: false, error: 'Action inconnue' }, { status: 400 });
    }
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
