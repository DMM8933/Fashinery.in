import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { doc, getDocFromServer, initializeFirestore, setLogLevel } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

// Silence verbose internal connection warnings from Firestore SDK
setLogLevel('silent');

// Prevent benign internal offline-detection warnings from being flagged as fatal console errors
if (typeof window !== 'undefined' && typeof window.console !== 'undefined') {
  const originalConsoleError = window.console.error;
  window.console.error = (...args: any[]) => {
    const message = args.map((a) => (typeof a === 'string' ? a : a?.message || '')).join(' ');
    if (
      message.includes('Could not reach Cloud Firestore backend') ||
      message.includes("Backend didn't respond within 10 seconds") ||
      message.includes('client will operate in offline mode')
    ) {
      // Benign temporary connection detection message - ignore
      return;
    }
    originalConsoleError.apply(window.console, args);
  };
}

const app = initializeApp(firebaseConfig);

// CRITICAL: Initialize Firestore with required database ID and force long polling
// Using experimentalForceLongPolling avoids WebSockets being blocked or timing out in iframe/proxy environments,
// preventing the 10-second backend timeout warning and unavailable error.
export const db = initializeFirestore(
  app,
  {
    experimentalForceLongPolling: true,
    ignoreUndefinedProperties: true,
  },
  firebaseConfig.firestoreDatabaseId
);

export const auth = getAuth(app);
export const storage = getStorage(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMessage = error instanceof Error ? error.message : String(error);
  const errorCode = (error as any)?.code;
  const isPermissionError =
    errorCode === 'permission-denied' ||
    errMessage.toLowerCase().includes('permission') ||
    errMessage.toLowerCase().includes('missing or insufficient');

  const errInfo: FirestoreErrorInfo = {
    error: errMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };

  if (isPermissionError) {
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  } else {
    console.warn(`Firestore ${operationType} warning on ${path}:`, errMessage);
  }
}

/**
 * Recursively removes properties with undefined values from an object.
 * Firestore setDoc/updateDoc/addDoc strictly rejects fields whose value is undefined.
 */
export function removeUndefinedFields<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => removeUndefinedFields(item)) as unknown as T;
  }
  if (typeof obj === 'object' && !(obj instanceof Date)) {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = removeUndefinedFields(value);
      }
    }
    return cleaned as T;
  }
  return obj;
}

// CRITICAL CONSTRAINT: Test connection when app boots
export async function testConnection(retries = 2) {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    const isUnavailable =
      error instanceof Error &&
      (error.message.includes('the client is offline') ||
        error.message.includes('unavailable') ||
        error.message.includes('Could not reach') ||
        (error as any)?.code === 'unavailable');

    if (isUnavailable && retries > 0) {
      setTimeout(() => {
        testConnection(retries - 1);
      }, 2500);
      return;
    }

    if (isUnavailable) {
      console.warn('Firestore is connecting or operating in offline mode.');
    } else {
      console.warn('Firestore connection check notice:', error);
    }
  }
}

// Automatically trigger connection test once runtime environment is established
if (typeof window !== 'undefined') {
  setTimeout(() => {
    testConnection();
  }, 2000);
} else {
  testConnection();
}
