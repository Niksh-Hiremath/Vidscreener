import { getDB } from "../db/drizzle"
import * as schema from "../db/schema"

export default {
  async fetch(req: Request, env: Env) {

    const db = getDB(env)

    const files = await db.select().from(schema.files)

    return Response.json(files)
  }
}
