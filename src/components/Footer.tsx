"use client";

import Link from "next/link";
import { NAV_LINKS } from "@/data/mock";

export default function Footer() {
  return (
    <footer className="bg-black-deep text-white-pure pt-20 pb-8 px-6 md:px-12 border-t border-white-pure/10">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
        {/* Brand */}
        <div>
          <p className="text-2xl font-bold tracking-widest-xl uppercase mb-6">DJ POSAXA</p>
          <p className="text-xs text-gray-500 uppercase tracking-widest max-w-xs leading-loose">
            Música professional per a festes i esdeveniments a Granollers i Barcelona.
          </p>
          <div className="flex gap-4 mt-6">
            <a href="https://www.instagram.com/dj.posaxa/" target="_blank" rel="noopener" className="text-gray-500 hover:text-white-pure transition-colors uppercase text-xs tracking-widest">
              Instagram
            </a>
            <a href="https://www.tiktok.com/@djposaxa" target="_blank" rel="noopener" className="text-gray-500 hover:text-white-pure transition-colors uppercase text-xs tracking-widest">
              TikTok
            </a>
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Enllaços Ràpids</h3>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-xs uppercase tracking-widest text-gray-500 hover:text-white-pure transition-colors w-max"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Sigma Company */}
        <div className="flex flex-col gap-3" id="contact">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Sigma Company</h3>
          <p className="text-xs text-gray-500 uppercase tracking-widest">Desenvolupat per Sigma Company</p>
          <p className="text-xs text-gray-500 uppercase tracking-widest mt-2">Més projectes:</p>
          <div className="flex gap-4 mt-1">
            <a href="https://www.tiktok.com/@sigmacompanyoficial" target="_blank" rel="noopener" className="text-gray-500 hover:text-white-pure transition-colors uppercase text-xs tracking-widest">TikTok</a>
            <a href="https://www.instagram.com/sigmacompanyoficial/" target="_blank" rel="noopener" className="text-gray-500 hover:text-white-pure transition-colors uppercase text-xs tracking-widest">Instagram</a>
          </div>
        </div>
      </div>

      <div className="container mx-auto pt-8 border-t border-white-pure/10 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[10px] text-gray-600 uppercase tracking-widest">
          &copy; {new Date().getFullYear()} DJ POSAXA. TOTS ELS DRETS RESERVATS.
        </p>
        <div className="flex gap-6">
          <a href="#" className="text-[10px] text-gray-600 uppercase tracking-widest hover:text-white-pure transition-colors">Avís Legal</a>
          <a href="#" className="text-[10px] text-gray-600 uppercase tracking-widest hover:text-white-pure transition-colors">Privacitat</a>
          <a href="#" className="text-[10px] text-gray-600 uppercase tracking-widest hover:text-white-pure transition-colors">Cookies</a>
        </div>
        <p className="text-[10px] text-gray-600 uppercase tracking-widest">Granollers · Barcelona</p>
      </div>
    </footer>
  );
}
