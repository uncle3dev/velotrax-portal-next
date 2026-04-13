import { SidebarNav } from "./sidebar-nav";
import { SidebarUser } from "./sidebar-user";

interface SidebarProps {
  name: string | null | undefined;
  email: string | null | undefined;
}

export function Sidebar({ name, email }: SidebarProps) {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-gray-200 px-4">
        <span className="text-lg font-bold text-gray-900">
          Velo<span className="text-blue-600">Trax</span>
        </span>
      </div>

      {/* Navigation */}
      <SidebarNav />

      {/* User section */}
      <SidebarUser name={name} email={email} />
    </aside>
  );
}
