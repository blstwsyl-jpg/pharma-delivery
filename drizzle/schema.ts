import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "captain"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const captains = mysqlTable("captains", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  phone: varchar("phone", { length: 32 }),
  vehiclePlate: varchar("vehiclePlate", { length: 32 }),
  availability: mysqlEnum("availability", ["available", "busy", "offline"]).default("offline").notNull(),
  rating: varchar("rating", { length: 8 }).default("5.0").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Captain = typeof captains.$inferSelect;
export type InsertCaptain = typeof captains.$inferInsert;

export const orders = mysqlTable("orders", {
  id: varchar("id", { length: 32 }).primaryKey(),
  customerId: int("customerId"),
  captainId: int("captainId"),
  status: mysqlEnum("status", ["new", "preparing", "ready", "assigned", "in_transit", "delivered", "cancelled"]).default("new").notNull(),
  customerName: varchar("customerName", { length: 160 }).notNull(),
  deliveryAddress: text("deliveryAddress").notNull(),
  total: varchar("total", { length: 32 }).notNull(),
  items: text("items").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
