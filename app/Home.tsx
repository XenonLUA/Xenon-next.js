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
    const storedKey = localStorage.getItem("key");
    const storedExpiry = localStorage.getItem("expiry");
    const linkvertiseCompleted = localStorage.getItem("linkvertiseCompleted");

    if (storedKey && storedExpiry && new Date(storedExpiry) > new Date()) {
      setKey(storedKey);
      setExpiry(storedExpiry);
      setProgress(100);
      const expiryDate = new Date(storedExpiry);
      updateExpiryProgress(expiryDate);
      updateTimeRemaining(expiryDate);
    } else if (linkvertiseCompleted === "true") {
      localStorage.removeItem("linkvertiseCompleted");
      generateKey();
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
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Supabase response data:", data);

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

  const fetchTokenAndRedirect = async () => {
    try {
      const response = await fetch("/api/generate-token");
      const data = await response.json();
      localStorage.setItem("linkvertiseToken", data.token);
      return data.token;
    } catch (error) {
      console.error("Error fetching token:", error);
      toast.error("Failed to fetch token.");
    }
  };

  const linkvertise = (link: string, userid: number, token: string) => {
    const base_url = `https://link-to.net/${userid}/${
      Math.random() * 1000
    }/dynamic`;
    const href = `${base_url}?r=${btoa(encodeURI(link))}&token=${token}`;
    return href;
  };

  const unlockKey = async () => {
    try {
      // Generate the token
      const response = await fetch("/api/generate-token");
      const data = await response.json();
      const token = data.token;
      localStorage.setItem("linkvertiseToken", token);

      // Redirect to Linkvertise
      const link = "https://xenon-next-js-seven.vercel.app/";
      const userid = 1092296; // Replace with your Linkvertise user ID
      const linkvertiseUrl = linkvertise(link, userid, token);
      window.location.href = linkvertiseUrl;

      // Verify the token immediately
      const verificationResponse = await fetch(
        `/api/verify-token?token=${token}`
      );
      const verificationData = await verificationResponse.json();

      if (verificationData.success) {
        console.log("Token verified successfully:", token);
        localStorage.removeItem("linkvertiseToken");
        localStorage.setItem("linkvertiseCompleted", "true");
        await saveTokenToSupabase(token);
        window.location.reload();
      } else {
        console.error("Token verification failed:", token);
        toast.error(
          "Token verification failed. Please complete the Linkvertise process."
        );
        localStorage.removeItem("linkvertiseToken");
      }
    } catch (error) {
      console.error("Error during unlocking key:", error);
      toast.error("Failed to unlock key. Please try again.");
    }
  };

  const saveTokenToSupabase = async (token: string) => {
    try {
      const { data, error } = await supabase
        .from("tokens")
        .insert([{ token, status: "completed" }]);

      if (error) {
        console.error("Supabase insert error:", error);
        throw error;
      }

      console.log("Token saved to Supabase:", data);
    } catch (error) {
      console.error("Error saving token to Supabase:", error);
      toast.error("Failed to save the token on the server.");
    }
  };

  React.useEffect(() => {
    verifyToken();
  }, []);

  const verifyToken = async () => {
    const token = localStorage.getItem("linkvertiseToken");
    if (token) {
      try {
        const response = await fetch(`/api/verify-token?token=${token}`);
        const data = await response.json();
        if (data.success) {
          console.log("Token verified successfully:", token);
          localStorage.removeItem("linkvertiseToken");
          localStorage.setItem("linkvertiseCompleted", "true");
          await saveTokenToSupabase(token);
          window.location.reload();
        } else {
          console.error("Token verification failed:", token);
          toast.error(
            "Token verification failed. Please complete the Linkvertise process."
          );
          localStorage.removeItem("linkvertiseToken");
        }
      } catch (error) {
        console.error("Error verifying token:", error);
        toast.error("Failed to verify token. Please try again.");
      }
    }
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
                XENON HUB SCRIPT
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
              <p className="mb-2 text-gray-200">
                Please wait while we prepare your key...
              </p>
              <Progress value={progress} className="w-full" />
            </div>
          ) : key ? (
            <Card className="w-full max-w-lg mx-auto mt-10">
              <CardHeader>
                <CardTitle>Your Key</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-2 text-gray-500">{key}</p>
                <Button onClick={copyToClipboard}>Copy Key</Button>
                <p className="mt-4 text-sm text-gray-500">
                  Time remaining: {timeRemaining}
                </p>
                <Progress value={expiryProgress} className="w-full mt-2" />
              </CardContent>
            </Card>
          ) : (
            <Card className="w-full max-w-lg mx-auto mt-10">
              <CardHeader>
                <CardTitle>Unlock Key</CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={unlockKey}>Unlock Key</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <ToastContainer />
    </section>
  );
};

export default Home;
