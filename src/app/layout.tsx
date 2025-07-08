import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeProvider from "./components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "gdotv",
  description: "gdotv: Visualize, edit, and query property graphs with Gremlin.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/gdotv.png",
  },
  openGraph: {
    title: "gdotv",
    description: "gdotv: Visualize, edit, and query property graphs with Gremlin.",
    url: "https://gdote.nimesh.info.np/", // Update with your actual domain
    siteName: "gdotv",
    images: [
      {
        url: "/gdotv.png",
        width: 512,
        height: 512,
        alt: "gdotv logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "gdotv",
    description: "gdotv: Visualize, edit, and query property graphs with Gremlin.",
    images: ["/gdotv.png"],
    site: "@", // Update with your Twitter handle if available
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={"antialiased transition-colors"}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
