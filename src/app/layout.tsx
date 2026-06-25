import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import SmoothScrolling from "@/components/SmoothScrolling";
import { AppProvider } from "@/context/AppContext";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KRISHNA FURNITURE | Premium E-Commerce",
  description: "High-end luxury furniture store built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col font-sans text-neutral-900 bg-neutral-50 selection:bg-[#B88E2F] selection:text-white">
        <SmoothScrolling>
          <AppProvider>
            {children}
            <Toaster position="bottom-right" toastOptions={{
              className: 'bg-white/80 backdrop-blur-md border border-neutral-200 text-neutral-900 font-medium tracking-wide shadow-lg rounded-xl',
              duration: 3000,
            }} />
          </AppProvider>
        </SmoothScrolling>
      </body>
    </html>
  );
}
