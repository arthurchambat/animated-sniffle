import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try .env.local first, then .env
const possiblePaths = [
  join(__dirname, '..', '.env.local'),
  join(__dirname, '..', '.env')
];

let envPath = null;
for (const path of possiblePaths) {
  if (existsSync(path)) {
    envPath = path;
    break;
  }
}

if (!envPath) {
  console.error('❌ No .env or .env.local file found!');
  process.exit(1);
}

// Load .env file
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

console.log(`✅ Environment variables loaded from ${envPath.split('/').pop()}`);
