import { Request, Response, NextFunction } from 'express';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { storage } from './storage';

// Initialize Firebase Admin SDK
let admin: any = null;

try {
  // For production, use service account key
  // For development, Firebase will use default credentials
  admin = initializeApp({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'laboratorio-evcs'
  });
} catch (error) {
  console.log('Firebase Admin not initialized - using mock auth for development');
}

export interface FirebaseUser {
  uid: string;
  email: string;
  name: string;
  photoURL?: string;
  emailVerified: boolean;
}

export const verifyFirebaseToken = async (idToken: string): Promise<FirebaseUser | null> => {
  // Token de desenvolvimento para testes
  if (idToken === 'dev-token') {
    return {
      uid: 'dev-user-123',
      email: 'evcsousa@yahoo.com.br',
      name: 'Desenvolvedor',
      emailVerified: true
    };
  }

  if (!admin) {
    console.log('Firebase Admin não configurado - requer credenciais');
    return null;
  }

  try {
    const auth = getAuth(admin);
    const decodedToken = await auth.verifyIdToken(idToken);
    return {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      name: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
      photoURL: decodedToken.picture,
      emailVerified: decodedToken.email_verified || false
    };
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    return null;
  }
};

export const syncUserWithDatabase = async (firebaseUser: FirebaseUser) => {
  try {
    // Check if user exists in database
    let user = await storage.getUser(firebaseUser.uid);
    
    if (!user) {
      // Create new user in database
      const newUser = {
        username: firebaseUser.email.split('@')[0],
        name: firebaseUser.name,
        email: firebaseUser.email,
        role: 'TECHNICIAN',
        active: true,
        profileImageUrl: firebaseUser.photoURL || null,
        permissions: {}
      };
      
      user = await storage.upsertUser(newUser);
      console.log(`Created new user in database: ${user.email}`);
    } else {
      // Update existing user
      const updatedUser = {
        username: user.username,
        name: firebaseUser.name,
        email: firebaseUser.email,
        role: user.role,
        active: user.active,
        profileImageUrl: firebaseUser.photoURL || user.profileImageUrl,
        permissions: (user.permissions as any) || {}
      };
      
      user = await storage.upsertUser(updatedUser);
      console.log(`Updated existing user: ${user.email}`);
    }
    
    return user;
  } catch (error) {
    console.error('Error syncing user with database:', error);
    throw error;
  }
};

export const firebaseAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Verificação mais robusta do header de autorização
    if (!authHeader) {
      return res.status(401).json({ error: 'Header de autorização ausente' });
    }
    
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Formato de token inválido. Use Bearer <token>' });
    }
    
    const idToken = authHeader.split('Bearer ')[1];
    
    if (!idToken || idToken.trim() === '') {
      return res.status(401).json({ error: 'Token vazio fornecido' });
    }
    
    const firebaseUser = await verifyFirebaseToken(idToken);
    
    if (!firebaseUser) {
      return res.status(401).json({ error: 'Token Firebase inválido ou expirado' });
    }
    
    // Sync user with database
    const dbUser = await syncUserWithDatabase(firebaseUser);
    
    // Add user to request object
    (req as any).user = dbUser;
    (req as any).firebaseUser = firebaseUser;
    
    next();
  } catch (error) {
    console.error('Firebase auth middleware error:', error);
    res.status(500).json({ error: 'Erro de autenticação interno' });
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: 'Acesso negado - permissão insuficiente' });
    }
    
    next();
  };
};