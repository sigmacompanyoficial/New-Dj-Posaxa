"use client";

import { motion } from "framer-motion";

export default function TrajectorySection() {
  const years = [
    { year: "2023", desc: "Primers esdeveniments privats. Descobriment de la meva passió per connectar amb el públic." },
    { year: "2024", desc: "Festes Majors. Col·laboracions amb Disco Inferno XS. Comença la meva trajectòria professional." },
    { year: "2025", desc: "Expansió per Catalunya. Més de 10 esdeveniments completats. Reconeixement en xarxes socials." },
    { year: "2026", desc: "Objectiu: consolidar-me com a referent jove en la zona de Granollers i Barcelona." },
  ];

  return (
    <section className="py-32 px-6 md:px-12 bg-black-deep text-white-pure">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-widest text-white-pure mb-4">
            EL MEU TRAJECTE
          </h2>
          <div className="w-24 h-1 bg-white-pure mx-auto"></div>
        </motion.div>

        <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white-pure/20 before:to-transparent">
          {years.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white-pure bg-black-deep text-white-pure shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <div className="w-3 h-3 bg-white-pure rounded-full"></div>
              </div>
              
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-6 md:p-8 bg-gray-900/50 backdrop-blur-sm border border-white-pure/5 hover:border-white-pure/20 transition-colors duration-300">
                <h3 className="text-3xl font-bold uppercase tracking-widest mb-2 text-white-pure">{item.year}</h3>
                <p className="text-gray-400 text-sm leading-relaxed tracking-wide">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
