import type { Metadata, Viewport } from "next";
import { Gentium_Plus, Noto_Sans, Noto_Serif_Hebrew } from "next/font/google";
import "./globals.css";

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
});

const notoSerifHebrew = Noto_Serif_Hebrew({
  variable: "--font-noto-serif-hebrew",
  subsets: ["hebrew"],
});

const gentiumPlus = Gentium_Plus({
  variable: "--font-gentium-plus",
  weight: ["400", "700"],
  subsets: ["latin", "greek"],
});

export const metadata: Metadata = {
  title: "Aleph Translate",
  description:
    "iPad-first Hebrew and Greek translation workspace with local autosave.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Aleph Translate",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
    <html
      lang="en"
      className={`${notoSans.variable} ${notoSerifHebrew.variable} ${gentiumPlus.variable} h-full antialiased`}
    >
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  );
}
