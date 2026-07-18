"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, AuthProvider } from "@/hooks/useAuth";

const PASOS_PREVIEW = [
  { icon: "🔍", titulo: "Validar la idea", desc: "Confirmá que hay demanda real antes de invertir" },
  { icon: "👥", titulo: "Primeros clientes", desc: "Estrategia para conseguir las primeras ventas" },
  { icon: "🛠", titulo: "Construir el MVP", desc: "Qué construir primero y cómo hacerlo rápido" },
  { icon: "📈", titulo: "Escalar", desc: "Crecer en ventas, equipo y producto" },
];

const RUBROS = [
  { valor: "tech", label: "💻 Tech / Software" },
  { valor: "ecommerce", label: "🛒 E-commerce" },
  { valor: "servicios", label: "🤝 Servicios" },
  { valor: "alimentos", label: "🍕 Alimentos" },
  { valor: "educacion", label: "📚 Educación" },
  { valor: "otro", label: "🔧 Otro" },
];

function LandingContent() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [idea, setIdea] = useState("");
  const [rubro, setRubro] = useState("");
  const [etapa, setEtapa] = useState("");
  const [paso, setPaso] = useState<"inicio" | "detalle" | "preview" | "auth">("inicio");
  const [generando, setGenerando] = useState(false);
  const [previewRoadmap, setPreviewRoadmap] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      // Si hay datos guardados del onboarding anónimo, ir a onboarding
      const savedOnboarding = localStorage.getItem("semillai_onboarding");
      if (savedOnboarding) {
        router.push("/onboarding?from=landing");
      } else {
        router.push("/dashboard");
      }
    }
  }, [user, loading, router]);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ color: "#555", fontSize: 14 }}>Cargando...</div>
    </div>
  );

  if (user) return null;

  const generarPreview = async () => {
    if (!idea.trim()) return;
    setGenerando(true);
    setPaso("preview");

    try {
      const res = await fetch("/api/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, rubro, etapa }),
      });
      const data = await res.json();
      setPreviewRoadmap(data);
      // Guardar para después del registro
      localStorage.setItem("semillai_onboarding", JSON.stringify({ idea, rubro, etapa }));
    } catch {
      setPaso("detalle");
    } finally {
      setGenerando(false);
    }
  };

  // ── Auth screen inline ────────────────────────────────────────────────────
  if (showAuth) return (
    <div style={s.root}>
      <div style={s.authWrap}>
        <button onClick={() => setShowAuth(false)} style={s.btnBack}>← Volver</button>
        <div style={s.authCard}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <span style={s.logo}>🌱 semillai</span>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 8 }}>
              Creá tu cuenta para acceder al roadmap completo y al mentor IA
            </p>
          </div>
          {/* Auth form inline */}
          <AuthFormInline onSuccess={() => {}} />
        </div>
      </div>
    </div>
  );

  return (
    <div style={s.root}>
      {/* Header */}
      <header style={s.header}>
        <span style={s.logo}>🌱 semillai</span>
        <button onClick={() => setShowAuth(true)} style={s.btnLoginHeader}>
          Ingresar →
        </button>
      </header>

      <main style={s.main}>

        {/* ── PASO 1: Hero con input ── */}
        {paso === "inicio" && (
          <div style={s.hero}>
            <div style={s.heroTag}>Co-fundador con IA para emprendedores</div>
            <h1 style={s.heroTitle}>
              Construí tu negocio con<br />
              <span style={{ color: "var(--verde)" }}>inteligencia artificial</span>
            </h1>
            <p style={s.heroSubtitle}>
              Describí tu emprendimiento y en segundos tenés un roadmap personalizado,
              ejercicios concretos y un mentor IA que conoce tu proyecto.
            </p>

            <div style={s.inputCard}>
              <p style={{ color: "var(--text-primary)", fontWeight: 600, marginBottom: 12, fontSize: 15 }}>
                ¿Cuál es tu idea de negocio?
              </p>
              <textarea
                style={s.textarea}
                placeholder="Ej: Quiero crear una app para que los dueños de mascotas puedan encontrar veterinarios disponibles de urgencia..."
                value={idea}
                onChange={e => setIdea(e.target.value)}
                rows={4}
                autoFocus
              />
              <button
                style={{ ...s.btnPrimary, ...(!idea.trim() ? s.btnDisabled : {}) }}
                onClick={() => idea.trim() && setPaso("detalle")}
                disabled={!idea.trim()}
              >
                Analizar mi idea →
              </button>
            </div>

            {/* Social proof */}
            <div style={s.socialProof}>
              <span style={s.proofItem}>✓ Sin tarjeta de crédito</span>
              <span style={s.proofItem}>✓ Roadmap en segundos</span>
              <span style={s.proofItem}>✓ Mentor IA personalizado</span>
            </div>
          </div>
        )}

        {/* ── PASO 2: Detalle ── */}
        {paso === "detalle" && (
          <div style={s.stepCard}>
            <div style={s.stepHeader}>
              <button onClick={() => setPaso("inicio")} style={s.btnBack}>←</button>
              <div style={s.progressBar}>
                <div style={{ ...s.progressFill, width: "50%" }} />
              </div>
              <span style={s.stepLabel}>2 / 2</span>
            </div>

            <h2 style={s.stepTitle}>Un poco más sobre tu negocio</h2>
            <p style={s.stepSubtitle}>Esto nos ayuda a personalizar tu roadmap</p>

            <div style={s.grupoLabel}>¿En qué rubro?</div>
            <div style={s.rubrosGrid}>
              {RUBROS.map(r => (
                <button key={r.valor}
                  style={{ ...s.rubroBtn, ...(rubro === r.valor ? s.rubroBtnActive : {}) }}
                  onClick={() => setRubro(r.valor)}>
                  {r.label}
                </button>
              ))}
            </div>

            <div style={{ ...s.grupoLabel, marginTop: 20 }}>¿En qué etapa estás?</div>
            <div style={s.etapasGrid}>
              {[
                { valor: "idea", label: "💡 Idea", desc: "Solo en mi cabeza" },
                { valor: "validando", label: "🔍 Validando", desc: "Hablando con clientes" },
                { valor: "mvp", label: "🛠 MVP", desc: "Producto básico" },
                { valor: "clientes", label: "👥 Con clientes", desc: "Ya vendí algo" },
              ].map(e => (
                <button key={e.valor}
                  style={{ ...s.etapaBtn, ...(etapa === e.valor ? s.etapaBtnActive : {}) }}
                  onClick={() => setEtapa(e.valor)}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{e.label}</span>
                  <span style={{ color: "var(--text-muted)", fontSize: 11, marginTop: 2 }}>{e.desc}</span>
                </button>
              ))}
            </div>

            <button
              style={{ ...s.btnPrimary, marginTop: 24, ...(generando ? s.btnDisabled : {}) }}
              onClick={generarPreview}
              disabled={generando}
            >
              {generando ? "⟳ Generando tu roadmap..." : "🚀 Ver mi roadmap →"}
            </button>
          </div>
        )}

        {/* ── PASO 3: Preview del roadmap ── */}
        {paso === "preview" && (
          <div style={s.previewWrap}>
            {generando ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>🌱</div>
                <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Generando tu roadmap personalizado...</p>
                <div style={s.loadingBar}>
                  <div style={s.loadingFill} />
                </div>
              </div>
            ) : (
              <>
                <div style={s.previewHeader}>
                  <div>
                    <p style={s.previewTag}>Tu roadmap personalizado</p>
                    <h2 style={s.previewTitle}>{previewRoadmap?.resumen || "Plan de 4 etapas para tu emprendimiento"}</h2>
                  </div>
                </div>

                {/* Etapas preview */}
                <div style={s.etapasPreview}>
                  {(previewRoadmap?.etapas || PASOS_PREVIEW).map((etapa: any, i: number) => (
                    <div key={i} style={{ ...s.etapaPreviewCard, ...(i === 0 ? s.etapaActiva : {}) }}>
                      <div style={{ ...s.etapaNum, background: i === 0 ? "var(--verde)" : "var(--surface-2)" }}>
                        {i === 0 ? etapa.icon || "🎯" : etapa.icon || (i + 1)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: 14 }}>{etapa.titulo || etapa.nombre}</p>
                        <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 2 }}>{etapa.desc || etapa.descripcion}</p>
                      </div>
                      {i === 0 && <span style={s.badgeActiva}>● En curso</span>}
                      {i > 0 && (
                        <div style={s.blurBadge}>🔒</div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Fortalezas preview */}
                {previewRoadmap?.fortalezas && (
                  <div style={s.fortalezasCard}>
                    <p style={s.fortalezasTitle}>✅ Fortalezas de tu idea</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {previewRoadmap.fortalezas.slice(0, 3).map((f: string, i: number) => (
                        <span key={i} style={s.tagVerde}>{f}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA registro */}
                <div style={s.ctaCard}>
                  <div style={{ textAlign: "center" }}>
                    <h3 style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
                      🔓 Desbloqueá el plan completo
                    </h3>
                    <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
                      Accedé a los módulos de cada etapa, ejercicios concretos para tu negocio
                      y el mentor IA que conoce tu proyecto en detalle.
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 340, margin: "0 auto" }}>
                      <button onClick={() => setShowAuth(true)} style={s.btnPrimary}>
                        Crear cuenta gratis y ver todo →
                      </button>
                      <p style={{ color: "var(--text-muted)", fontSize: 11 }}>
                        ✓ Sin tarjeta · ✓ Tu roadmap ya está guardado
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

      </main>
    </div>
  );
}

// Auth form simple inline
function AuthFormInline({ onSuccess }: { onSuccess: () => void }) {
  const { login, signup, error } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("signup");
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
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", background: "var(--surface-2)", borderRadius: 8, padding: 4, gap: 4 }}>
        {(["signup", "login"] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            style={{ flex: 1, padding: "8px 0", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit", background: mode === m ? "var(--verde)" : "transparent", color: mode === m ? "#000" : "var(--text-muted)" }}>
            {m === "signup" ? "Crear cuenta" : "Ingresar"}
          </button>
        ))}
      </div>
      <input style={s.input} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
      <input style={s.input} type="password" placeholder="Contraseña" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
      {error && <p style={{ color: "#ff8080", fontSize: 12 }}>{error}</p>}
      <button style={{ ...s.btnPrimary, ...(loading ? s.btnDisabled : {}) }} onClick={handleSubmit} disabled={loading}>
        {loading ? "..." : mode === "signup" ? "Crear cuenta gratis" : "Ingresar"}
      </button>
    </div>
  );
}

export default function Page() {
  return <AuthProvider><LandingContent /></AuthProvider>;
}

const s: Record<string, React.CSSProperties> = {
  root: { minHeight: "100vh", background: "var(--bg)", color: "var(--text-primary)" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 32px", borderBottom: "1px solid var(--border)" },
  logo: { color: "var(--verde)", fontWeight: 800, fontSize: 20 },
  btnLoginHeader: { background: "transparent", border: "1px solid var(--border)", color: "var(--text-secondary)", padding: "6px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: "inherit" },
  main: { maxWidth: 680, margin: "0 auto", padding: "40px 24px" },
  hero: { display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 20 },
  heroTag: { background: "rgba(0,196,125,0.1)", color: "var(--verde)", border: "1px solid rgba(0,196,125,0.2)", padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600 },
  heroTitle: { fontSize: 38, fontWeight: 800, lineHeight: 1.2, color: "var(--text-primary)", margin: 0 },
  heroSubtitle: { color: "var(--text-muted)", fontSize: 15, lineHeight: 1.7, maxWidth: 500, margin: 0 },
  inputCard: { background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px", width: "100%", display: "flex", flexDirection: "column", gap: 14 },
  textarea: { background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text-primary)", fontSize: 14, padding: "12px 16px", outline: "none", fontFamily: "inherit", resize: "vertical", lineHeight: 1.6 },
  btnPrimary: { background: "var(--verde)", color: "#000", border: "none", padding: "13px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
  btnDisabled: { opacity: 0.4, cursor: "not-allowed" },
  socialProof: { display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" },
  proofItem: { color: "var(--text-muted)", fontSize: 12 },
  stepCard: { background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 16, padding: "28px" },
  stepHeader: { display: "flex", alignItems: "center", gap: 12, marginBottom: 28 },
  btnBack: { background: "transparent", border: "1px solid var(--border)", color: "var(--text-muted)", padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: "inherit" },
  progressBar: { flex: 1, height: 4, background: "var(--surface-2)", borderRadius: 2, overflow: "hidden" },
  progressFill: { height: 4, background: "var(--verde)", borderRadius: 2, transition: "width 0.4s" },
  stepLabel: { color: "var(--text-muted)", fontSize: 12 },
  stepTitle: { color: "var(--text-primary)", fontSize: 20, fontWeight: 700, marginBottom: 6 },
  stepSubtitle: { color: "var(--text-muted)", fontSize: 13, marginBottom: 24 },
  grupoLabel: { color: "var(--text-muted)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 },
  rubrosGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 },
  rubroBtn: { background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", cursor: "pointer", fontSize: 13, color: "var(--text-secondary)", fontFamily: "inherit" },
  rubroBtnActive: { border: "1.5px solid var(--verde)", background: "rgba(0,196,125,0.08)", color: "var(--text-primary)" },
  etapasGrid: { display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 },
  etapaBtn: { background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "flex-start", fontFamily: "inherit" },
  etapaBtnActive: { border: "1.5px solid var(--verde)", background: "rgba(0,196,125,0.08)" },
  previewWrap: { display: "flex", flexDirection: "column", gap: 16 },
  previewHeader: { padding: "4px 0 12px" },
  previewTag: { color: "var(--verde)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 },
  previewTitle: { color: "var(--text-primary)", fontSize: 18, fontWeight: 700, lineHeight: 1.4 },
  etapasPreview: { display: "flex", flexDirection: "column", gap: 8 },
  etapaPreviewCard: { background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 },
  etapaActiva: { border: "1px solid rgba(0,196,125,0.3)", background: "rgba(0,196,125,0.04)" },
  etapaNum: { width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 },
  badgeActiva: { color: "var(--verde)", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" },
  blurBadge: { fontSize: 16, opacity: 0.4 },
  fortalezasCard: { background: "rgba(0,196,125,0.04)", border: "1px solid rgba(0,196,125,0.15)", borderRadius: 12, padding: "16px" },
  fortalezasTitle: { color: "var(--verde)", fontSize: 13, fontWeight: 600, marginBottom: 10 },
  tagVerde: { background: "rgba(0,196,125,0.1)", color: "var(--verde)", border: "1px solid rgba(0,196,125,0.2)", padding: "4px 12px", borderRadius: 20, fontSize: 12 },
  ctaCard: { background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 16, padding: "32px 24px" },
  loadingBar: { width: 200, height: 3, background: "var(--surface-2)", borderRadius: 2, overflow: "hidden", margin: "16px auto 0" },
  loadingFill: { height: 3, background: "var(--verde)", borderRadius: 2, animation: "loading 2s ease-in-out infinite" },
  authWrap: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 20 },
  authCard: { background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 16, padding: "32px 28px", width: "100%", maxWidth: 400 },
  input: { background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-primary)", fontSize: 14, padding: "12px 14px", outline: "none", fontFamily: "inherit" },
};
