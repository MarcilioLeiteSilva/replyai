import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
    title: "ReplyAI — Respostas automáticas para redes sociais",
    description:
        "Automatize 100% das respostas nos comentários do YouTube, Instagram, TikTok e mais com Inteligência Artificial. Economize horas de trabalho.",
    keywords: ["resposta automática", "youtube", "instagram", "ia", "saas", "comentários"],
    openGraph: {
        title: "ReplyAI",
        description: "Respostas inteligentes para suas redes sociais",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="pt-BR" className={inter.variable}>
            <body className="min-h-screen bg-gray-950 text-white antialiased">{children}</body>
        </html>
    );
}
