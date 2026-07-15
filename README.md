# 🌱 Semillai — Tu co-fundador con IA

Co-fundador virtual para emprendedores latinoamericanos. Semillai genera un roadmap personalizado para tu negocio y te acompaña con un mentor IA que conoce tu proyecto en detalle.

## Stack
- **Frontend + Backend:** Next.js 14 (App Router)
- **Auth + DB:** Firebase (Authentication + Firestore)
- **IA:** Groq (llama-3.3-70b)
- **Deploy:** Render

## Estructura
```
src/
  app/
    page.tsx              ← Login/Signup
    onboarding/page.tsx   ← 5 pasos para describir el emprendimiento
    dashboard/page.tsx    ← Roadmap personalizado + progreso
    mentor/page.tsx       ← Chat con mentor IA
    api/
      onboarding/         ← POST guardar proyecto, GET traer proyecto
      proyecto/           ← PATCH actualizar roadmap
      chat/               ← POST enviar mensaje, GET historial
  components/
    AuthScreen.tsx
  hooks/
    useAuth.ts
  lib/
    firebase-client.ts
    firebase-admin.ts
    groq.ts
    auth-server.ts
```

## Setup local

1. Cloná el repo
2. `npm install`
3. Copiá `.env.example` a `.env.local` y completá las variables
4. `npm run dev`

## Deploy en Render

1. Pusheá a GitHub
2. New Web Service en Render → conectá el repo
3. Build: `npm install && npm run build`
4. Start: `npm start`
5. Agregá todas las env vars del `.env.example`

## Variables de entorno necesarias

### Firebase Console → Project Settings → Web App
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### Firebase Console → Project Settings → Service Accounts → Generate new private key
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

### Groq Console → API Keys
- `GROQ_API_KEY`
