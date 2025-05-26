import { users, sessions, bookings, type User, type InsertUser, type Session, type InsertSession, type Booking, type InsertBooking } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Session operations
  getAllSessions(): Promise<Session[]>;
  getSessionById(id: number): Promise<Session | undefined>;
  getSessionsByTeacherId(teacherId: number): Promise<Session[]>;
  getRecommendedSessions(userId: number): Promise<Session[]>;
  createSession(session: InsertSession): Promise<Session>;
  updateSession(id: number, sessionData: Partial<InsertSession>): Promise<Session>;
  deleteSession(id: number): Promise<void>;
  getSessionEnrollmentCount(sessionId: number): Promise<number>;
  
  // Booking operations
  getBookingById(id: number): Promise<Booking | undefined>;
  getBookingsByUserId(userId: number): Promise<Booking[]>;
  getBookingBySessionAndLearner(sessionId: number, learnerId: number): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  deleteBooking(id: number): Promise<void>;
  
  // Session store for authentication
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private sessions: Map<number, Session>;
  private bookings: Map<number, Booking>;
  sessionStore: session.SessionStore;
  
  private userIdCounter: number;
  private sessionIdCounter: number;
  private bookingIdCounter: number;

  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    this.bookings = new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
    
    this.userIdCounter = 1;
    this.sessionIdCounter = 1;
    this.bookingIdCounter = 1;
    
    // Initialize with some sample users (for development only)
    this.seedUsers();
  }

  private seedUsers() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      ...userData, 
      id,
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }

  // Session operations
  async getAllSessions(): Promise<Session[]> {
    return Array.from(this.sessions.values());
  }

  async getSessionById(id: number): Promise<Session | undefined> {
    return this.sessions.get(id);
  }

  async getSessionsByTeacherId(teacherId: number): Promise<Session[]> {
    return Array.from(this.sessions.values()).filter(
      (session) => session.teacherId === teacherId
    );
  }

  async getRecommendedSessions(userId: number): Promise<Session[]> {
    // For a real app, we would implement recommendation logic
    // For now, return all sessions that the user hasn't booked yet
    const userBookings = Array.from(this.bookings.values()).filter(
      (booking) => booking.learnerId === userId
    );
    
    const bookedSessionIds = userBookings.map((booking) => booking.sessionId);
    
    // Filter out sessions that the user has already booked and sort by date
    const recommendedSessions = Array.from(this.sessions.values())
      .filter((session) => !bookedSessionIds.includes(session.id))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Return only the first 3 or fewer
    return recommendedSessions.slice(0, 3);
  }

  async createSession(sessionData: InsertSession): Promise<Session> {
    const id = this.sessionIdCounter++;
    const now = new Date();
    const teacher = await this.getUser(sessionData.teacherId);
    
    if (!teacher) {
      throw new Error("Teacher not found");
    }
    
    const session: Session = {
      ...sessionData,
      id,
      createdAt: now,
      teacherName: `${teacher.firstName} ${teacher.lastName}`,
      teacherTitle: teacher.specialization || "Teacher",
      enrolledCount: 0
    };
    
    this.sessions.set(id, session);
    return session;
  }

  async updateSession(id: number, sessionData: Partial<InsertSession>): Promise<Session> {
    const existingSession = await this.getSessionById(id);
    
    if (!existingSession) {
      throw new Error("Session not found");
    }
    
    const updatedSession: Session = {
      ...existingSession,
      ...sessionData
    };
    
    this.sessions.set(id, updatedSession);
    return updatedSession;
  }

  async deleteSession(id: number): Promise<void> {
    // Delete associated bookings first
    const sessionBookings = Array.from(this.bookings.values()).filter(
      (booking) => booking.sessionId === id
    );
    
    for (const booking of sessionBookings) {
      await this.deleteBooking(booking.id);
    }
    
    this.sessions.delete(id);
  }

  async getSessionEnrollmentCount(sessionId: number): Promise<number> {
    const sessionBookings = Array.from(this.bookings.values()).filter(
      (booking) => booking.sessionId === sessionId && booking.status === "confirmed"
    );
    
    return sessionBookings.length;
  }

  // Booking operations
  async getBookingById(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getBookingsByUserId(userId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.learnerId === userId
    );
  }

  async getBookingBySessionAndLearner(sessionId: number, learnerId: number): Promise<Booking | undefined> {
    return Array.from(this.bookings.values()).find(
      (booking) => booking.sessionId === sessionId && booking.learnerId === learnerId
    );
  }

  async createBooking(bookingData: InsertBooking): Promise<Booking> {
    const id = this.bookingIdCounter++;
    const now = new Date();
    const session = await this.getSessionById(bookingData.sessionId);
    const learner = await this.getUser(bookingData.learnerId);
    
    if (!session) {
      throw new Error("Session not found");
    }
    
    if (!learner) {
      throw new Error("Learner not found");
    }
    
    // Update the session's enrolled count
    const updatedSession = { ...session, enrolledCount: session.enrolledCount + 1 };
    this.sessions.set(session.id, updatedSession);
    
    const booking: Booking = {
      ...bookingData,
      id,
      createdAt: now,
      session: updatedSession,
      learner
    };
    
    this.bookings.set(id, booking);
    return booking;
  }

  async deleteBooking(id: number): Promise<void> {
    const booking = await this.getBookingById(id);
    
    if (booking && booking.status === "confirmed") {
      // Update the session's enrolled count
      const session = await this.getSessionById(booking.sessionId);
      
      if (session) {
        const updatedSession = { 
          ...session, 
          enrolledCount: Math.max(0, session.enrolledCount - 1) 
        };
        this.sessions.set(session.id, updatedSession);
      }
    }
    
    this.bookings.delete(id);
  }
}

export const storage = new MemStorage();
