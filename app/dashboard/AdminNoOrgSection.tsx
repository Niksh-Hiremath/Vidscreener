"use client";

import CreateOrganizationForm from "./CreateOrganizationForm";

export default function AdminNoOrgSection({ user }: { user: any }) {
  return (
    <div className="max-w-2xl space-y-5">
      <section className="rounded-2xl p-6 md:p-7">
        <h1 className="text-3xl font-semibold tracking-tight">Organization Setup</h1>
        <p className="text-sm text-muted mt-2">Welcome, {user?.name || user?.email}.</p>
        <p className="text-sm text-muted mt-3">
          You are not part of any organization yet. Ask an existing superadmin to add you, or create a new organization.
        </p>
      </section>
      <section className="surface-card rounded-2xl p-6">
        <CreateOrganizationForm />
      </section>
    </div>
  );
}
