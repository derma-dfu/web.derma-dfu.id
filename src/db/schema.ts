
import { pgTable, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("emailVerified").notNull(),
    image: text("image"),
    role: text("role").default("user"),
    createdAt: timestamp("createdAt").notNull(),
    updatedAt: timestamp("updatedAt").notNull()
});

export const session = pgTable("session", {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expiresAt").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("createdAt").notNull(),
    updatedAt: timestamp("updatedAt").notNull(),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    userId: text("userId").notNull().references(() => user.id)
});

export const account = pgTable("account", {
    id: text("id").primaryKey(),
    accountId: text("accountId").notNull(),
    providerId: text("providerId").notNull(),
    userId: text("userId").notNull().references(() => user.id),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    idToken: text("idToken"),
    accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
    refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("createdAt").notNull(),
    updatedAt: timestamp("updatedAt").notNull()
});

export const verification = pgTable("verification", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    createdAt: timestamp("createdAt"),
    updatedAt: timestamp("updatedAt")
});

export const articles = pgTable("articles", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    title_id: text("title_id").notNull(),
    title_en: text("title_en").notNull(),
    content_id: text("content_id").notNull(),
    content_en: text("content_en").notNull(),
    excerpt_id: text("excerpt_id"),
    excerpt_en: text("excerpt_en"),
    category: text("category").notNull(),
    image_url: text("image_url"),
    is_published: boolean("is_published").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const products = pgTable("products", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    title_id: text("title_id").notNull(),
    title_en: text("title_en").notNull(),
    description_id: text("description_id").notNull(),
    description_en: text("description_en").notNull(),
    category: text("category").notNull(),
    image_url: text("image_url"),
    features_id: text("features_id").array(),
    features_en: text("features_en").array(),
    is_active: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const partners = pgTable("partners", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    description_id: text("description_id"),
    description_en: text("description_en"),
    logo_url: text("logo_url"),
    website_url: text("website_url"),
    contact_email: text("contact_email"),
    contact_phone: text("contact_phone"),
    address: text("address"),
    status: text("status").default("pending").notNull(),
    is_active: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const partnerSubmissions = pgTable("partner_submissions", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    company_name: text("company_name").notNull(),
    contact_person: text("contact_person").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    message: text("message").notNull(),
    status: text("status").default("new").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const webinars = pgTable("webinars", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    title: text("title").notNull(),
    description: text("description"),
    date: timestamp("date").notNull(),
    time: text("time").notNull(),
    platform: text("platform").default("Via Zoom").notNull(),
    speakers: jsonb("speakers").$type<{ name: string; role: string }[]>(),
    moderator: text("moderator"),
    price: text("price").default("GRATIS"),
    image_url: text("image_url"),
    registration_url: text("registration_url"),
    is_active: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const doctors = pgTable("doctors", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    role_id: text("role_id").notNull(),
    role_en: text("role_en").notNull(),
    specialty_id: text("specialty_id").notNull(),
    specialty_en: text("specialty_en").notNull(),
    image_url: text("image_url"),
    bio_id: text("bio_id"),
    bio_en: text("bio_en"),
    experience_id: text("experience_id"),
    experience_en: text("experience_en"),
    credentials: text("credentials").array(),
    is_active: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const productCategories = pgTable("product_categories", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name_id: text("name_id").notNull(),
    name_en: text("name_en").notNull(),
    slug: text("slug").notNull().unique(),
    is_active: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull()
});
