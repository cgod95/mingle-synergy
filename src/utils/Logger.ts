// 🧠 Purpose: Centralized logging utility with environment-aware behavior and security

interface LogLevel {
  DEBUG: 0;
  INFO: 1;
  WARN: 2;
  ERROR: 3;
}

const LOG_LEVELS: LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

// Sensitive fields that should be redacted in production
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'apiKey',
  'secret',
  'privateKey',
  'authToken',
  'sessionId',
  'email',
  'phone',
  'address',
  'ssn',
  'creditCard',
  'firebaseApiKey',
  'firebaseAuthDomain',
  'firebaseProjectId',
  'firebaseStorageBucket',
  'firebaseMessagingSenderId',
  'firebaseAppId',
  'firebaseMeasurementId',
  'vapidPublicKey',
  'stripePublishableKey',
  'sentryDsn',
];

class Logger {
  private currentLevel: number | null = null;

  private getLevel(): number {
    // Lazy initialization of log level to avoid TDZ issues with config import
    if (this.currentLevel === null) {
      try {
        // Dynamic import to avoid circular dependency issues
        const config = require('@/config').default;
        this.currentLevel = config.ENVIRONMENT === 'production' ? LOG_LEVELS.WARN : LOG_LEVELS.DEBUG;
      } catch {
        // Fallback to DEBUG level if config can't be loaded
        this.currentLevel = LOG_LEVELS.DEBUG;
      }
    }
    return this.currentLevel;
  }

  constructor() {
    // Don't initialize level in constructor to avoid TDZ issues
    // Level will be lazily initialized on first log call
  }

  private shouldLog(level: number): boolean {
    return level >= this.getLevel();
  }

  private sanitizeData(data: unknown): unknown {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item));
    }

    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      if (SENSITIVE_FIELDS.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeData(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  private formatMessage(level: string, message: string, data?: unknown): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}]`;
    
    if (data) {
      const sanitizedData = this.sanitizeData(data);
      return `${prefix} ${message} ${JSON.stringify(sanitizedData)}`;
    }
    
    return `${prefix} ${message}`;
  }

  debug(message: string, data?: unknown): void {
    if (this.shouldLog(LOG_LEVELS.DEBUG)) {
      console.debug(this.formatMessage('DEBUG', message, data));
    }
  }

  info(message: string, data?: unknown): void {
    if (this.shouldLog(LOG_LEVELS.INFO)) {
      console.info(this.formatMessage('INFO', message, data));
    }
  }

  warn(message: string, data?: unknown): void {
    if (this.shouldLog(LOG_LEVELS.WARN)) {
      console.warn(this.formatMessage('WARN', message, data));
    }
  }

  error(message: string, error?: unknown, context?: unknown): void {
    if (this.shouldLog(LOG_LEVELS.ERROR)) {
      const errorData = {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        context: this.sanitizeData(context),
      };
      console.error(this.formatMessage('ERROR', message, errorData));
    }
  }

  // Security-focused logging methods
  security(message: string, data?: unknown): void {
    // Always log security events regardless of level
    const securityData = this.sanitizeData(data);
    console.warn(this.formatMessage('SECURITY', message, securityData));
  }

  audit(message: string, userId?: string, action?: string, data?: unknown): void {
    // Audit logging for compliance and security
    const auditData = {
      userId: userId ? '[REDACTED]' : undefined,
      action,
      ...(this.sanitizeData(data) as Record<string, unknown>),
    };
    console.info(this.formatMessage('AUDIT', message, auditData));
  }

  // Performance logging
  performance(message: string, duration?: number, data?: unknown): void {
    if (config.features.performanceMonitoring) {
      const perfData = {
        duration,
        ...(this.sanitizeData(data) as Record<string, unknown>),
      };
      console.info(this.formatMessage('PERF', message, perfData));
    }
  }

  // Network logging
  network(message: string, url?: string, status?: number, data?: unknown): void {
    const networkData = {
      url: url ? new URL(url).pathname : undefined, // Only log path, not full URL
      status,
      ...(this.sanitizeData(data) as Record<string, unknown>),
    };
    console.info(this.formatMessage('NETWORK', message, networkData));
  }

  // User action logging (with privacy protection)
  userAction(action: string, userId?: string, data?: unknown): void {
    const actionData = {
      action,
      userId: userId ? '[REDACTED]' : undefined,
      ...(this.sanitizeData(data) as Record<string, unknown>),
    };
    console.info(this.formatMessage('USER_ACTION', `User performed: ${action}`, actionData));
  }
}

// Create singleton instance
const logger = new Logger();

export default logger; 