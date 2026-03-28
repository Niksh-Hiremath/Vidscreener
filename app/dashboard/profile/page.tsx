import { getDashboardContext } from "../data";
import NameEditableInfo from "./NameEditableInfo";
import ChangePasswordForm from "./ChangePasswordForm";

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

      <section className="surface-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border-soft)] bg-[var(--surface-2)]">
            <svg className="h-4 w-4 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Security</h2>
            <p className="text-xs text-[var(--color-text-muted)]">Change your password</p>
          </div>
        </div>
        <ChangePasswordForm />
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
