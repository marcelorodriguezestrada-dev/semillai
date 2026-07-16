import admin from "firebase-admin";

function getFirebaseAdmin() {
  if (admin.apps.length) return admin;

  try {
    // Opción 1: JSON completo
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({ credential: admin.credential.cert(sa) });
      return admin;
    }

    // Opción 2: variables separadas
    const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "")
      .replace(/\\n/g, "\n")
      .replace(/^"|"$/g, ""); // quitar comillas extra si las hay

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        privateKey,
      }),
    });
  } catch (e) {
    console.error("[firebase-admin] Error inicializando:", e);
    throw e;
  }

  return admin;
}

export function getAdminDb() {
  return getFirebaseAdmin().firestore();
}

export function getAdminAuth() {
  return getFirebaseAdmin().auth();
}

// Para compatibilidad con código existente
export const adminDb = new Proxy({} as admin.firestore.Firestore, {
  get(_target, prop) {
    return (getFirebaseAdmin().firestore() as any)[prop];
  },
});

export const adminAuth = new Proxy({} as admin.auth.Auth, {
  get(_target, prop) {
    return (getFirebaseAdmin().auth() as any)[prop];
  },
});