import { getDashboardContext } from "../data";

export default async function ProfilePage() {
  const { user, organization, isSuperAdmin } = await getDashboardContext();

  if (!user) return null;

  return (
    <div className="max-w-3xl rounded border border-zinc-800 bg-zinc-900 p-6">
      <h1 className="text-2xl font-semibold mb-4">Profile</h1>
      <div className="space-y-2">
        <div>
          Name: <b>{user.name || "-"}</b>
        </div>
        <div>
          Email: <b>{user.email}</b>
        </div>
        <div>
          Role: <b>{user.role}</b>
        </div>
        <div>
          Organization: <b>{organization?.name || "Not in an organization"}</b>
        </div>
        {organization ? (
          <div>
            Access: <b>{isSuperAdmin ? "Superadmin" : "Admin"}</b>
          </div>
        ) : null}
      </div>
    </div>
  );
}
