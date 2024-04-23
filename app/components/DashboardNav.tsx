"use client";

import { cn } from "@/lib/utils";
import { Home, Settings } from "lucide-react";
import Link from 'next/link'; // Import Link from Next.js untuk routing
import { usePathname } from "next/navigation";

export const navItems = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function DashboardNav() {
    const pathName = usePathname();


    return (
        <nav className="grid items-start gap-2">
            {navItems.map((item, index) => (
                <Link key={index} href={item.href}>
                    <span className={cn(
                        "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground", pathName === item.href ?
                        "bg-accent" : "bg-transparent"
                    )}>
                        <item.icon className="mr-2 h-4 w-4 text-primary" />
                        <span>{item.name}</span>
                    </span>
                </Link>
            ))}
        </nav>
    );
}
