/**
 * Hook pour gérer la configuration IA des providers
 */

import { useState, useEffect } from 'react';
import {
  AIProvider,
  AIFunction,
  getAIConfig,
  saveAIConfig,
  setApiKey,
  setFunctionProvider,
  hasValidApiKey,
  PROVIDERS
} from '@/lib/ai-config';
import { getProviderColor } from '@/components/AIConfigPanel';
import { testProviderConnection } from '@/lib/ai-provider';

export interface CustomProviderConfig {
  name: string;
  baseUrl: string;
  models: string[];
}

export function useAIConfig() {
  const [config, setConfig] = useState(() => getAIConfig());
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('groq');
  const [customProviderConfig, setCustomProviderConfig] = useState<CustomProviderConfig>({
    name: '',
    baseUrl: '',
    models: []
  });
  const [isTestingProvider, setIsTestingProvider] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Refresh config when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setConfig(getAIConfig());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Get all providers (existing + custom)
  const providers = Object.keys(PROVIDERS) as AIProvider[];

  // Get function providers mapping
  const functionProviders = config.functionProviders;

  // Get provider color (copied from AIConfigPanel)
  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'groq': return 'from-purple-500 to-violet-500';
      case 'openrouter': return 'from-blue-500 to-cyan-500';
      case 'openai': return 'from-green-500 to-emerald-500';
      case 'huggingface': return 'from-yellow-500 to-orange-500';
      case 'gemini': return 'from-pink-500 to-rose-500';
      case 'zai': return 'from-indigo-500 to-blue-600';
      case 'local': return 'from-gray-500 to-slate-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  // Test provider connection
  const handleTestProvider = async (provider: AIProvider) => {
    setIsTestingProvider(provider);
    setTestResult(null);

    const result = await testProviderConnection(provider, config.apiKeys[provider]);
    setTestResult(result);
    setIsTestingProvider(null);
  };

  // Save custom provider
  const handleSaveCustomProvider = () => {
    if (!customProviderConfig.name || !customProviderConfig.baseUrl) return;

    setConfig({
      ...config,
      apiKeys: {
        ...config.apiKeys,
        [customProviderConfig.name]: ''
      }
    });

    setCustomProviderConfig({
      name: '',
      baseUrl: '',
      models: []
    });
  };

  // Add provider to system
  const handleAddProvider = () => {
    if (!customProviderConfig.name || !customProviderConfig.baseUrl) return;

    // Add to PROVIDERS (in memory only, doesn't persist)
    console.log(`Adding custom provider: ${customProviderConfig.name}`);

    // Test immediately after adding
    setTimeout(() => {
      handleTestProvider(customProviderConfig.name as AIProvider);
    }, 100);
  };

  // Remove custom provider
  const handleRemoveCustomProvider = (provider: string) => {
    if (provider === 'zai' || provider === 'local') return; // Can't remove built-in providers

    const newApiKeys = { ...config.apiKeys };
    delete newApiKeys[provider];

    setConfig({
      ...config,
      apiKeys: newApiKeys
    });
  };

  // Update provider configuration
  const handleUpdateProviderConfig = (provider: AIProvider, updates: Partial<AIProvider>) => {
    // Implementation for updating provider config if needed
    console.log(`Updating provider ${provider}:`, updates);
  };

  // Set function provider
  const handleSetFunctionProvider = (func: AIFunction, provider: AIProvider) => {
    setFunctionProvider(func, provider);
    setConfig(getAIConfig());
  };

  // Test custom provider
  const handleTestCustomProvider = async () => {
    if (!customProviderConfig.name || !customProviderConfig.baseUrl) return;

    setIsTestingProvider(customProviderConfig.name);
    setTestResult(null);

    // Test with the custom config
    try {
      const result = await testProviderConnection(
        customProviderConfig.name as AIProvider,
        customProviderConfig.baseUrl
      );
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: "Impossible de se connecter au provider"
      });
    }

    setIsTestingProvider(null);
  };

  return {
    config,
    setConfig,
    customProviderConfig,
    setCustomProviderConfig,
    isTestingProvider,
    testResult,
    providers,
    functionProviders,
    handleTestProvider,
    handleSaveCustomProvider,
    handleAddProvider,
    handleRemoveCustomProvider,
    handleSetFunctionProvider,
    handleTestCustomProvider
  };
}