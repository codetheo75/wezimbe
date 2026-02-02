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

export const metadata: Metadata = {
  title: "Wezimbe - Group Savings Platform",
  description: "Save together with friends and family. Create, manage, and track group and personal savings goals with Wezimbe.",
  keywords: "savings, group savings, financial goals, collaborative saving",
  openGraph: {
    title: "Wezimbe - Group Savings Platform",
    description: "Save together with friends and family. Create, manage, and track group and personal savings goals.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans bg-slate-50`}
      >
        {children}
      </body>
    </html>
  );
}
