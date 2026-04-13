import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/sidebar";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
      <Sidebar name={session.user.name} email={session.user.email} />
      <main className="flex-1 overflow-y-auto min-w-0">
        <div className="mx-auto max-w-5xl px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
