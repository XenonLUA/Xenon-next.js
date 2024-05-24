"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactTyped } from "react-typed";
import { generateRandomKey, supabase } from "../lib/utils";

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
    const checkForKey = async () => {
      const { data, error } = await supabase
        .from("valid_keys")
        .select("*")
        .order("expiry", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Supabase error:", error);
        return;
      }

      if (data && data.length > 0) {
        const existingKey = data[0];
        const expiryDate = new Date(existingKey.expiry);

        if (expiryDate > new Date()) {
          setKey(existingKey.key);
          setExpiry(existingKey.expiry);
          setProgress(100);
          updateExpiryProgress(expiryDate);
          updateTimeRemaining(expiryDate);
        } else {
          await deleteExpiredKey(existingKey.key);
          generateKey();
        }
      } else {
        generateKey();
      }
    };

    checkForKey();
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

    try {
      const { data, error } = await supabase
        .from("valid_keys")
        .insert([{ key: newKey, expiry: expiryDate.toISOString() }]);

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      setKey(newKey);
      setExpiry(expiryDate.toISOString());
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

  const unlockKey = async () => {
    try {
      const response = await fetch("/api/generate-token");
      const data = await response.json();
      const token = data.token;

      const { data: supabaseData, error: supabaseError } = await supabase
        .from("tokens")
        .insert([{ token, status: "pending" }]);

      if (supabaseError) {
        console.error("Supabase insert error:", supabaseError);
        throw supabaseError;
      }

      localStorage.setItem("linkvertiseToken", token);

      const link = "https://xenon-next-js-seven.vercel.app/";
      const userid = 1092296;
      const linkvertiseUrl = linkvertise(link, userid, token);
      window.location.href = linkvertiseUrl;
    } catch (error) {
      console.error("Error during unlocking key:", error);
      toast.error("Failed to unlock key. Please try again.");
    }
  };

  const verifyToken = async () => {
    const token = localStorage.getItem("linkvertiseToken");
    if (token) {
      try {
        const response = await fetch(`/api/verify-token?token=${token}`);
        const data = await response.json();
        if (data.success) {
          localStorage.removeItem("linkvertiseToken");
          localStorage.setItem("linkvertiseCompleted", "true");
          await updateTokenStatusInSupabase(token, "completed");
          generateKey();
        } else {
          toast.error(
            "Token verification failed. Please complete the Linkvertise process."
          );
          localStorage.removeItem("linkvertiseToken");
        }
      } catch (error) {
        toast.error("Failed to verify token. Please try again.");
      }
    }
  };

  const updateTokenStatusInSupabase = async (token: string, status: string) => {
    try {
      const { data, error } = await supabase
        .from("tokens")
        .update({ status })
        .eq("token", token);

      if (error) {
        throw error;
      }
    } catch (error) {
      toast.error("Failed to update the token status on the server");
    }
  };

  const deleteExpiredKey = async (key: string) => {
    try {
      const { data, error } = await supabase
        .from("valid_keys")
        .delete()
        .eq("key", key);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error deleting expired key:", error);
    }
  };

  React.useEffect(() => {
    verifyToken();
  }, []);

  const linkvertise = (link: string, userid: number, token: string) => {
    const base_url = `https://link-to.net/${userid}/${
      Math.random() * 1000
    }/dynamic`;
    const href = `${base_url}?r=${btoa(encodeURI(link))}&token=${token}`;
    return href;
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
              <h1 className="max-w-3xl mx-auto mt-5 text-5xl font-bold tracking-normal text-white md:text-7xl">
                XENON HUB KEY
              </h1>
              <p className="max-w-xl mx-auto mt-5 text-lg leading-7 text-gray-500">
                Xenon Hub is a powerful tool for your needs.
              </p>
            </div>
          </div>
        </div>
        <div className="w-full max-w-lg mx-auto mt-10">
          {progress < 100 ? (
            <div className="flex flex-col items-center justify-center">
              <p className="mb-4 text-lg font-medium text-gray-300">
                Preparing your key, please wait...
              </p>
              <Progress value={progress} className="w-full" />
            </div>
          ) : key && expiry ? (
            <Card>
              <CardHeader>
                <CardTitle>Here is your key!</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center p-2 mb-4 font-mono text-sm text-center text-white bg-gray-800 rounded-md">
                  {key}
                </div>
                <Button
                  onClick={copyToClipboard}
                  className="w-full mb-2 bg-orange-500 hover:bg-orange-700"
                >
                  Copy Key
                </Button>
                <p className="text-sm text-gray-500">
                  Key expires in: {timeRemaining}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Button
              onClick={unlockKey}
              className="w-full bg-orange-500 hover:bg-orange-700"
            >
              Unlock Key
            </Button>
          )}
        </div>
        <ToastContainer />
      </div>
    </section>
  );
};

export default Home;
