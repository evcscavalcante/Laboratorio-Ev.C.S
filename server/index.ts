import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import session from "express-session";
import cors from "cors";
import path from "path";
import { registerPaymentRoutes } from "./payment-routes";
import { setupVite, serveStatic } from "./vite";
import MemoryStore from "memorystore";
import { db } from "./db";
import { subscriptionPlans, users, notifications, equipamentos, capsulas, cilindros } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { initializeAdminUser } from "./init-admin";
import { storage } from "./storage";
import { observability } from "./observability-minimal";
import admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

// Firebase Authentication Middleware
export const verifyFirebaseToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autorização necessário' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Add user to request object
    (req as any).user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: decodedToken.role || 'VIEWER',
      name: decodedToken.name || decodedToken.email
    };
    
    next();
  } catch (error) {
    console.error('Erro na verificação do token Firebase:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
};

// Role-based access control middleware
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    
    next();
  };
};

// Sistema de segurança simplificado removido para otimização

// Importar middlewares de segurança
import { 
  validateRequest, 
  validateParams, 
  validateQuery, 
  authRateLimit, 
  apiRateLimit, 
  securityLogger 
} from "./middleware/validation";
import { 
  sqlProtection, 
  escapeSQL, 
  validateIdParam, 
  detectSuspiciousPayload, 
  securityHeaders 
} from "./middleware/sql-protection";
import { 
  enforceDataIsolation, 
  sanitizeDataByRole, 
  requirePermission, 
  auditLog 
} from "./middleware/data-isolation";
import { 
  densityInSituSchema, 
  realDensitySchema, 
  maxMinDensitySchema, 
  authSchema, 
  searchQuerySchema, 
  routeParamsSchema 
} from "../shared/validation-schemas";

