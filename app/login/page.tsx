"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { ReactTyped } from "react-typed";

export default function Login() {
  const supabaseUrl = "https://sqgifjezpzxplyvrrtev.supabase.co";
  const supabaseKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxZ2lmamV6cHp4cGx5dnJydGV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTMzNDc2NzQsImV4cCI6MjAyODkyMzY3NH0.2yYEUffqta76luZ5mUF0pwgWNx3iEonvmxxr1KJge68";
  const supabase = createClient(supabaseUrl, supabaseKey);
  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState(""); // Menambahkan state untuk pesan kesalahan

  const router = useRouter();

  const login = async () => {
    try {
      let { data: dataUser, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (dataUser) {
        router.push("/dashboard");
      }
    } catch (error) {
      setError("Email atau password salah."); // Menangani kesalahan dan menetapkan pesan kesalahan
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress < 100) {
          return prevProgress + 1;
        } else {
          clearInterval(interval);
          return prevProgress;
        }
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="flex items-center justify-center bg-background h-[90vh]">
      <div className="relative items-center w-full px-5 py-12 mx-auto lg:px-16 max-w-7xl md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <div>
            <span className="w-auto px-6 py-3 rounded-full bg-secondary">
              <span className="text-sm font-medium text-primary text-[#3838ff]">
                <ReactTyped
                  strings={["XENON SHOP"]}
                  typeSpeed={300}
                  backSpeed={150}
                  loop
                />
              </span>
            </span>

            <div>
              <h1 className="mt-8 text-3xl font-extrabold tracking-tight lg:text-6xl">
                Login
              </h1>
              <p className="max-w-xl mx-auto mt-8 text-base lg:text-xl text-secondary-foreground">
                <Input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={data.email}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 mt-1 text-base placeholder-gray-400 transition duration-150 ease-in-out bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                />
                <Input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={data.password}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 mt-4 text-base placeholder-gray-400 transition duration-150 ease-in-out bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                />
              </p>
              {error && ( // Menampilkan pesan kesalahan jika ada
                <p className="text-red-500">{error}</p>
              )}
            </div>
            <div>
              <div className="flex justify-center max-w-sm mx-auto mt-10">
                <Button size="lg" className="w-full" onClick={login}>
                  Login
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
