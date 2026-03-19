import { cookies } from "next/headers";

const WORKER_API_BASE_URL = process.env.WORKER_API_BASE_URL || "http://localhost:8787";

export type SessionUser = {
  id: number;
  email: string;
  name: string;
  role: string;
} | null;

export async function getSessionUser(): Promise<SessionUser> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    const res = await fetch(`${WORKER_API_BASE_URL}/api/user/profile`, {
      method: "GET",
      headers: { Cookie: `token=${token}` },
      cache: "no-store",
    });

    if (!res.ok) return null;

    const data = await res.json();
    return (data.user || null) as SessionUser;
  } catch {
    return null;
  }
}
