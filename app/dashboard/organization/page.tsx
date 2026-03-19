import AdminNoOrgSection from "../AdminNoOrgSection";
import AdminOrgSection from "../AdminOrgSection";
import { getDashboardContext } from "../data";

export default async function ManageOrganizationPage() {
  const { user } = await getDashboardContext();

  if (!user) return null;

  if (user.role !== "admin") {
    return (
      <div className="max-w-3xl rounded-2xl p-6 md:p-7">
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Manage Organization</h1>
        <div className="text-muted">Only admins can manage organization settings.</div>
      </div>
    );
  }

  if (!user.organizationId) {
    return <AdminNoOrgSection user={user} />;
  }

  return <AdminOrgSection user={user} />;
}
