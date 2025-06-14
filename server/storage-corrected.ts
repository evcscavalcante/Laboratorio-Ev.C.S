import { db } from './db';
import { users, densityInSituTests, realDensityTests, maxMinDensityTests } from '../shared/schema';
import { eq } from 'drizzle-orm';
import type { 
  InsertUser, 
  SelectUser, 
  InsertDensityInSituTest, 
  SelectDensityInSituTest,
  InsertRealDensityTest,
  SelectRealDensityTest,
  InsertMaxMinDensityTest,
  SelectMaxMinDensityTest
} from '../shared/schema';

export interface IStorage {
  // User operations
  getUserByFirebaseUid(firebase_uid: string): Promise<SelectUser | null>;
  getUserById(id: number): Promise<SelectUser | null>;
  createUser(user: InsertUser): Promise<SelectUser>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<SelectUser | null>;
  getAllUsers(): Promise<SelectUser[]>;

  // Density In-Situ Test operations
  getDensityInSituTests(): Promise<SelectDensityInSituTest[]>;
  getDensityInSituTestById(id: number): Promise<SelectDensityInSituTest | null>;
  createDensityInSituTest(test: InsertDensityInSituTest): Promise<SelectDensityInSituTest>;
  updateDensityInSituTest(id: number, updates: Partial<InsertDensityInSituTest>): Promise<SelectDensityInSituTest | null>;
  deleteDensityInSituTest(id: number): Promise<boolean>;

  // Real Density Test operations
  getRealDensityTests(): Promise<SelectRealDensityTest[]>;
  getRealDensityTestById(id: number): Promise<SelectRealDensityTest | null>;
  createRealDensityTest(test: InsertRealDensityTest): Promise<SelectRealDensityTest>;
  updateRealDensityTest(id: number, updates: Partial<InsertRealDensityTest>): Promise<SelectRealDensityTest | null>;
  deleteRealDensityTest(id: number): Promise<boolean>;

  // Max/Min Density Test operations
  getMaxMinDensityTests(): Promise<SelectMaxMinDensityTest[]>;
  getMaxMinDensityTestById(id: number): Promise<SelectMaxMinDensityTest | null>;
  createMaxMinDensityTest(test: InsertMaxMinDensityTest): Promise<SelectMaxMinDensityTest>;
  updateMaxMinDensityTest(id: number, updates: Partial<InsertMaxMinDensityTest>): Promise<SelectMaxMinDensityTest | null>;
  deleteMaxMinDensityTest(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUserByFirebaseUid(firebase_uid: string): Promise<SelectUser | null> {
    const result = await db.select().from(users).where(eq(users.firebase_uid, firebase_uid)).limit(1);
    return result[0] || null;
  }

  async getUserById(id: number): Promise<SelectUser | null> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0] || null;
  }

  async createUser(user: InsertUser): Promise<SelectUser> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<SelectUser | null> {
    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0] || null;
  }

  async getAllUsers(): Promise<SelectUser[]> {
    return await db.select().from(users);
  }

  // Density In-Situ Test operations
  async getDensityInSituTests(): Promise<SelectDensityInSituTest[]> {
    return await db.select().from(densityInSituTests).orderBy(densityInSituTests.id);
  }

  async getDensityInSituTestById(id: number): Promise<SelectDensityInSituTest | null> {
    const result = await db.select().from(densityInSituTests).where(eq(densityInSituTests.id, id)).limit(1);
    return result[0] || null;
  }

  async createDensityInSituTest(test: InsertDensityInSituTest): Promise<SelectDensityInSituTest> {
    const result = await db.insert(densityInSituTests).values(test).returning();
    return result[0];
  }

  async updateDensityInSituTest(id: number, updates: Partial<InsertDensityInSituTest>): Promise<SelectDensityInSituTest | null> {
    const result = await db.update(densityInSituTests).set(updates).where(eq(densityInSituTests.id, id)).returning();
    return result[0] || null;
  }

  async deleteDensityInSituTest(id: number): Promise<boolean> {
    const result = await db.delete(densityInSituTests).where(eq(densityInSituTests.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Real Density Test operations
  async getRealDensityTests(): Promise<SelectRealDensityTest[]> {
    return await db.select().from(realDensityTests).orderBy(realDensityTests.id);
  }

  async getRealDensityTestById(id: number): Promise<SelectRealDensityTest | null> {
    const result = await db.select().from(realDensityTests).where(eq(realDensityTests.id, id)).limit(1);
    return result[0] || null;
  }

  async createRealDensityTest(test: InsertRealDensityTest): Promise<SelectRealDensityTest> {
    const result = await db.insert(realDensityTests).values(test).returning();
    return result[0];
  }

  async updateRealDensityTest(id: number, updates: Partial<InsertRealDensityTest>): Promise<SelectRealDensityTest | null> {
    const result = await db.update(realDensityTests).set(updates).where(eq(realDensityTests.id, id)).returning();
    return result[0] || null;
  }

  async deleteRealDensityTest(id: number): Promise<boolean> {
    const result = await db.delete(realDensityTests).where(eq(realDensityTests.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Max/Min Density Test operations
  async getMaxMinDensityTests(): Promise<SelectMaxMinDensityTest[]> {
    return await db.select().from(maxMinDensityTests).orderBy(maxMinDensityTests.id);
  }

  async getMaxMinDensityTestById(id: number): Promise<SelectMaxMinDensityTest | null> {
    const result = await db.select().from(maxMinDensityTests).where(eq(maxMinDensityTests.id, id)).limit(1);
    return result[0] || null;
  }

  async createMaxMinDensityTest(test: InsertMaxMinDensityTest): Promise<SelectMaxMinDensityTest> {
    const result = await db.insert(maxMinDensityTests).values(test).returning();
    return result[0];
  }

  async updateMaxMinDensityTest(id: number, updates: Partial<InsertMaxMinDensityTest>): Promise<SelectMaxMinDensityTest | null> {
    const result = await db.update(maxMinDensityTests).set(updates).where(eq(maxMinDensityTests.id, id)).returning();
    return result[0] || null;
  }

  async deleteMaxMinDensityTest(id: number): Promise<boolean> {
    const result = await db.delete(maxMinDensityTests).where(eq(maxMinDensityTests.id, id));
    return (result.rowCount || 0) > 0;
  }
}

export const storage = new DatabaseStorage();