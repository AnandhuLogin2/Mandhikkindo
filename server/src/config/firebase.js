import admin from 'firebase-admin';
import config from './env.js';

let db = null;
let auth = null;
let rtdb = null;

try {
  if (!admin.apps.length) {
    const hasValidKey =
      config.firebase.privateKey &&
      config.firebase.privateKey.includes('BEGIN PRIVATE KEY') &&
      !config.firebase.privateKey.includes('YOUR_PRIVATE_KEY_HERE');

    if (config.firebase.projectId && config.firebase.clientEmail && hasValidKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: config.firebase.projectId,
          clientEmail: config.firebase.clientEmail,
          privateKey: config.firebase.privateKey,
        }),
        databaseURL: config.firebase.databaseURL,
      });
      console.log('⚡ Firebase Admin initialized successfully with credentials.');
    } else {
      console.warn(
        '⚠️ Warning: Service Account credentials absent or placeholder. Initializing default app...'
      );
      admin.initializeApp({
        projectId: config.firebase.projectId || 'mandhikkindo',
      });
      console.log('⚡ Firebase Admin initialized with project ID:', config.firebase.projectId || 'mandhikkindo');
    }
  }

  db = admin.firestore();
  auth = admin.auth();
  try {
    rtdb = admin.database();
  } catch (_e) {
    // Optional if RTDB isn't enabled
  }
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
  // Ensure fallback app initialization if previous cert attempt threw an error
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        projectId: config.firebase.projectId || 'mandhikkindo',
        databaseURL: config.firebase.databaseURL,
      });
    }
    db = admin.firestore();
    auth = admin.auth();
    console.log('⚡ Firebase Admin fallback app ready.');
  } catch (fallbackError) {
    console.error('❌ Critical: Firebase Admin fallback also failed:', fallbackError.message);
  }
}

export { admin, db, auth, rtdb };
