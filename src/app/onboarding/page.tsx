"use client";
import { useState, useEffect, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, AuthProvider } from "@/hooks/useAuth";

const PASOS = [
  { id: "nombre", titulo: "¿Cómo se llama tu emprendimiento?", subtitulo: "Si todavía no tiene nombre, poné una idea o descripción corta.", tipo: "text", placeholder: "Ej: Semillai, Mi tienda de ropa, AppDelivery..." },
  { id: "descripcion", titulo: "¿Qué problema resuelve?", subtitulo: "Describilo en 2-3 oraciones. Sé específico — ¿a quién le resuelve el problema?", tipo: "textarea", placeholder: "Ej: Ayudo a emprendedores a construir su negocio con IA..." },
  { id: "etapa", titulo: "¿En qué etapa está tu emprendimiento?", subtitulo: "Esto nos ayuda a personalizar tu roadmap.", tipo: "opciones", opciones: [
    { valor: "idea", label: "💡 Idea", desc: "Todavía es un concepto en mi cabeza" },
    { valor: "validando", label: "🔍 Validando", desc: "Estoy hablando con potenciales clientes" },
    { valor: "mvp", label: "🛠 MVP", desc: "Tengo un producto básico funcionando" },
    { valor: "primeros_clientes", label: "👥 Primeros clientes", desc: "Ya tengo algunas ventas o usuarios" },
    { valor: "creciendo", label: "🚀 Creciendo", desc: "Tengo tracción y quiero escalar" },
  ]},
  { id: "rubro", titulo: "¿En qué rubro opera?", subtitulo: "Seleccioná el que mejor lo describe.", tipo: "opciones", opciones: [
    { valor: "tech", label: "💻 Tech / Software", desc: "Apps, SaaS, plataformas digitales" },
    { valor: "ecommerce", label: "🛒 E-commerce", desc: "Venta de productos online" },
    { valor: "servicios", label: "🤝 Servicios", desc: "Consultoría, freelance, agencia" },
    { valor: "alimentos", label: "🍕 Alimentos", desc: "Gastronomía, delivery, catering" },
    { valor: "educacion", label: "📚 Educación", desc: "Cursos, tutorías, formación" },
    { valor: "salud", label: "🏥 Salud y bienestar", desc: "Fitness, nutrición, salud mental" },
    { valor: "otro", label: "🔧 Otro", desc: "No encaja en las anteriores" },
  ]},
  { id: "objetivo", titulo: "¿Cuál es tu principal objetivo ahora?", subtitulo: "Enfocate en lo más urgente.", tipo: "opciones", opciones: [
    { valor: "validar", label: "✅ Validar la idea", desc: "Confirmar que hay demanda real" },
    { valor: "primeros_clientes", label: "💰 Conseguir primeros clientes", desc: "Generar las primeras ventas" },
    { valor: "producto", label: "🛠 Construir el producto", desc: "Desarrollar el MVP" },
    { valor: "financiamiento", label: "💵 Conseguir financiamiento", desc: "Inversores o subsidios" },
    { valor: "escalar", label: "📈 Escalar", desc: "Crecer en ventas y equipo" },
  ]},
];

function SearchParamsReader({ onFromLanding }: { onFromLanding: (v: boolean) => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    onFromLanding(searchParams.get("from") === "landing");
  }, [searchParams, onFromLanding]);
  return null;
}

