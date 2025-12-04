import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file
const envPath = join(__dirname, '..', '.env');
const envFile = readFileSync(envPath, 'utf-8');

// Parse and set environment variables
envFile.split('\n').forEach(line => {
  const trimmed = line.trim();
  
  // Skip empty lines and comments
  if (!trimmed || trimmed.startsWith('#')) return;
  
  const [key, ...valueParts] = trimmed.split('=');
  const value = valueParts.join('='); // Handle values with '=' in them
  
  if (key && value) {
    process.env[key.trim()] = value.trim();
  }
});

console.log('✅ Environment variables loaded from .env');
