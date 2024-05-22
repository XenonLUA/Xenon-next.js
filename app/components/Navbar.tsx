"use client";

import Link from "next/link";
import { ReactTyped } from "react-typed";
import { ThemeToggle } from "./Themetoggle";

export function Navbar() {
  return (
    <nav className="border-b bg-background h-[10vh] flex items-center">
      <div className="container flex items-center justify-between">
        <Link href="/">
          <h1 className="font-bold text-3xl text-primary">
            <ReactTyped
              strings={["Xenon HUB"]}
              typeSpeed={120}
              backSpeed={50}
              loop
            />
          </h1>
        </Link>

        <div className="flex items-center gap-x-5">
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
