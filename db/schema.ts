import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"

export const roles = sqliteTable("roles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
})

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  roleId: integer("role_id").notNull().references(() => roles.id),
})

export const files = sqliteTable("files", {
  id: text("id").primaryKey(),
  name: text("name")
})
