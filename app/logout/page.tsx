"use client";

import { useEffect } from "react";
import { redirect } from "next/navigation";

export default function AdminLogoutPage() {
  useEffect(() => {
    async function logout() {
      await fetch("/api/auth/logout", { method: "POST" });
      redirect("/admin/login");
    }
    logout();
  }, []);
  return <p>Logging out...</p>;
}
