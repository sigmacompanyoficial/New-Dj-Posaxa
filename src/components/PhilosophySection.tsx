"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/animations";

export default function PhilosophySection() {
  return (
    <section id="philosophy" className="py-24 px-6 md:px-12 bg-black-deep text-white-pure border-t border-white-pure/10">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-16"
        >
          {/* Esquerra - Psicologia de la música */}
          <motion.div variants={fadeUp} className="space-y-8">
            <div className="bg-white-pure/5 p-8 border-l-2 border-white-pure hover:bg-white-pure/10 transition-colors">
              <p className="text-lg text-gray-300 leading-relaxed mb-6">
                La música i els sons tenen un gran impacte en el cervell humà. Algunes freqüències poden fer-nos sentir relaxats, mentre que altres ens poden activar o fins i tot posar nerviosos. He descobert que la música pot millorar la concentració, reduir l&apos;estrès i ajudar en teràpies per a malalties neurològiques.
              </p>
            </div>

            <div className="pt-8">
              <h2 className="text-2xl font-bold tracking-widest uppercase mb-6 flex items-center gap-4">
                <span className="w-8 h-[2px] bg-white-pure"></span>
                Quines cançons?
              </h2>
              <p className="text-gray-400 mb-6 italic">Si estudies amb música relaxada:</p>
              <ul className="space-y-6">
                {[
                  { title: "Sons greus (freqüències baixes)", desc: "Tendència a calmar." },
                  { title: "Sons aguts (freqüències altes)", desc: "Poden generar alerta." },
                  { title: "Ritmes repetitius", desc: "Indueixen concentració." },
                ].map((item, i) => (
                  <li key={i} className="flex flex-col gap-2 border-b border-white-pure/10 pb-4">
                    <span className="font-bold text-white-pure tracking-wider uppercase">{item.title}</span>
                    <span className="text-gray-500">{item.desc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Dreta - Objectius i Vibe */}
          <motion.div variants={fadeUp} className="space-y-12">
            <div>
              <h2 className="text-2xl font-bold tracking-widest uppercase mb-6 flex items-center gap-4">
                <span className="w-8 h-[2px] bg-white-pure"></span>
                OBJECTIUS
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed">
                Jo em centro principalment en fer sonar música del gust de tot el públic. Encara que sigui complicat, sempre hi ha un punt mitjà, el qual, es pot aconseguir.
              </p>
            </div>

            <div className="relative py-12 px-8 border border-white-pure/20 text-center">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black-deep px-4 text-4xl text-gray-600">
                &ldquo;
              </div>
              <p className="text-2xl md:text-3xl font-serif italic text-white-pure leading-relaxed">
                El meu objectiu és que cada beat ressoni al teu pit i que cada baixada et faci vibrar fins a l&apos;ànima.
              </p>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-black-deep px-4 text-4xl text-gray-600">
                &rdquo;
              </div>
            </div>

            <div className="bg-gradient-to-r from-white-pure/10 to-transparent p-8">
              <p className="text-xl text-gray-200 leading-relaxed font-light">
                Amb mi, la festa mai s&apos;apaga. Així que si vols una sessió plena de <span className="font-bold text-white-pure tracking-wider uppercase">&apos;bellakeo&apos;</span> i energia al 200%, no dubtis: jo soc el DJ que necessites!
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
