import { and, desc, eq, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { captains, InsertOrder, InsertUser, orders, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createOrder(order: InsertOrder) {
  const db = await getDb();
  if (!db) return undefined;
  await db.insert(orders).values(order);
  const result = await db.select().from(orders).where(eq(orders.id, order.id)).limit(1);
  return result[0];
}

export async function listOrdersForUser(userId: number, role: "user" | "admin" | "captain", scope: "mine" | "available" | "all") {
  const db = await getDb();
  if (!db) return [];

  if (role === "admin" || scope === "all") {
    return db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  if (role === "captain") {
    const captain = await db.select().from(captains).where(eq(captains.userId, userId)).limit(1);
    const captainId = captain[0]?.id;
    if (!captainId) return [];
    if (scope === "available") {
      return db.select().from(orders).where(or(eq(orders.status, "ready"), eq(orders.status, "new"))).orderBy(desc(orders.createdAt));
    }
    return db.select().from(orders).where(eq(orders.captainId, captainId)).orderBy(desc(orders.createdAt));
  }

  return db.select().from(orders).where(eq(orders.customerId, userId)).orderBy(desc(orders.createdAt));
}

export async function claimOrder(userId: number, orderId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const captain = await db.select().from(captains).where(eq(captains.userId, userId)).limit(1);
  const captainId = captain[0]?.id;
  if (!captainId) return undefined;
  await db.update(orders).set({ captainId, status: "assigned" }).where(eq(orders.id, orderId));
  const result = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  return result[0];
}

export async function updateOrderStatus(orderId: string, status: "new" | "preparing" | "ready" | "assigned" | "in_transit" | "delivered" | "cancelled", userId?: number, role?: "user" | "admin" | "captain") {
  const db = await getDb();
  if (!db) return undefined;
  if (role === "captain") {
    const captain = await db.select().from(captains).where(eq(captains.userId, userId ?? 0)).limit(1);
    const captainId = captain[0]?.id;
    if (!captainId) return undefined;
    await db.update(orders).set({ status }).where(and(eq(orders.id, orderId), eq(orders.captainId, captainId)));
  } else {
    await db.update(orders).set({ status }).where(eq(orders.id, orderId));
  }
  const result = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  return result[0];
}

export async function setCaptainAvailability(userId: number, availability: "available" | "busy" | "offline") {
  const db = await getDb();
  if (!db) return undefined;
  const current = await db.select().from(captains).where(eq(captains.userId, userId)).limit(1);
  if (current[0]) {
    await db.update(captains).set({ availability }).where(eq(captains.userId, userId));
  } else {
    await db.insert(captains).values({ userId, availability });
  }
  const result = await db.select().from(captains).where(eq(captains.userId, userId)).limit(1);
  return result[0];
}

export async function listCaptains() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: captains.id,
    userId: captains.userId,
    name: users.name,
    email: users.email,
    phone: captains.phone,
    vehiclePlate: captains.vehiclePlate,
    availability: captains.availability,
    rating: captains.rating,
  }).from(captains).leftJoin(users, eq(captains.userId, users.id));
}

export async function assignOrder(orderId: string, captainId: number) {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(orders).set({ captainId, status: "assigned" }).where(eq(orders.id, orderId));
  const result = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  return result[0];
}
