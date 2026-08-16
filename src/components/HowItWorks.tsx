"use client";

import { motion } from "framer-motion";
import { HOW_IT_WORKS } from "@/data/mock";

export default function HowItWorks() {
  return (
    <section className="py-32 px-6 md:px-12 bg-white-pure text-black-deep">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-20 text-center"
        >
          <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-widest mb-4">
            COM FUNCIONA?
          </h2>
          <div className="w-24 h-1 bg-black-deep mx-auto"></div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
          {HOW_IT_WORKS.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="flex flex-col items-start border-t border-black-deep pt-6"
            >
              <span className="text-6xl font-bold text-gray-300 mb-6 tracking-tighter">
                {item.step}
              </span>
              <h3 className="text-2xl font-bold uppercase tracking-widest mb-4">
                {item.title}
              </h3>
              <p className="text-base text-gray-600 leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
