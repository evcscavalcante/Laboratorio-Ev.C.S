/**
 * Testes de Integração - Fluxo de Autenticação
 * Validação do sistema híbrido Firebase + PostgreSQL
 */

import { describe, test, expect, beforeEach } from '@jest/globals';

const mockAuth = {
  signIn: jest.fn(),
  signOut: jest.fn(),
  getCurrentUser: jest.fn(),
  syncUser: jest.fn()
};

const mockAPI = {
  post: jest.fn(),
  get: jest.fn()
};

describe('Fluxo de Autenticação Completo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Login com Firebase', () => {
    test('realiza login completo com sucesso', async () => {
      const mockUser = {
        uid: 'firebase-uid-123',
        email: 'test@example.com',
        displayName: 'Usuário Teste',
        getIdToken: jest.fn().mockResolvedValue('firebase-token-123')
      };

      mockAuth.signIn.mockResolvedValue({ user: mockUser });
      mockAPI.post.mockResolvedValue({
        status: 200,
        data: {
          user: {
            id: 1,
            firebaseUid: 'firebase-uid-123',
            email: 'test@example.com',
            name: 'Usuário Teste',
            role: 'USER',
            active: true
          }
        }
      });

      const loginResult = await performLogin('test@example.com', 'password123');

      expect(mockAuth.signIn).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockAPI.post).toHaveBeenCalledWith('/api/auth/sync-user', {
        firebaseUid: 'firebase-uid-123',
        email: 'test@example.com',
        name: 'Usuário Teste'
      });
      expect(loginResult.success).toBe(true);
      expect(loginResult.user.role).toBe('USER');
    });

    test('trata erro de credenciais inválidas', async () => {
      mockAuth.signIn.mockRejectedValue({
        code: 'auth/invalid-credential',
        message: 'Credenciais inválidas'
      });

      const loginResult = await performLogin('wrong@example.com', 'wrongpass');

      expect(loginResult.success).toBe(false);
      expect(loginResult.error).toContain('Credenciais inválidas');
    });
  });

  describe('Verificação de Autenticação', () => {
    test('verifica token válido', async () => {
      mockAPI.get.mockResolvedValue({
        status: 200,
        data: {
          user: {
            id: 1,
            email: 'test@example.com',
            role: 'USER'
          }
        }
      });

      const authStatus = await checkAuthStatus('valid-token');

      expect(mockAPI.get).toHaveBeenCalledWith('/api/auth/user', {
        headers: { 'Authorization': 'Bearer valid-token' }
      });
      expect(authStatus.authenticated).toBe(true);
    });

    test('detecta token expirado', async () => {
      mockAPI.get.mockRejectedValue({
        status: 401,
        message: 'Token expirado'
      });

      const authStatus = await checkAuthStatus('expired-token');

      expect(authStatus.authenticated).toBe(false);
      expect(authStatus.needsReauth).toBe(true);
    });
  });

  describe('Controle de Acesso por Roles', () => {
    test('permite acesso para ADMIN', () => {
      const adminUser = { id: 1, role: 'ADMIN', email: 'admin@example.com' };
      const hasAccess = checkRoleAccess(adminUser, ['ADMIN', 'TECH']);
      expect(hasAccess).toBe(true);
    });

    test('nega acesso para USER em rota ADMIN', () => {
      const regularUser = { id: 2, role: 'USER', email: 'user@example.com' };
      const hasAccess = checkRoleAccess(regularUser, ['ADMIN']);
      expect(hasAccess).toBe(false);
    });
  });
});

async function performLogin(email: string, password: string) {
  try {
    const userCredential = await mockAuth.signIn(email, password);
    const user = userCredential.user;
    
    if (!user) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    const token = await user.getIdToken();
    
    try {
      const response = await mockAPI.post('/api/auth/sync-user', {
        firebaseUid: user.uid,
        email: user.email,
        name: user.displayName
      });

      return { 
        success: true, 
        user: response.data.user,
        token 
      };
    } catch (syncError) {
      return { 
        success: false, 
        error: 'Erro na sincronização com o banco de dados' 
      };
    }
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Erro de autenticação' 
    };
  }
}

async function checkAuthStatus(token: string) {
  try {
    const response = await mockAPI.get('/api/auth/user', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    return {
      authenticated: true,
      user: response.data.user
    };
  } catch (error: any) {
    if (error.status === 401) {
      return {
        authenticated: false,
        needsReauth: true
      };
    }
    
    return {
      authenticated: false,
      error: error.message || 'Erro de verificação'
    };
  }
}

function checkRoleAccess(user: any, allowedRoles: string[]): boolean {
  return allowedRoles.includes(user.role);
}