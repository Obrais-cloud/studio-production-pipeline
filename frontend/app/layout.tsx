import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Studio Production Pipeline",
  description: "Gestor visual de producción de contenido",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
