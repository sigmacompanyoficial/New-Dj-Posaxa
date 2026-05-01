"use client";

import { motion } from "framer-motion";

export default function MarqueeSection() {
  const words = ["BODES", "FESTES MAJORS", "CLUBS", "ESDEVENIMENTS PRIVATS"];
  const repeatedWords = [...words, ...words, ...words, ...words];

  return (
    <div className="w-full bg-white-pure py-4 overflow-hidden border-y border-black-deep">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: 20,
        }}
      >
        <div className="flex items-center">
          {repeatedWords.map((word, idx) => (
            <div key={idx} className="flex items-center">
              <span className="text-xl md:text-3xl font-bold uppercase tracking-widest text-black-deep px-8">
                {word}
              </span>
              <span className="text-xl md:text-3xl text-gray-300 px-4">•</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
