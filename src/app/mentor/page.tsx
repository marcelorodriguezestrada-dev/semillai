"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth, AuthProvider } from "@/hooks/useAuth";

interface Mensaje { role: "user" | "assistant"; content: string; ts?: any; }

const SUGERENCIAS = [
  "¿Cómo valido mi idea sin gastar plata?",
  "Ayudame a definir mi cliente ideal",
  "¿Cómo consigo mis primeros 10 clientes?",
  "¿Qué precio le pongo a mi producto?",
  "¿Cómo armo un pitch para inversores?",
  "Revisá mi modelo de negocio",
];

function MentorContent() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistorial, setLoadingHistorial] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) { router.push("/"); return; }
    fetch("/api/chat", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setMensajes(d.mensajes || []))
      .finally(() => setLoadingHistorial(false));
  }, [user, token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, loading]);

  const enviar = async (texto?: string) => {
    const msg = texto || input.trim();
    if (!msg || loading) return;
    setInput("");

    const nuevo: Mensaje = { role: "user", content: msg };
    setMensajes(prev => [...prev, nuevo]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          mensaje: msg,
          historial: mensajes.slice(-10).map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      setMensajes(prev => [...prev, { role: "assistant", content: data.respuesta }]);
    } catch {
      setMensajes(prev => [...prev, { role: "assistant", content: "Hubo un error. Intentá de nuevo." }]);
    } finally {
      setLoading(false);
    }
  };

  const esPrimero = !loadingHistorial && mensajes.length === 0;

  return (
    <div style={s.root}>
      {/* Header */}
      <header style={s.header}>
        <div style={s.headerLeft}>
          <button style={s.btnBack} onClick={() => router.push("/dashboard")}>← Dashboard</button>
          <div style={s.mentorInfo}>
            <span style={s.mentorAvatar}>🌱</span>
            <div>
              <p style={s.mentorNombre}>Mentor Semillai</p>
              <p style={s.mentorEstado}>● Activo — conoce tu proyecto</p>
            </div>
          </div>
        </div>
        <span style={s.logo}>semillai</span>
      </header>

      {/* Chat */}
      <div style={s.chatWrap}>
        {loadingHistorial && (
          <div style={s.centrado}><p style={{ color: "var(--muted)" }}>Cargando conversación...</p></div>
        )}

        {esPrimero && (
          <div style={s.bienvenida}>
            <span style={{ fontSize: 48 }}>🌱</span>
            <h2 style={s.bienvenidaTitulo}>¡Hola! Soy tu mentor de Semillai</h2>
            <p style={s.bienvenidaDesc}>Conozco tu proyecto en detalle y estoy acá para ayudarte a hacerlo crecer. Podés preguntarme cualquier cosa.</p>
            <div style={s.sugerencias}>
              {SUGERENCIAS.map((s_, i) => (
                <button key={i} style={s.sugerenciaBtn} onClick={() => enviar(s_)}>
                  {s_}
                </button>
              ))}
            </div>
          </div>
        )}

        {mensajes.map((m, i) => (
          <div key={i} style={{ ...s.msgRow, ...(m.role === "user" ? s.msgRowUser : {}) }}>
            {m.role === "assistant" && <div style={s.avatar}>🌱</div>}
            <div style={{ ...s.bubble, ...(m.role === "user" ? s.bubbleUser : s.bubbleAssistant) }}>
              {m.content.split("\n").map((line, j) => (
                <span key={j}>{line}{j < m.content.split("\n").length - 1 && <br />}</span>
              ))}
            </div>
          </div>
        ))}

        {loading && (
          <div style={s.msgRow}>
            <div style={s.avatar}>🌱</div>
            <div style={{ ...s.bubble, ...s.bubbleAssistant, ...s.typing }}>
              <span style={s.dot} />
              <span style={s.dot} />
              <span style={s.dot} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={s.inputArea}>
        {!esPrimero && mensajes.length > 0 && (
          <div style={s.sugerenciasBottom}>
            {SUGERENCIAS.slice(0, 3).map((sg, i) => (
              <button key={i} style={s.sugerenciaBtnSmall} onClick={() => enviar(sg)}>{sg}</button>
            ))}
          </div>
        )}
        <div style={s.inputRow}>
          <textarea
            style={s.input}
            placeholder="Preguntale algo a tu mentor..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(); } }}
            rows={1}
          />
          <button
            style={{ ...s.btnEnviar, ...(loading || !input.trim() ? s.btnEnviarOff : {}) }}
            onClick={() => enviar()}
            disabled={loading || !input.trim()}
          >
            ↑
          </button>
        </div>
        <p style={s.hint}>Enter para enviar · Shift+Enter para nueva línea</p>
      </div>
    </div>
  );
}

export default function MentorPage() {
  return <AuthProvider><MentorContent /></AuthProvider>;
}

const s: Record<string, React.CSSProperties> = {
  root: { height: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 24px", borderBottom: "1px solid var(--border)", background: "var(--surface)", flexShrink: 0 },
  headerLeft: { display: "flex", alignItems: "center", gap: 16 },
  btnBack: { background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 13 },
  mentorInfo: { display: "flex", alignItems: "center", gap: 10 },
  mentorAvatar: { fontSize: 28, background: "rgba(0,196,125,0.1)", borderRadius: "50%", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" },
  mentorNombre: { color: "var(--text)", fontWeight: 600, fontSize: 14 },
  mentorEstado: { color: "var(--verde)", fontSize: 11 },
  logo: { color: "var(--verde)", fontWeight: 800, fontSize: 16 },
  chatWrap: { flex: 1, overflowY: "auto", padding: "24px 0", display: "flex", flexDirection: "column", gap: 16, maxWidth: 760, width: "100%", margin: "0 auto", paddingLeft: 24, paddingRight: 24 },
  centrado: { display: "flex", alignItems: "center", justifyContent: "center", flex: 1 },
  bienvenida: { display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "40px 20px", textAlign: "center" },
  bienvenidaTitulo: { color: "var(--text)", fontSize: 22, fontWeight: 700 },
  bienvenidaDesc: { color: "var(--muted)", fontSize: 14, lineHeight: 1.6, maxWidth: 440 },
  sugerencias: { display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 8 },
  sugerenciaBtn: { background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", padding: "8px 14px", borderRadius: 20, cursor: "pointer", fontSize: 13 },
  msgRow: { display: "flex", alignItems: "flex-end", gap: 10 },
  msgRowUser: { flexDirection: "row-reverse" },
  avatar: { width: 32, height: 32, background: "rgba(0,196,125,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 },
  bubble: { maxWidth: "75%", padding: "12px 16px", borderRadius: 16, fontSize: 14, lineHeight: 1.6 },
  bubbleAssistant: { background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", borderBottomLeftRadius: 4 },
  bubbleUser: { background: "var(--verde)", color: "#000", fontWeight: 500, borderBottomRightRadius: 4 },
  typing: { display: "flex", gap: 6, alignItems: "center", padding: "14px 18px" },
  dot: { width: 7, height: 7, background: "var(--muted)", borderRadius: "50%", animation: "pulse 1.2s infinite" },
  inputArea: { borderTop: "1px solid var(--border)", background: "var(--surface)", padding: "16px 24px", flexShrink: 0 },
  sugerenciasBottom: { display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" },
  sugerenciaBtnSmall: { background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--muted)", padding: "4px 10px", borderRadius: 20, cursor: "pointer", fontSize: 11 },
  inputRow: { display: "flex", gap: 10, maxWidth: 760, margin: "0 auto", width: "100%" },
  input: { flex: 1, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--text)", fontSize: 14, padding: "12px 16px", outline: "none", fontFamily: "inherit", resize: "none", lineHeight: 1.5 },
  btnEnviar: { width: 44, height: 44, background: "var(--verde)", color: "#000", border: "none", borderRadius: 12, cursor: "pointer", fontSize: 20, fontWeight: 700, flexShrink: 0 },
  btnEnviarOff: { opacity: 0.4, cursor: "not-allowed" },
  hint: { color: "var(--muted)", fontSize: 11, textAlign: "center", marginTop: 8 },
};
