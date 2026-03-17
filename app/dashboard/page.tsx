import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminNoOrgSection from "./AdminNoOrgSection";

async function getUserAndOrg() {
  const baseUrl = process.env.WORKER_API_BASE_URL || "http://localhost:8787";
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const headers: Record<string, string> = {};
  if (token) headers.Cookie = `token=${token}`;
  const res = await fetch(`${baseUrl}/api/user/profile`, {
    method: "GET",
    headers,
  });
  if (!res.ok) return { user: null, organization: null };
  const data = await res.json();
  return { user: data.user, organization: data.organization };
}

export default async function DashboardPage() {
  const { user, organization } = await getUserAndOrg();
  if (!user) {
    redirect('/login');
  }

  if (user.role !== "admin") {
    return (
      <div className="max-w-xl mx-auto mt-20 p-6 border rounded shadow">
        <h1 className="text-2xl mb-4">Dashboard</h1>
        <div>Welcome, <b>{user?.name || user?.email}</b>!</div>
        <div>Role: <b>{user?.role}</b></div>
        <div className="mt-6 text-gray-500">This dashboard is for admins. Your dashboard will be available soon.</div>
      </div>
    );
  }

  // Admin logic
  if (!user.organizationId) {
    // Not associated with any org
    return <AdminNoOrgSection user={user} />;
  }

  // Associated with org: show org info
  return (
    <div className="max-w-xl mx-auto mt-20 p-6 border rounded shadow">
      <h1 className="text-2xl mb-4">Admin Dashboard</h1>
      <div>Welcome, <b>{user?.name || user?.email}</b>!</div>
      <div className="mt-4">
        <div className="font-semibold">Organization Info</div>
        <div>Name: <b>{organization?.name}</b></div>
        <div>ID: <b>{organization?.id}</b></div>
      </div>
    </div>
  );
}
