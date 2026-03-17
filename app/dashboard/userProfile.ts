import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || "jwt_secret";

export async function getUserProfile() {
  let userId = null;
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    if (token) {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
      userId = payload.id;
    }
  } catch { }
  if (!userId) return null;

  // Get DB instance from env
  // @ts-ignore
  const db = drizzle(process.env.DB, { schema });
  const userArr = await db.select().from(schema.users).where(eq(schema.users.id, userId));
  if (userArr.length === 0) return null;
  const user = userArr[0];
  return user;
}
