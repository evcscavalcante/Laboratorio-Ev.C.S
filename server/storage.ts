import { 
  densityInSituTests,
  realDensityTests,
  maxMinDensityTests,
  type DensityInSituTest,
  type RealDensityTest,
  type MaxMinDensityTest,
  type InsertDensityInSituTest,
  type InsertRealDensityTest,
  type InsertMaxMinDensityTest,
  type User,
  type InsertUser
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
      user.username === username || user.email === username
    );
  }

  async createUser(userData: any): Promise<User> {
    const userId = userData.id || String(Date.now());
    const user: User = {
      id: userId,
      username: userData.username || userData.email?.split('@')[0] || 'user',
      name: userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
      email: userData.email || null,
      password: userData.password || '',
      role: userData.role || 'VIEWER',
      organizationId: userData.organizationId || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      active: userData.active !== undefined ? userData.active : true,
      permissions: userData.permissions || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null
    };
    
    this.users.set(user.id, user);
    return user;
  }

  async upsertUser(userData: any): Promise<User> {
    const existingUser = userData.id ? this.users.get(userData.id) : null;
    const userId = userData.id || String(Date.now());
    
    const user: User = {
      id: userId,
      username: userData.username || userData.email?.split('@')[0] || 'user',
      name: userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
      email: userData.email || null,
      password: userData.password || '',
      role: userData.role || 'VIEWER',
      organizationId: userData.organizationId || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      active: userData.active !== undefined ? userData.active : true,
      permissions: userData.permissions || null,
      createdAt: existingUser?.createdAt || new Date(),
      updatedAt: new Date(),
      lastLogin: existingUser?.lastLogin || null
    };
    
    this.users.set(user.id, user);
    return user;
  }
}

export const storage = new MemStorage();
