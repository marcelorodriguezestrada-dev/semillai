"use client";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function AuthScreen() {
  const { login, signup, error } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    if (mode === "login") await login(email, pw);
    else await signup(email, pw);
    setLoading(false);
  };

  return (
    <div style={s.root}>
      <div style={s.card}>
        {/* Logo */}
        <div style={s.logo}>
          <span style={s.logoIcon}>🌱</span>
          <span style={s.logoText}>semillai</span>
        </div>
        <p style={s.tagline}>Tu co-fundador con inteligencia artificial</p>

        {/* Tabs */}
        <div style={s.tabs}>
          {(["login", "signup"] as const).map(m => (
            <button
              key={m}
              style={{ ...s.tab, ...(mode === m ? s.tabActive : {}) }}
              onClick={() => setMode(m)}
            >
              {m === "login" ? "Ingresar" : "Crear cuenta"}
            </button>
          ))}
        </div>

        {/* Form */}
        <div style={s.form}>
          <input
            style={s.input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
          />
          <input
            style={s.input}
            type="password"
            placeholder="Contraseña"
            value={pw}
            onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
          />
          {error && <p style={s.error}>{error}</p>}
          <button
            style={{ ...s.btn, ...(loading ? s.btnDisabled : {}) }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "..." : mode === "login" ? "Ingresar" : "Crear cuenta"}
          </button>
        </div>

        <p style={s.foot}>
          {mode === "login" ? "¿No tenés cuenta? " : "¿Ya tenés cuenta? "}
          <span style={s.link} onClick={() => setMode(mode === "login" ? "signup" : "login")}>
            {mode === "login" ? "Registrate gratis" : "Ingresá"}
          </span>
        </p>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  root: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: 20 },
  card: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "40px 36px", width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", gap: 20 },
  logo: { display: "flex", alignItems: "center", gap: 10, justifyContent: "center" },
  logoIcon: { fontSize: 32 },
  logoText: { fontSize: 28, fontWeight: 800, color: "var(--verde)", letterSpacing: -1 },
  tagline: { textAlign: "center", color: "var(--muted)", fontSize: 13 },
  tabs: { display: "flex", background: "var(--surface2)", borderRadius: 8, padding: 4, gap: 4 },
  tab: { flex: 1, padding: "8px 0", borderRadius: 6, border: "none", background: "transparent", color: "var(--muted)", fontSize: 13, cursor: "pointer", fontWeight: 500 },
  tabActive: { background: "var(--verde)", color: "#000", fontWeight: 700 },
  form: { display: "flex", flexDirection: "column", gap: 12 },
  input: { background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: 14, padding: "12px 14px", outline: "none", fontFamily: "inherit" },
  error: { color: "#ff8080", fontSize: 12, background: "rgba(255,80,80,0.08)", padding: "8px 12px", borderRadius: 6 },
  btn: { background: "var(--verde)", color: "#000", border: "none", padding: "13px", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer" },
  btnDisabled: { opacity: 0.5, cursor: "not-allowed" },
  foot: { textAlign: "center", color: "var(--muted)", fontSize: 12 },
  link: { color: "var(--verde)", cursor: "pointer", fontWeight: 600 },
};
