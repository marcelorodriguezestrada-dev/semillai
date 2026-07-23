import { NextRequest, NextResponse } from "next/server";
import { groqChat } from "@/lib/groq";

export async function POST(req: NextRequest) {
  const { nombre, descripcion, etapa, rubro, objetivo } = await req.json();

  const roadmapRaw = await groqChat([
    {
      role: "system",
      content: "Generás roadmaps para emprendimientos. Respondés SOLO con JSON válido, sin markdown.",
    },
    {
      role: "user",
      content: `Generá un roadmap para:
Nombre: ${nombre}
Descripción: ${descripcion}
Etapa: ${etapa}
Rubro: ${rubro}
Objetivo: ${objetivo}

JSON:
{
  "nombre": "${nombre}",
  "descripcion": "${descripcion}",
  "etapa": "${etapa}",
  "rubro": "${rubro}",
  "objetivo": "${objetivo}",
  "roadmap": {
    "resumen": "análisis en 2 oraciones",
    "fortalezas": ["f1","f2","f3"],
    "desafios": ["d1","d2"],
    "consejo_semana": "consejo accionable",
    "etapas": [
      {
        "id": "etapa_1",
        "nombre": "Nombre etapa",
        "descripcion": "qué se logra",
        "estado": "activa",
        "semanas": 4,
        "modulos": [
          {"id":"mod_1","titulo":"título","descripcion":"desc","tipo":"ejercicio","completado":false}
        ]
      }
    ]
  }
}

4 etapas, primera activa, resto pendiente, 3-5 módulos por etapa.`,
    },
  ], 3000);

  try {
    const proyecto = JSON.parse(roadmapRaw.replace(/```json\n?|\n?```/g, "").trim());
    return NextResponse.json({ proyecto });
  } catch {
    return NextResponse.json({ error: "Error generando roadmap" }, { status: 500 });
  }
}