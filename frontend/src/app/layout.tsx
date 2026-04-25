import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { Playfair_Display as Playfair, DM_Sans as DMSans } from "next/font/google";

const playfair = Playfair({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const dmSans = DMSans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "SourceMind — AI Document Intelligence",
  description: "Upload PDFs, URLs, and text sources. Chat with citations, summarize research, compare documents, and detect gaps.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${dmSans.variable} font-body antialiased`}>
        {children}
        <Toaster position="top-right" theme="dark" closeButton />
      </body>
    </html>
  );
}
