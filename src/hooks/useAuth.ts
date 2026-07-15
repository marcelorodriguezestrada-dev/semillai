"use client";
import { useState, useEffect, createContext, useContext } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { auth } from "@/lib/firebase-client";

interface AuthCtx {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pw: string) => Promise<boolean>;
  signup: (email: string, pw: string) => Promise<boolean>;
  logout: () => void;
  error: string | null;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const t = await u.getIdToken();
        setToken(t);
      } else {
        setToken(null);
      }
      setLoading(false);
    });
  }, []);

  const login = async (email: string, pw: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pw);
      return true;
    } catch (e: any) {
      setError(e.message);
      return false;
    }
  };

  const signup = async (email: string, pw: string) => {
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, pw);
      return true;
    } catch (e: any) {
      setError(e.message);
      return false;
    }
  };

  const logout = () => signOut(auth);

  return (
    <Ctx.Provider value={{ user, token, loading, login, signup, logout, error }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth fuera de AuthProvider");
  return ctx;
}
