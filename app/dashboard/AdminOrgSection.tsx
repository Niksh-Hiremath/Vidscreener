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
  const [newAdminPhone, setNewAdminPhone] = useState("");
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
          phone: newAdminPhone || null,
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Failed to add admin");
      setSuccess("Admin added.");
      setNewAdminEmail("");
      setNewAdminName("");
      setNewAdminPassword("");
      setNewAdminPhone("");
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
    return <div className="max-w-3xl mx-auto mt-20 p-6 border border-zinc-800 bg-zinc-900 rounded shadow">Loading organization dashboard...</div>;
  }

  if (!data) {
    return (
      <div className="max-w-3xl mx-auto mt-20 p-6 border border-zinc-800 bg-zinc-900 rounded shadow">
        <h1 className="text-2xl mb-4">Admin Dashboard</h1>
        <div className="text-red-400">{error || "Failed to load dashboard."}</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-12 p-6 border border-zinc-800 bg-zinc-900 rounded shadow">
      <h1 className="text-2xl mb-2">Manage Organization</h1>
      <div className="mb-1">Welcome, <b>{user?.name || user?.email}</b>!</div>
      <div className="mb-1">Organization: <b>{data.organization.name}</b></div>
      <div className="mb-6">
        Access Level:{" "}
        <b>{data.isSuperAdmin ? "Superadmin" : "Admin"}</b>
      </div>

      {error && <div className="text-red-400 mb-4">{error}</div>}
      {success && <div className="text-green-600 mb-4">{success}</div>}

      <section className="mb-8">
        <h2 className="text-xl mb-2">Organization Admins</h2>
        <div className="space-y-2">
          {data.admins.map((admin) => (
            <div key={admin.id} className="border border-zinc-700 bg-zinc-800 rounded p-3 flex items-center justify-between gap-3">
              <div>
                <div><b>{admin.name || admin.email}</b> {admin.isSuperAdmin ? "(Superadmin)" : ""}</div>
                <div className="text-sm text-zinc-400">{admin.email}</div>
              </div>
              {data.isSuperAdmin && !admin.isSuperAdmin ? (
                <button
                  className="bg-red-600 text-white px-3 py-1 rounded"
                  onClick={() => removeAdmin(admin.id)}
                >
                  Remove
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      {data.isSuperAdmin ? (
        <>
          <section className="mb-8">
            <h2 className="text-xl mb-2">Rename Organization</h2>
            <form onSubmit={submitRename} className="flex flex-col gap-2 sm:flex-row">
              <input
                value={renameName}
                onChange={(e) => setRenameName(e.target.value)}
                className="border border-zinc-700 bg-zinc-800 rounded px-3 py-2 flex-1"
                placeholder="Organization name"
                required
              />
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                Save Name
              </button>
            </form>
          </section>

          <section className="mb-8">
            <h2 className="text-xl mb-2">Add Admin</h2>
            <form onSubmit={submitAddAdmin} className="flex flex-col gap-2">
              <input
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                className="border border-zinc-700 bg-zinc-800 rounded px-3 py-2"
                type="email"
                placeholder="Admin email"
                required
              />
              <input
                value={newAdminName}
                onChange={(e) => setNewAdminName(e.target.value)}
                className="border border-zinc-700 bg-zinc-800 rounded px-3 py-2"
                type="text"
                placeholder="Name (required for new user)"
              />
              <input
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                className="border border-zinc-700 bg-zinc-800 rounded px-3 py-2"
                type="password"
                placeholder="Password (required for new user)"
              />
              <div className="sm:col-span-2">
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
                  Add Admin
                </button>
              </div>
            </form>
          </section>

          <section className="mb-8">
            <h2 className="text-xl mb-2">Transfer Superadmin</h2>
            <form onSubmit={transferSuperadmin} className="flex flex-col gap-2 sm:flex-row">
              <select
                className="border border-zinc-700 bg-zinc-800 rounded px-3 py-2 flex-1"
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
              <button
                type="submit"
                className="bg-amber-600 text-white px-4 py-2 rounded"
                disabled={otherAdmins.length === 0}
              >
                Transfer
              </button>
            </form>
          </section>
        </>
      ) : null}

      <section>
        <h2 className="text-xl mb-2">Exit Organization</h2>
        <div className="text-sm text-zinc-400 mb-2">
          {data.isSuperAdmin
            ? "As superadmin, transfer superadmin to another admin before exiting."
            : "You can exit this organization at any time."}
        </div>
        <button
          className="bg-red-700 text-white px-4 py-2 rounded"
          onClick={exitOrganization}
        >
          Exit Organization
        </button>
      </section>
    </div>
  );
}
