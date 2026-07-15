import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth-server";
import { adminDb } from "@/lib/firebase-admin";
import { groqChat } from "@/lib/groq";

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { mensaje, historial } = await req.json();

  // Traer proyecto del usuario
  const doc = await adminDb.collection("proyectos").doc(user.uid).get();
  const proyecto = doc.data();

  if (!proyecto) return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });

  const { nombre, descripcion, etapa, rubro, objetivo, roadmap } = proyecto;
  const etapaActiva = roadmap?.etapas?.find((e: any) => e.estado === "activa");

  const systemPrompt = `Sos el mentor IA de Semillai, un co-fundador virtual experto en emprendimientos latinoamericanos.

Conocés en detalle el emprendimiento de este usuario:
- Nombre: ${nombre}
- Descripción: ${descripcion}
- Rubro: ${rubro}
- Etapa: ${etapa}
- Objetivo principal: ${objetivo}
- Etapa actual del roadmap: ${etapaActiva?.nombre || "No definida"}
- Módulos en progreso: ${etapaActiva?.modulos?.map((m: any) => m.titulo).join(", ") || "ninguno"}

Tu estilo:
- Sos directo, práctico y motivador
- Usás ejemplos concretos aplicados a SU negocio específico
- Nunca dás consejos genéricos — siempre personalizados
- Si no sabés algo, lo decís claramente
- Respondés en español rioplatense (vos, che, etc.)
- Tus respuestas son concisas (máximo 200 palabras) salvo que te pidan más detalle`;

  const messages = [
    { role: "system" as const, content: systemPrompt },
    ...(historial || []),
    { role: "user" as const, content: mensaje },
  ];

  const respuesta = await groqChat(messages, 1000);

  // Guardar historial en Firestore
  const chatRef = adminDb.collection("chats").doc(user.uid);
  const chatDoc = await chatRef.get();
  const mensajes = chatDoc.exists ? chatDoc.data()?.mensajes || [] : [];
  mensajes.push(
    { role: "user", content: mensaje, ts: new Date() },
    { role: "assistant", content: respuesta, ts: new Date() }
  );
  await chatRef.set({ mensajes: mensajes.slice(-100) }); // máximo 100 mensajes

  return NextResponse.json({ respuesta });
}

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const doc = await adminDb.collection("chats").doc(user.uid).get();
  const mensajes = doc.exists ? doc.data()?.mensajes || [] : [];

  return NextResponse.json({ mensajes });
}
