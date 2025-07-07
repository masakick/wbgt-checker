import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { PWAInstaller } from "@/components/PWAInstaller";
import { WebVitalsReporter } from "@/components/WebVitalsReporter";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { ToastProvider } from "@/contexts/ToastContext";
import { ToastContainer } from "@/components/Toast";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: "暑さ指数チェッカー - 全国841地点WBGT情報",
  description: "日本全国841地点の暑さ指数（WBGT）をリアルタイムでチェック。21時点詳細予報と運動指針で熱中症を予防しましょう。環境省・気象庁データを使用。",
  keywords: "暑さ指数,WBGT,熱中症予防,気温,湿度,環境省,気象庁,リアルタイム",
  authors: [{ name: "山辺真幸", url: "https://twitter.com/masakick" }],
  creator: "一橋大学大学院 ソーシャル・データサイエンス研究科 山辺真幸",
  publisher: "一橋大学大学院 ソーシャル・データサイエンス研究科",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "https://your-domain.com",
    title: "暑さ指数チェッカー",
    description: "全国840地点の暑さ指数（WBGT）をリアルタイムで確認できる熱中症予防アプリ",
    siteName: "暑さ指数チェッカー",
  },
  twitter: {
    card: "summary_large_image",
    title: "暑さ指数チェッカー",
    description: "全国840地点の暑さ指数（WBGT）をリアルタイムで確認",
    creator: "@masakick",
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "暑さ指数チェッカー",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.className} antialiased`}>
        <ToastProvider>
          {children}
          <ToastContainer />
        </ToastProvider>
        <PWAInstaller />
        <WebVitalsReporter />
        <AnalyticsProvider />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('[SW] Registration successful:', registration.scope);
                    })
                    .catch(function(error) {
                      console.log('[SW] Registration failed:', error);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
