import { 
  densityInSituTests,
  realDensityTests,
  maxMinDensityTests,
  users,
  type DensityInSituTest,
  type RealDensityTest,
  type MaxMinDensityTest,
  type InsertDensityInSituTest,
  type InsertRealDensityTest,
  type InsertMaxMinDensityTest,
  type User,
  type InsertUser
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  // User Management Methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, parseInt(id)));
    return user || undefined;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, username));
    return user || undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async upsertUser(userData: InsertUser): Promise<User> {
    // Try to find existing user
    const existingUser = userData.firebase_uid 
      ? (await db.select().from(users).where(eq(users.firebase_uid, userData.firebase_uid)))[0]
      : undefined;

    if (existingUser) {
      // Update existing user
      const [updatedUser] = await db
        .update(users)
        .set(userData)
        .where(eq(users.id, existingUser.id))
        .returning();
      return updatedUser;
    } else {
      // Create new user
      return await this.createUser(userData);
    }
  }

  // Density In Situ Tests
  async createDensityInSituTest(test: InsertDensityInSituTest): Promise<DensityInSituTest> {
    const [newTest] = await db.insert(densityInSituTests).values(test).returning();
    return newTest;
  }

  async getDensityInSituTest(id: number): Promise<DensityInSituTest | undefined> {
    const [test] = await db.select().from(densityInSituTests).where(eq(densityInSituTests.id, id));
    return test || undefined;
  }

  async getDensityInSituTests(): Promise<DensityInSituTest[]> {
    return await db.select().from(densityInSituTests);
  }

  async updateDensityInSituTest(id: number, updates: Partial<InsertDensityInSituTest>): Promise<DensityInSituTest | undefined> {
    const [updatedTest] = await db
      .update(densityInSituTests)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(densityInSituTests.id, id))
      .returning();
    return updatedTest || undefined;
  }

  async deleteDensityInSituTest(id: number): Promise<boolean> {
    const result = await db.delete(densityInSituTests).where(eq(densityInSituTests.id, id));
    return result.rowCount > 0;
  }

  // Real Density Tests
  async createRealDensityTest(test: InsertRealDensityTest): Promise<RealDensityTest> {
    const [newTest] = await db.insert(realDensityTests).values(test).returning();
    return newTest;
  }

  async getRealDensityTest(id: number): Promise<RealDensityTest | undefined> {
    const [test] = await db.select().from(realDensityTests).where(eq(realDensityTests.id, id));
    return test || undefined;
  }

  async getRealDensityTests(): Promise<RealDensityTest[]> {
    return await db.select().from(realDensityTests);
  }

  async updateRealDensityTest(id: number, updates: Partial<InsertRealDensityTest>): Promise<RealDensityTest | undefined> {
    const [updatedTest] = await db
      .update(realDensityTests)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(realDensityTests.id, id))
      .returning();
    return updatedTest || undefined;
  }

  async deleteRealDensityTest(id: number): Promise<boolean> {
    const result = await db.delete(realDensityTests).where(eq(realDensityTests.id, id));
    return result.rowCount > 0;
  }

  // Max Min Density Tests
  async createMaxMinDensityTest(test: InsertMaxMinDensityTest): Promise<MaxMinDensityTest> {
    const [newTest] = await db.insert(maxMinDensityTests).values(test).returning();
    return newTest;
  }

  async getMaxMinDensityTest(id: number): Promise<MaxMinDensityTest | undefined> {
    const [test] = await db.select().from(maxMinDensityTests).where(eq(maxMinDensityTests.id, id));
    return test || undefined;
  }

  async getMaxMinDensityTests(): Promise<MaxMinDensityTest[]> {
    return await db.select().from(maxMinDensityTests);
  }

  async updateMaxMinDensityTest(id: number, updates: Partial<InsertMaxMinDensityTest>): Promise<MaxMinDensityTest | undefined> {
    const [updatedTest] = await db
      .update(maxMinDensityTests)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(maxMinDensityTests.id, id))
      .returning();
    return updatedTest || undefined;
  }

  async deleteMaxMinDensityTest(id: number): Promise<boolean> {
    const result = await db.delete(maxMinDensityTests).where(eq(maxMinDensityTests.id, id));
    return result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();