import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./database-storage";
import { setupAuth } from "./auth";
import { insertSessionSchema, insertBookingSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Middleware to check if user is authenticated
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    next();
  };

  // Middleware to check if user is a teacher
  const requireTeacher = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated() || req.user.role !== "teacher") {
      return res.status(403).json({ message: "Not authorized as teacher" });
    }
    next();
  };

  // Sessions endpoints
  app.get("/api/sessions", requireAuth, async (req, res) => {
    try {
      const sessions = await storage.getAllSessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  app.get("/api/sessions/recommended", requireAuth, async (req, res) => {
    try {
      const sessions = await storage.getRecommendedSessions(req.user.id);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recommended sessions" });
    }
  });

  app.get("/api/sessions/teaching", requireAuth, requireTeacher, async (req, res) => {
    try {
      const sessions = await storage.getSessionsByTeacherId(req.user.id);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch teacher sessions" });
    }
  });

  app.get("/api/sessions/:id", requireAuth, async (req, res) => {
    try {
      const sessionId = Number(req.params.id);
      const session = await storage.getSessionById(sessionId);
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch session" });
    }
  });

  app.post("/api/sessions", requireAuth, requireTeacher, async (req, res) => {
    try {
      console.log("Session creation request body:", JSON.stringify(req.body, null, 2));
      
      // Ensure teacher ID is included
      const sessionData = {
        ...req.body,
        teacherId: req.user!.id
      };
      
      // Validate session data with our schema
      const validatedData = insertSessionSchema.parse(sessionData);
      console.log("Validated session data:", JSON.stringify(validatedData, null, 2));
      
      const session = await storage.createSession(validatedData);
      res.status(201).json(session);
    } catch (error) {
      console.error("Session creation error:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid session data", 
          errors: error.errors
        });
      }
      
      res.status(500).json({ 
        message: "Failed to create session", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.patch("/api/sessions/:id", requireAuth, requireTeacher, async (req, res) => {
    try {
      const sessionId = Number(req.params.id);
      const session = await storage.getSessionById(sessionId);
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      if (session.teacherId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to update this session" });
      }
      
      const updatedSession = await storage.updateSession(sessionId, req.body);
      res.json(updatedSession);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid session data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update session" });
    }
  });

  app.delete("/api/sessions/:id", requireAuth, requireTeacher, async (req, res) => {
    try {
      const sessionId = Number(req.params.id);
      const session = await storage.getSessionById(sessionId);
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      if (session.teacherId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to delete this session" });
      }
      
      await storage.deleteSession(sessionId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete session" });
    }
  });

  // Bookings endpoints
  app.get("/api/bookings", requireAuth, async (req, res) => {
    try {
      const bookings = await storage.getBookingsByUserId(req.user.id);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.post("/api/sessions/:id/book", requireAuth, async (req, res) => {
    try {
      const sessionId = Number(req.params.id);
      const session = await storage.getSessionById(sessionId);
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      // Check if user is a learner
      if (req.user.role !== "learner") {
        return res.status(403).json({ message: "Only learners can book sessions" });
      }
      
      // Check if session is already booked by this user
      const existingBooking = await storage.getBookingBySessionAndLearner(sessionId, req.user.id);
      if (existingBooking) {
        return res.status(400).json({ message: "You have already booked this session" });
      }
      
      // Check if session is full
      const enrolled = await storage.getSessionEnrollmentCount(sessionId);
      if (enrolled >= session.capacity) {
        return res.status(400).json({ message: "Session is full" });
      }
      
      const bookingData = {
        sessionId,
        learnerId: req.user.id,
        status: "confirmed"
      };
      
      const validatedData = insertBookingSchema.parse(bookingData);
      const booking = await storage.createBooking(validatedData);
      
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid booking data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to book session" });
    }
  });

  app.delete("/api/bookings/:id", requireAuth, async (req, res) => {
    try {
      const bookingId = Number(req.params.id);
      const booking = await storage.getBookingById(bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      if (booking.learnerId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to cancel this booking" });
      }
      
      await storage.deleteBooking(bookingId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to cancel booking" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
