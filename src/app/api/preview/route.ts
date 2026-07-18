import { NextRequest, NextResponse } from "next/server";
import { groqChat } from "@/lib/groq";

export async function POST(req: NextRequest) {
  const { idea, rubro, etapa } = await req.json();

  if (!idea?.trim()) {
    return NextResponse.json({ error: "Idea requerida" }, { status: 400 });
  }

  try {
    const raw = await groqChat([
      {
        role: "system",
        content: "Generás previews de roadmaps para emprendimientos. Respondés SOLO con JSON válido, sin markdown ni texto extra.",
      },
      {
        role: "user",
        content: `Generá un preview rápido para este emprendimiento:
Idea: ${idea}
Rubro: ${rubro || "no especificado"}
Etapa: ${etapa || "idea"}

Respondé SOLO con este JSON:
{
  "resumen": "análisis de la idea en una oración motivadora",
  "fortalezas": ["fortaleza1", "fortaleza2", "fortaleza3"],
  "etapas": [
    { "icon": "emoji", "titulo": "nombre de la etapa", "descripcion": "qué se logra" },
    { "icon": "emoji", "titulo": "nombre de la etapa", "descripcion": "qué se logra" },
    { "icon": "emoji", "titulo": "nombre de la etapa", "descripcion": "qué se logra" },
    { "icon": "emoji", "titulo": "nombre de la etapa", "descripcion": "qué se logra" }
  ]
}`,
      },
    ], 600);

    const preview = JSON.parse(raw.replace(/```json\n?|\n?```/g, "").trim());
    return NextResponse.json(preview);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
