// ──────────────────────────────────────────────
// Environment Configuration
// ──────────────────────────────────────────────

import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  // Server
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Firebase Admin SDK
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || '',
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || '',
  FIREBASE_PRIVATE_KEY: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL || '',

  // OpenRouter AI
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
  OPENROUTER_MODEL: process.env.OPENROUTER_MODEL || 'openai/gpt-3.5-turbo',

  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 min
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  AUTH_RATE_LIMIT_MAX: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '20', 10),

  // File Upload
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5 MB
  UPLOAD_DIR: process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads'),

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'dev',
} as const;

// Validate critical env vars
export function validateEnv(): void {
  const required = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY',
  ];

  const missing = required.filter((key) => {
    const value = process.env[key];
    return !value || value.trim() === '';
  });

  if (missing.length > 0) {
    console.error(
      `❌ Missing required environment variables: ${missing.join(', ')}`
    );
    console.error('Please create a .env file with these values.');
    if (env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
}
