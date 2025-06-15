import { 
  densityInSituTests,
  realDensityTests,
  maxMinDensityTests,
  capsulas,
  cilindros,
  type DensityInSituTest,
  type RealDensityTest,
  type MaxMinDensityTest,
  type User,
  type InsertUser,
  type InsertDensityInSituTest,
  type InsertRealDensityTest,
  type InsertMaxMinDensityTest
} from "@shared/schema";

export interface IStorage {
  // User operations for Authentication
  getUser(id: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  getUserByUsername(username: string): Promise<User | undefined>;
  upsertUser(user: InsertUser): Promise<User>;
  createUser(user: InsertUser): Promise<User>;

  // Density In Situ
  createDensityInSituTest(test: InsertDensityInSituTest): Promise<DensityInSituTest>;
  getDensityInSituTest(id: number): Promise<DensityInSituTest | undefined>;
  getDensityInSituTests(): Promise<DensityInSituTest[]>;
  updateDensityInSituTest(id: number, test: Partial<InsertDensityInSituTest>): Promise<DensityInSituTest | undefined>;
  deleteDensityInSituTest(id: number): Promise<boolean>;
  
  // Real Density
  createRealDensityTest(test: InsertRealDensityTest): Promise<RealDensityTest>;
  getRealDensityTest(id: number): Promise<RealDensityTest | undefined>;
  getRealDensityTests(): Promise<RealDensityTest[]>;
  updateRealDensityTest(id: number, test: Partial<InsertRealDensityTest>): Promise<RealDensityTest | undefined>;
  deleteRealDensityTest(id: number): Promise<boolean>;
  
  // Max Min Density
  createMaxMinDensityTest(test: InsertMaxMinDensityTest): Promise<MaxMinDensityTest>;
  getMaxMinDensityTest(id: number): Promise<MaxMinDensityTest | undefined>;
  getMaxMinDensityTests(): Promise<MaxMinDensityTest[]>;
  updateMaxMinDensityTest(id: number, test: Partial<InsertMaxMinDensityTest>): Promise<MaxMinDensityTest | undefined>;
  deleteMaxMinDensityTest(id: number): Promise<boolean>;

  // Equipment - Capsulas
  createCapsula(capsula: any): Promise<any>;
  updateCapsula(id: number, capsula: any): Promise<any>;
  deleteCapsula(id: number): Promise<boolean>;
  getCapsulas(): Promise<any[]>;

  // Equipment - Cilindros
  createCilindro(cilindro: any): Promise<any>;
  updateCilindro(id: number, cilindro: any): Promise<any>;
  deleteCilindro(id: number): Promise<boolean>;
  getCilindros(): Promise<any[]>;
}

export class MemStorage implements IStorage {
  private densityInSituTests: Map<number, DensityInSituTest>;
  private realDensityTests: Map<number, RealDensityTest>;
  private maxMinDensityTests: Map<number, MaxMinDensityTest>;
  private users: Map<string, User>;
  private currentId: number;

  constructor() {
    this.densityInSituTests = new Map();
    this.realDensityTests = new Map();
    this.maxMinDensityTests = new Map();
    this.users = new Map();
    this.currentId = 1;
  }

  // Density In Situ Methods
  async createDensityInSituTest(insertTest: InsertDensityInSituTest): Promise<DensityInSituTest> {
    const id = this.currentId++;
    const test = { 
      id, 
      createdAt: new Date(),
      date: insertTest.date,
      registrationNumber: insertTest.registrationNumber,
      time: insertTest.time || null,
      operator: insertTest.operator,
      technicalResponsible: insertTest.technicalResponsible || null,
      verifier: insertTest.verifier || null,
      material: insertTest.material,
      origin: insertTest.origin || null,
      coordinates: insertTest.coordinates || null,
      quadrant: insertTest.quadrant || null,
      layer: insertTest.layer || null,
      balanceId: insertTest.balanceId || null,
      ovenId: insertTest.ovenId || null,
      realDensityRef: insertTest.realDensityRef || null,
      maxMinDensityRef: insertTest.maxMinDensityRef || null,
      userId: insertTest.userId || null,
      createdBy: insertTest.createdBy || null,
      updatedBy: insertTest.updatedBy || null,
      determinations: insertTest.determinations || null,
      moistureTop: insertTest.moistureTop || null,
      moistureBase: insertTest.moistureBase || null,
      results: insertTest.results || null
    } as DensityInSituTest;
    this.densityInSituTests.set(id, test);
    return test;
  }

