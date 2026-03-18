import { redirect } from "next/navigation";
import DashboardShell from "./DashboardShell";
import { getDashboardContext } from "./data";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user } = await getDashboardContext();

  if (!user) {
    redirect("/login");
  }

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
