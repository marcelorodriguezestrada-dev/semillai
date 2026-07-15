import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Semillai — Tu co-fundador con IA",
  description: "Construí tu emprendimiento con inteligencia artificial",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
