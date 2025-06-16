"use client";
import { Outfit } from "next/font/google";
import "@/styles/globals.css";
import { Toaster } from 'sonner'
import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { useEffect, useState } from "react";

const outfit = Outfit({
  variable: "--font-outfit-sans",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // State to track if component is mounted (for hydration)
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <html lang="en">
      <body className={`${outfit.variable} dark:bg-gray-900`}>
        {/* Only render providers after mounting to avoid hydration issues */}
        {mounted && (
          <ThemeProvider>
            <SidebarProvider>{children}</SidebarProvider>
          </ThemeProvider>
        )}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}