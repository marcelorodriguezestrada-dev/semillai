"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, AuthProvider } from "@/hooks/useAuth";

interface Modulo { id: string; titulo: string; descripcion: string; tipo: string; completado: boolean; }
interface Etapa { id: string; nombre: string; descripcion: string; estado: string; semanas: number; modulos: Modulo[]; }
interface Roadmap { resumen: string; fortalezas: string[]; desafios: string[]; etapas: Etapa[]; consejo_semana: string; }
interface Proyecto { nombre: string; descripcion: string; etapa: string; rubro: string; objetivo: string; roadmap: Roadmap; }

function DashboardContent() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [loading, setLoading] = useState(true);
  const [etapaAbierta, setEtapaAbierta] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { router.push("/"); return; }
    fetch("/api/onboarding", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (!d.proyecto) { router.push("/onboarding"); return; }
        setProyecto(d.proyecto);
        const activa = d.proyecto.roadmap?.etapas?.find((e: Etapa) => e.estado === "activa");
        if (activa) setEtapaAbierta(activa.id);
      })
      .finally(() => setLoading(false));
  }, [user, token]);

  const toggleModulo = async (etapaId: string, moduloId: string) => {
    if (!proyecto) return;
    const nuevasEtapas = proyecto.roadmap.etapas.map(e =>
      e.id !== etapaId ? e : {
        ...e,
        modulos: e.modulos.map(m => m.id !== moduloId ? m : { ...m, completado: !m.completado })
      }
    );
    const actualizado = { ...proyecto, roadmap: { ...proyecto.roadmap, etapas: nuevasEtapas } };
    setProyecto(actualizado);
    await fetch("/api/proyecto", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ roadmap: actualizado.roadmap }),
    });
  };

  if (loading) return (
    <div style={s.loading}>
      <div style={s.loadingInner}>
        <span style={{ fontSize: 32 }}>🌱</span>
        <p style={{ color: "#555", marginTop: 12 }}>Cargando tu proyecto...</p>
      </div>
    </div>
  );

  if (!proyecto) return null;

  const { roadmap } = proyecto;
  const totalModulos = roadmap.etapas.flatMap(e => e.modulos).length;
  const completados = roadmap.etapas.flatMap(e => e.modulos).filter(m => m.completado).length;
  const progreso = Math.round((completados / totalModulos) * 100);

  const tipoColor: Record<string, string> = {
    ejercicio: "#4fc3f7",
    herramienta: "#ce93d8",
    entregable: "#00C47D",
  };

  return (
    <div style={s.root}>
      {/* Header */}
      <header style={s.header}>
        <div style={s.headerLeft}>
          <span style={s.logo}>🌱 semillai</span>
          <span style={s.proyectoNombre}>{proyecto.nombre}</span>
        </div>
        <div style={s.headerRight}>
          <button style={s.btnMentor} onClick={() => router.push("/mentor")}>💬 Mentor IA</button>
          <span style={s.email}>{user?.email}</span>
          <button style={s.btnLogout} onClick={logout}>Salir</button>
        </div>
      </header>

      <main style={s.main}>
        {/* Resumen + progreso */}
        <div style={s.topGrid}>
          <div style={s.resumenCard}>
            <p style={s.resumenLabel}>Tu emprendimiento</p>
            <p style={s.resumenText}>{roadmap.resumen}</p>
            <div style={s.tags}>
              {roadmap.fortalezas.slice(0, 3).map((f, i) => (
                <span key={i} style={s.tagVerde}>{f}</span>
              ))}
            </div>
          </div>

          <div style={s.progresoCard}>
            <p style={s.resumenLabel}>Progreso general</p>
            <div style={s.progCircle}>
              <span style={s.progNum}>{progreso}%</span>
              <span style={s.progSub}>{completados}/{totalModulos} módulos</span>
            </div>
            <div style={s.progBarBg}>
              <div style={{ ...s.progBarFill, width: `${progreso}%` }} />
            </div>
          </div>

          <div style={s.consejoCard}>
            <p style={s.resumenLabel}>💡 Consejo de la semana</p>
            <p style={s.consejoText}>{roadmap.consejo_semana}</p>
          </div>
        </div>

        {/* Roadmap */}
        <div style={s.roadmapSection}>
          <h2 style={s.sectionTitle}>Tu roadmap personalizado</h2>
          <div style={s.etapas}>
            {roadmap.etapas.map((etapa, idx) => {
              const abierta = etapaAbierta === etapa.id;
              const modCompletados = etapa.modulos.filter(m => m.completado).length;
              const estadoColor: Record<string, string> = {
                activa: "#00C47D", pendiente: "#555", completada: "#4fc3f7"
              };
              return (
                <div key={etapa.id} style={{ ...s.etapaCard, ...(etapa.estado === "activa" ? s.etapaActiva : {}) }}>
                  {/* Etapa header */}
                  <div style={s.etapaHeader} onClick={() => setEtapaAbierta(abierta ? null : etapa.id)}>
                    <div style={s.etapaLeft}>
                      <div style={{ ...s.etapaNum, background: estadoColor[etapa.estado] || "#555" }}>
                        {etapa.estado === "completada" ? "✓" : idx + 1}
                      </div>
                      <div>
                        <p style={s.etapaNombre}>{etapa.nombre}</p>
                        <p style={s.etapaDesc}>{etapa.descripcion}</p>
                      </div>
                    </div>
                    <div style={s.etapaRight}>
                      <span style={{ ...s.etapaEstado, color: estadoColor[etapa.estado] }}>
                        {etapa.estado === "activa" ? "● En curso" : etapa.estado === "completada" ? "✓ Completada" : "○ Pendiente"}
                      </span>
                      <span style={s.etapaModCount}>{modCompletados}/{etapa.modulos.length}</span>
                      <span style={s.chevron}>{abierta ? "▲" : "▼"}</span>
                    </div>
                  </div>

                  {/* Módulos */}
                  {abierta && (
                    <div style={s.modulos}>
                      {etapa.modulos.map(mod => (
                        <div
                          key={mod.id}
                          style={{ ...s.moduloRow, ...(mod.completado ? s.moduloCompletado : {}) }}
                          onClick={() => etapa.estado !== "pendiente" && toggleModulo(etapa.id, mod.id)}
                        >
                          <div style={{ ...s.checkbox, ...(mod.completado ? s.checkboxOn : {}) }}>
                            {mod.completado && "✓"}
                          </div>
                          <div style={s.moduloInfo}>
                            <p style={s.moduloTitulo}>{mod.titulo}</p>
                            <p style={s.moduloDesc}>{mod.descripcion}</p>
                          </div>
                          <span style={{ ...s.moduloTipo, color: tipoColor[mod.tipo] || "#888" }}>
                            {mod.tipo}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Desafíos */}
        <div style={s.desafiosCard}>
          <p style={s.resumenLabel}>⚠ Desafíos a tener en cuenta</p>
          <div style={s.desafiosList}>
            {roadmap.desafios.map((d, i) => (
              <div key={i} style={s.desafioRow}>
                <span style={s.desafioIcon}>!</span>
                <span style={s.desafioText}>{d}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return <AuthProvider><DashboardContent /></AuthProvider>;
}

const s: Record<string, React.CSSProperties> = {
  root: { minHeight: "100vh", background: "var(--bg)" },
  loading: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" },
  loadingInner: { textAlign: "center" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 32px", borderBottom: "1px solid var(--border)", background: "var(--surface)" },
  headerLeft: { display: "flex", alignItems: "center", gap: 16 },
  logo: { color: "var(--verde)", fontWeight: 800, fontSize: 18 },
  proyectoNombre: { color: "var(--muted)", fontSize: 13, borderLeft: "1px solid var(--border)", paddingLeft: 16 },
  headerRight: { display: "flex", alignItems: "center", gap: 12 },
  btnMentor: { background: "var(--verde)", color: "#000", border: "none", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13 },
  email: { color: "var(--muted)", fontSize: 12 },
  btnLogout: { background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 12 },
  main: { padding: "32px", maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 28 },
  topGrid: { display: "grid", gridTemplateColumns: "1fr 200px 1fr", gap: 16 },
  resumenCard: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 12 },
  resumenLabel: { color: "var(--muted)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: .06 },
  resumenText: { color: "var(--text)", fontSize: 13, lineHeight: 1.6 },
  tags: { display: "flex", flexWrap: "wrap", gap: 6 },
  tagVerde: { background: "rgba(0,196,125,0.1)", color: "var(--verde)", border: "1px solid rgba(0,196,125,0.2)", padding: "3px 10px", borderRadius: 20, fontSize: 11 },
  progresoCard: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 22px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 },
  progCircle: { display: "flex", flexDirection: "column", alignItems: "center" },
  progNum: { color: "var(--verde)", fontSize: 36, fontWeight: 800 },
  progSub: { color: "var(--muted)", fontSize: 11, marginTop: 2 },
  progBarBg: { width: "100%", height: 6, background: "var(--surface2)", borderRadius: 3, overflow: "hidden" },
  progBarFill: { height: 6, background: "var(--verde)", borderRadius: 3, transition: "width 0.4s" },
  consejoCard: { background: "rgba(0,196,125,0.05)", border: "1px solid rgba(0,196,125,0.15)", borderRadius: 12, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 10 },
  consejoText: { color: "var(--text)", fontSize: 13, lineHeight: 1.6 },
  roadmapSection: { display: "flex", flexDirection: "column", gap: 16 },
  sectionTitle: { color: "var(--text)", fontSize: 16, fontWeight: 700 },
  etapas: { display: "flex", flexDirection: "column", gap: 10 },
  etapaCard: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" },
  etapaActiva: { border: "1px solid rgba(0,196,125,0.3)" },
  etapaHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", cursor: "pointer" },
  etapaLeft: { display: "flex", alignItems: "center", gap: 14 },
  etapaNum: { width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#000", fontWeight: 800, fontSize: 13, flexShrink: 0 },
  etapaNombre: { color: "var(--text)", fontWeight: 600, fontSize: 14 },
  etapaDesc: { color: "var(--muted)", fontSize: 12, marginTop: 2 },
  etapaRight: { display: "flex", alignItems: "center", gap: 12 },
  etapaEstado: { fontSize: 12, fontWeight: 500 },
  etapaModCount: { color: "var(--muted)", fontSize: 12 },
  chevron: { color: "var(--muted)", fontSize: 11 },
  modulos: { borderTop: "1px solid var(--border)", padding: "8px 0" },
  moduloRow: { display: "flex", alignItems: "center", gap: 12, padding: "10px 20px", cursor: "pointer", transition: "background 0.1s" },
  moduloCompletado: { opacity: 0.5 },
  checkbox: { width: 20, height: 20, border: "1.5px solid var(--border)", borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#000", flexShrink: 0 },
  checkboxOn: { background: "var(--verde)", borderColor: "var(--verde)" },
  moduloInfo: { flex: 1 },
  moduloTitulo: { color: "var(--text)", fontSize: 13, fontWeight: 500 },
  moduloDesc: { color: "var(--muted)", fontSize: 11, marginTop: 2 },
  moduloTipo: { fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: .05 },
  desafiosCard: { background: "rgba(255,80,80,0.04)", border: "1px solid rgba(255,80,80,0.15)", borderRadius: 12, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 12 },
  desafiosList: { display: "flex", flexDirection: "column", gap: 8 },
  desafioRow: { display: "flex", alignItems: "flex-start", gap: 10 },
  desafioIcon: { background: "rgba(255,80,80,0.2)", color: "#ff8080", width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 },
  desafioText: { color: "#ff9999", fontSize: 13, lineHeight: 1.5 },
};
