import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DJ Posaxa | Cold Culture",
  description: "Música professional per a festes i esdeveniments a Granollers i Barcelona.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ca">
      <body className={`${inter.className} bg-black-deep text-white-pure antialiased overflow-x-hidden selection:bg-white-pure selection:text-black-deep`}>
        <Navbar />
        <main className="pb-20 md:pb-0">{children}</main>
        <MobileBottomNav />
        <div className="hidden md:block">
          <Footer />
        </div>
      </body>
    </html>
  );
}
