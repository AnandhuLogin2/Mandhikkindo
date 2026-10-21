import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const readEnv = (name) => globalThis.Netlify?.env
  ? globalThis.Netlify.env.get(name)
  : process.env[name];

const config = {
  port: parseInt(readEnv('PORT') || '4000', 10),
  clientOrigin: readEnv('CLIENT_ORIGIN') || 'http://localhost:5173',
  firebase: {
    projectId: readEnv('FIREBASE_PROJECT_ID') || '',
    clientEmail: readEnv('FIREBASE_CLIENT_EMAIL') || '',
    privateKey: readEnv('FIREBASE_PRIVATE_KEY')
      ? readEnv('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n')
      : '',
  },
  isProd: readEnv('NODE_ENV') === 'production',
};

export default config;
