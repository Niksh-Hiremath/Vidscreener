import AdminNoOrgSection from "../AdminNoOrgSection";
import AdminOrgSection from "../AdminOrgSection";
import { getDashboardContext } from "../data";

export default async function ManageOrganizationPage() {
  const { user } = await getDashboardContext();

  if (!user) return null;

  if (user.role !== "admin") {
    return (
      <div className="max-w-3xl rounded border border-zinc-800 bg-zinc-900 p-6">
        <h1 className="text-2xl font-semibold mb-2">Manage Organization</h1>
        <div className="text-zinc-400">Only admins can manage organization settings.</div>
      </div>
    );
  }

  if (!user.organizationId) {
    return <AdminNoOrgSection user={user} />;
  }

  return <AdminOrgSection user={user} />;
}
