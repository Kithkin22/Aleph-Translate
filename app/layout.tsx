import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { SwapStoreProvider } from "@/context/SwapStoreContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shift Swap",
  description:
    "Request, review, and approve coworker shift swaps with local mock data.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf9" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0a09" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-dvh font-sans">
        <SwapStoreProvider>{children}</SwapStoreProvider>
      </body>
    </html>
  );
}
