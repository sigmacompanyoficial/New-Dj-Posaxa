"use client";

import { motion } from "framer-motion";

export default function HighlightSection() {
  return (
    <section className="py-20 sm:py-32 md:py-40 px-4 sm:px-6 md:px-12 bg-black-deep flex items-center justify-center relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[40vw] md:h-[40vw] bg-blue-ice/5 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="container mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <h2 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold uppercase tracking-wide sm:tracking-widest-xl text-white-pure leading-tight mb-4 sm:mb-8">
            LA MÚSICA ÉS <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-white-pure">L'ÀNIMA</span> DE LA FESTA
          </h2>
          
          <p className="text-xs sm:text-base md:text-xl text-gray-soft tracking-wider sm:tracking-widest uppercase mb-8 sm:mb-12">
            I JO M'ENCARREGO DE QUE CADA MOMENT SIGUI MEMORABLE.
          </p>

          <a
            href="#contact"
            className="inline-block px-8 sm:px-12 py-3.5 sm:py-5 bg-white-pure text-black-deep font-bold text-xs sm:text-sm tracking-widest sm:tracking-widest-xl uppercase hover:bg-gray-soft transition-colors duration-300 rounded-full sm:rounded-none"
          >
            CONTRACTA ARA
          </a>
        </motion.div>
      </div>
    </section>
  );
}
