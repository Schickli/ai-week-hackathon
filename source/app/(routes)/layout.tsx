import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import '../../components/process/custom-cursor.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Next-Gen Damage Estimation (VZ2)",
  description: "Next-Gen Damage Estimation (VZ2)",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Lazy load to avoid SSR issues
  const CustomCursor = require('../../components/process/CustomCursor').default;
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased p-2`}
      >
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
