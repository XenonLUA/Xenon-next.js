"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [isGeneratingKey, setIsGeneratingKey] = React.useState<boolean>(false);
  const [isVerifyingToken, setIsVerifyingToken] =
    React.useState<boolean>(false);
  const [isUnlocking, setIsUnlocking] = React.useState<boolean>(false);
  const [hasValidKey, setHasValidKey] = React.useState<boolean>(false);

  React.useEffect(() => {
    const storedKey = localStorage.getItem("key");
    const storedExpiry = localStorage.getItem("expiry");

    if (storedKey && storedExpiry && new Date(storedExpiry) > new Date()) {
      checkKeyValidity(storedKey).then((isValid: boolean) => {
        if (isValid) {
          setKey(storedKey);
          setExpiry(storedExpiry);
          setProgress(100);
          setHasValidKey(true);
          const expiryDate = new Date(storedExpiry);
          updateExpiryProgress(expiryDate);
          updateTimeRemaining(expiryDate);
        } else {
          localStorage.removeItem("key");
          localStorage.removeItem("expiry");
          startProgress();
        }
      });
    } else {
      localStorage.removeItem("key");
      localStorage.removeItem("expiry");
      startProgress();
    }

    const expiryCheckInterval = setInterval(fetchExpiryFromSupabase, 60000);
    const timeRemainingInterval = setInterval(() => {
      if (expiry) {
        const expiryDate = new Date(expiry);
        updateTimeRemaining(expiryDate);
      }
    }, 1000);

    return () => {
      clearInterval(expiryCheckInterval);
      clearInterval(timeRemainingInterval);
    };
  }, [expiry]);

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

  const fetchUniqueToken = async (): Promise<string> => {
    try {
      const response = await fetch("/api/generate-token");
      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error("Error fetching token:", error);
      throw new Error("Failed to fetch token");
    }
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
        setHasValidKey(false);
        localStorage.removeItem("key");
        localStorage.removeItem("expiry");
        toast.error("Key has expired.");
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

  const fetchExpiryFromSupabase = async () => {
    if (!key) return;

    try {
      console.log("Fetching expiry from Supabase for key:", key);
      const { data, error } = await supabase
        .from("valid_keys")
        .select("expiry")
        .eq("key", key)
        .single();

      if (error) {
        console.error("Supabase fetch expiry error:", error);
        return;
      }

      if (data && data.expiry) {
        const newExpiry = new Date(data.expiry).toISOString();
        if (newExpiry !== expiry) {
          console.log("Updating expiry state:", newExpiry);
          setExpiry(newExpiry);
          localStorage.setItem("expiry", newExpiry);
          const expiryDate = new Date(newExpiry);
          updateExpiryProgress(expiryDate);
          updateTimeRemaining(expiryDate);
        }
      }
    } catch (error) {
      console.error("Error fetching expiry from Supabase:", error);
    }
  };

  const generateKey = async (): Promise<void> => {
    if (isGeneratingKey) return;

    setIsGeneratingKey(true);
    const newKey = generateRandomKey();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 1);

    console.log("Generating new key:", newKey);
    console.log("Expiry date:", expiryDate.toISOString());

    try {
      // Check if the key already exists
      const { data: existingKey, error: checkError } = await supabase
        .from("valid_keys")
        .select("key")
        .eq("key", newKey)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        // Handle error that is not related to key not being found
        console.error("Supabase error during key existence check:", checkError);
        throw checkError;
      }

      if (existingKey) {
        // If the key exists, return without creating a new key
        console.log(
          "Key already exists, returning without creating a new one."
        );
        setIsGeneratingKey(false);
        return;
      }

      // Insert the new key
      const { data, error } = await supabase
        .from("valid_keys")
        .insert([{ key: newKey, expiry: expiryDate.toISOString() }])
        .select("*");

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Supabase response data:", data);

      setKey(newKey);
      setExpiry(expiryDate.toISOString());
      localStorage.setItem("key", newKey);
      localStorage.setItem("expiry", expiryDate.toISOString());
      setHasValidKey(true);
      toast.success("Key generated successfully.");
      updateExpiryProgress(expiryDate);
      updateTimeRemaining(expiryDate);
      fetchExpiryFromSupabase();
    } catch (error) {
      console.error("Error saving key:", error);
      toast.error("Failed to save the key on the server.");
    } finally {
      setIsGeneratingKey(false);
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
    if (isUnlocking) return; // Prevent multiple clicks
    setIsUnlocking(true);

    try {
      const response = await fetch("/api/generate-token");
      const data = await response.json();
      const token_id = data.token;

      const { data: supabaseData, error: supabaseError } = await supabase
        .from("tokens")
        .insert([{ token_id, status: "pending" }]);

      if (supabaseError) {
        console.error("Supabase insert error:", supabaseError);
        throw supabaseError;
      }

      localStorage.setItem("linkvertiseToken", token_id);

      const link = "https://xenon-next-js-seven.vercel.app/";
      const userid = 1092296;
      const linkvertiseUrl = linkvertise(link, userid, token_id);
      window.location.href = linkvertiseUrl;
    } catch (error) {
      console.error("Error during unlocking key:", error);
      toast.error("Failed to unlock the key. Please try again.");
    } finally {
      setIsUnlocking(false); // Reset unlocking state
    }
  };

  const verifyToken = async () => {
    if (isVerifyingToken) return;

    const token = localStorage.getItem("linkvertiseToken");
    if (token) {
      setIsVerifyingToken(true);
      try {
        const response = await fetch("/api/verify-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (data.success) {
          console.log("Token verified successfully:", token);
          localStorage.removeItem("linkvertiseToken");
          generateKey();
        } else {
          console.error("Token verification failed:", token);
          localStorage.removeItem("linkvertiseToken");
        }
      } catch (error) {
        console.error("Error verifying token:", error);
      } finally {
        setIsVerifyingToken(false);
      }
    }
  };

  const checkKeyValidity = async (key: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from("valid_keys")
        .select("*")
        .eq("key", key)
        .single();

      if (error || !data) {
        console.error("Supabase check key validity error:", error);
        return false;
      }

      const keyExpiry = new Date(data.expiry);
      return keyExpiry > new Date();
    } catch (error) {
      console.error("Error checking key validity:", error);
      return false;
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
          ) : hasValidKey && key ? (
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
                disabled={isUnlocking} // Disable the button if unlocking is in progress
                className="w-full bg-orange-500 hover:bg-orange-700"
              >
                {isUnlocking ? "Unlocking..." : "Unlock Key"}
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
          <ScriptCard
            title="Evade"
            script='loadstring(game:HttpGet("https://raw.githubusercontent.com/XenonLUA/XenonHUB/main/Script/Evade.lua"))()'
          />
          <ScriptCard title="COMING SOON" script="COMING SOON" />
          <ScriptCard title="COMING SOON" script="COMING SOON" />
          <ScriptCard title="COMING SOON" script="COMING SOON" />
        </div>
      </div>
    </section>
  );
};

export default Home;
