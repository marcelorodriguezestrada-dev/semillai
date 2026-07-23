"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";

const PASOS = [
  { id: "nombre", titulo: "¿Cómo se llama tu emprendimiento?", subtitulo: "Si todavía no tiene nombre, poné una idea o descripción corta.", tipo: "text", placeholder: "Ej: Semillai, Mi tienda de ropa, AppDelivery..." },
  { id: "descripcion", titulo: "¿Qué problema resuelve?", subtitulo: "Describilo en 2-3 oraciones. Sé específico — ¿a quién le resuelve el problema?", tipo: "textarea", placeholder: "Ej: Ayudo a emprendedores a construir su negocio con IA..." },
  { id: "etapa", titulo: "¿En qué etapa está tu emprendimiento?", tipo: "opciones", opciones: [
    { valor: "idea", label: "💡 Idea", desc: "Todavía es un concepto en mi cabeza" },
    { valor: "validando", label: "🔍 Validando", desc: "Estoy hablando con potenciales clientes" },
    { valor: "mvp", label: "🛠 MVP", desc: "Tengo un producto básico funcionando" },
    { valor: "primeros_clientes", label: "👥 Primeros clientes", desc: "Ya tengo algunas ventas o usuarios" },
    { valor: "creciendo", label: "🚀 Creciendo", desc: "Tengo tracción y quiero escalar" },
  ]},
  { id: "rubro", titulo: "¿En qué rubro opera?", tipo: "opciones", opciones: [
    { valor: "tech", label: "💻 Tech / Software", desc: "Apps, SaaS, plataformas digitales" },
    { valor: "ecommerce", label: "🛒 E-commerce", desc: "Venta de productos online" },
    { valor: "servicios", label: "🤝 Servicios", desc: "Consultoría, freelance, agencia" },
    { valor: "alimentos", label: "🍕 Alimentos", desc: "Gastronomía, delivery, catering" },
    { valor: "educacion", label: "📚 Educación", desc: "Cursos, tutorías, formación" },
    { valor: "salud", label: "🏥 Salud y bienestar", desc: "Fitness, nutrición, salud mental" },
    { valor: "otro", label: "🔧 Otro", desc: "No encaja en las anteriores" },
  ]},
  { id: "objetivo", titulo: "¿Cuál es tu principal objetivo ahora?", tipo: "opciones", opciones: [
    { valor: "validar", label: "✅ Validar la idea", desc: "Confirmar que hay demanda real" },
    { valor: "primeros_clientes", label: "💰 Conseguir primeros clientes", desc: "Generar las primeras ventas" },
    { valor: "producto", label: "🛠 Construir el producto", desc: "Desarrollar el MVP" },
    { valor: "financiamiento", label: "💵 Conseguir financiamiento", desc: "Inversores o subsidios" },
    { valor: "escalar", label: "📈 Escalar", desc: "Crecer en ventas y equipo" },
  ]},
];

export default function OnboardingPage() {
  const router = useRouter();
  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const pasoActual = PASOS[paso];
  const valor = respuestas[pasoActual.id] || "";
  const puedeAvanzar = valor.trim().length > 0;
  const progreso = ((paso + 1) / PASOS.length) * 100;

  const setValor = (v: string) => setRespuestas(prev => ({ ...prev, [pasoActual.id]: v }));

  const siguiente = async () => {
    if (paso < PASOS.length - 1) { setPaso(paso + 1); return; }
    setLoading(true);
    try {
      // Guardar en localStorage y redirigir al dashboard
      localStorage.setItem("semillai_proyecto", JSON.stringify(respuestas));
      router.push("/dashboard");
    } catch {
      alert("Error. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.root}>
      <div style={s.card}>
        <div style={s.header}>
          <span style={s.logo}>🌱 semillai</span>
          <span style={s.pasoLabel}>{paso + 1} / {PASOS.length}</span>
        </div>
        <div style={s.progressBg}>
          <div style={{ ...s.progressFill, width: `${progreso}%` }} />
        </div>
        <div style={s.body}>
          <h2 style={s.titulo}>{pasoActual.titulo}</h2>
          {pasoActual.subtitulo && <p style={s.subtitulo}>{pasoActual.subtitulo}</p>}
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
        </div>
        <div style={s.footer}>
          {paso > 0 && <button style={s.btnBack} onClick={() => setPaso(paso - 1)}>← Volver</button>}
          <button style={{ ...s.btnNext, ...(!puedeAvanzar || loading ? s.btnDisabled : {}) }}
            onClick={siguiente} disabled={!puedeAvanzar || loading}>
            {loading ? "Cargando..." : paso === PASOS.length - 1 ? "🚀 Ver mi roadmap →" : "Siguiente →"}
          </button>
        </div>
      </div>
    </div>
  );
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