function OnboardingContent() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [fromLanding, setFromLanding] = useState(false);
  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [pendienteGuardar, setPendienteGuardar] = useState(false);

  // Pre-cargar datos del landing
  useEffect(() => {
    if (!fromLanding) return;
    const saved = localStorage.getItem("semillai_onboarding");
    if (!saved) return;
    try {
      const data = JSON.parse(saved);
      const preloaded: Record<string, string> = {};
      if (data.idea) preloaded["descripcion"] = data.idea;
      if (data.rubro) preloaded["rubro"] = data.rubro;
      if (data.etapa) preloaded["etapa"] = data.etapa;
      setRespuestas(preloaded);
    } catch {}
  }, [fromLanding]);

  // Cuando el usuario se loguea y hay un guardado pendiente, guardar
  useEffect(() => {
    if (pendienteGuardar && user && token) {
      guardarProyecto(token, respuestas);
    }
  }, [pendienteGuardar, user, token]);

  const guardarProyecto = async (tkn: string, resp: Record<string, string>) => {
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tkn}` },
        body: JSON.stringify(resp),
      });
      if (!res.ok) throw new Error("Error guardando");
      localStorage.removeItem("semillai_onboarding");
      router.push("/dashboard");
    } catch {
      alert("Error al guardar. Intentá de nuevo.");
      setPendienteGuardar(false);
      setShowAuth(false);
      setLoading(false);
    }
  };

  const pasoActual = PASOS[paso];
  const valor = respuestas[pasoActual?.id || ""] || "";
  const puedeAvanzar = valor.trim().length > 0;
  const setValor = (v: string) => setRespuestas(prev => ({ ...prev, [pasoActual.id]: v }));
  const progreso = showAuth ? 100 : ((paso + 1) / PASOS.length) * 100;

  const siguiente = () => {
    if (paso < PASOS.length - 1) { setPaso(paso + 1); return; }
    if (user && token) {
      guardarProyecto(token, respuestas);
    } else {
      setPendienteGuardar(true);
      setShowAuth(true);
    }
  };

  return (
    <div style={s.root}>
      <Suspense fallback={null}>
        <SearchParamsReader onFromLanding={setFromLanding} />
      </Suspense>
      <div style={s.card}>
        <div style={s.header}>
          <span style={s.logo}>🌱 semillai</span>
          <span style={s.pasoLabel}>{showAuth ? "Último paso" : `${paso + 1} / ${PASOS.length}`}</span>
        </div>
        <div style={s.progressBg}>
          <div style={{ ...s.progressFill, width: `${progreso}%` }} />
        </div>
        <div style={s.body}>
          {showAuth ? (
            <AuthInlineForm
              nombre={respuestas.nombre}
              onAuth={(tkn, resp) => guardarProyecto(tkn, resp)}
              respuestas={respuestas}
            />
          ) : (
            <>
              {fromLanding && paso === 0 && (
                <div style={s.badge}>✓ Tu idea ya fue guardada — solo completá estos datos</div>
              )}
              <h2 style={s.titulo}>{pasoActual.titulo}</h2>
              <p style={s.subtitulo}>{pasoActual.subtitulo}</p>
              {pasoActual.tipo === "text" && (
                <input style={s.input} type="text" placeholder={pasoActual.placeholder}
                  value={valor} onChange={e => setValor(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && puedeAvanzar && siguiente()} autoFocus />
              )}
              {pasoActual.tipo === "textarea" && (
                <textarea style={s.textarea} placeholder={pasoActual.placeholder}
                  value={valor} onChange={e => setValor(e.target.value)} autoFocus />
              )}
              {pasoActual.tipo === "opciones" && (
                <div style={s.opciones}>
                  {pasoActual.opciones?.map(op => (
                    <button key={op.valor}
                      style={{ ...s.opcion, ...(valor === op.valor ? s.opcionActive : {}) }}
                      onClick={() => setValor(op.valor)}>
                      <span style={s.opcionLabel}>{op.label}</span>
                      <span style={s.opcionDesc}>{op.desc}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        {!showAuth && (
          <div style={s.footer}>
            {paso > 0 && <button style={s.btnBack} onClick={() => setPaso(paso - 1)}>← Volver</button>}
            <button style={{ ...s.btnNext, ...(!puedeAvanzar || loading ? s.btnDisabled : {}) }}
              onClick={siguiente} disabled={!puedeAvanzar || loading}>
              {loading ? "Guardando..." : paso === PASOS.length - 1 ? "🚀 Ver mi roadmap →" : "Siguiente →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Auth inline separado con acceso directo al token ──────────────────────
function AuthInlineForm({ nombre, respuestas, onAuth }: {
  nombre?: string;
  respuestas: Record<string, string>;
  onAuth: (token: string, respuestas: Record<string, string>) => void;
}) {
  const { login, signup, error } = useAuth();
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !pw) return;
    setLoading(true);
    let result: any;
    if (mode === "signup") result = await signup(email, pw);
    else result = await login(email, pw);
    // signup/login deben retornar el token
    if (result?.token) {
      onAuth(result.token, respuestas);
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 10 }}>🌱</div>
        <h2 style={{ ...s.titulo, textAlign: "center" }}>Tu roadmap está listo</h2>
        <p style={{ ...s.subtitulo, textAlign: "center", marginTop: 6 }}>
          Creá tu cuenta gratis para verlo y acceder al mentor IA
        </p>
      </div>
      <div style={{ background: "rgba(0,196,125,0.06)", border: "1px solid rgba(0,196,125,0.15)", borderRadius: 10, padding: "10px 14px" }}>
        <p style={{ color: "var(--verde)", fontSize: 12, margin: 0 }}>
          ✓ Roadmap personalizado para <strong>{nombre || "tu emprendimiento"}</strong> listo para guardar
        </p>
      </div>
      <div style={{ display: "flex", background: "var(--surface-2)", borderRadius: 8, padding: 4, gap: 4 }}>
        {(["signup", "login"] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            style={{ flex: 1, padding: "8px 0", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit", background: mode === m ? "var(--verde)" : "transparent", color: mode === m ? "#000" : "var(--text-muted)" }}>
            {m === "signup" ? "Crear cuenta" : "Ya tengo cuenta"}
          </button>
        ))}
      </div>
      <input style={s.input} type="email" placeholder="Email" value={email}
        onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
      <input style={s.input} type="password" placeholder="Contraseña (mínimo 6 caracteres)" value={pw}
        onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
      {error && <p style={{ color: "#ff8080", fontSize: 12, margin: 0 }}>{error}</p>}
      <button style={{ ...s.btnNext, marginLeft: 0, opacity: loading ? 0.5 : 1 }}
        onClick={handleSubmit} disabled={loading}>
        {loading ? "Generando tu roadmap..." : mode === "signup" ? "Crear cuenta y ver roadmap →" : "Ingresar →"}
      </button>
    </div>
  );
}

export default function OnboardingPage() {
  return <AuthProvider><OnboardingContent /></AuthProvider>;
}

const s: Record<string, React.CSSProperties> = {
  root: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: 20 },
  card: { background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 16, width: "100%", maxWidth: 580, overflow: "hidden" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 28px" },
  logo: { color: "var(--verde)", fontWeight: 800, fontSize: 18 },
  pasoLabel: { color: "var(--text-muted)", fontSize: 13 },
  progressBg: { height: 3, background: "var(--surface-2)" },
  progressFill: { height: 3, background: "var(--verde)", transition: "width 0.4s ease" },
  body: { padding: "32px 28px", display: "flex", flexDirection: "column", gap: 16 },
  badge: { background: "rgba(0,196,125,0.08)", border: "1px solid rgba(0,196,125,0.2)", borderRadius: 8, padding: "8px 14px", color: "var(--verde)", fontSize: 12 },
  titulo: { color: "var(--text-primary)", fontSize: 22, fontWeight: 700, lineHeight: 1.3, margin: 0 },
  subtitulo: { color: "var(--text-muted)", fontSize: 14, lineHeight: 1.6, margin: 0 },
  input: { background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text-primary)", fontSize: 15, padding: "14px 16px", outline: "none", fontFamily: "inherit" },
  textarea: { background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text-primary)", fontSize: 14, padding: "14px 16px", outline: "none", fontFamily: "inherit", minHeight: 120, resize: "vertical", lineHeight: 1.6 },
  opciones: { display: "flex", flexDirection: "column", gap: 8 },
  opcion: { background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px", cursor: "pointer", textAlign: "left", display: "flex", flexDirection: "column", gap: 3 },
  opcionActive: { border: "1.5px solid var(--verde)", background: "rgba(0,196,125,0.08)" },
  opcionLabel: { color: "var(--text-primary)", fontSize: 14, fontWeight: 600 },
  opcionDesc: { color: "var(--text-muted)", fontSize: 12 },
  footer: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 28px", borderTop: "1px solid var(--border)" },
  btnBack: { background: "transparent", border: "1px solid var(--border)", color: "var(--text-muted)", padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: "inherit" },
  btnNext: { background: "var(--verde)", color: "#000", border: "none", padding: "12px 28px", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer", marginLeft: "auto", fontFamily: "inherit" },
  btnDisabled: { opacity: 0.4, cursor: "not-allowed" },
};