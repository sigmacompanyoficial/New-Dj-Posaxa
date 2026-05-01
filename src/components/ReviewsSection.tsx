"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Star, MessageCircle, Send } from "lucide-react";

export default function ReviewsSection() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setReviews(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const { error } = await supabase.from("reviews").insert([
      {
        user_id: user.id,
        user_name: user.user_metadata?.full_name || user.email?.split("@")[0],
        rating,
        comment: newReview
      }
    ]);

    if (!error) {
      setNewReview("");
      setShowForm(false);
      fetchReviews();
    }
    setLoading(false);
  };

  return (
    <section id="opinions" className="py-32 px-6 md:px-12 bg-white text-black">
      <div className="container mx-auto max-w-5xl">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none">
              Què diu la <br /> <span className="text-gray-400">gent?</span>
            </h2>
          </motion.div>

          {user ? (
            <button 
              onClick={() => setShowForm(!showForm)}
              className="px-6 py-3 bg-black text-white rounded-full font-bold uppercase tracking-widest text-xs hover:scale-105 transition-transform"
            >
              {showForm ? "Tancar" : "Deixar Opinió"}
            </button>
          ) : (
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Inicia sessió per deixar la teva opinió
            </p>
          )}
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-16 overflow-hidden"
            >
              <form onSubmit={handleSubmit} className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
                <div className="flex gap-2 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star} 
                      type="button"
                      onClick={() => setRating(star)}
                      className={`transition-colors ${star <= rating ? 'text-yellow-500' : 'text-gray-200'}`}
                    >
                      <Star fill={star <= rating ? "currentColor" : "none"} size={24} />
                    </button>
                  ))}
                </div>
                <textarea 
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                  placeholder="Com ha estat la teva experiència amb DJ Posaxa?"
                  className="w-full bg-white border border-gray-200 rounded-2xl p-6 text-lg focus:outline-none focus:border-black transition-colors resize-none mb-6"
                  rows={4}
                  required
                />
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-3 bg-black text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm disabled:opacity-50"
                >
                  <Send size={18} /> {loading ? "Enviant..." : "Publicar Opinió"}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {reviews.length === 0 ? (
            <div className="col-span-2 py-20 text-center border-2 border-dashed border-gray-100 rounded-[3rem]">
              <MessageCircle size={40} className="mx-auto mb-4 text-gray-200" />
              <p className="text-gray-400 uppercase tracking-widest text-xs font-bold">Encara no hi ha opinions. Sigues el primer!</p>
            </div>
          ) : (
            reviews.map((review, idx) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gray-50 p-10 rounded-[3rem] flex flex-col justify-between"
              >
                <div>
                  <div className="flex gap-1 mb-6 text-yellow-500">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} fill="currentColor" size={14} />
                    ))}
                  </div>
                  <p className="text-xl font-medium leading-relaxed text-gray-800 mb-8 italic">
                    "{review.comment}"
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {review.user_name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest">{review.user_name}</p>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">{new Date(review.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