  async getDensityInSituTest(id: number): Promise<DensityInSituTest | undefined> {
    return this.densityInSituTests.get(id);
  }

  async getDensityInSituTests(): Promise<DensityInSituTest[]> {
    return Array.from(this.densityInSituTests.values());
  }

  async updateDensityInSituTest(id: number, updates: Partial<InsertDensityInSituTest>): Promise<DensityInSituTest | undefined> {
    const existing = this.densityInSituTests.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates } as DensityInSituTest;
    this.densityInSituTests.set(id, updated);
    return updated;
  }

  async deleteDensityInSituTest(id: number): Promise<boolean> {
    return this.densityInSituTests.delete(id);
  }

  // Real Density Methods
  async createRealDensityTest(insertTest: InsertRealDensityTest): Promise<RealDensityTest> {
    const id = this.currentId++;
    const test = { 
      id, 
      createdAt: new Date(),
      date: insertTest.date,
      registrationNumber: insertTest.registrationNumber,
      operator: insertTest.operator,
      material: insertTest.material,
      origin: insertTest.origin || null,
      userId: insertTest.userId || null,
      createdBy: insertTest.createdBy || null,
      updatedBy: insertTest.updatedBy || null,
      results: insertTest.results || null,
      moisture: insertTest.moisture || null,
      picnometer: insertTest.picnometer || null
    } as RealDensityTest;
    this.realDensityTests.set(id, test);
    return test;
  }

  async getRealDensityTest(id: number): Promise<RealDensityTest | undefined> {
    return this.realDensityTests.get(id);
  }

  async getRealDensityTests(): Promise<RealDensityTest[]> {
    return Array.from(this.realDensityTests.values());
  }