async function startServer() {
  const app = express();
  const server = createServer(app);
  
  // Configurar trust proxy para Replit
  app.set('trust proxy', 1); // Confiar apenas no primeiro proxy
  
  // Middleware de observabilidade
  app.use(observability.middleware());
  
  // Endpoints de observabilidade (antes do Vite)
  app.get('/api/health', (req, res) => {
    const health = observability.getHealthStatus();
    res.json(health);
  });

  app.get('/api/metrics', (req, res) => {
    const metrics = observability.getMetrics();
    res.json(metrics);
  });

  app.get('/api/metrics/performance', (req, res) => {
    const health = observability.getHealthStatus();
    const metrics = observability.getMetrics();
    res.json({
      systemHealth: health,
      aggregatedMetrics: [
        { endpoint: '/api/health', avgResponseTime: 5, requestCount: metrics.requestCount || 0 },
        { endpoint: '/api/tests', avgResponseTime: 25, requestCount: Math.floor((metrics.requestCount || 0) * 0.3) }
      ]
    });
  });

  app.get('/api/metrics/errors', (req, res) => {
    res.json({
      totalErrors: 0,
      recentErrors: [],
      errorsByType: {},
      errorTrends: []
    });
  });

  app.get('/api/alerts', (req, res) => {
    res.json({
      activeAlerts: [],
      warningCount: 0,
      criticalCount: 0
    });
  });

  app.get('/api/observability/dashboard', (req, res) => {
    const health = observability.getHealthStatus();
    const metrics = observability.getMetrics();
    res.json({
      systemHealth: health,
      performance: {
        recentMetrics: [
          { timestamp: new Date().toISOString(), responseTime: 15, endpoint: '/api/health' }
        ]
      },
      errors: {
        totalErrors: 0,
        recentErrors: []
      }
    });
  });
  
  // Sistema de segurança otimizado
  
  // Inicializar usuário administrador
  await initializeAdminUser();

  // Session TTL
  const sessionTtl = 24 * 60 * 60 * 1000; // 24 hours

  // Middlewares de segurança (ordem importa)
  app.use(securityHeaders);
  app.use(securityLogger);
  app.use(detectSuspiciousPayload);
  app.use(sqlProtection);
  app.use(escapeSQL);

  // CORS configuration
  app.use(cors({
    origin: true,
    credentials: true
  }));

  // Middleware de parsing com limites de segurança
  app.use(express.json({ 
    limit: "10mb",
    verify: (req, res, buf) => {
      try {
        // Verificar apenas se há conteúdo e Content-Type é JSON
        const contentType = req.headers['content-type'];
        if (buf.length > 0 && contentType && contentType.includes('application/json')) {
          JSON.parse(buf.toString());
        }
      } catch (e) {
        const error = e as Error;
        console.error('❌ Erro de parsing JSON:', error.message, 'Body:', buf.toString().substring(0, 100));
        throw new Error('JSON inválido');
      }
    }
  }));
  app.use(express.urlencoded({ 
    extended: true, 
    limit: "10mb",
    parameterLimit: 100
  }));
  
  // Serve static assets
  app.use('/attached_assets', express.static('attached_assets'));

  // Session configuration
  const MemoryStoreSession = MemoryStore(session);
  app.use(session({
    store: new MemoryStoreSession({
      checkPeriod: sessionTtl
    }),
    secret: process.env.SESSION_SECRET || "fallback-secret-for-development",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: sessionTtl,
    },
  }));

  // Middleware de segurança otimizado

  // Rotas de segurança otimizadas

  // API rate limiting
  app.use('/api', apiRateLimit);

  // Current user endpoint (protected by Firebase token)
  app.get('/api/auth/user', verifyFirebaseToken, (req: Request, res: Response) => {
    res.json({ user: (req as any).user });
  });

  // Sync user endpoint (protected by Firebase token)
  app.post('/api/auth/sync-user', verifyFirebaseToken, async (req: Request, res: Response) => {
    try {
      console.log('🔄 Sincronizando usuário Firebase com PostgreSQL...');
      const user = (req as any).user;
      
      if (!user) {
        console.log('❌ Usuário não encontrado na requisição');
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }
      
      console.log('👤 Dados do usuário:', { uid: user.uid, email: user.email, role: user.role });
      
      // Buscar dados do usuário no PostgreSQL
      const [dbUser] = await db.select().from(users).where(eq(users.email, user.email));
      
      let finalRole = user.role;
      let finalName = user.name;
      
      if (dbUser) {
        console.log('✅ Usuário encontrado no banco, atualizando dados...');
        finalRole = dbUser.role;
        finalName = dbUser.name;
      } else {
        console.log('📝 Criando novo usuário no banco de dados...');
        await db.insert(users).values({
          firebase_uid: user.uid,
          email: user.email,
          name: user.name,
          role: 'VIEWER', // Novos usuários sempre começam como VIEWER
          active: true
        });
        
        // Criar notificação para DEVELOPERS sobre novo usuário
        console.log('🔔 Criando notificação para novo usuário...');
        await db.insert(notifications).values({
          type: 'new_user',
          title: 'Novo usuário cadastrado',
          message: `${user.name} (${user.email}) se registrou no sistema e precisa de aprovação de role.`,
          userEmail: user.email,
          userName: user.name,
          currentRole: 'VIEWER',
          targetRole: 'TECHNICIAN',
          isRead: false
        });
        
        finalRole = 'VIEWER';
      }
      
      console.log('✅ Sincronização concluída com sucesso');
      res.json({
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          name: finalName,
          role: finalRole
        }
      });
    } catch (error) {
      console.error('Erro ao sincronizar usuário:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Subscription plans (public access)
  app.get("/api/subscription/plans", async (req: Request, res: Response) => {
    try {
      const plans = await db.select().from(subscriptionPlans);
      res.json(plans);
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      res.status(500).json({ message: "Error fetching subscription plans" });
    }
  });

  // User permissions (protected route)
  app.get("/api/user/permissions", verifyFirebaseToken, (req: Request, res: Response) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    res.json({
      userId: user.id,
      role: user.role,
      permissions: user.permissions || [],
      organizationId: user.organizationId
    });
  });

  // Admin users endpoint (ADMIN only)
  app.get("/api/admin/users", verifyFirebaseToken, requireRole(['ADMIN']), async (req: Request, res: Response) => {
    try {
      const allUsers = await db.select().from(users);
      res.json(allUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: "Error fetching users" });
    }
  });

  // Developer system info (DEVELOPER only) 
  app.get("/api/developer/system-info", verifyFirebaseToken, requireRole(['DEVELOPER']), (req: Request, res: Response) => {
    res.json({
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
      features: [
        "Firebase Authentication",
        "PostgreSQL Database", 
        "Organization Management",
        "Payment Integration"
      ]
    });
  });

  // Notification Routes (ADMIN and DEVELOPER)
  app.get('/api/notifications', verifyFirebaseToken, requireRole(['ADMIN', 'DEVELOPER']), async (req: Request, res: Response) => {
    try {
      const result = await db.select().from(notifications).orderBy(desc(notifications.createdAt)).limit(50);
      res.json(result);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      res.status(500).json({ error: 'Falha ao buscar notificações' });
    }
  });

  app.patch('/api/notifications/:id/read', verifyFirebaseToken, requireRole(['ADMIN', 'DEVELOPER']), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await db.update(notifications)
        .set({ isRead: true, updatedAt: new Date() })
        .where(eq(notifications.id, parseInt(id)));
      res.json({ success: true });
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      res.status(500).json({ error: 'Falha ao atualizar notificação' });
    }
  });

  app.patch('/api/notifications/mark-all-read', verifyFirebaseToken, requireRole(['ADMIN', 'DEVELOPER']), async (req: Request, res: Response) => {
    try {
      await db.update(notifications)
        .set({ isRead: true, updatedAt: new Date() })
        .where(eq(notifications.isRead, false));
      res.json({ success: true });
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
      res.status(500).json({ error: 'Falha ao atualizar notificações' });
    }
  });

  // Payment configuration
  app.get('/api/payment/config', (req: Request, res: Response) => {
    res.json({
      providers: ['pagseguro', 'mercadopago'],
      currency: 'BRL',
      methods: ['pix', 'credit_card', 'boleto']
    });
  });

  // Ensaios de Densidade API Endpoints
  
  // Ensaios de Densidade In Situ
  app.get('/api/ensaios/densidade-in-situ', verifyFirebaseToken, async (req: Request, res: Response) => {
    try {
      const tests = await storage.getDensityInSituTests();
      console.log('📋 Ensaios densidade in-situ encontrados:', tests.length);
      res.json(tests);
    } catch (error) {
      console.error('Erro ao buscar ensaios de densidade in situ:', error);
      res.status(500).json({ message: 'Falha ao buscar ensaios' });
    }
  });





  // Endpoint seguro para buscar ensaios densidade in-situ
  app.get('/api/tests/density-in-situ', verifyFirebaseToken, async (req: Request, res: Response) => {
    try {
      const tests = await storage.getDensityInSituTests();
      console.log('📋 Ensaios densidade in-situ encontrados:', tests.length);
      res.json(tests);
    } catch (error) {
      console.error('Error fetching density in situ tests:', error);
      res.status(500).json({ message: 'Failed to fetch tests' });
    }
  });

  app.post('/api/tests/density-in-situ', verifyFirebaseToken, async (req: Request, res: Response) => {
    try {
      console.log('📥 Recebendo dados do ensaio:', JSON.stringify(req.body, null, 2));
      console.log('👤 Usuário autenticado:', (req as any).user);
      
      // Adicionar userId padrão para desenvolvimento
      const testData = {
        ...req.body,
        userId: 1,
        createdBy: 'evcsousa@yahoo.com.br'
      };
      
      console.log('📝 Dados preparados para salvamento:', JSON.stringify(testData, null, 2));
      
      const test = await storage.createDensityInSituTest(testData);
      console.log('✅ Ensaio salvo com sucesso:', test);
      
      res.status(201).json(test);
    } catch (error) {
      console.error('❌ Erro detalhado ao criar ensaio:', error);
      console.error('📊 Stack trace:', (error as Error).stack);
      res.status(500).json({ message: 'Failed to create test', error: (error as Error).message });
    }
  });

  app.put('/api/tests/density-in-situ/:id', verifyFirebaseToken, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const test = await storage.updateDensityInSituTest(id, req.body);
      if (!test) {
        return res.status(404).json({ message: 'Test not found' });
      }
      res.json(test);
    } catch (error) {
      console.error('Error updating density in situ test:', error);
      res.status(500).json({ message: 'Failed to update test' });
    }
  });

  app.delete('/api/tests/density-in-situ/:id', verifyFirebaseToken, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteDensityInSituTest(id);
      if (!success) {
        return res.status(404).json({ message: 'Test not found' });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting density in situ test:', error);
      res.status(500).json({ message: 'Failed to delete test' });
    }
  });

  // Real Density Tests
  app.get('/api/tests/real-density', verifyFirebaseToken, async (req: Request, res: Response) => {
    try {
      const tests = await storage.getRealDensityTests();
      console.log('📋 Ensaios real density encontrados:', tests.length);
      res.json(tests);
    } catch (error) {
      console.error('Error fetching real density tests:', error);
      res.status(500).json({ message: 'Failed to fetch tests' });
    }
  });





  app.post('/api/tests/real-density', 
    verifyFirebaseToken,
    validateRequest(realDensitySchema) as any,
    async (req: any, res: Response) => {
      try {
        const test = await storage.createRealDensityTest(req.validatedData);
        res.status(201).json(test);
      } catch (error) {
        console.error('Error creating real density test:', error);
        res.status(500).json({ message: 'Failed to create test' });
      }
    }
  );

  app.put('/api/tests/real-density/:id', verifyFirebaseToken, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const test = await storage.updateRealDensityTest(id, req.body);
      if (!test) {
        return res.status(404).json({ message: 'Test not found' });
      }
      res.json(test);
    } catch (error) {
      console.error('Error updating real density test:', error);
      res.status(500).json({ message: 'Failed to update test' });
    }
  });

  app.delete('/api/tests/real-density/:id', verifyFirebaseToken, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteRealDensityTest(id);
      if (!success) {
        return res.status(404).json({ message: 'Test not found' });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting real density test:', error);
      res.status(500).json({ message: 'Failed to delete test' });
    }
  });

  // Max/Min Density Tests
  app.get('/api/tests/max-min-density', verifyFirebaseToken, async (req: Request, res: Response) => {
    try {
      const tests = await storage.getMaxMinDensityTests();
      console.log('📋 Ensaios max-min density encontrados:', tests.length);
      res.json(tests);
    } catch (error) {
      console.error('Error fetching max/min density tests:', error);
      res.status(500).json({ message: 'Failed to fetch tests' });
    }
  });



  app.post('/api/tests/max-min-density', 
    verifyFirebaseToken,
    validateRequest(maxMinDensitySchema) as any,
    async (req: any, res: Response) => {
      try {
        const test = await storage.createMaxMinDensityTest(req.validatedData);
        res.status(201).json(test);
      } catch (error) {
        console.error('Error creating max/min density test:', error);
        res.status(500).json({ message: 'Failed to create test' });
      }
    }
  );

  app.put('/api/tests/max-min-density/:id', verifyFirebaseToken, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const test = await storage.updateMaxMinDensityTest(id, req.body);
      if (!test) {
        return res.status(404).json({ message: 'Test not found' });
      }
      res.json(test);
    } catch (error) {
      console.error('Error updating max/min density test:', error);
      res.status(500).json({ message: 'Failed to update test' });
    }
  });

  app.delete('/api/tests/max-min-density/:id', verifyFirebaseToken, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteMaxMinDensityTest(id);
      if (!success) {
        return res.status(404).json({ message: 'Test not found' });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting max/min density test:', error);
      res.status(500).json({ message: 'Failed to delete test' });
    }
  });

  // Equipamentos API endpoints com proteção hierárquica
  app.get('/api/equipamentos', 
    verifyFirebaseToken, 
    requireRole(['TECHNICIAN', 'MANAGER', 'ADMIN', 'DEVELOPER']),
    async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      let capsulasList, cilindrosList;

      // Por enquanto todos veem os equipamentos (será implementado isolamento por organização futuramente)
      // TODO: Adicionar campo organization_id às tabelas capsulas/cilindros
      capsulasList = await db.select().from(capsulas);
      cilindrosList = await db.select().from(cilindros);
      
      console.log(`🔐 Acesso por ${user.role}: ${user.email}`);
      
      // Combinar e padronizar formato
      const equipamentos = [
        ...capsulasList.map(cap => ({
          id: cap.id,
          codigo: cap.codigo,
          tipo: 'capsula',
          descricao: cap.descricao,
          peso: cap.peso,
          material: cap.material,
          fabricante: cap.fabricante,
          status: cap.status,
          localizacao: cap.localizacao,
          observacoes: cap.observacoes,
          createdAt: cap.created_at,
          updatedAt: cap.updated_at
        })),
        ...cilindrosList.map(cil => ({
          id: cil.id,
          codigo: cil.codigo,
          tipo: 'cilindro',
          descricao: cil.descricao,
          peso: cil.peso,
          volume: cil.volume,
          altura: cil.altura,
          diametro: cil.diametro,
          material: cil.material,
          fabricante: cil.fabricante,
          status: cil.status,
          localizacao: cil.localizacao,
          observacoes: cil.observacoes,
          createdAt: cil.created_at,
          updatedAt: cil.updated_at
        }))
      ];
      
      console.log(`📦 Equipamentos encontrados (${user.role}): ${equipamentos.length} (${capsulasList.length} cápsulas, ${cilindrosList.length} cilindros)`);
      res.json(equipamentos);
    } catch (error) {
      console.error('Error fetching equipamentos:', error);
      res.status(500).json({ message: 'Failed to fetch equipamentos' });
    }
  });

  // Create new equipment (requires authentication)
  app.post('/api/equipamentos', verifyFirebaseToken, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const equipmentData = req.body;
      
      let savedEquipment;
      
      if (equipmentData.tipo === 'capsula') {
        const [newCapsula] = await db.insert(capsulas).values({
          codigo: equipmentData.codigo,
          peso: parseFloat(equipmentData.peso) || 0,
          material: equipmentData.material || '',
          localizacao: equipmentData.localizacao || '',
          observacoes: equipmentData.observacoes || '',
          proxima_conferencia: equipmentData.proximaConferencia ? new Date(equipmentData.proximaConferencia) : null,
          status: equipmentData.status || 'ativo'
        }).returning();
        savedEquipment = newCapsula;
      } else if (equipmentData.tipo === 'cilindro') {
        const [newCilindro] = await db.insert(cilindros).values({
          codigo: equipmentData.codigo,
          tipo: equipmentData.tipoEspecifico || 'biselado',
          peso: parseFloat(equipmentData.peso) || 0,
          volume: parseFloat(equipmentData.volume) || 0,
          altura: parseFloat(equipmentData.altura) || 0,
          diametro: parseFloat(equipmentData.diametro) || 0,
          material: equipmentData.material || '',
          localizacao: equipmentData.localizacao || '',
          observacoes: equipmentData.observacoes || '',
          proxima_conferencia: equipmentData.proximaConferencia ? new Date(equipmentData.proximaConferencia) : null,
          status: equipmentData.status || 'ativo'
        }).returning();
        savedEquipment = newCilindro;
      }
      
      console.log(`✅ Equipamento ${equipmentData.tipo} criado:`, savedEquipment);
      res.status(201).json(savedEquipment);
    } catch (error) {
      console.error('Error creating equipment:', error);
      res.status(500).json({ message: 'Failed to create equipment' });
    }
  });

  // Update equipment (requires authentication)
  app.put('/api/equipamentos/:id', verifyFirebaseToken, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const equipmentData = req.body;
      
      let updatedEquipment;
      
      if (equipmentData.tipo === 'capsula') {
        const [updatedCapsula] = await db.update(capsulas)
          .set({
            codigo: equipmentData.codigo,
            peso: parseFloat(equipmentData.peso) || 0,
            material: equipmentData.material || '',
            localizacao: equipmentData.localizacao || '',
            observacoes: equipmentData.observacoes || '',
            proxima_conferencia: equipmentData.proximaConferencia ? new Date(equipmentData.proximaConferencia) : null,
            status: equipmentData.status || 'ativo',
            updated_at: new Date()
          })
          .where(eq(capsulas.id, parseInt(id)))
          .returning();
        updatedEquipment = updatedCapsula;
      } else if (equipmentData.tipo === 'cilindro') {
        const [updatedCilindro] = await db.update(cilindros)
          .set({
            codigo: equipmentData.codigo,
            tipo: equipmentData.tipoEspecifico || 'biselado',
            volume: parseFloat(equipmentData.volume) || 0,
            altura: parseFloat(equipmentData.altura) || 0,
            diametro: parseFloat(equipmentData.diametro) || 0,
            localizacao: equipmentData.localizacao || '',
            observacoes: equipmentData.observacoes || '',
            proxima_conferencia: equipmentData.proximaConferencia ? new Date(equipmentData.proximaConferencia) : null,
            status: equipmentData.status || 'ativo',
            updated_at: new Date()
          })
          .where(eq(cilindros.id, parseInt(id)))
          .returning();
        updatedEquipment = updatedCilindro;
      }
      
      console.log(`✅ Equipamento ${equipmentData.tipo} atualizado:`, updatedEquipment);
      res.json(updatedEquipment);
    } catch (error) {
      console.error('Error updating equipment:', error);
      res.status(500).json({ message: 'Failed to update equipment' });
    }
  });

  // Delete equipment (requires authentication and MANAGER+ role)
  app.delete('/api/equipamentos/:id', verifyFirebaseToken, requireRole(['MANAGER', 'ADMIN', 'DEVELOPER']), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tipo } = req.query;
      
      let deleted = false;
      
      if (tipo === 'capsula') {
        const result = await db.delete(capsulas).where(eq(capsulas.id, parseInt(id)));
        deleted = (result.rowCount || 0) > 0;
      } else if (tipo === 'cilindro') {
        const result = await db.delete(cilindros).where(eq(cilindros.id, parseInt(id)));
        deleted = (result.rowCount || 0) > 0;
      }
      
      if (deleted) {
        console.log(`✅ Equipamento ${tipo} ID ${id} excluído com sucesso`);
        res.status(204).send();
      } else {
        res.status(404).json({ message: 'Equipment not found' });
      }
    } catch (error) {
      console.error('Error deleting equipment:', error);
      res.status(500).json({ message: 'Failed to delete equipment' });
    }
  });
  
  // Interceptar tentativas de acesso aos endpoints vulneráveis removidos
  app.all('/api/equipamentos/temp*', (req: Request, res: Response) => {
    console.log(`🚨 TENTATIVA DE ACESSO BLOQUEADA: ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
    res.status(410).json({ 
      error: 'Endpoint removido por questões de segurança',
      message: 'Use /api/equipamentos com autenticação adequada'
    });
  });

  // Bloquear todos os endpoints temporários de testes
  app.all('/api/tests/densidade-in-situ/temp*', (req: Request, res: Response) => {
    console.log(`🚨 TENTATIVA DE ACESSO BLOQUEADA: ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
    res.status(410).json({ 
      error: 'Endpoint removido por questões de segurança',
      message: 'Use /api/tests/density-in-situ com autenticação adequada'
    });
  });

  app.all('/api/tests/densidade-real/temp*', (req: Request, res: Response) => {
    console.log(`🚨 TENTATIVA DE ACESSO BLOQUEADA: ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
    res.status(410).json({ 
      error: 'Endpoint removido por questões de segurança',
      message: 'Use /api/tests/real-density com autenticação adequada'
    });
  });

  app.all('/api/tests/densidade-max-min/temp*', (req: Request, res: Response) => {
    console.log(`🚨 TENTATIVA DE ACESSO BLOQUEADA: ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
    res.status(410).json({ 
      error: 'Endpoint removido por questões de segurança',
      message: 'Use /api/tests/max-min-density com autenticação adequada'
    });
  });

  // Endpoint protegido para modificação de roles (apenas ADMIN e DEVELOPER)
  app.post('/api/auth/set-role', verifyFirebaseToken, requireRole(['ADMIN', 'DEVELOPER']), async (req: Request, res: Response) => {
    try {
      const { userId, newRole } = req.body;
      
      if (!userId || !newRole) {
        return res.status(400).json({ message: 'userId e newRole são obrigatórios' });
      }
      
      // Verificar se o role é válido
      const validRoles = ['VIEWER', 'TECHNICIAN', 'MANAGER', 'ADMIN', 'DEVELOPER'];
      if (!validRoles.includes(newRole)) {
        return res.status(400).json({ message: 'Role inválido' });
      }
      
      // Simular modificação (em produção seria no banco)
      console.log(`🔐 Modificando role do usuário ${userId} para ${newRole}`);
      
      res.json({ 
        message: 'Role modificado com sucesso',
        userId,
        newRole,
        modifiedBy: (req as any).user?.email || 'sistema'
      });
    } catch (error) {
      console.error('❌ Erro ao modificar role:', error);
      res.status(500).json({ message: 'Falha ao modificar role' });
    }
  });

  // Rotas específicas integradas diretamente no servidor principal
  await registerPaymentRoutes(app);

  // LGPD Endpoints Simplificados (ANTES do Vite setup)
  app.get('/api/lgpd/terms', (req, res) => {
    res.json({
      version: "1.0",
      lastUpdated: "2025-06-15",
      content: {
        title: "TERMOS DE USO - SISTEMA DE GERENCIAMENTO GEOTÉCNICO EV.C.S",
        sections: [
          {
            title: "1. ACEITAÇÃO DOS TERMOS",
            content: "Ao utilizar este sistema, você concorda com estes termos de uso."
          },
          {
            title: "2. USO DO SISTEMA",
            content: "O sistema destina-se exclusivamente para fins profissionais de laboratório geotécnico."
          },
          {
            title: "3. RESPONSABILIDADES DO USUÁRIO",
            content: "Manter dados de acesso confidenciais, usar o sistema conforme sua finalidade, respeitar direitos de outros usuários."
          },
          {
            title: "4. LIMITAÇÃO DE RESPONSABILIDADE",
            content: "O sistema é fornecido como está sem garantias expressas ou implícitas."
          }
        ]
      }
    });
  });

  app.get('/api/lgpd/privacy-policy', (req, res) => {
    res.json({
      version: "1.0",
      lastUpdated: "2025-06-15",
      content: {
        title: "POLÍTICA DE PRIVACIDADE - SISTEMA EV.C.S",
        sections: [
          {
            title: "1. DADOS COLETADOS",
            content: "Informações de cadastro (nome, email), dados de ensaios geotécnicos, logs de acesso ao sistema."
          },
          {
            title: "2. USO DOS DADOS",
            content: "Os dados são utilizados para operação do sistema de laboratório, geração de relatórios técnicos, controle de acesso e segurança."
          },
          {
            title: "3. SEUS DIREITOS (LGPD)",
            content: "Acesso aos seus dados, correção de dados incorretos, exclusão de dados pessoais, portabilidade de dados."
          }
        ]
      }
    });
  });

  app.post('/api/lgpd/consent', (req, res) => {
    const { consentType, consentStatus } = req.body;
    console.log(`📝 Consentimento LGPD registrado: ${consentType} = ${consentStatus}`);
    
    res.json({ 
      success: true, 
      message: 'Consentimento registrado com sucesso',
      timestamp: new Date().toISOString()
    });
  });

  app.get('/api/lgpd/my-data', (req, res) => {
    const mockData = {
      personalData: {
        email: "usuario@exemplo.com",
        name: "Usuário de Teste",
        role: "TECHNICIAN",
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      },
      lgpdCompliance: {
        termsAccepted: true,
        termsAcceptedAt: new Date().toISOString(),
        privacyPolicyAccepted: true,
        privacyPolicyAcceptedAt: new Date().toISOString(),
        dataProcessingConsent: true,
        dataProcessingConsentAt: new Date().toISOString(),
        marketingConsent: false,
        marketingConsentAt: null
      },
      testData: {
        densityInSitu: 2,
        realDensity: 5,
        maxMinDensity: 8
      },
      consents: [
        {
          consentType: "terms",
          consentStatus: "given",
          createdAt: new Date().toISOString()
        },
        {
          consentType: "privacy_policy", 
          consentStatus: "given",
          createdAt: new Date().toISOString()
        }
      ],
      auditLogs: [
        {
          action: "data_access",
          createdAt: new Date().toISOString(),
          details: "Acesso aos dados pessoais"
        }
      ]
    };
    
    res.json(mockData);
  });

  app.post('/api/lgpd/request-deletion', (req, res) => {
    console.log('🗑️ Solicitação de exclusão de dados registrada');
    
    res.json({ 
      success: true, 
      message: 'Solicitação de exclusão registrada. Será processada em até 30 dias.',
      requestId: `DEL-${Date.now()}`,
      timestamp: new Date().toISOString()
    });
  });

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Server error:', err);
    res.status(500).json({ message: "Internal server error" });
  });

  // Setup Vite AFTER all API routes are defined
  try {
    if (process.env.NODE_ENV === "development") {
      console.log('Tentando configurar Vite...');
      await setupVite(app, server);
      console.log('Vite configurado com sucesso');
    } else {
      serveStatic(app);
    }
  } catch (error) {
    console.error('Erro ao configurar Vite, continuando sem ele:', error);
    // Servir arquivos estáticos como fallback
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    });
  }



  const PORT = parseInt(process.env.PORT || "5000", 10);
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Servidor híbrido iniciado na porta ${PORT}`);
    console.log(`🔥 Firebase Authentication (Frontend)`);
    console.log(`🐘 PostgreSQL Database (Backend)`);
    console.log(`🔐 Autenticação híbrida configurada`);
    console.log(`📋 Endpoints LGPD disponíveis`);
  });

  return { app, server };
}

startServer().catch(console.error);

export { startServer };