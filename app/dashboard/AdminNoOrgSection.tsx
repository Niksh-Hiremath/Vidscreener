"use client";
import CreateOrganizationForm from "./CreateOrganizationForm";

export default function AdminNoOrgSection({ user }: { user: any }) {
  return (
    <div className="max-w-xl mx-auto mt-20 p-6 border rounded shadow">
      <h1 className="text-2xl mb-4">Admin Dashboard</h1>
      <div>Welcome, <b>{user?.name || user?.email}</b>!</div>
      <div className="mb-4">You are not associated with any organization.</div>
      <div className="mb-2">Ask an existing organization admin to add you or create a new organization.</div>
      <CreateOrganizationForm />
    </div>
  );
}
