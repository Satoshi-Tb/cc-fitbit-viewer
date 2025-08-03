import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import { Provider } from "jotai";
import "./globals.css";

// Next.js 14で利用可能なフォントに変更
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fitbit ヘルスケアビューワ",
  description: "Fitbitのヘルスケア情報を表示するビューワアプリケーション",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${inter.variable} ${robotoMono.variable} antialiased bg-gray-50`}>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
