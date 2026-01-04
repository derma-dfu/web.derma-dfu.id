import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import Navigation from "@/components/Navigation";
import FooterWrapper from "@/components/FooterWrapper";
import ChatWidget from "@/components/ChatWidget";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "DERMA-DFU - Platform Perawatan Luka Diabetes",
    description: "Platform inovatif untuk manajemen luka diabetes di Indonesia. Konsultasi dengan ahli medis profesional.",
    icons: {
        icon: "/logo/logo-derma-dfu-low-res.png",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://accounts.google.com" />
                <link rel="preconnect" href="https://ljllloeneawemiffitrm.supabase.co" />
            </head>
            <body className={inter.className}>
                <Providers>
                    <Navigation />
                    <ChatWidget />
                    <main className="min-h-screen">
                        {children}
                    </main>
                    <FooterWrapper />
                    <Toaster />
                    <Sonner />
                </Providers>
            </body>
        </html>
    );
}
