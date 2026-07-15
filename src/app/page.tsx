"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import AuthScreen from "@/components/AuthScreen";
import { AuthProvider } from "@/hooks/useAuth";

function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.push("/dashboard");
  }, [user, loading, router]);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <div style={{ color: "#555", fontSize: 14 }}>Cargando...</div>
    </div>
  );

  if (user) return null;
  return <AuthScreen />;
}

export default function Page() {
  return <AuthProvider><Home /></AuthProvider>;
}
