/**
 * NutritionInspirations Component
 * Section inspirations gastronomiques
 */

import { Clock } from 'lucide-react';
import { inspirationRecipes } from '../constants';

interface NutritionInspirationsProps {
  inspirationsRef: React.RefObject<HTMLDivElement | null>;
}

export function NutritionInspirations({ inspirationsRef }: NutritionInspirationsProps) {
  return (
    <section className="pt-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-8 mb-8">
        <div>
          <h3 className="text-2xl font-black text-white italic tracking-tighter">Inspirations Gastronomiques</h3>
          <p className="text-slate-500 mt-1 uppercase text-[10px] font-bold tracking-widest">
            Curated for your specific metabolic profile
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2 rounded-xl bg-emerald-500 text-[#050706] text-[10px] font-black uppercase">
            Tout explorer
          </button>
          <button className="px-5 py-2 rounded-xl bg-white/5 text-slate-400 text-[10px] font-black uppercase border border-white/10 hover:text-white transition-colors">
            Cétogène
          </button>
          <button className="px-5 py-2 rounded-xl bg-white/5 text-slate-400 text-[10px] font-black uppercase border border-white/10 hover:text-white transition-colors">
            World Gourmet
          </button>
        </div>
      </div>

      <div ref={inspirationsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {inspirationRecipes.map((recipe) => (
          <div
            key={recipe.id}
            className="inspiration-card glass-panel p-4 rounded-[2rem] group cursor-pointer border-transparent hover:border-emerald-500/30 transition-all duration-500"
          >
            <div className="aspect-[4/3] rounded-[1.25rem] overflow-hidden mb-4 relative border border-white/5">
              <div className="absolute inset-0">
                <img 
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="absolute bottom-4 left-4">
                <span className="px-3 py-1 bg-black/80 backdrop-blur-md rounded-lg text-[9px] font-black text-emerald-400 uppercase border border-emerald-500/20">
                  {recipe.tag}
                </span>
              </div>
            </div>
            <h5 className="text-white font-bold text-base mb-1 group-hover:text-emerald-400 transition-colors">
              {recipe.title}
            </h5>
            <p className="text-[10px] text-slate-500 font-black flex items-center gap-2 uppercase tracking-widest">
              <Clock className="w-3 h-3" /> {recipe.time} MIN • {recipe.calories} KCAL
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
