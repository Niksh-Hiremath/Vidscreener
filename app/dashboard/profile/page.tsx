import { getDashboardContext } from "../data";
import NameEditableInfo from "./NameEditableInfo";

export default async function ProfilePage() {
  const { user, organization, isSuperAdmin } = await getDashboardContext();

  if (!user) return null;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      <section className="rounded-2xl p-6 md:p-7">
        <h1 className="text-3xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-muted mt-2">Your account and access details.</p>
      </section>

      <section className="surface-card rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <NameEditableInfo initialName={user.name || ""} />
          <Info label="Email" value={user.email} />
          <Info label="Role" value={user.role} className="capitalize" />
          <Info label="Organization" value={organization?.name || "Not in an organization"} className="capitalize" />
          {organization ? <Info label="Access" value={isSuperAdmin ? "Super Admin" : "Admin"} /> : null}
        </div>
      </section>
    </div>
  );
}

function Info({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={`surface-muted rounded-xl p-3 ${className || ""}`}>
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}
