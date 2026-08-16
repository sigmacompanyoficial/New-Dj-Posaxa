"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function CTASection() {
  return (
    <section
      id="contact"
      className="relative py-48 px-6 flex items-center justify-center text-center overflow-hidden"
    >
      <div className="absolute inset-0 z-0">
        <Image
          src="/Fotos/dj-posaxa-sessio-inici-3.jpg"
          alt="DJ Posaxa Sessió"
          fill
          className="object-cover brightness-40"
        />
        <div className="absolute inset-0 bg-black-deep/60"></div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-7xl font-bold uppercase tracking-widest text-white-pure mb-6 leading-tight"
        >
          LA MÚSICA ÉS L&apos;ÀNIMA DE LA FESTA
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-base md:text-xl text-gray-soft uppercase tracking-widest mb-12"
        >
          I jo m&apos;encarrego de que cada moment sigui memorable.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <a
            href="mailto:contact@djposaxa.com"
            className="group relative px-12 py-5 bg-white-pure text-black-deep font-bold text-sm tracking-widest-xl uppercase overflow-hidden"
          >
            <span className="relative z-10 group-hover:text-white-pure transition-colors duration-300">
              CONTACTA ARA
            </span>
            <div className="absolute inset-0 bg-black-deep transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500 ease-out z-0"></div>
          </a>
          <a
            href="#"
            className="px-12 py-5 border border-white-pure text-white-pure font-bold text-sm tracking-widest-xl uppercase hover:bg-white-pure hover:text-black-deep transition-colors duration-300"
          >
            VEURE PREUS
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12"
        >
          <p className="text-xs uppercase tracking-widest text-gray-soft">
            Preparat? Contacta&apos;ns avui mateix i descobreix com podem fer que el teu esdeveniment sigui inoblidable.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
