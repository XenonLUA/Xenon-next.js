// src/hoc/withAuth.tsx

import React from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/app/contexts/AuthContext";

const withAuth = (WrappedComponent: React.FC) => {
  return (props: any) => {
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    React.useEffect(() => {
      if (!isAuthenticated) {
        router.push("/"); // Redirect to the initial page
      }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) {
      return null; // Or a loading spinner
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
