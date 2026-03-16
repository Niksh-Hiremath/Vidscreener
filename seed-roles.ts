import { getDB } from "./db/drizzle";
import * as schema from "./db/schema";
import { eq } from "drizzle-orm";

async function seedRoles(env: any) {
  const db = getDB(env);
  const roleNames = ["admin", "reviewer", "submitter"];
  for (const name of roleNames) {
    const exists = await db.select().from(schema.roles).where(eq(schema.roles.name, name));
    if (exists.length === 0) {
      await db.insert(schema.roles).values({ name });
    }
  }
  console.log("Seeded roles: ", roleNames.join(", "));
}

export default seedRoles;
