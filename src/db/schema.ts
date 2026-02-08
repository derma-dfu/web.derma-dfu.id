
import { pgTable, text, timestamp, boolean, jsonb, integer } from "drizzle-orm/pg-core";

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
    price: integer("price").default(0).notNull(), // Price in IDR
    partner_id: text("partner_id").references(() => partners.id),
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

// === PAYMENT & ORDER TABLES ===

export const orders = pgTable("orders", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    user_id: text("user_id").notNull().references(() => user.id),
    total_amount: integer("total_amount").notNull(), // in IDR
    shipping_address: text("shipping_address").notNull(),
    shipping_name: text("shipping_name").notNull(),
    shipping_phone: text("shipping_phone").notNull(),
    status: text("status").default("pending").notNull(), // pending, paid, shipped, completed, cancelled
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const orderItems = pgTable("order_items", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    order_id: text("order_id").notNull().references(() => orders.id),
    product_id: text("product_id").notNull().references(() => products.id),
    product_title: text("product_title").notNull(), // snapshot at purchase time
    quantity: integer("quantity").notNull(),
    unit_price: integer("unit_price").notNull(), // snapshot of price at purchase time
    createdAt: timestamp("created_at").defaultNow().notNull()
});

export const payments = pgTable("payments", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    user_id: text("user_id").notNull().references(() => user.id),
    order_id: text("order_id").notNull().references(() => orders.id),
    amount: integer("amount").notNull(), // in IDR
    status: text("status").default("pending").notNull(), // pending, paid, failed, expired
    xendit_invoice_id: text("xendit_invoice_id"),
    xendit_invoice_url: text("xendit_invoice_url"),
    xendit_external_id: text("xendit_external_id"),
    paid_at: timestamp("paid_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// === TRIAGE & TELECONSULTATION TABLES ===

export const triageRecords = pgTable("triage_records", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    user_id: text("user_id").notNull().references(() => user.id),
    photo_url: text("photo_url"),
    has_scale_card: boolean("has_scale_card").default(false),
    triage_result: text("triage_result").notNull(), // red, yellow, green

    // Clinical data
    has_fever: boolean("has_fever").default(false),
    has_smell_pus: boolean("has_smell_pus").default(false),
    has_spreading_redness: boolean("has_spreading_redness").default(false),
    has_rest_pain: boolean("has_rest_pain").default(false),
    has_foot_pulse: boolean("has_foot_pulse").default(true),
    has_black_cold_skin: boolean("has_black_cold_skin").default(false),
    wound_duration: integer("wound_duration"), // days
    wound_location: text("wound_location"), // toes, midfoot, heel
    diabetes_history: text("diabetes_history"),
    kidney_condition: text("kidney_condition"), // none, mild, severe, hemodialysis
    abi_value: text("abi_value"),
    notes: text("notes"),

    // AI results
    infection_class: integer("infection_class"), // 0-3
    infection_prob: text("infection_prob"),
    infection_prob_present: text("infection_prob_present"),
    ischaemia_prob: text("ischaemia_prob"),
    top_class_name: text("top_class_name"),
    top_class_prob: text("top_class_prob"),

    // Wound measurements
    wound_area_px: integer("wound_area_px"),
    wound_area_pct: text("wound_area_pct"),
    wound_area_cm2: text("wound_area_cm2"),
    calibration_mm_per_px: text("calibration_mm_per_px"),
    model_gated: boolean("model_gated").default(false),

    // Summary
    ai_summary: jsonb("ai_summary"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const referrals = pgTable("referrals", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    triage_id: text("triage_id").notNull().references(() => triageRecords.id),
    doctor_id: text("doctor_id").references(() => doctors.id),
    facility: text("facility"),
    consultation_type: text("consultation_type").notNull(), // teleconsultation, inperson
    status: text("status").default("pending").notNull(), // pending, confirmed, completed, cancelled
    scheduled_date: timestamp("scheduled_date"),
    completed_at: timestamp("completed_at"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const chatMessages = pgTable("chat_messages", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    referral_id: text("referral_id").notNull().references(() => referrals.id),
    sender_id: text("sender_id").notNull(),
    message: text("message").notNull(),
    is_read: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull()
});

export const userRoles = pgTable("user_roles", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    user_id: text("user_id").notNull().references(() => user.id),
    role: text("role").notNull(), // admin, doctor, user
    createdAt: timestamp("created_at").defaultNow().notNull()
});

