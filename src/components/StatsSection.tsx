"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { STATS } from "@/data/mock";

function CountUp({ target, suffix = "" }: { target: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  // Parse number from target (e.g. "10+" → 10, "4K" → 4, "+10M" → 10, "100%" → 100)
  const numericMatch = target.match(/\d+/);
  const numericValue = numericMatch ? parseInt(numericMatch[0]) : 0;
  const prefix = target.startsWith("+") ? "+" : "";
  const postfix = target.includes("K") ? "K" : target.includes("M") ? "M" : target.includes("%") ? "%" : target.includes("+") && !target.startsWith("+") ? "+" : "";

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1800;
    const step = Math.ceil(numericValue / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= numericValue) {
        setCount(numericValue);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, numericValue]);

  return (
    <span ref={ref}>
      {prefix}{count}{postfix}
    </span>
  );
}

export default function StatsSection() {
  return (
    <section className="py-14 sm:py-20 md:py-24 border-y border-white-pure/10 bg-black-deep overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 md:px-12">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-12 text-center"
        >
          {STATS.map((stat, idx) => (
            <motion.div
              key={idx}
              variants={fadeUp}
              className="flex flex-col items-center justify-center gap-2.5 sm:gap-4 group"
            >
              <motion.h4
                className="text-3xl sm:text-5xl md:text-7xl font-bold text-white-pure"
                whileHover={{ scale: 1.1, color: "#CFE8F7" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <CountUp target={stat.value} />
              </motion.h4>
              <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider sm:tracking-widest-xl">{stat.label}</p>
              <motion.div
                className="w-6 sm:w-8 h-[1px] bg-white-pure/30"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 + 0.4 }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
