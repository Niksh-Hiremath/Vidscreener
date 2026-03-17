import * as schema from "../../db/schema";
import { eq } from "drizzle-orm";

export async function getUserFromJWT(req: Request, env: Env, db: any) {
  const cookie = req.headers.get("Cookie") || "";
  const token = cookie.split(';').map(s => s.trim()).find(s => s.startsWith("token="))?.split("=")[1];
  if (!token) return null;
  let userPayload;
  try {
    const { payload } = await import("jose").then(jose => jose.jwtVerify(token, new TextEncoder().encode(env.JWT_SECRET)));
    userPayload = payload;
  } catch {
    return null;
  }
  if (!userPayload) return null;
  const userArr = await db.select().from(schema.users).where(eq(schema.users.id, userPayload.id));
  if (userArr.length === 0) return null;
  return userArr[0];
}

export async function getUserWithRole(req: Request, env: Env, db: any) {
  const user = await getUserFromJWT(req, env, db);
  if (!user) return null;
  const roleArr = await db.select().from(schema.roles).where(eq(schema.roles.id, user.roleId));
  const role = roleArr[0]?.name || null;
  return { ...user, role };
}
