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

const ScriptCard: React.FC<{ title: string; script: string }> = ({
  title,
  script,
}) => {
  const copyScriptToClipboard = (scriptText: string) => {
    navigator.clipboard.writeText(scriptText).then(
      () => {
        toast.success("Script copied to clipboard!");
      },
      () => {
        toast.error("Failed to copy the script.");
      }
    );
  };

  return (
    <Card className="rounded-b-lg">
      <CardHeader className="text-center">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <div
          className="flex items-center justify-center p-2 mb-4 font-mono text-sm text-center text-white bg-gray-800 rounded-md"
          style={{
            wordWrap: "break-word",
            maxWidth: "100%",
            overflowWrap: "break-word",
            overflow: "hidden",
          }}
        >
          {script}
        </div>
        <Button
          onClick={() => copyScriptToClipboard(script)}
          className="w-full bg-orange-500 hover:bg-orange-700"
        >
          Copy Script
        </Button>
      </CardContent>
    </Card>
  );
};

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
      validateKey(storedKey);
    } else if (linkvertiseCompleted === "true") {
      localStorage.removeItem("linkvertiseCompleted");
      generateKey();
    } else {
      localStorage.removeItem("key");
      localStorage.removeItem("expiry");
      startProgress();
    }
  }, []);

  const validateKey = async (key: string) => {
    try {
      const { data, error } = await supabase
        .from("valid_keys")
        .select("expiry")
        .eq("key", key)
        .single();

      if (error || !data) {
        // If the key is invalid, prompt the user to unlock a new one
        toast.error("Stored key is no longer valid. Please unlock a new key.");
        localStorage.removeItem("key");
        localStorage.removeItem("expiry");
        startProgress();
      } else {
        // If the key is valid, update the state and continue
        const expiryDate = new Date(data.expiry);
        setKey(key);
        setExpiry(data.expiry);
        setProgress(100);
        updateExpiryProgress(expiryDate);
        updateTimeRemaining(expiryDate);
      }
    } catch (error) {
      console.error("Error validating key from Supabase:", error);
      toast.error("Failed to validate key from the server.");
    }
  };

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

  const fetchExpiryFromSupabase = async (key: string) => {
    try {
      const { data, error } = await supabase
        .from("valid_keys")
        .select("expiry")
        .eq("key", key)
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      if (data) {
        const expiryDate = new Date(data.expiry);
        setExpiry(data.expiry);
        updateExpiryProgress(expiryDate);
        updateTimeRemaining(expiryDate);
      }
    } catch (error) {
      console.error("Error fetching expiry from Supabase:", error);
      toast.error("Failed to fetch expiry from the server.");
    }
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

  const unlockKey = async () => {
    try {
      // Generate the token
      const response = await fetch("/api/generate-token");
      const data = await response.json();
      const token = data.token;

      // Save the token to Supabase
      const { data: supabaseData, error: supabaseError } = await supabase
        .from("tokens")
        .insert([{ token, status: "pending" }]);

      if (supabaseError) {
        console.error("Supabase insert error:", supabaseError);
        throw supabaseError;
      }

      localStorage.setItem("linkvertiseToken", token);

      // Redirect to Linkvertise
      const link = "https://xenon-next-js-seven.vercel.app/";
      const userid = 1092296; // Replace with your Linkvertise user ID
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
          console.log("Token verified successfully:", token);
          localStorage.removeItem("linkvertiseToken");
          localStorage.setItem("linkvertiseCompleted", "true");
          await updateTokenStatusInSupabase(token, "completed");
          generateKey();
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

  const updateTokenStatusInSupabase = async (token: string, status: string) => {
    try {
      const { data, error } = await supabase
        .from("tokens")
        .update({ status })
        .eq("token", token);

      if (error) {
        console.error("Supabase update error:", error);
        throw error;
      }

      console.log("Token status updated in Supabase:", data);
    } catch (error) {
      console.error("Error updating token status in Supabase:", error);
      toast.error("Failed to update the token status on the server");
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
    <section className="flex items-center justify-center min-h-screen py-20">
      <div className="relative items-center w-full px-5 py-12 mx-auto lg:px-16 max-w-7xl md:px-12">
        <div className="max-w-2xl p-6 mx-auto rounded-lg shadow">
          <h1 className="w-auto px-6 py-3 rounded-full max-w-3xl mx-auto text-center font-bold">
            WELCOME TO XENON HUB
          </h1>
          {progress < 100 ? (
            <div>
              <Progress value={progress} className="w-full h-4 mb-4" />
              <p className="w-auto px-6 py-3 rounded-full max-w-3xl mx-auto text-center">
                Loading... {progress}%
              </p>
            </div>
          ) : key ? (
            <div className="text-center">
              <p className="w-auto px-6 py-3 rounded-full max-w-3xl mx-auto text-center font-medium">
                Your Key:
              </p>
              <div className="flex items-center justify-center p-2 mb-4 font-mono text-sm text-center text-white bg-gray-800 rounded-md">
                {key}
              </div>
              <Button
                onClick={copyToClipboard}
                className="w-full bg-orange-500 hover:bg-orange-700"
              >
                Copy Key
              </Button>
              {expiry && (
                <p className="w-auto px-6 py-3 rounded-full max-w-3xl mx-auto text-center">
                  Key expires: {new Date(expiry).toLocaleString()}
                </p>
              )}
              {expiryProgress > 0 && (
                <div className="mt-4">
                  <p className="text-center">Time remaining: {timeRemaining}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <h1 className="w-auto px-6 py-3 rounded-full max-w-3xl mx-auto text-center">
                Get Your Key to Access
              </h1>
              <p className="w-auto px-6 py-3 rounded-full max-w-3xl mx-auto text-center">
                Click the button below to unlock your key.
              </p>
              <Button
                onClick={unlockKey}
                className="w-full bg-orange-500 hover:bg-orange-700"
              >
                Unlock Key
              </Button>
            </div>
          )}
          <ToastContainer />
        </div>

        {/* Grid of Script Cards */}
        <div className="w-full max-w-7xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ScriptCard
            title="Hide And Seek Extreme"
            script='loadstring(game:HttpGet("https://raw.githubusercontent.com/XenonLUA/XenonHUB/main/Script/Hide%20and%20seek%20Extreme.lua"))()'
          />
          <ScriptCard title="COMING SOON" script="COMING SOON" />
          <ScriptCard title="COMING SOON" script="COMING SOON" />
          <ScriptCard title="COMING SOON" script="COMING SOON" />
          <ScriptCard title="COMING SOON" script="COMING SOON" />
        </div>
      </div>
    </section>
  );
};

export default Home;
