import "./globals.css";
import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { ToasterProvider } from "@/components/providers/toaster";

const font = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Healthcare Workforce",
  description: "Healthcare workforce management platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${font.className} min-h-screen bg-background text-text`}>
        {children}
        <ToasterProvider />
      </body>
    </html>
  );
}
