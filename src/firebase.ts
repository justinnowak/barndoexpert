import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, collection, onSnapshot, query, where, addDoc, serverTimestamp, setDoc, getDoc, updateDoc, getDocs, orderBy, deleteDoc, Timestamp } from 'firebase/firestore';
// Import the Firebase configuration
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Lazy-initialize storage — only loaded when first needed
// This avoids crashes when Firebase Storage isn't enabled in the console yet
let _storageModule: typeof import('firebase/storage') | null = null;
let _storageInstance: any = null;

async function getStorageLazy() {
  if (!_storageInstance) {
    _storageModule = await import('firebase/storage');
    _storageInstance = _storageModule.getStorage(app);
  }
  return { storage: _storageInstance, mod: _storageModule! };
}

export async function uploadFile(path: string, file: File) {
  const { storage, mod } = await getStorageLazy();
  const storageRef = mod.ref(storage, path);
  await mod.uploadBytes(storageRef, file);
  return mod.getDownloadURL(storageRef);
}

export async function deleteFile(path: string) {
  const { storage, mod } = await getStorageLazy();
  const storageRef = mod.ref(storage, path);
  await mod.deleteObject(storageRef);
}

// Error Handling Spec for Firestore Operations
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
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. ");
    }
  }
}
testConnection();

export { signInWithPopup, onAuthStateChanged, collection, onSnapshot, query, where, addDoc, serverTimestamp, setDoc, getDoc, updateDoc, getDocs, orderBy, deleteDoc, Timestamp, doc };
export type { FirebaseUser };
