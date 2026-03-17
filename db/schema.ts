import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"

export const roles = sqliteTable("roles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
})

// Organization table
export const organizations = sqliteTable("organizations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").notNull().default("CURRENT_TIMESTAMP"),
  deletedAt: text("deleted_at"),
});

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  roleId: integer("role_id").notNull().references(() => roles.id),
  organizationId: integer("organization_id").references(() => organizations.id),
})

export const files = sqliteTable("files", {
  id: text("id").primaryKey(),
  name: text("name")
})
