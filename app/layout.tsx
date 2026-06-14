import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 🔁 Заміни на свій домен після деплою на Vercel
const APP_URL =
  process.env.NEXT_PUBLIC_URL || "https://YOUR-DOMAIN.vercel.app";

// Base Mini App embed (показує кнопку "Грати" при шерингу посилання)
const miniapp = {
  version: "1",
  imageUrl: `${APP_URL}/og.png`,
  button: {
    title: "🎮 Грати",
    action: {
      type: "launch_miniapp",
      name: "Три в ряд",
      url: APP_URL,
      splashImageUrl: `${APP_URL}/splash.png`,
      splashBackgroundColor: "#0a0e1a",
    },
  },
};

export const metadata: Metadata = {
  title: "Три в ряд — Base Mini App",
  description: "Гра «три в ряд» (match-3) як Base Mini App на Next.js",
  other: {
    "fc:miniapp": JSON.stringify(miniapp),
    // зворотна сумісність зі старою назвою тега
    "fc:frame": JSON.stringify(miniapp),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uk"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
