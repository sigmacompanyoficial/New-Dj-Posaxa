"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

// Helper components for new animations
const FadeIn = ({ children, delay = 0, className = "" }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    className={className}
  >
    {children}
  </motion.div>
);

const ParallaxImage = ({ src, alt, className = "" }: { src: string, alt: string, className?: string }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <div ref={ref} className={`overflow-hidden rounded-[2rem] bg-black-deep ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        style={{ y, scale: 1.15 }}
        className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.2]"
      />
    </div>
  );
};

export default function EsdevenimentsPage() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], ["0%", "50%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  return (
    <div className="bg-[#050505] text-white min-h-screen selection:bg-white selection:text-black">

      {/* 
        =================
        HERO SECTION
        =================
      */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/60 to-[#050505] z-10" />
          <img
            src="/Fotos/dj-posaxa-sessio-inici-1.jpg"
            className="w-full h-full object-cover opacity-40 scale-105"
            alt="DJ Posaxa"
          />
        </motion.div>

        <div className="relative z-10 text-center px-6 mt-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-6xl md:text-[8rem] lg:text-[10rem] font-black uppercase tracking-tighter leading-none mb-6 mix-blend-difference">
              L'HISTORIAL
            </h1>
          </motion.div>
          <FadeIn delay={0.2}>
            <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto font-light tracking-wide">
              L'evolució d'un concepte. Consulta les fotos, vídeos i records que han definit el camí de DJ Posaxa.
            </p>
          </FadeIn>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Scroll</span>
          <div className="w-[1px] h-12 bg-white/20 relative overflow-hidden">
            <motion.div
              animate={{ y: ["-100%", "200%"] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="w-full h-1/2 bg-white absolute top-0 left-0"
            />
          </div>
        </motion.div>
      </section>

      {/* 
        =================
        INTRO BIO
        =================
      */}
      <section className="py-32 px-6 md:px-12 relative z-20 bg-[#050505]">
        <div className="container mx-auto">
          <FadeIn className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-medium leading-[1.3] text-gray-200">
              Des de la primera actuació a l'Escola Pia (2024), fins a fer vibrar escenaris com el barri Montserrat, MusiKnviu i l'èxit massiu de <span className="text-white font-bold italic">Carnaval a la NAUB1</span>.
              <br /><br />
              Una connexió pura amb el públic.
            </h2>
          </FadeIn>
        </div>
      </section>

      {/* 
        =================
        EVENTS 2026
        =================
      */}
      <section className="relative py-32 px-6 md:px-12">
        {/* Sticky background year */}
        <div className="sticky top-1/4 h-0 flex justify-center pointer-events-none z-0 opacity-[0.03]">
          <span className="text-[20rem] md:text-[40rem] font-black leading-none tracking-tighter">
            2026
          </span>
        </div>

        <div className="container mx-auto relative z-10 flex flex-col gap-32">

          {/* EVENT: La Garriga 2026 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <FadeIn>
                <ParallaxImage
                  src="/Fotos/eventos/la-garriga-2026/6861b1eb-9cb7-49b3-ba22-8f04e78fcde5.jpeg"
                  alt="La Garriga 2026"
                  className="aspect-[4/3] md:aspect-[16/10]"
                />
              </FadeIn>
            </div>
            <div className="lg:col-span-5">
              <FadeIn delay={0.2}>
                <div className="inline-block px-4 py-1 rounded-full border border-blue-400/20 text-xs font-bold uppercase tracking-widest mb-6 bg-blue-400/5 backdrop-blur-md text-blue-300">
                  Abril 2026
                </div>
                <h3 className="text-5xl md:text-6xl font-black uppercase tracking-tight mb-6">
                  La Garriga 2026
                </h3>
                <p className="text-lg text-gray-400 leading-relaxed mb-6">
                  Una de les millors nits del 2026. La gent de La Garriga va respondre amb una energia increïble, creant una connexió única des de la primera cançó fins a l'últim beat.
                </p>
                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1 bg-white/10 rounded-lg text-sm text-gray-300">Open Air</span>
                  <span className="px-3 py-1 bg-white/10 rounded-lg text-sm text-gray-300">Reggaeton</span>
                  <span className="px-3 py-1 bg-white/10 rounded-lg text-sm text-gray-300">Full Energy</span>
                </div>
              </FadeIn>
            </div>
          </div>

          {/* EVENT: Carnaval */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 order-2 lg:order-1">
              <FadeIn>
                <div className="inline-block px-4 py-1 rounded-full border border-white/20 text-xs font-bold uppercase tracking-widest mb-6 bg-white/5 backdrop-blur-md">
                  13 febrer 2026
                </div>
                <h3 className="text-5xl md:text-6xl font-black uppercase tracking-tight mb-6 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-500 transition-all">
                  Carnaval 2026 <br /> La NAUB1
                </h3>
                <p className="text-lg text-gray-400 leading-relaxed mb-8">
                  Una nit espectacular amb DJ Posaxa i Skalopa, plena d'energia, disfresses i bona música. Una fita inoblidable organitzada per Libèlia que va fer vibrar tot Granollers.
                </p>
              </FadeIn>
            </div>
            <div className="lg:col-span-7 order-1 lg:order-2">
              <FadeIn delay={0.2}>
                <ParallaxImage
                  src="/Fotos/eventos/carnaval-2026/dj-posaxa-carnaval-2026-festa-0050.jpg"
                  alt="Carnaval 2026"
                  className="aspect-[4/3] md:aspect-[16/10]"
                />
              </FadeIn>
            </div>
          </div>

          {/* EVENT: Festes del Barri Montserrat */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <FadeIn>
                <ParallaxImage
                  src="/Fotos/eventos/la-garriga-2026/30bd7efc-b56e-4f8d-a265-d0f7476c273a.jpeg"
                  alt="Festes Montserrat 2026"
                  className="aspect-[4/3] md:aspect-[16/10]"
                />
              </FadeIn>
            </div>
            <div className="lg:col-span-5">
              <FadeIn delay={0.2}>
                <div className="inline-block px-4 py-1 rounded-full border border-white/20 text-xs font-bold uppercase tracking-widest mb-6 bg-white/5 backdrop-blur-md">
                  24-25 abril 2026
                </div>
                <h3 className="text-5xl md:text-6xl font-black uppercase tracking-tight mb-6">
                  Barri de Montserrat
                </h3>
                <p className="text-lg text-gray-400 leading-relaxed mb-6">
                  Un doblet per a la història de la Garriga. Divendres: una sessió d’ambient house creant l'atmosfera perfecta. Dissabte: sessió enèrgica amb reggaeton i hits per no parar de ballar.
                </p>
                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1 bg-white/10 rounded-lg text-sm text-gray-300">House</span>
                  <span className="px-3 py-1 bg-white/10 rounded-lg text-sm text-gray-300">Reggaeton</span>
                  <span className="px-3 py-1 bg-white/10 rounded-lg text-sm text-gray-300">Hits</span>
                </div>
              </FadeIn>
            </div>
          </div>

          {/* EVENT: Can Torrents */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 order-2 lg:order-1">
              <FadeIn>
                <div className="inline-block px-4 py-1 rounded-full border border-white/20 text-xs font-bold uppercase tracking-widest mb-6 bg-white/5 backdrop-blur-md">
                  Abril 2026 (Divendres)
                </div>
                <h3 className="text-5xl md:text-6xl font-black uppercase tracking-tight mb-6">
                  Can Torrents
                </h3>
                <p className="text-lg text-gray-400 leading-relaxed mb-8">
                  Gravació de sessions d'electrònica en format multicàmera per a YouTube. Estudi de gravació en directe amb servei de barra al Porxo de Can Torrents (La Roca del Vallès).
                </p>
              </FadeIn>
            </div>
            <div className="lg:col-span-7 order-1 lg:order-2">
              <FadeIn delay={0.2}>
                <ParallaxImage
                  src="/Fotos/404.webp"
                  alt="Can Torrents"
                  className="aspect-[4/3] md:aspect-[16/10]"
                />
              </FadeIn>
            </div>
          </div>

          {/* EVENT: Cancelat (Mitja Marató) */}
          <FadeIn>
            <div className="w-full bg-gradient-to-br from-red-950/20 to-black border border-red-900/30 rounded-[2rem] p-12 md:p-20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8">
                <div className="animate-pulse bg-red-600/20 text-red-500 border border-red-500/50 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                  Cancel·lat
                </div>
              </div>
              <div className="inline-block px-4 py-1 rounded-full border border-white/10 text-xs font-bold uppercase tracking-widest mb-6 bg-white/5">
                18 gener 2026
              </div>
              <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4 text-gray-500">
                Mitja Marató de Granollers
              </h3>
              <p className="text-lg text-gray-500 max-w-2xl">
                L'objectiu era posar ritme a la matinal acompanyant els corredors amb la Colla dels Blancs. Un esdeveniment que haurà d'esperar per a properes edicions.
              </p>
            </div>
          </FadeIn>

        </div>
      </section>


      {/* 
        =================
        EVENTS 2025
        =================
      */}
      <section className="relative py-32 px-6 md:px-12 bg-[#080808]">
        <div className="sticky top-1/4 h-0 flex justify-center pointer-events-none z-0 opacity-[0.03]">
          <span className="text-[20rem] md:text-[40rem] font-black leading-none tracking-tighter">
            2025
          </span>
        </div>

        <div className="container mx-auto relative z-10 flex flex-col gap-32">

          {/* EVENT: Disco Inferno */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-12">
              <FadeIn>
                <div className="text-center mb-12">
                  <div className="inline-block px-4 py-1 rounded-full border border-white/20 text-xs font-bold uppercase tracking-widest mb-6 bg-white/5">
                    27 agost 2025
                  </div>
                  <h3 className="text-6xl md:text-8xl font-black uppercase tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
                    Disco Inferno XS
                  </h3>
                  <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                    El gran moment de l'any a la Festa Major. Escenografia pròpia, efectes de llum, intro audiovisual i un concepte pirata totalment personalitzat. Un èxit absolut marcat pel show de bengales amb "Sky Full of Stars".
                  </p>
                </div>

                {/* Horizontal Scrolling Gallery modern */}
                <div className="flex gap-4 overflow-x-auto hide-scrollbar snap-x snap-mandatory pb-8">
                  {[1, 2, 4, 8].map((num) => (
                    <div key={num} className="snap-center shrink-0 w-[85vw] md:w-[40vw] overflow-hidden rounded-3xl border border-white/10 group">
                      <img
                        src={`/Fotos/eventos/disco-inferno-xs-2025/dj-posaxa-disco-inferno-pnc-${num}.jpg`}
                        alt="Disco Inferno"
                        className="w-full h-full object-cover aspect-[4/3] transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              </FadeIn>
            </div>
          </div>

          {/* EVENT: Festa Blanca & Gra Jove Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FadeIn>
              <div className="h-full bg-white/[0.02] border border-white/10 rounded-[2rem] p-10 hover:bg-white/[0.04] transition-colors">
                <div className="px-3 py-1 rounded border border-white/20 text-[10px] font-bold uppercase tracking-widest mb-6 inline-block text-gray-400">
                  8 juny 2025
                </div>
                <h4 className="text-3xl font-black uppercase mb-4">Festa Blanca</h4>
                <p className="text-gray-400 leading-relaxed">
                  Sessió estètica a la plaça de l'Església. Transició constant d'energies, combinant temes populars amb l'electrònica més elegant per a un públic molt variat.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="h-full bg-white/[0.02] border border-white/10 rounded-[2rem] p-10 hover:bg-white/[0.04] transition-colors">
                <div className="px-3 py-1 rounded border border-white/20 text-[10px] font-bold uppercase tracking-widest mb-6 inline-block text-gray-400">
                  24 maig 2025
                </div>
                <h4 className="text-3xl font-black uppercase mb-4">Gra Jove (MusiKnviu)</h4>
                <p className="text-gray-400 leading-relaxed">
                  Actuació fora de concurs (per minoria d'edat) durant la deliberació del jurat. Una sessió molt dinàmica que va rebre crítiques excel·lents de públic i organitzadors.
                </p>
              </div>
            </FadeIn>
          </div>

          {/* EVENT: Barri Montserrat 2025 */}
          <FadeIn>
            <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-[2rem] p-10 md:p-16 flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1">
                <div className="inline-block px-4 py-1 rounded-full border border-white/20 text-xs font-bold uppercase tracking-widest mb-6">
                  25 abril 2025
                </div>
                <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-6">
                  Inicis a La Garriga
                </h3>
                <p className="text-lg text-gray-400 leading-relaxed">
                  Sessió oberta amb música d'ambient i pachangueo al Barri Montserrat. El primer gran punt d'inflexió: connexió brutal amb el públic convertint una plaça en una autèntica festa (tot i la pluja del segon dia).
                </p>
              </div>
            </div>
          </FadeIn>

        </div>
      </section>

      {/* 
        =================
        EVENTS 2024 & OUTRO
        =================
      */}
      <section className="relative py-32 px-6 md:px-12 bg-[#030303] overflow-hidden">

        {/* Abstract Glowing Orb Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.02] blur-[120px] rounded-full pointer-events-none" />

        <div className="container mx-auto relative z-10 text-center">
          <FadeIn>
            <div className="inline-block px-4 py-1 rounded-full border border-white/20 text-xs font-bold uppercase tracking-widest mb-8 bg-white/5">
              20 desembre 2024
            </div>
            <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tight mb-8">
              L'ORIGEN
            </h2>
            <h3 className="text-2xl md:text-4xl font-light text-gray-300 mb-12">
              Festa de Nadal – Escola Pia Granollers
            </h3>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-32">
              La primera actuació en públic. Companys i famílies descobrint el projecte DJ Posaxa amb les primeres proves d'il·luminació i animació. El dia que va començar tot.
            </p>
          </FadeIn>

          <FadeIn>
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent mb-32" />

            <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6">
              El pròxim escenari pot ser el teu.
            </h3>
            <a href="/contacte" className="inline-block px-10 py-5 bg-white text-black font-bold uppercase tracking-widest rounded-full hover:scale-105 transition-transform duration-300 shadow-[0_0_40px_rgba(255,255,255,0.3)]">
              Reserva una data
            </a>
          </FadeIn>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{
        __html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
