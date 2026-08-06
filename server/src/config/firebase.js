import admin from 'firebase-admin';
import config from './env.js';

let db;
let auth;

try {
  if (!admin.apps.length) {
    if (config.firebase.projectId && config.firebase.clientEmail && config.firebase.privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: config.firebase.projectId,
          clientEmail: config.firebase.clientEmail,
          privateKey: config.firebase.privateKey,
        }),
      });
      console.log('⚡ Firebase Admin initialized successfully with credentials.');
    } else {
      console.warn(
        '⚠️ Warning: Firebase credentials missing in .env. Initializing default app...'
      );
      admin.initializeApp({
        projectId: config.firebase.projectId || 'demo-mandhikkindo',
      });
    }
  }

  db = admin.firestore();
  auth = admin.auth();
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin SDK:', error);
}

export { admin, db, auth };
