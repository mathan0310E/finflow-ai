// ──────────────────────────────────────────────
// Firebase Admin SDK Initialization
// ──────────────────────────────────────────────

import admin from 'firebase-admin';
import { env } from './env';

let firebaseApp: admin.app.App;

export function initFirebase(): void {
  if (admin.apps.length > 0) {
    firebaseApp = admin.apps[0]!;
    return;
  }

  try {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        privateKey: env.FIREBASE_PRIVATE_KEY,
      }),
      databaseURL: env.FIREBASE_DATABASE_URL || undefined,
    });

    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error);
    throw error;
  }
}

// Firestore database instance
export const db = (): admin.firestore.Firestore => {
  if (!firebaseApp) {
    initFirebase();
  }
  return admin.firestore();
};

// Firebase Authentication instance
export const auth = (): admin.auth.Auth => {
  if (!firebaseApp) {
    initFirebase();
  }
  return admin.auth();
};

// Firebase Storage instance
export const storage = (): admin.storage.Storage => {
  if (!firebaseApp) {
    initFirebase();
  }
  return admin.storage();
};

// Timestamp helper — creates a Firestore Timestamp from a JS Date
export function toFirestoreTimestamp(date: Date = new Date()): admin.firestore.Timestamp {
  return admin.firestore.Timestamp.fromDate(date);
}

// Server timestamp helper
export const serverTimestamp = (): admin.firestore.FieldValue => {
  return admin.firestore.FieldValue.serverTimestamp();
};

// Document reference helper
export function docRef(collection: string, id?: string): admin.firestore.DocumentReference {
  if (id) {
    return db().collection(collection).doc(id);
  }
  return db().collection(collection).doc();
}

// Collection reference helper
export function collectionRef(collection: string): admin.firestore.CollectionReference {
  return db().collection(collection);
}

// Generate a new document ID
export function generateId(collection: string): string {
  return db().collection(collection).doc().id;
}

export default { initFirebase, db, auth, storage, serverTimestamp, docRef, collectionRef, generateId };
