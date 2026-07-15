import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth-server";
import { adminDb } from "@/lib/firebase-admin";

export async function PATCH(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  await adminDb.collection("proyectos").doc(user.uid).update({
    ...body,
    actualizado_en: new Date(),
  });

  return NextResponse.json({ ok: true });
}
