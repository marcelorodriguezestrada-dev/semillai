import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth-server";
import { adminDb } from "@/lib/firebase-admin";
import { groqChat } from "@/lib/groq";

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { nombre, descripcion, etapa, rubro, objetivo } = await req.json();

  // Generar roadmap con Groq
  const roadmapRaw = await groqChat([
    {
      role: "system",
      content: `Sos un experto en emprendimientos y startups latinoamericanas. 
Generás roadmaps personalizados y accionables. 
Respondés SOLO con JSON válido, sin markdown ni texto extra.`,
    },
    {
      role: "user",
      content: `Generá un roadmap personalizado para este emprendimiento:

Nombre: ${nombre}
Descripción: ${descripcion}
Etapa actual: ${etapa}
Rubro: ${rubro}
Objetivo principal: ${objetivo}

Respondé SOLO con este JSON:
{
  "resumen": "análisis breve del emprendimiento en 2 oraciones",
  "fortalezas": ["fortaleza1", "fortaleza2", "fortaleza3"],
  "desafios": ["desafio1", "desafio2"],
  "etapas": [
    {
      "id": "etapa_1",
      "nombre": "Nombre de la etapa",
      "descripcion": "Qué se logra en esta etapa",
      "estado": "activa|pendiente|completada",
      "semanas": 4,
      "modulos": [
        {
          "id": "mod_1",
          "titulo": "Título del módulo",
          "descripcion": "Descripción breve",
          "tipo": "ejercicio|herramienta|entregable",
          "completado": false
        }
      ]
    }
  ],
  "consejo_semana": "Un consejo específico y accionable para esta semana"
}

Generá exactamente 4 etapas adaptadas a la situación del emprendimiento. La primera etapa debe estar en estado 'activa', el resto 'pendiente'. Cada etapa debe tener entre 3 y 5 módulos.`,
    },
  ], 3000);

  let roadmap;
  try {
    roadmap = JSON.parse(roadmapRaw.replace(/```json\n?|\n?```/g, "").trim());
  } catch {
    return NextResponse.json({ error: "Error generando roadmap" }, { status: 500 });
  }

  // Guardar en Firestore
  const now = new Date();
  await adminDb.collection("proyectos").doc(user.uid).set({
    uid: user.uid,
    nombre,
    descripcion,
    etapa,
    rubro,
    objetivo,
    roadmap,
    creado_en: now,
    actualizado_en: now,
  });

  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const doc = await adminDb.collection("proyectos").doc(user.uid).get();
  if (!doc.exists) return NextResponse.json({ proyecto: null });

  return NextResponse.json({ proyecto: doc.data() });
}
