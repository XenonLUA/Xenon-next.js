import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import * as React from "react";
import { ReactTyped } from "react-typed";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const generateRandomKey = () => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

export default function Home() {
  const [progress, setProgress] = React.useState(0);
  const [key, setKey] = React.useState<string | null>(null);
  const [expiry, setExpiry] = React.useState<string | null>(null);

  React.useEffect(() => {
    const storedKey = localStorage.getItem("key");
    const storedExpiry = localStorage.getItem("expiry");

    if (storedKey && storedExpiry && new Date(storedExpiry) > new Date()) {
      setKey(storedKey);
      setExpiry(new Date(storedExpiry).toLocaleString());
      setProgress(100);
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
          generateKey();
          return prevProgress;
        }
      });
    }, 100);
  };

  const generateKey = async () => {
    const newKey = generateRandomKey();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 1);

    console.log("Generating new key:", newKey);
    console.log("Expiry date:", expiryDate.toISOString());

    try {
      const response = await fetch("/api/save-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key: newKey, expiry: expiryDate.toISOString() }),
      });

      console.log("Fetch response:", response);

      if (response.ok) {
        const responseData = await response.json();
        console.log("Response data:", responseData);
        setKey(newKey);
        setExpiry(expiryDate.toLocaleString());
        localStorage.setItem("key", newKey);
        localStorage.setItem("expiry", expiryDate.toISOString());
        toast.success("Key saved successfully.");
      } else {
        const errorData = await response.text();
        console.error("Server error:", errorData);
        toast.error(`Failed to save the key: ${errorData}`);
      }
    } catch (error) {
      console.error("Fetch error:", error);
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
            {progress === 100 && key && (
              <div className="flex justify-center max-w-sm mx-auto mt-10">
                <Card>
                  <CardHeader>
                    <CardTitle>YOUR KEY</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center">
                      <p>{key}</p>
                      <p>Expires on: {expiry}</p>
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
}
