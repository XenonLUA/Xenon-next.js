"use client";

import { cn } from "@/lib/utils";
import { Home, Settings, LogOut } from "lucide-react"; // Menambahkan LogOut icon dari lucide-react
import Link from "next/link"; // Import Link from Next.js untuk routing
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@supabase/supabase-js";

export const navItems = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export async function DashboardNav() {
  const pathName = usePathname();

  const supabaseUrl = "https://sqgifjezpzxplyvrrtev.supabase.co";
  const supabaseKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxZ2lmamV6cHp4cGx5dnJydGV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTMzNDc2NzQsImV4cCI6MjAyODkyMzY3NH0.2yYEUffqta76luZ5mUF0pwgWNx3iEonvmxxr1KJge68";
  const supabase = createClient(supabaseUrl, supabaseKey);

  const handleSignOut = async () => {
    // Menambahkan fungsi untuk sign out
    let { error } = await supabase.auth.signOut();
    if (error) console.error("Error signing out:", error.message);
    // Redirect atau lakukan tindakan lain setelah sign out
  };

  return (
    <nav className="grid items-start gap-2">
      {navItems.map((item, index) => (
        <Link key={index} href={item.href}>
          <span
            className={cn(
              "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              pathName === item.href ? "bg-accent" : "bg-transparent"
            )}
          >
            <item.icon className="mr-2 h-4 w-4 text-primary" />
            <span>{item.name}</span>
          </span>
        </Link>
      ))}
      <Button className="bg-accent" onClick={handleSignOut}>
        Sign Out
      </Button>
    </nav>
  );
}
