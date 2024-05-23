"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactTyped } from "react-typed";
import { createClient } from "@supabase/supabase-js";
import withAuth from "@/app/hoc/withAuth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey);

const generateRandomKey = (): string => {
  return (
    "XENONHUB_" +
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

const KeyPage: React.FC = () => {
  const [expiryProgress, setExpiryProgress] = React.useState<number>(0);
  const [timeRemaining, setTimeRemaining] = React.useState<string>("");
  const [key, setKey] = React.useState<string | null>(null);
  const [expiry, setExpiry] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    const storedKey = localStorage.getItem("key");
    const storedExpiry = localStorage.getItem("expiry");

    if (storedKey && storedExpiry && new Date(storedExpiry) > new Date()) {
      setKey(storedKey);
      setExpiry(storedExpiry);
      const expiryDate = new Date(storedExpiry);
      updateExpiryProgress(expiryDate);
      updateTimeRemaining(expiryDate);
      setLoading(false);
    } else {
      localStorage.removeItem("key");
      localStorage.removeItem("expiry");
      generateKey();
    }
  }, []);

  const updateExpiryProgress = (expiryDate: Date) => {
    const totalDuration = expiryDate.getTime() - new Date().getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const timeRemaining = expiryDate.getTime() - now;
      const newProgress = (timeRemaining / totalDuration) * 100;
      setExpiryProgress(newProgress > 0 ? newProgress : 0);

      if (timeRemaining <= 0) {
        clearInterval(interval);
        setKey(null);
        setExpiry(null);
        localStorage.removeItem("key");
        localStorage.removeItem("expiry");
        toast.error("Key has expired.");
      } else {
        updateTimeRemaining(expiryDate);
      }
    }, 1000);
  };

  const updateTimeRemaining = (expiryDate: Date) => {
    const now = new Date().getTime();
    const timeRemaining = expiryDate.getTime() - now;
    const seconds = Math.floor((timeRemaining / 1000) % 60);
    const minutes = Math.floor((timeRemaining / (1000 * 60)) % 60);
    const hours = Math.floor((timeRemaining / (1000 * 60 * 60)) % 24);
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));

    setTimeRemaining(`${days}d, ${hours}h, ${minutes}m, ${seconds}s`);
  };

  const generateKey = async () => {
    const newKey = generateRandomKey();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 1);

    console.log("Generating new key:", newKey);
    console.log("Expiry date:", expiryDate.toISOString());

    try {
      const { data, error } = await supabase
        .from("valid_keys")
        .insert([{ key: newKey, expiry: expiryDate.toISOString() }]);

      if (error) {
        throw error;
      }

      setKey(newKey);
      setExpiry(expiryDate.toISOString());
      localStorage.setItem("key", newKey);
      localStorage.setItem("expiry", expiryDate.toISOString());
      toast.success("Key saved successfully.");
      updateExpiryProgress(expiryDate);
      updateTimeRemaining(expiryDate);
      setLoading(false);
    } catch (error) {
      console.error("Error saving key:", error);
      toast.error("Failed to save the key on the server.");
    }
  };

  const copyToClipboard = () => {
    if (key) {
      navigator.clipboard.writeText(key).then(
        () => {
          toast.success("Key copied to clipboard!");
        },
        () => {
          toast.error("Failed to copy the key.");
        }
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center bg-background h-[90vh]">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="flex items-center justify-center bg-background h-[90vh]">
      <div className="relative items-center w-full px-5 py-12 mx-auto lg:px-16 max-w-7xl md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <div>
            <span className="w-auto px-6 py-3 rounded-full bg-secondary">
              <span className="text-sm font-medium text-primary text-[#3838ff]">
                <ReactTyped
                  strings={["XENON HUB"]}
                  typeSpeed={300}
                  backSpeed={150}
                  loop
                />
              </span>
            </span>

            <div>
              <h1 className="mt-8 text-3xl font-extrabold tracking-tight lg:text-6xl"></h1>
              <div className="max-w-xl mx-auto mt-8 text-base lg:text-xl text-secondary-foreground">
                {key && (
                  <div className="flex justify-center max-w-sm mx-auto mt-10">
                    <Card>
                      <CardHeader>
                        <CardTitle>YOUR KEY</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col items-center">
                          <p>{key}</p>
                          <p>
                            Expires on:{" "}
                            {new Date(expiry || "").toLocaleString()}
                          </p>
                          <p className="mt-2">
                            Time remaining: {timeRemaining}
                          </p>
                          <div className="w-full mt-2">
                            <Progress value={expiryProgress} />
                          </div>
                          <Button onClick={copyToClipboard} className="mt-4">
                            Copy Key
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </section>
  );
};

export default withAuth(KeyPage);
