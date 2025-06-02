"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Lightbulb, Hammer, PlayCircle, Rocket, Users, Boxes } from "lucide-react";

const SidebarInfo = () => {
  const pathname = usePathname();
  const normalized = pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;

  const links = [
    { href: "/teamsInfo", label: "teams", icon: Users },
    { href: "/RecourceManagment", label: "Resource Management", icon: Boxes }
    // { href: "", label: "", icon: Hammer },
    // { href: "", label: "", icon: PlayCircle },
    // { href: "", label: "", icon: Rocket },
  ];

  return (
    <ul className="space-y-2">
      {links.map(({ href, label, icon: Icon }) => (
        <li key={href}>
          <Link
            href={href}
            className={`flex items-center gap-3 rounded-lg px-4 py-2 text-sm transition-all duration-200 ${normalized === href
              ? "bg-primary text-white shadow-md"
              : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default SidebarInfo;