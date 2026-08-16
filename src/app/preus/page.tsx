"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
};

export default function PreusPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    event_date: "",
    event_time: "",
    location: "",
    duration: "",
    attendees: "",
    music_style: "",
    comments: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: submitError } = await supabase
      .from("reservations")
      .insert([
        {
          ...formData,
          user_id: user?.id || null
        }
      ]);

    if (submitError) {
      setError(submitError.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      setFormData({
        full_name: "",
        phone: "",
        email: "",
        event_date: "",
        event_time: "",
        location: "",
        duration: "",
        attendees: "",
        music_style: "",
        comments: ""
      });
    }
  };

  return (
    <div className="bg-[#050505] text-white min-h-screen selection:bg-white selection:text-black">
      {/* 
        =================
        HERO SECTION
        =================
      */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/60 to-[#050505] z-10" />
          <img 
            src="/Fotos/dj-posaxa-sessio-inici-3.jpg" 
            className="w-full h-full object-cover opacity-30"
            alt="Preus i Reserves"
          />
        </div>

        <div className="relative z-10 text-center px-6 mt-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-5xl md:text-[6rem] lg:text-[8rem] font-black uppercase tracking-tighter leading-none mb-6 text-white-pure">
              RESERVES
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto font-light tracking-wide"
          >
            Sol·licita un pressupost a mida per al teu esdeveniment.
          </motion.p>
        </div>
      </section>

      {/* 
        =================
        INFO & FORM SECTION
        =================
      */}
      <section className="py-24 px-6 md:px-12 relative z-20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Info Column */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="lg:col-span-5 flex flex-col gap-12"
            >
              <div>
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
                  Política de Preus
                </h2>
                <p className="text-lg text-gray-400 leading-relaxed font-light mb-6">
                  Cada esdeveniment és únic. <strong className="text-white">No treballo amb preus fixos</strong> perquè les necessitats (durada, equip tècnic, distància) varien substancialment.
                </p>
                <p className="text-lg text-gray-400 leading-relaxed font-light mb-6">
                  El meu compromís és oferir un espectacle professional i personalitzat. Per això, preparo un pressupost a mida per a cada ocasió.
                </p>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mt-8">
                  <p className="text-sm text-gray-300 italic">
                    * Només demano que l'escenari estigui muntat i els altaveus disponibles si no es contracta equip extra.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold uppercase tracking-widest text-gray-500 mb-4">Contacte Directe</h3>
                <a href="mailto:newposaxa@gmail.com" className="inline-block text-2xl md:text-3xl font-bold text-white hover:text-gray-300 transition-colors">
                  newposaxa@gmail.com
                </a>
              </div>
            </motion.div>

            {/* Form Column */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="lg:col-span-7"
            >
              <div className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-8 md:p-12 backdrop-blur-sm">
                <h2 className="text-2xl font-black uppercase tracking-tight mb-8">Sol·licitar Pressupost</h2>
                
                {success ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-20 h-20 bg-white text-black rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-3xl font-black uppercase mb-2">Enviat amb èxit!</h3>
                    <p className="text-gray-400">DJ Posaxa es posarà en contacte amb tu molt aviat.</p>
                    <button 
                      onClick={() => setSuccess(false)}
                      className="mt-8 text-sm uppercase tracking-widest text-white border-b border-white/20 pb-1"
                    >
                      Enviar una altra sol·licitud
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {error && (
                      <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm">
                        {error}
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Nom i Cognoms / Entitat</label>
                        <input 
                          type="text" 
                          required
                          value={formData.full_name}
                          onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                          placeholder="La teva entitat o nom" 
                          className="bg-transparent border-b border-white/20 pb-2 text-white focus:outline-none focus:border-white transition-colors" 
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Telèfon</label>
                        <input 
                          type="tel" 
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          placeholder="+34 000 000 000" 
                          className="bg-transparent border-b border-white/20 pb-2 text-white focus:outline-none focus:border-white transition-colors" 
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Email</label>
                      <input 
                        type="email" 
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="exemple@correu.com" 
                        className="bg-transparent border-b border-white/20 pb-2 text-white focus:outline-none focus:border-white transition-colors" 
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Data</label>
                        <input 
                          type="date" 
                          required
                          value={formData.event_date}
                          onChange={(e) => setFormData({...formData, event_date: e.target.value})}
                          className="bg-transparent border-b border-white/20 pb-2 text-white focus:outline-none focus:border-white transition-colors [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" 
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Hora d'Inici</label>
                        <input 
                          type="time" 
                          required
                          value={formData.event_time}
                          onChange={(e) => setFormData({...formData, event_time: e.target.value})}
                          className="bg-transparent border-b border-white/20 pb-2 text-white focus:outline-none focus:border-white transition-colors [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" 
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Ubicació / Població</label>
                      <input 
                        type="text" 
                        required
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        placeholder="Ex: Granollers, Barcelona..." 
                        className="bg-transparent border-b border-white/20 pb-2 text-white focus:outline-none focus:border-white transition-colors" 
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Durada Aprox. (h)</label>
                        <input 
                          type="number" 
                          required
                          value={formData.duration}
                          onChange={(e) => setFormData({...formData, duration: e.target.value})}
                          placeholder="Ex: 4" 
                          className="bg-transparent border-b border-white/20 pb-2 text-white focus:outline-none focus:border-white transition-colors" 
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Assistents Aprox.</label>
                        <input 
                          type="number" 
                          required
                          value={formData.attendees}
                          onChange={(e) => setFormData({...formData, attendees: e.target.value})}
                          placeholder="Ex: 150" 
                          className="bg-transparent border-b border-white/20 pb-2 text-white focus:outline-none focus:border-white transition-colors" 
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Estil Musical</label>
                      <input 
                        type="text" 
                        required
                        value={formData.music_style}
                        onChange={(e) => setFormData({...formData, music_style: e.target.value})}
                        placeholder="Ex: Reggaeton, Techno, Èxits, Variat..." 
                        className="bg-transparent border-b border-white/20 pb-2 text-white focus:outline-none focus:border-white transition-colors" 
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Comentaris / Detalls</label>
                      <textarea 
                        rows={4} 
                        value={formData.comments}
                        onChange={(e) => setFormData({...formData, comments: e.target.value})}
                        placeholder="Explica'ns una mica més sobre la teva idea..." 
                        className="bg-transparent border-b border-white/20 pb-2 text-white focus:outline-none focus:border-white transition-colors resize-none"
                      ></textarea>
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading}
                      className="mt-8 px-10 py-5 bg-white text-black font-bold uppercase tracking-widest rounded-full hover:scale-[1.02] transition-transform duration-300 shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] disabled:opacity-50"
                    >
                      {loading ? "Enviant..." : "Enviar Sol·licitud"}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>

          </div>
        </div>
      </section>
    </div>
  );
}
