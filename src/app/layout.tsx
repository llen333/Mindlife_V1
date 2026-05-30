import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/lib/providers";
import ErrorBoundary from "@/components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mindlife - Gestion Personnelle Intelligente",
  description: "Application de gestion personnelle avec IA pour suivre vos objectifs, nutrition, sport et bien-être.",
  keywords: ["Mindlife", "Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui", "productivité", "bien-être"],
  authors: [{ name: "Mindlife Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Mindlife",
    description: "Gestion personnelle intelligente avec IA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mindlife",
    description: "Gestion personnelle intelligente avec IA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
