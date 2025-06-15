import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User } from 'firebase/auth';

// Limpar aspas extras das variáveis de ambiente
const cleanEnvVar = (value: string) => value?.replace(/^["']|["']$/g, '') || '';

const firebaseConfig = {
  apiKey: cleanEnvVar(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: `${cleanEnvVar(import.meta.env.VITE_FIREBASE_PROJECT_ID)}.firebaseapp.com`,
  projectId: cleanEnvVar(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: `${cleanEnvVar(import.meta.env.VITE_FIREBASE_PROJECT_ID)}.firebasestorage.app`,
  messagingSenderId: "130749701",
  appId: cleanEnvVar(import.meta.env.VITE_FIREBASE_APP_ID)
};

// Inicializar Firebase evitando duplicação
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Funções de autenticação com validação
export const signIn = (email: string, password: string) => {
  // Validação básica
  if (!email || !password) {
    throw new Error('Email e senha são obrigatórios');
  }
  
  if (!email.includes('@')) {
    throw new Error('Email inválido');
  }
  
  if (password.length < 6) {
    throw new Error('Senha deve ter pelo menos 6 caracteres');
  }
  
  return signInWithEmailAndPassword(auth, email.trim(), password);
};

export const signUp = (email: string, password: string) => {
  // Validação básica
  if (!email || !password) {
    throw new Error('Email e senha são obrigatórios');
  }
  
  if (!email.includes('@')) {
    throw new Error('Email inválido');
  }
  
  if (password.length < 6) {
    throw new Error('Senha deve ter pelo menos 6 caracteres');
  }
  
  return createUserWithEmailAndPassword(auth, email.trim(), password);
};

export const logout = () => {
  return signOut(auth);
};

// Observador de estado de autenticação
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export default app;