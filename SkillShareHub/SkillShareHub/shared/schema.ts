import { pgTable, text, serial, integer, boolean, timestamp, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("firstName").notNull(),
  lastName: text("lastName").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("learner"), // "teacher" or "learner"
  specialization: text("specialization"),
  experience: integer("experience"),
  bio: text("bio"),
  createdAt: timestamp("createdAt").defaultNow(),
});

// Session table schema
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  skillCategory: text("skillCategory").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  duration: integer("duration").notNull(),
  capacity: integer("capacity").notNull(),
  teacherId: integer("teacherId").notNull().references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow(),
});

// Booking table schema
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  sessionId: integer("sessionId").notNull().references(() => sessions.id),
  learnerId: integer("learnerId").notNull().references(() => users.id),
  status: text("status").notNull().default("confirmed"), // "confirmed", "cancelled", "waitlisted"
  createdAt: timestamp("createdAt").defaultNow(),
});

// Zod schema for user insertion
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});

// Zod schema for session insertion
export const insertSessionSchema = createInsertSchema(sessions)
  .omit({
    id: true,
    createdAt: true
  })
  .extend({
    // Override the date field with a more specific validation
    date: z.string()
      .refine(val => !isNaN(new Date(val).getTime()), {
        message: "Invalid date format. Please use ISO format (YYYY-MM-DD or with time component)."
      })
  })
  .transform((data) => {
    // Parse the date string into a Date object after validation
    return {
      ...data,
      date: new Date(data.date)
    };
  });

// Zod schema for booking insertion
export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true
});

// TypeScript types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect & {
  teacherName: string;
  teacherTitle: string;
  enrolledCount: number;
};

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect & {
  session: Session;
  learner: User;
};
