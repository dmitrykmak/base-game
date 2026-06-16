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

// Домен продакшн-деплою на Vercel
const APP_URL =
  process.env.NEXT_PUBLIC_URL || "https://base-game-three.vercel.app";

// Base Mini App embed (показує кнопку "Грати" при шерингу посилання)
const miniapp = {
  version: "1",
  imageUrl: `${APP_URL}/og.png`,
  button: {
    title: "⚡ Грати",
    action: {
      type: "launch_miniapp",
      name: "Base Tap Rush",
      url: APP_URL,
      splashImageUrl: `${APP_URL}/splash.png`,
      splashBackgroundColor: "#0a0e1a",
    },
  },
};

export const metadata: Metadata = {
  title: "Base Tap Rush — Base Mini App",
  description:
    "Тапай по цілі, нарощуй комбо й множник очок. Кожен тап — мікротранзакція в мережі Base.",
  other: {
    // Base.dev — підтвердження власності домену (App ID)
    "base:app_id": "6a2ea5a1894040438b8e6431",
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
