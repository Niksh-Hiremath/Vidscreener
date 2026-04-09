"use client";

import { useEffect, useMemo, useState } from "react";

const WORKER_API_BASE_URL =
  process.env.NEXT_PUBLIC_WORKER_API_BASE_URL ||
  process.env.WORKER_API_BASE_URL ||
  "http://localhost:8787";

type AdminUser = {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  isSuperAdmin: boolean;
};

type AdminPayload = {
  organization: { id: number; name: string; superAdminUserId: number };
  isSuperAdmin: boolean;
  admins: AdminUser[];
};

export default function AdminOrgSection({ user }: { user: any }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [data, setData] = useState<AdminPayload | null>(null);

  const [renameName, setRenameName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [transferUserId, setTransferUserId] = useState<number | "">("");

  const otherAdmins = useMemo(
    () => (data?.admins || []).filter((admin) => admin.id !== user.id),
    [data, user.id]
  );

  async function fetchAdmins() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${WORKER_API_BASE_URL}/api/organization/admins`, {
        method: "GET",
        credentials: "include",
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Failed to load admins");
      setData(payload);
      setRenameName(payload.organization?.name || "");
      if (payload.admins?.length > 1) {
        const candidate = payload.admins.find((a: AdminUser) => a.id !== user.id);
        setTransferUserId(candidate?.id ?? "");
      }
    } catch (e: any) {
      setError(e.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAdmins();
  }, []);

  async function submitRename(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${WORKER_API_BASE_URL}/api/organization/rename`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: renameName }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Rename failed");
      setSuccess("Organization renamed.");
      await fetchAdmins();
    } catch (e: any) {
      setError(e.message || "Rename failed");
    }
  }

  async function submitAddAdmin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${WORKER_API_BASE_URL}/api/organization/admins/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: newAdminEmail,
          name: newAdminName,
          password: newAdminPassword,
          phone: null,
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Failed to add admin");
      setSuccess("Admin added.");
      setNewAdminEmail("");
      setNewAdminName("");
      setNewAdminPassword("");
      await fetchAdmins();
    } catch (e: any) {
      setError(e.message || "Failed to add admin");
    }
  }

  async function removeAdmin(adminUserId: number) {
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${WORKER_API_BASE_URL}/api/organization/admins/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ adminUserId }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Failed to remove admin");
      setSuccess("Admin removed from organization.");
      await fetchAdmins();
    } catch (e: any) {
      setError(e.message || "Failed to remove admin");
    }
  }

  async function transferSuperadmin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!transferUserId) {
      setError("Select an admin first.");
      return;
    }
    try {
      const res = await fetch(`${WORKER_API_BASE_URL}/api/organization/superadmin/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ newSuperadminUserId: transferUserId }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Transfer failed");
      setSuccess("Superadmin transferred.");
      await fetchAdmins();
    } catch (e: any) {
      setError(e.message || "Transfer failed");
    }
  }

  async function exitOrganization() {
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${WORKER_API_BASE_URL}/api/organization/exit`, {
        method: "POST",
        credentials: "include",
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Failed to exit organization");
      setSuccess("Exited organization.");
      setTimeout(() => window.location.reload(), 700);
    } catch (e: any) {
      setError(e.message || "Failed to exit organization");
    }
  }

  if (loading) {
    return <div className="surface-card rounded-2xl p-6">Loading organization settings...</div>;
  }

  if (!data) {
    return <div className="surface-card rounded-2xl p-6 text-[var(--color-primary)]">{error || "Failed to load dashboard."}</div>;
  }

  return (
    <div className="max-w-4xl space-y-5">
      <section className="rounded-2xl p-6 md:p-7">
        <h1 className="text-3xl font-semibold tracking-tight">Manage Organization</h1>
        <div className="text-sm text-muted mt-2">Organization: {data.organization.name}</div>
        <div className="text-sm text-muted">Access: {data.isSuperAdmin ? "Superadmin" : "Admin"}</div>
      </section>

      {error ? <div className="surface-card rounded-2xl p-4 text-sm text-[var(--color-primary)]">{error}</div> : null}
      {success ? <div className="surface-card rounded-2xl p-4 text-sm text-emerald-400">{success}</div> : null}

      <section className="surface-card rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-3">Organization Admins</h2>
        <div className="space-y-2">
          {data.admins.map((admin) => (
            <div key={admin.id} className="surface-muted rounded-xl p-3 flex items-center justify-between gap-3">
              <div>
                <div className="font-medium">
                  {admin.name || admin.email} {admin.isSuperAdmin ? "(Superadmin)" : ""}
                </div>
                <div className="text-sm text-muted">{admin.email}</div>
              </div>
              {data.isSuperAdmin && !admin.isSuperAdmin ? (
                <button className="button-danger rounded-lg px-3 py-1.5 text-xs" onClick={() => removeAdmin(admin.id)}>
                  Remove
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      {data.isSuperAdmin ? (
        <>
          <section className="surface-card rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-3">Rename Organization</h2>
            <form onSubmit={submitRename} className="flex flex-col sm:flex-row gap-2">
              <input
                value={renameName}
                onChange={(e) => setRenameName(e.target.value)}
                className="input-base focus-ring rounded-xl px-3 py-2 flex-1"
                placeholder="Organization name"
                required
              />
              <button type="submit" className="button-primary rounded-xl px-4 py-2 text-sm">
                Save Name
              </button>
            </form>
          </section>

          <section className="surface-card rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-3">Add Admin</h2>
            <form onSubmit={submitAddAdmin} className="space-y-2">
              <input
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                className="input-base focus-ring rounded-xl px-3 py-2 w-full"
                type="email"
                placeholder="Admin email"
                required
              />
              <input
                value={newAdminName}
                onChange={(e) => setNewAdminName(e.target.value)}
                className="input-base focus-ring rounded-xl px-3 py-2 w-full"
                type="text"
                placeholder="Name"
              />
              <input
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                className="input-base focus-ring rounded-xl px-3 py-2 w-full"
                type="password"
                placeholder="Temporary password"
              />
              <button type="submit" className="button-primary rounded-xl px-4 py-2 text-sm">
                Add Admin
              </button>
            </form>
          </section>

          <section className="surface-card rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-3">Transfer Superadmin</h2>
            <form onSubmit={transferSuperadmin} className="flex flex-col sm:flex-row gap-2">
              <select
                className="input-base focus-ring rounded-xl px-3 py-2 flex-1"
                value={transferUserId}
                onChange={(e) => setTransferUserId(e.target.value ? Number(e.target.value) : "")}
              >
                {otherAdmins.length === 0 ? <option value="">No other admins available</option> : null}
                {otherAdmins.map((admin) => (
                  <option key={admin.id} value={admin.id}>
                    {admin.name || admin.email} ({admin.email})
                  </option>
                ))}
              </select>
              <button type="submit" className="button-secondary rounded-xl px-4 py-2 text-sm" disabled={otherAdmins.length === 0}>
                Transfer
              </button>
            </form>
          </section>
        </>
      ) : null}

      <section className="surface-card rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-2">Exit Organization</h2>
        <p className="text-sm text-muted mb-3">
          {data.isSuperAdmin
            ? "As superadmin, transfer superadmin to another admin before exiting."
            : "You can exit this organization at any time."}
        </p>
        <button className="button-danger rounded-xl px-4 py-2 text-sm" onClick={exitOrganization}>
          Exit Organization
        </button>
      </section>
    </div>
  );
}
