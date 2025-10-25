import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ImageContest - プロンプト競技",
  description: "AIを活用した画像生成プロンプトの精度を競うWebアプリケーション",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="dark">
      <body className="bg-background-light dark:bg-background-dark">
        {children}
      </body>
    </html>
  );
}

