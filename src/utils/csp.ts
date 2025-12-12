// Content Security Policy implementation

export const generateCSP = (): string => {
  const policies = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'", // For development - remove in production
      "'unsafe-eval'", // For development - remove in production
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
      'https://maps.googleapis.com'
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'",
      'https://fonts.googleapis.com'
    ],
    'font-src': [
      "'self'",
      'https://fonts.gstatic.com',
      'data:'
    ],
    'img-src': [
      "'self'",
      'data:',
      'https:',
      'blob:'
    ],
    'connect-src': [
      "'self'",
      'http://127.0.0.1:7242',
      'http://localhost:7242',
      'https://firestore.googleapis.com',
      'https://identitytoolkit.googleapis.com',
      'https://securetoken.googleapis.com',
      'https://www.googleapis.com',
      'wss://localhost:8080',
      'ws://localhost:8080',
      'wss://localhost:8083',
      'ws://localhost:8083',
      'wss://localhost:8084',
      'ws://localhost:8084'
    ],
    'frame-src': [
      "'none'"
    ],
    'object-src': [
      "'none'"
    ],
    'base-uri': [
      "'self'"
    ],
    'form-action': [
      "'self'"
    ],
    'frame-ancestors': [
      "'none'"
    ],
    'upgrade-insecure-requests': [],
    'block-all-mixed-content': [],
    'require-trusted-types-for': ["'script'"]
  };

  return Object.entries(policies)
    .map(([key, values]) => {
      if (values.length === 0) {
        return key;
      }
      return `${key} ${values.join(' ')}`;
    })
    .join('; ');
};

// Security headers configuration
export const securityHeaders = {
  'Content-Security-Policy': generateCSP(),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self), payment=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin'
};

// Feature Policy (deprecated but still useful)
export const featurePolicy = {
  'camera': '()',
  'microphone': '()',
  'geolocation': '(self)',
  'payment': '()',
  'usb': '()',
  'magnetometer': '()',
  'gyroscope': '()',
  'accelerometer': '()'
};

// Validate CSP
export const validateCSP = (csp: string): boolean => {
  const requiredDirectives = [
    'default-src',
    'script-src',
    'style-src',
    'img-src',
    'connect-src'
  ];

  return requiredDirectives.every(directive => 
    csp.includes(directive)
  );
};

// Generate nonce for inline scripts
export const generateNonce = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Apply CSP to document
export const applyCSP = (): void => {
  if (typeof document !== 'undefined') {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = generateCSP();
    document.head.appendChild(meta);
  }
}; 