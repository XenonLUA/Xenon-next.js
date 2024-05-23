"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactTyped } from "react-typed";
import { generateRandomKey, supabase } from "../lib/utils";

// Deklarasi global untuk linkvertise
declare global {
  interface Window {
    linkvertise: any;
  }
}

const Home: React.FC = () => {
  const [progress, setProgress] = React.useState<number>(0);
  const [expiryProgress, setExpiryProgress] = React.useState<number>(0);
  const [timeRemaining, setTimeRemaining] = React.useState<string>("");
  const [key, setKey] = React.useState<string | null>(null);
  const [expiry, setExpiry] = React.useState<string | null>(null);

  React.useEffect(() => {
    const storedKey = localStorage.getItem("key");
    const storedExpiry = localStorage.getItem("expiry");

    if (storedKey && storedExpiry && new Date(storedExpiry) > new Date()) {
      setKey(storedKey);
      setExpiry(storedExpiry);
      setProgress(100);
      const expiryDate = new Date(storedExpiry);
      updateExpiryProgress(expiryDate);
      updateTimeRemaining(expiryDate);
    } else {
      localStorage.removeItem("key");
      localStorage.removeItem("expiry");
      startProgress();
    }
  }, []);

  const startProgress = () => {
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
  };

  const updateExpiryProgress = React.useCallback((expiryDate: Date) => {
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
  }, []);

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

  const handleLinkvertiseCompletion = () => {
    generateKey();
  };

  const loadLinkvertiseScript = () => {
    return new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://publisher.linkvertise.com/cdn/linkvertise.js";
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error("Failed to load Linkvertise script"));
      document.body.appendChild(script);
    });
  };

  const unlockKey = () => {
    loadLinkvertiseScript()
      .then(() => {
        if (typeof window.linkvertise === "function") {
          window
            .linkvertise(1092296, {
              whitelist: [""],
              blacklist: [],
            })
            .then(() => {
              handleLinkvertiseCompletion();
            })
            .catch((error: any) => {
              console.error("Linkvertise error:", error);
              toast.error("Linkvertise error occurred.");
            });
        } else {
          throw new Error("Linkvertise is not defined");
        }
      })
      .catch((error: Error) => {
        console.error("Error loading Linkvertise script:", error);
        toast.error(error.message);
      });
  };

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
                <Progress value={progress} />
              </div>
            </div>
            {progress === 100 && !key && (
              <div className="flex justify-center max-w-sm mx-auto mt-10">
                <Button onClick={unlockKey}>Unlock Key</Button>
              </div>
            )}
            {progress === 100 && key && (
              <div className="flex justify-center max-w-sm mx-auto mt-10">
                <Card>
                  <CardHeader>
                    <CardTitle>YOUR KEY</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center">
                      <p>{key}</p>
                      <p>
                        Expires on: {new Date(expiry || "").toLocaleString()}
                      </p>
                      <p className="mt-2">Time remaining: {timeRemaining}</p>
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
      <ToastContainer />
    </section>
  );
};

export default Home;