  async updateRealDensityTest(id: number, updates: Partial<InsertRealDensityTest>): Promise<RealDensityTest | undefined> {
    const existing = this.realDensityTests.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates } as RealDensityTest;
    this.realDensityTests.set(id, updated);
    return updated;
  }

  async deleteRealDensityTest(id: number): Promise<boolean> {
    return this.realDensityTests.delete(id);
  }

  // Max Min Density Methods
  async createMaxMinDensityTest(insertTest: InsertMaxMinDensityTest): Promise<MaxMinDensityTest> {
    const id = this.currentId++;
    const test = { 
      id, 
      createdAt: new Date(),
      date: insertTest.date,
      registrationNumber: insertTest.registrationNumber,
      operator: insertTest.operator,
      material: insertTest.material,
      origin: insertTest.origin || null,
      userId: insertTest.userId || null,
      createdBy: insertTest.createdBy || null,
      updatedBy: insertTest.updatedBy || null,
      results: insertTest.results || null,
      maxDensity: insertTest.maxDensity || null,
      minDensity: insertTest.minDensity || null
    } as MaxMinDensityTest;
    this.maxMinDensityTests.set(id, test);
    return test;
  }

  async getMaxMinDensityTest(id: number): Promise<MaxMinDensityTest | undefined> {
    return this.maxMinDensityTests.get(id);
  }

  async getMaxMinDensityTests(): Promise<MaxMinDensityTest[]> {
    return Array.from(this.maxMinDensityTests.values());
  }

  async updateMaxMinDensityTest(id: number, updates: Partial<InsertMaxMinDensityTest>): Promise<MaxMinDensityTest | undefined> {
    const existing = this.maxMinDensityTests.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates } as MaxMinDensityTest;
    this.maxMinDensityTests.set(id, updated);
    return updated;
  }

  async deleteMaxMinDensityTest(id: number): Promise<boolean> {
    return this.maxMinDensityTests.delete(id);
  }

  // User Management Methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => 
      user.email === username
    );
  }

  async createUser(userData: any): Promise<User> {
    const userId = userData.id || Date.now();
    const user: User = {
      id: userId,
      firebase_uid: userData.firebase_uid || null,
      email: userData.email || null,
      name: userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
      role: userData.role || 'VIEWER',
      organizationId: userData.organizationId || null,
      permissions: userData.permissions || null,
      active: userData.active !== false,
      lastLogin: null,
      // LGPD Compliance Fields
      termsAccepted: userData.termsAccepted || false,
      termsAcceptedAt: userData.termsAcceptedAt || null,
      privacyPolicyAccepted: userData.privacyPolicyAccepted || false,
      privacyPolicyAcceptedAt: userData.privacyPolicyAcceptedAt || null,
      dataProcessingConsent: userData.dataProcessingConsent || false,
      dataProcessingConsentAt: userData.dataProcessingConsentAt || null,
      marketingConsent: userData.marketingConsent || false,
      marketingConsentAt: userData.marketingConsentAt || null,
      dataRetentionConsent: userData.dataRetentionConsent || false,
      dataRetentionConsentAt: userData.dataRetentionConsentAt || null,
      // Data Subject Rights
      dataExportRequested: userData.dataExportRequested || false,
      dataExportRequestedAt: userData.dataExportRequestedAt || null,
      dataDeleteRequested: userData.dataDeleteRequested || false,
      dataDeleteRequestedAt: userData.dataDeleteRequestedAt || null,
      dataDeleteExecutedAt: userData.dataDeleteExecutedAt || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.users.set(String(user.id), user);
    return user;
  }

  async upsertUser(userData: any): Promise<User> {
    const existingUser = userData.id ? this.users.get(String(userData.id)) : null;
    const userId = userData.id || Date.now();
    
    const user: User = {
      id: userId,
      firebase_uid: userData.firebase_uid || null,
      email: userData.email || null,
      name: userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
      role: userData.role || 'VIEWER',
      organizationId: userData.organizationId || null,
      permissions: userData.permissions || null,
      active: userData.active !== false,
      lastLogin: existingUser?.lastLogin || null,
      // LGPD Compliance Fields
      termsAccepted: userData.termsAccepted || existingUser?.termsAccepted || false,
      termsAcceptedAt: userData.termsAcceptedAt || existingUser?.termsAcceptedAt || null,
      privacyPolicyAccepted: userData.privacyPolicyAccepted || existingUser?.privacyPolicyAccepted || false,
      privacyPolicyAcceptedAt: userData.privacyPolicyAcceptedAt || existingUser?.privacyPolicyAcceptedAt || null,
      dataProcessingConsent: userData.dataProcessingConsent || existingUser?.dataProcessingConsent || false,
      dataProcessingConsentAt: userData.dataProcessingConsentAt || existingUser?.dataProcessingConsentAt || null,
      marketingConsent: userData.marketingConsent || existingUser?.marketingConsent || false,
      marketingConsentAt: userData.marketingConsentAt || existingUser?.marketingConsentAt || null,
      dataRetentionConsent: userData.dataRetentionConsent || existingUser?.dataRetentionConsent || false,
      dataRetentionConsentAt: userData.dataRetentionConsentAt || existingUser?.dataRetentionConsentAt || null,
      // Data Subject Rights
      dataExportRequested: userData.dataExportRequested || existingUser?.dataExportRequested || false,
      dataExportRequestedAt: userData.dataExportRequestedAt || existingUser?.dataExportRequestedAt || null,
      dataDeleteRequested: userData.dataDeleteRequested || existingUser?.dataDeleteRequested || false,
      dataDeleteRequestedAt: userData.dataDeleteRequestedAt || existingUser?.dataDeleteRequestedAt || null,
      dataDeleteExecutedAt: userData.dataDeleteExecutedAt || existingUser?.dataDeleteExecutedAt || null,
      createdAt: existingUser?.createdAt || new Date(),
      updatedAt: new Date()
    };
    
    this.users.set(String(user.id), user);
    return user;
  }

  // Equipment - Capsulas methods (stub implementation for interface compliance)
  async createCapsula(capsula: any): Promise<any> {
    // This method will use the real PostgreSQL implementation in the server
    throw new Error("Use real PostgreSQL implementation");
  }

  async updateCapsula(id: number, capsula: any): Promise<any> {
    throw new Error("Use real PostgreSQL implementation");
  }

  async deleteCapsula(id: number): Promise<boolean> {
    throw new Error("Use real PostgreSQL implementation");
  }

  async getCapsulas(): Promise<any[]> {
    throw new Error("Use real PostgreSQL implementation");
  }

  // Equipment - Cilindros methods (stub implementation for interface compliance)
  async createCilindro(cilindro: any): Promise<any> {
    throw new Error("Use real PostgreSQL implementation");
  }

  async updateCilindro(id: number, cilindro: any): Promise<any> {
    throw new Error("Use real PostgreSQL implementation");
  }

  async deleteCilindro(id: number): Promise<boolean> {
    throw new Error("Use real PostgreSQL implementation");
  }

  async getCilindros(): Promise<any[]> {
    throw new Error("Use real PostgreSQL implementation");
  }
}

export const storage = new MemStorage();
