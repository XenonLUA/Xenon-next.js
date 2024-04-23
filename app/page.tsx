"use client";

import * as React from "react";
import Image from "next/image";
import { ThemeToggle } from './components/Themetoggle';
import { ReactTyped } from "react-typed";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  const [progress, setProgress] = React.useState(13); // Initialize progress state to 0

  React.useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress < 100) {
          return prevProgress + 1;
        } else {
          clearInterval(interval); // Clear the interval when progress reaches 100
          return prevProgress; // Return current progress when it reaches 100
        }
      });
    }, 100); // Set interval to match typeSpeed (1000ms)

    return () => clearInterval(interval); // Clean up interval on component unmount
  }, []); // Empty dependency array ensures useEffect runs only on mount

  return (
    <section className="flex items-center justify-center bg-background h-[90vh]">
      <div className="relative items-center w-full px-5 py-12 mx-auto lg:px-16 max-w-7xl md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <div>
            <span className="w-auto px-6 py-3 rounded-full bg-secondary">
              <span className="text-sm font-medium text-primary text-[#3838ff]">
                <ReactTyped 
                  strings={["XENON SHOP"]} 
                  typeSpeed={500}
                  backSpeed={150}
                  loop
                />
              </span>
            </span>

            <div>
              <h1 className="mt-8 text-3xl font-extrabold tracking-tight lg:text-6xl">
                
              </h1>
              <p className="max-w-xl mx-auto mt-8 text-base lg:text-xl text-secondary-foreground">
                <Progress value={progress} />
              </p>
            </div>
            {progress === 100 && ( // Render the following content only when progress reaches 100
              <div className="flex justify-center max-w-sm mx-auto mt-10">
                <Link href="/dashboard">
                  <Button size="lg" className="w-full ">
                    Dashboard
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}