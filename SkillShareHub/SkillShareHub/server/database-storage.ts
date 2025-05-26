import { users, sessions, bookings, type User, type InsertUser, type Session, type InsertSession, type Booking, type InsertBooking } from "@shared/schema";
import { db, pool } from "./db";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { eq, and } from "drizzle-orm";

const PostgresSessionStore = connectPg(session);

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
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true,
      tableName: 'session' 
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  // Session operations
  async getAllSessions(): Promise<Session[]> {
    const result = await db.select().from(sessions);
    
    // Fetch additional data for each session
    const enhancedSessions = await Promise.all(result.map(async (session) => {
      const teacher = await this.getUser(session.teacherId);
      const enrolledCount = await this.getSessionEnrollmentCount(session.id);
      
      return {
        ...session,
        teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unknown Teacher',
        teacherTitle: teacher?.specialization || 'Teacher',
        enrolledCount
      };
    }));
    
    return enhancedSessions;
  }

  async getSessionById(id: number): Promise<Session | undefined> {
    const [sessionData] = await db.select().from(sessions).where(eq(sessions.id, id));
    
    if (!sessionData) return undefined;
    
    const teacher = await this.getUser(sessionData.teacherId);
    const enrolledCount = await this.getSessionEnrollmentCount(id);
    
    return {
      ...sessionData,
      teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unknown Teacher',
      teacherTitle: teacher?.specialization || 'Teacher',
      enrolledCount
    };
  }

  async getSessionsByTeacherId(teacherId: number): Promise<Session[]> {
    const result = await db
      .select()
      .from(sessions)
      .where(eq(sessions.teacherId, teacherId));
    
    const teacher = await this.getUser(teacherId);
    
    // Map to add the teacher name and enrollment count
    const enhancedSessions = await Promise.all(result.map(async (session) => {
      const enrolledCount = await this.getSessionEnrollmentCount(session.id);
      
      return {
        ...session,
        teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unknown Teacher',
        teacherTitle: teacher?.specialization || 'Teacher',
        enrolledCount
      };
    }));
    
    return enhancedSessions;
  }

  async getRecommendedSessions(userId: number): Promise<Session[]> {
    // Get all the sessions this user has booked
    const userBookings = await this.getBookingsByUserId(userId);
    const bookedSessionIds = userBookings.map(booking => booking.sessionId);
    
    // Get all sessions that aren't booked by this user
    const result = await db.select().from(sessions);
    const availableSessions = result.filter(session => !bookedSessionIds.includes(session.id));
    
    // Enhance the sessions with teacher info and enrollment count
    const enhancedSessions = await Promise.all(
      availableSessions.map(async (session) => {
        const teacher = await this.getUser(session.teacherId);
        const enrolledCount = await this.getSessionEnrollmentCount(session.id);
        
        return {
          ...session,
          teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unknown Teacher',
          teacherTitle: teacher?.specialization || 'Teacher',
          enrolledCount
        };
      })
    );
    
    // Sort by date and return top 3
    const sortedSessions = enhancedSessions.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    return sortedSessions.slice(0, 3);
  }

  async createSession(sessionData: InsertSession): Promise<Session> {
    const [session] = await db.insert(sessions).values(sessionData).returning();
    
    const teacher = await this.getUser(session.teacherId);
    
    return {
      ...session,
      teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unknown Teacher',
      teacherTitle: teacher?.specialization || 'Teacher',
      enrolledCount: 0
    };
  }

  async updateSession(id: number, sessionData: Partial<InsertSession>): Promise<Session> {
    const [updatedSession] = await db
      .update(sessions)
      .set(sessionData)
      .where(eq(sessions.id, id))
      .returning();
    
    const teacher = await this.getUser(updatedSession.teacherId);
    const enrolledCount = await this.getSessionEnrollmentCount(id);
    
    return {
      ...updatedSession,
      teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unknown Teacher',
      teacherTitle: teacher?.specialization || 'Teacher',
      enrolledCount
    };
  }

  async deleteSession(id: number): Promise<void> {
    // First delete all associated bookings
    await db.delete(bookings).where(eq(bookings.sessionId, id));
    
    // Then delete the session
    await db.delete(sessions).where(eq(sessions.id, id));
  }

  async getSessionEnrollmentCount(sessionId: number): Promise<number> {
    const confirmedBookings = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.sessionId, sessionId),
          eq(bookings.status, "confirmed")
        )
      );
    
    return confirmedBookings.length;
  }

  // Booking operations
  async getBookingById(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    
    if (!booking) return undefined;
    
    const session = await this.getSessionById(booking.sessionId);
    const learner = await this.getUser(booking.learnerId);
    
    if (!session || !learner) return undefined;
    
    return {
      ...booking,
      session,
      learner
    };
  }

  async getBookingsByUserId(userId: number): Promise<Booking[]> {
    const userBookings = await db
      .select()
      .from(bookings)
      .where(eq(bookings.learnerId, userId));
    
    // Enhance with session and learner data
    const enhancedBookings = await Promise.all(
      userBookings.map(async (booking) => {
        const session = await this.getSessionById(booking.sessionId);
        const learner = await this.getUser(booking.learnerId);
        
        if (!session || !learner) {
          throw new Error(`Could not find session or learner for booking ${booking.id}`);
        }
        
        return {
          ...booking,
          session,
          learner
        };
      })
    );
    
    return enhancedBookings;
  }

  async getBookingBySessionAndLearner(sessionId: number, learnerId: number): Promise<Booking | undefined> {
    const [booking] = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.sessionId, sessionId),
          eq(bookings.learnerId, learnerId)
        )
      );
    
    if (!booking) return undefined;
    
    const session = await this.getSessionById(booking.sessionId);
    const learner = await this.getUser(booking.learnerId);
    
    if (!session || !learner) return undefined;
    
    return {
      ...booking,
      session,
      learner
    };
  }

  async createBooking(bookingData: InsertBooking): Promise<Booking> {
    // First create the booking
    const [booking] = await db.insert(bookings).values(bookingData).returning();
    
    // Get the associated session and learner
    const session = await this.getSessionById(booking.sessionId);
    const learner = await this.getUser(booking.learnerId);
    
    if (!session || !learner) {
      throw new Error("Failed to retrieve session or learner data for new booking");
    }
    
    return {
      ...booking,
      session,
      learner
    };
  }

  async deleteBooking(id: number): Promise<void> {
    await db.delete(bookings).where(eq(bookings.id, id));
  }
}

export const storage = new DatabaseStorage();