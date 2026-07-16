import admin from "firebase-admin";
import { readFileSync } from "fs";

function initFirebase() {
  if (admin.apps.length) return;

  try {
    // Opción 1: Secret File (más confiable en Render)
    const secretPath = "/etc/secrets/firebase.json";
    try {
      const sa = JSON.parse(readFileSync(secretPath, "utf8"));
      admin.initializeApp({ credential: admin.credential.cert(sa) });
      console.log("[firebase-admin] Inicializado desde secret file");
      return;
    } catch {
      // archivo no existe, seguir con variables de entorno
    }

    // Opción 2: Variable FIREBASE_SERVICE_ACCOUNT (JSON completo)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({ credential: admin.credential.cert(sa) });
      console.log("[firebase-admin] Inicializado desde FIREBASE_SERVICE_ACCOUNT");
      return;
    }

    // Opción 3: Variables separadas
    const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "")
      .replace(/\\n/g, "\n")
      .replace(/^"|"$/g, "");

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        privateKey,
      }),
    });
    console.log("[firebase-admin] Inicializado desde variables separadas");
  } catch (e) {
    console.error("[firebase-admin] Error:", e);
    throw e;
  }
}

initFirebase();

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();