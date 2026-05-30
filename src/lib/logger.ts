/**
 * MindLife - Logger Utility
 * Système de logging centralisé pour remplacer console.log
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  isDevelopment: boolean;
  prefix: string;
}

const config: LoggerConfig = {
  isDevelopment: process.env.NODE_ENV === 'development',
  prefix: '[MindLife]',
};

// Formatage du timestamp
const getTimestamp = (): string => {
  return new Date().toISOString().split('T')[1].split('.')[0];
};

// Couleurs pour la console
const colors: Record<LogLevel, string> = {
  debug: '\x1b[36m', // cyan
  info: '\x1b[32m',  // green
  warn: '\x1b[33m',  // yellow
  error: '\x1b[31m', // red
};
const reset = '\x1b[0m';

/**
 * Logger centralisé pour MindLife
 * 
 * Usage:
 *   import { logger } from '@/lib/logger';
 *   logger.info('Message', { data });
 *   logger.error('Erreur', error);
 */
export const logger = {
  /**
   * Log de debug - Uniquement en développement
   */
  debug: (message: string, data?: unknown): void => {
    if (!config.isDevelopment) return;
    console.log(
      `${colors.debug}${getTimestamp()} ${config.prefix} [DEBUG]${reset}`,
      message,
      data !== undefined ? data : ''
    );
  },

  /**
   * Log d'information
   */
  info: (message: string, data?: unknown): void => {
    console.log(
      `${colors.info}${getTimestamp()} ${config.prefix} [INFO]${reset}`,
      message,
      data !== undefined ? data : ''
    );
  },

  /**
   * Log d'avertissement
   */
  warn: (message: string, data?: unknown): void => {
    console.warn(
      `${colors.warn}${getTimestamp()} ${config.prefix} [WARN]${reset}`,
      message,
      data !== undefined ? data : ''
    );
  },

  /**
   * Log d'erreur
   */
  error: (message: string, error?: unknown): void => {
    console.error(
      `${colors.error}${getTimestamp()} ${config.prefix} [ERROR]${reset}`,
      message,
      error !== undefined ? error : ''
    );
  },

  /**
   * Log pour les requêtes API
   */
  api: (method: string, path: string, status?: number, duration?: number): void => {
    const statusColor = status && status < 400 ? colors.info : colors.error;
    console.log(
      `${statusColor}${getTimestamp()} ${config.prefix} [API]${reset}`,
      `${method} ${path}`,
      status ? `→ ${status}` : '',
      duration ? `(${duration}ms)` : ''
    );
  },

  /**
   * Log pour les actions utilisateur
   */
  action: (action: string, details?: string): void => {
    if (!config.isDevelopment) return;
    console.log(
      `${colors.info}${getTimestamp()} ${config.prefix} [ACTION]${reset}`,
      action,
      details || ''
    );
  },
};

// Export par défaut
export default logger;
