'use client';

import React, { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error Boundary global pour MindLife
 * Capture les erreurs JavaScript dans les composants enfants
 * Affiche une interface de récupération élégante
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 ErrorBoundary caught an error:', error);
    console.error('Component stack:', errorInfo.componentStack);

    fetch('/api/debug-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: error?.message,
        stack: error?.stack,
        componentStack: errorInfo?.componentStack,
      }),
    }).catch(() => {});

    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Utiliser le fallback personnalisé si fourni
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Interface de récupération par défaut
      return (
        <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4">
          {/* Background gradient */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl" />
            <div className="absolute top-1/3 -right-40 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 max-w-md w-full">
            {/* Error Card */}
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 shadow-2xl shadow-black/30">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-rose-400" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-xl font-bold text-white text-center mb-2">
                Oups ! Une erreur s'est produite
              </h1>
              <p className="text-slate-400 text-center text-sm mb-6">
                Ne vous inquiétez pas, nos équipes ont été notifiées.
              </p>

              {/* Error Details (dev only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-6 p-4 bg-rose-500/5 border border-rose-500/20 rounded-xl">
                  <p className="text-xs font-mono text-rose-400 break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={this.handleReset}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  Réessayer
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all"
                >
                  <Home className="w-4 h-4" />
                  Accueil
                </button>
              </div>
            </div>

            {/* Help text */}
            <p className="text-center text-slate-500 text-xs mt-4">
              Si le problème persiste, contactez le support technique.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
