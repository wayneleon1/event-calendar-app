"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: "user" | "admin";
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }

    if (
      !isLoading &&
      user &&
      requiredRole === "admin" &&
      user.role !== "admin"
    ) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router, requiredRole]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  if (requiredRole === "admin" && user.role !== "admin") {
    return <div>Access denied. Admin privileges required.</div>;
  }

  return <>{children}</>;
}
