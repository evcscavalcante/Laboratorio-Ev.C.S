import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import session from "express-session";
import cors from "cors";
import path from "path";
import hybridAuthRoutes, { verifyFirebaseToken } from "./auth-firebase-hybrid";
import { registerRoutes } from "./routes";
import { registerPaymentRoutes } from "./payment-routes";
import { setupVite, serveStatic } from "./vite";
import MemoryStore from "memorystore";
import { simpleOrgManager, requireRole } from "./simple-org-management";
import { db } from "./db";
import { subscriptionPlans, users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { initializeAdminUser } from "./init-admin";
import { storage } from "./storage-corrected";
import { observability } from "./observability-simple";
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
        // Só verificar se não for vazio
        if (buf.length > 0) {
          JSON.parse(buf.toString());
        }
      } catch (e) {
        const error = e as Error;
        console.error('❌ Erro de parsing JSON:', error.message, 'Body:', buf.toString());
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

  // Endpoints de observabilidade
  app.get('/api/health', (req, res) => {
    const health = observability.getHealthStatus();
    res.json(health);
  });

  app.get('/api/metrics', (req, res) => {
    const metrics = observability.getMetrics();
    res.json(metrics);
  });

  // Rotas de segurança otimizadas

  // Firebase Authentication routes com rate limiting
  app.use('/api/auth', authRateLimit, hybridAuthRoutes);
  app.use('/api', apiRateLimit);

  // Current user endpoint (protected by Firebase token)
  app.get('/api/auth/user', verifyFirebaseToken, (req: Request, res: Response) => {
    res.json({ user: req.user });
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
    const user = req.user as any;
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
  app.get("/api/admin/users", verifyFirebaseToken, requireRole('ADMIN'), async (req: Request, res: Response) => {
    try {
      const allUsers = await db.select().from(users);
      res.json(allUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: "Error fetching users" });
    }
  });

  // Developer system info (DEVELOPER only) 
  app.get("/api/developer/system-info", verifyFirebaseToken, requireRole('DEVELOPER'), (req: Request, res: Response) => {
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

  // Rota temporária para buscar ensaios sem autenticação
  app.get('/api/ensaios/densidade-in-situ/temp', async (req: Request, res: Response) => {
    try {
      const tests = await storage.getDensityInSituTests();
      console.log('📋 Ensaios densidade in-situ encontrados:', tests.length);
      res.json(tests);
    } catch (error) {
      console.error('Erro ao buscar ensaios de densidade in situ:', error);
      res.status(500).json({ message: 'Falha ao buscar ensaios' });
    }
  });

  // Rota temporária sem autenticação para testes
  app.post('/api/ensaios/densidade-in-situ/temp', async (req: Request, res: Response) => {
    try {
      console.log('📥 Recebendo dados do ensaio (temp):', JSON.stringify(req.body, null, 2));
      
      // Remover userId para evitar erro de foreign key
      const testData = {
        ...req.body,
        userId: null,
        createdBy: 'sistema-temp'
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

  app.post('/api/tests/density-in-situ', verifyFirebaseToken, async (req: Request, res: Response) => {
    try {
      console.log('📥 Recebendo dados do ensaio:', JSON.stringify(req.body, null, 2));
      console.log('👤 Usuário autenticado:', req.user);
      
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

  // Rota temporária para buscar ensaios de densidade real sem autenticação
  app.get('/api/tests/densidade-real/temp', async (req: Request, res: Response) => {
    try {
      const tests = await storage.getRealDensityTests();
      console.log('📋 Ensaios densidade real encontrados:', tests.length);
      res.json(tests);
    } catch (error) {
      console.error('Erro ao buscar ensaios densidade real:', error);
      res.status(500).json({ message: 'Falha ao buscar ensaios' });
    }
  });

  // Rota temporária para salvar ensaios de densidade real sem autenticação
  app.post('/api/tests/densidade-real/temp', async (req: Request, res: Response) => {
    try {
      console.log('📥 Recebendo dados do ensaio densidade real (temp):', JSON.stringify(req.body, null, 2));
      
      const testData = {
        ...req.body,
        userId: null,
        createdBy: 'sistema-temp'
      };
      
      console.log('📝 Dados preparados para salvamento:', JSON.stringify(testData, null, 2));
      
      const test = await storage.createRealDensityTest(testData);
      console.log('✅ Ensaio densidade real salvo com sucesso:', test);
      
      res.status(201).json(test);
    } catch (error) {
      console.error('❌ Erro detalhado ao criar ensaio densidade real:', error);
      console.error('📊 Stack trace:', (error as Error).stack);
      res.status(500).json({ message: 'Failed to create test', error: (error as Error).message });
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

  // Rota temporária para buscar ensaios máx/mín sem autenticação
  app.get('/api/tests/densidade-max-min/temp', async (req: Request, res: Response) => {
    try {
      const tests = await storage.getMaxMinDensityTests();
      console.log('📋 Ensaios máx/mín encontrados:', tests.length);
      res.json(tests);
    } catch (error) {
      console.error('Erro ao buscar ensaios máx/mín:', error);
      res.status(500).json({ message: 'Falha ao buscar ensaios' });
    }
  });

  // Rota temporária para salvar ensaios máx/mín sem autenticação
  app.post('/api/tests/densidade-max-min/temp', async (req: Request, res: Response) => {
    try {
      console.log('📥 Recebendo dados do ensaio máx/mín (temp):', JSON.stringify(req.body, null, 2));
      
      const testData = {
        ...req.body,
        userId: null,
        createdBy: 'sistema-temp'
      };
      
      console.log('📝 Dados preparados para salvamento:', JSON.stringify(testData, null, 2));
      
      const test = await storage.createMaxMinDensityTest(testData);
      console.log('✅ Ensaio máx/mín salvo com sucesso:', test);
      
      res.status(201).json(test);
    } catch (error) {
      console.error('❌ Erro detalhado ao criar ensaio máx/mín:', error);
      console.error('📊 Stack trace:', (error as Error).stack);
      res.status(500).json({ message: 'Failed to create test', error: (error as Error).message });
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

  // Equipamentos API endpoints
  app.get('/api/equipamentos', verifyFirebaseToken, async (req: Request, res: Response) => {
    try {
      // Por enquanto, retornar array vazio até implementar no storage
      res.json([]);
    } catch (error) {
      console.error('Error fetching equipamentos:', error);
      res.status(500).json({ message: 'Failed to fetch equipamentos' });
    }
  });

  app.post('/api/equipamentos', verifyFirebaseToken, async (req: Request, res: Response) => {
    try {
      // Simular salvamento bem-sucedido
      const equipamento = { ...req.body, id: req.body.id || crypto.randomUUID() };
      res.status(201).json(equipamento);
    } catch (error) {
      console.error('Error creating equipamento:', error);
      res.status(500).json({ message: 'Failed to create equipamento' });
    }
  });

  app.delete('/api/equipamentos/:id', verifyFirebaseToken, async (req: Request, res: Response) => {
    try {
      // Simular exclusão bem-sucedida
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting equipamento:', error);
      res.status(500).json({ message: 'Failed to delete equipamento' });
    }
  });

  // Register additional routes
  await registerRoutes(app);
  await registerPaymentRoutes(app);

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
  });

  return { app, server };
}

startServer().catch(console.error);

export { startServer };