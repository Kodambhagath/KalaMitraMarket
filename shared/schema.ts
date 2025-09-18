import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  username: text("username").notNull(),
  role: text("role").notNull(), // 'shopkeeper' or 'customer'
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImage: text("profile_image"),
  location: text("location"),
  experience: text("experience"),
  specialty: text("specialty"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sellerId: varchar("seller_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  images: jsonb("images").$type<string[]>().default([]),
  tags: jsonb("tags").$type<string[]>().default([]),
  dimensions: text("dimensions"),
  weight: decimal("weight", { precision: 5, scale: 2 }),
  material: text("material"),
  stock: integer("stock").notNull().default(0),
  views: integer("views").default(0),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0"),
  reviewCount: integer("review_count").default(0),
  isActive: boolean("is_active").default(true),
  authenticityCode: text("authenticity_code"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  images: jsonb("images").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cartItems = pgTable("cart_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  items: jsonb("items").$type<{productId: string, quantity: number, price: string}[]>().notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  shippingAddress: jsonb("shipping_address").$type<{
    street: string,
    city: string,
    state: string,
    zipCode: string,
    country: string
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const adContent = pgTable("ad_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // 'script', 'image', 'video'
  content: jsonb("content").$type<{
    text?: string,
    imageUrl?: string,
    videoUrl?: string,
    tagline?: string
  }>().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  username: true,
  role: true,
  firstName: true,
  lastName: true,
  location: true,
  experience: true,
  specialty: true,
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  description: true,
  price: true,
  category: true,
  subcategory: true,
  images: true,
  tags: true,
  dimensions: true,
  weight: true,
  material: true,
  stock: true,
});

export const insertReviewSchema = createInsertSchema(reviews).pick({
  productId: true,
  rating: true,
  comment: true,
  images: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).pick({
  productId: true,
  quantity: true,
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  items: true,
  totalAmount: true,
  shippingAddress: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type AdContent = typeof adContent.$inferSelect;
