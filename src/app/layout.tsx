import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { BrandingProvider } from "@/components/BrandingProvider";
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
  title: "Bodana Creation Machine | One Platform. Every Workflow.",
  description:
    "Type one sentence and get movies, music, websites, ads, documents, and code — autonomous AI creation with 94 capabilities.",
  keywords: [
    "AI creation",
    "autonomous agent",
    "video generation",
    "AI music",
    "website builder",
    "creation machine",
  ],
  openGraph: {
    title: "Bodana Creation Machine",
    description: "SuperCool-style autonomous creation — one prompt, finished assets.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full bg-[#050505] text-white">
        <BrandingProvider>{children}</BrandingProvider>
      </body>
    </html>
  );
}
