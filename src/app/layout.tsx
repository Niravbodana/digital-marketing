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
  title: "Bodana Digital | Growth-Driven Digital Marketing",
  description:
    "Bodana Digital helps brands grow with SEO, social media marketing, paid ads, and content strategy. Built by Nirav Bodana.",
  keywords: [
    "digital marketing",
    "SEO",
    "social media marketing",
    "PPC",
    "brand strategy",
    "India",
  ],
  openGraph: {
    title: "Bodana Digital | Growth-Driven Digital Marketing",
    description: "We turn attention into revenue. SEO, social, ads & content.",
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
      <body className="min-h-full bg-[#030712] text-slate-50">
        <BrandingProvider>{children}</BrandingProvider>
      </body>
    </html>
  );
}
