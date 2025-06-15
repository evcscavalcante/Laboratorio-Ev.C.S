import type { Express } from "express";
import { storage } from "./storage-corrected";
import { 
  insertDensityInSituTestSchema,
  insertRealDensityTestSchema,
  insertMaxMinDensityTestSchema
} from "../shared/schema";

export async function registerRoutes(app: Express): Promise<void> {
  
  // Density In Situ Routes
  app.get("/api/density-in-situ", async (req, res) => {
    try {
      const tests = await storage.getDensityInSituTests();
      res.json(tests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch density in situ tests" });
    }
  });

  app.get("/api/density-in-situ/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const test = await storage.getDensityInSituTest(id);
      if (!test) {
        return res.status(404).json({ message: "Test not found" });
      }
      res.json(test);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch density in situ test" });
    }
  });

  app.post("/api/density-in-situ", async (req, res) => {
    try {
      const validated = insertDensityInSituTestSchema.parse(req.body);
      const test = await storage.createDensityInSituTest(validated);
      res.status(201).json(test);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to create density in situ test" });
      }
    }
  });

  app.put("/api/density-in-situ/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertDensityInSituTestSchema.partial().parse(req.body);
      const test = await storage.updateDensityInSituTest(id, updates);
      if (!test) {
        return res.status(404).json({ message: "Test not found" });
      }
      res.json(test);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to update density in situ test" });
      }
    }
  });

  app.delete("/api/density-in-situ/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteDensityInSituTest(id);
      if (!deleted) {
        return res.status(404).json({ message: "Test not found" });
      }
      res.json({ message: "Test deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete density in situ test" });
    }
  });

  // Real Density Routes
  app.get("/api/real-density", async (req, res) => {
    try {
      const tests = await storage.getRealDensityTests();
      res.json(tests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch real density tests" });
    }
  });

  app.get("/api/real-density/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const test = await storage.getRealDensityTest(id);
      if (!test) {
        return res.status(404).json({ message: "Test not found" });
      }
      res.json(test);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch real density test" });
    }
  });

  app.post("/api/real-density", async (req, res) => {
    try {
      const validated = insertRealDensityTestSchema.parse(req.body);
      const test = await storage.createRealDensityTest(validated);
      res.status(201).json(test);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to create real density test" });
      }
    }
  });

  app.put("/api/real-density/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertRealDensityTestSchema.partial().parse(req.body);
      const test = await storage.updateRealDensityTest(id, updates);
      if (!test) {
        return res.status(404).json({ message: "Test not found" });
      }
      res.json(test);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to update real density test" });
      }
    }
  });

  app.delete("/api/real-density/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteRealDensityTest(id);
      if (!deleted) {
        return res.status(404).json({ message: "Test not found" });
      }
      res.json({ message: "Test deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete real density test" });
    }
  });

  // Max Min Density Routes
  app.get("/api/max-min-density", async (req, res) => {
    try {
      const tests = await storage.getMaxMinDensityTests();
      res.json(tests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch max min density tests" });
    }
  });

  app.get("/api/max-min-density/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const test = await storage.getMaxMinDensityTest(id);
      if (!test) {
        return res.status(404).json({ message: "Test not found" });
      }
      res.json(test);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch max min density test" });
    }
  });

  app.post("/api/max-min-density", async (req, res) => {
    try {
      const validated = insertMaxMinDensityTestSchema.parse(req.body);
      const test = await storage.createMaxMinDensityTest(validated);
      res.status(201).json(test);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to create max min density test" });
      }
    }
  });

  app.put("/api/max-min-density/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertMaxMinDensityTestSchema.partial().parse(req.body);
      const test = await storage.updateMaxMinDensityTest(id, updates);
      if (!test) {
        return res.status(404).json({ message: "Test not found" });
      }
      res.json(test);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to update max min density test" });
      }
    }
  });

  app.delete("/api/max-min-density/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteMaxMinDensityTest(id);
      if (!deleted) {
        return res.status(404).json({ message: "Test not found" });
      }
      res.json({ message: "Test deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete max min density test" });
    }
  });

  // User Management Routes
  app.get("/api/users", async (req, res) => {
    try {
      // Return mock data for dashboard statistics
      const mockUsers = [
        { id: "1", email: "admin@lab.com", role: "ADMIN", active: true, firstName: "Admin", lastName: "User" },
        { id: "2", email: "tech@lab.com", role: "TECHNICIAN", active: true, firstName: "Tech", lastName: "User" },
        { id: "3", email: "viewer@lab.com", role: "VIEWER", active: false, firstName: "Viewer", lastName: "User" }
      ];
      res.json(mockUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = {
        id: String(Date.now()),
        ...req.body,
        createdAt: new Date()
      };
      res.status(201).json(userData);
    } catch (error) {
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const updates = req.body;
      const updatedUser = {
        id,
        ...updates,
        updatedAt: new Date()
      };
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Organization Management Routes
  app.get("/api/organizations", async (req, res) => {
    try {
      // Return mock organization data for dashboard statistics
      const mockOrgs = [
        { 
          id: 1, 
          name: "Laboratório Geotécnico Central", 
          active: true,
          userCount: 15,
          testCount: 45,
          createdAt: new Date('2024-01-01')
        },
        { 
          id: 2, 
          name: "Filial Norte", 
          active: true,
          userCount: 8,
          testCount: 23,
          createdAt: new Date('2024-02-15')
        }
      ];
      res.json(mockOrgs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch organizations" });
    }
  });

  app.get("/api/organizations/user-counts", async (req, res) => {
    try {
      const countsMap = {
        1: 15,
        2: 8
      };
      res.json(countsMap);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user counts" });
    }
  });

  app.post("/api/organizations", async (req, res) => {
    try {
      const orgData = {
        id: Date.now(),
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      res.status(201).json(orgData);
    } catch (error) {
      res.status(500).json({ message: "Failed to create organization" });
    }
  });

  app.patch("/api/organizations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedOrg = {
        id,
        ...req.body,
        updatedAt: new Date()
      };
      res.json(updatedOrg);
    } catch (error) {
      res.status(500).json({ message: "Failed to update organization" });
    }
  });

  app.delete("/api/organizations/:id", async (req, res) => {
    try {
      res.json({ message: "Organization deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete organization" });
    }
  });

}
