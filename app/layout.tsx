import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SiteNavbar from "./components/SiteNavbar";
import { getSessionUser } from "./lib/session";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VidScreener",
  description: "AI-assisted video evaluation platform for structured, explainable decisions.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SiteNavbar user={user} />
        {children}
      </body>
    </html>
  );
}
