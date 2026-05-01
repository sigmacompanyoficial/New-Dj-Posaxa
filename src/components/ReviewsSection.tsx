"use client";

import { motion } from "framer-motion";
import { REVIEWS } from "@/data/mock";

export default function ReviewsSection() {
  return (
    <section id="opinions" className="py-32 px-6 md:px-12 bg-white-pure text-black-deep">
      <div className="container mx-auto text-center max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-widest mb-16">OPINIONS</h2>
        </motion.div>

        {REVIEWS.map((review, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: idx * 0.1 }}
            className="mb-12"
          >
            <div className="text-6xl text-gray-300 mb-6 font-serif">&ldquo;</div>
            <p className="text-xl md:text-2xl text-gray-800 italic leading-relaxed mb-8">
              {review.text}
            </p>
            <p className="text-sm uppercase tracking-widest font-bold text-gray-500">— {review.author}</p>
          </motion.div>
        ))}

        <motion.a
          href="#"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="inline-block border-b-2 border-black-deep pb-1 text-sm font-bold uppercase tracking-widest hover:text-gray-500 hover:border-gray-500 transition-colors"
        >
          LLEGIR MÉS OPINIONS
        </motion.a>
      </div>
    </section>
  );
}
