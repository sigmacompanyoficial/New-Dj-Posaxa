import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: "DJ POSAXA | DJ Professional a Granollers i Barcelona",
  description: "Reserva el millor DJ per a les teves festes, esdeveniments i festivals. Música personalitzada, equip professional i l'energia que la teva festa necessita.",
  keywords: ["DJ Granollers", "DJ Barcelona", "DJ festes majors", "DJ casaments", "DJ esdeveniments", "DJ Posaxa", "música en viu"],
  authors: [{ name: "DJ Posaxa" }],
  creator: "Sigma Company",
  openGraph: {
    title: "DJ POSAXA | Experiències Musicals Inoblidables",
    description: "Sessió de DJ professional per a tot tipus d'esdeveniments.",
    url: "https://djposaxa.com",
    siteName: "DJ POSAXA",
    images: [
      {
        url: "/Fotos/dj-posaxa-logo.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "ca_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DJ POSAXA",
    description: "DJ Professional a Granollers",
    images: ["/Fotos/dj-posaxa-logo.png"],
  },
  icons: {
    icon: "/Fotos/dj-posaxa-logo.png",
    apple: "/Fotos/dj-posaxa-logo.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ca" data-scroll-behavior="smooth">
      <body className={`${inter.className} bg-black-deep text-white-pure antialiased overflow-x-hidden selection:bg-white-pure selection:text-black-deep`}>
        <Providers>
          <Navbar />
          <main className="pb-20 md:pb-0">{children}</main>
          <MobileBottomNav />
          <div className="hidden md:block">
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
