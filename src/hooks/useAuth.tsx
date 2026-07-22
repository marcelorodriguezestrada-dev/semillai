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
  login: (email: string, pw: string) => Promise<string | null>;
  signup: (email: string, pw: string) => Promise<string | null>;
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

  // Retorna el token directamente, no espera onAuthStateChanged
  const login = async (email: string, pw: string): Promise<string | null> => {
    setError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pw);
      const t = await cred.user.getIdToken();
      setToken(t);
      return t;
    } catch (e: any) {
      setError(e.message);
      return null;
    }
  };

  const signup = async (email: string, pw: string): Promise<string | null> => {
    setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pw);
      const t = await cred.user.getIdToken();
      setToken(t);
      return t;
    } catch (e: any) {
      setError(e.message);
      return null;
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