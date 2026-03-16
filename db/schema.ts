import { sqliteTable, text } from "drizzle-orm/sqlite-core"

export const files = sqliteTable("files", {
  id: text("id").primaryKey(),
  name: text("name")
})
