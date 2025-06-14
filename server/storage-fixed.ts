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
    try {
      const [user] = await db.select().from(users).where(eq(users.id, parseInt(id)));
      return user || undefined;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUsers(): Promise<User[]> {
    try {
      return await db.select().from(users);
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, username));
      return user || undefined;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async createUser(userData: InsertUser): Promise<User> {
    try {
      const [user] = await db.insert(users).values(userData).returning();
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async upsertUser(userData: InsertUser): Promise<User> {
    try {
      // Try to find existing user by firebase_uid
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
    } catch (error) {
      console.error('Error upserting user:', error);
      throw error;
    }
  }

  // Density In Situ Tests
  async createDensityInSituTest(test: InsertDensityInSituTest): Promise<DensityInSituTest> {
    try {
      const [newTest] = await db.insert(densityInSituTests).values(test).returning();
      return newTest;
    } catch (error) {
      console.error('Error creating density in situ test:', error);
      throw error;
    }
  }

  async getDensityInSituTest(id: number): Promise<DensityInSituTest | undefined> {
    try {
      const [test] = await db.select().from(densityInSituTests).where(eq(densityInSituTests.id, id));
      return test || undefined;
    } catch (error) {
      console.error('Error getting density in situ test:', error);
      return undefined;
    }
  }

  async getDensityInSituTests(): Promise<DensityInSituTest[]> {
    try {
      return await db.select().from(densityInSituTests);
    } catch (error) {
      console.error('Error getting density in situ tests:', error);
      return [];
    }
  }

  async updateDensityInSituTest(id: number, updates: Partial<InsertDensityInSituTest>): Promise<DensityInSituTest | undefined> {
    try {
      const [updatedTest] = await db
        .update(densityInSituTests)
        .set(updates)
        .where(eq(densityInSituTests.id, id))
        .returning();
      return updatedTest || undefined;
    } catch (error) {
      console.error('Error updating density in situ test:', error);
      return undefined;
    }
  }

  async deleteDensityInSituTest(id: number): Promise<boolean> {
    try {
      const result = await db.delete(densityInSituTests).where(eq(densityInSituTests.id, id));
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Error deleting density in situ test:', error);
      return false;
    }
  }

  // Real Density Tests
  async createRealDensityTest(test: InsertRealDensityTest): Promise<RealDensityTest> {
    try {
      const [newTest] = await db.insert(realDensityTests).values(test).returning();
      return newTest;
    } catch (error) {
      console.error('Error creating real density test:', error);
      throw error;
    }
  }

  async getRealDensityTest(id: number): Promise<RealDensityTest | undefined> {
    try {
      const [test] = await db.select().from(realDensityTests).where(eq(realDensityTests.id, id));
      return test || undefined;
    } catch (error) {
      console.error('Error getting real density test:', error);
      return undefined;
    }
  }

  async getRealDensityTests(): Promise<RealDensityTest[]> {
    try {
      return await db.select().from(realDensityTests);
    } catch (error) {
      console.error('Error getting real density tests:', error);
      return [];
    }
  }

  async updateRealDensityTest(id: number, updates: Partial<InsertRealDensityTest>): Promise<RealDensityTest | undefined> {
    try {
      const [updatedTest] = await db
        .update(realDensityTests)
        .set(updates)
        .where(eq(realDensityTests.id, id))
        .returning();
      return updatedTest || undefined;
    } catch (error) {
      console.error('Error updating real density test:', error);
      return undefined;
    }
  }

  async deleteRealDensityTest(id: number): Promise<boolean> {
    try {
      const result = await db.delete(realDensityTests).where(eq(realDensityTests.id, id));
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Error deleting real density test:', error);
      return false;
    }
  }

  // Max Min Density Tests
  async createMaxMinDensityTest(test: InsertMaxMinDensityTest): Promise<MaxMinDensityTest> {
    try {
      const [newTest] = await db.insert(maxMinDensityTests).values(test).returning();
      return newTest;
    } catch (error) {
      console.error('Error creating max min density test:', error);
      throw error;
    }
  }

  async getMaxMinDensityTest(id: number): Promise<MaxMinDensityTest | undefined> {
    try {
      const [test] = await db.select().from(maxMinDensityTests).where(eq(maxMinDensityTests.id, id));
      return test || undefined;
    } catch (error) {
      console.error('Error getting max min density test:', error);
      return undefined;
    }
  }

  async getMaxMinDensityTests(): Promise<MaxMinDensityTest[]> {
    try {
      return await db.select().from(maxMinDensityTests);
    } catch (error) {
      console.error('Error getting max min density tests:', error);
      return [];
    }
  }

  async updateMaxMinDensityTest(id: number, updates: Partial<InsertMaxMinDensityTest>): Promise<MaxMinDensityTest | undefined> {
    try {
      const [updatedTest] = await db
        .update(maxMinDensityTests)
        .set(updates)
        .where(eq(maxMinDensityTests.id, id))
        .returning();
      return updatedTest || undefined;
    } catch (error) {
      console.error('Error updating max min density test:', error);
      return undefined;
    }
  }

  async deleteMaxMinDensityTest(id: number): Promise<boolean> {
    try {
      const result = await db.delete(maxMinDensityTests).where(eq(maxMinDensityTests.id, id));
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Error deleting max min density test:', error);
      return false;
    }
  }
}

export const storage = new DatabaseStorage();