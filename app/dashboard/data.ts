import { cookies } from "next/headers";

const WORKER_API_BASE_URL =
  process.env.WORKER_API_BASE_URL || "http://127.0.0.1:8787";

export type DashboardUser = {
  id: number;
  email: string;
  name: string;
  role: string;
  organizationId: number | null;
};

export type DashboardOrganization = {
  id: number;
  name: string;
  createdBy: number;
} | null;

export async function getDashboardContext() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const headers: Record<string, string> = {};
  if (token) headers.Cookie = `token=${token}`;

  const res = await fetch(`${WORKER_API_BASE_URL}/api/user/profile`, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    return { user: null, organization: null, isSuperAdmin: false };
  }

  const data = await res.json();
  return {
    user: data.user as DashboardUser,
    organization: (data.organization || null) as DashboardOrganization,
    isSuperAdmin: Boolean(data.isSuperAdmin),
  };
}
