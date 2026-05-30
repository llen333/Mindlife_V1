/**
 * NutritionLogistics Component
 * Section logistique courses et points de retrait
 */

import { ShoppingCart, RefreshCw, Car, Truck, Store, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CartItem } from '../types';

interface NutritionLogisticsProps {
  logisticsRef: React.RefObject<HTMLDivElement>;
  shoppingList: CartItem[];
  getPeriodMultiplier: () => number;
  getPeriodLabel: () => string;
  calculateTotalIngredients: () => string;
}

export function NutritionLogistics({
  logisticsRef,
  shoppingList,
  getPeriodMultiplier,
  getPeriodLabel,
  calculateTotalIngredients,
}: NutritionLogisticsProps) {
  return (
    <section ref={logisticsRef} className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
      {/* Shopping Options */}
      <div className="logistics-panel glass-panel p-8 rounded-[2.5rem] flex flex-col h-full space-y-6">
        <div>
          <h3 className="text-2xl font-black italic text-white flex items-center gap-3">
            <ShoppingCart className="w-7 h-7 text-emerald-400" />
            Logistique Courses
          </h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">
            Choisissez votre mode d'approvisionnement
          </p>
        </div>

        <div className="space-y-4">
          {/* Drive Sync Option */}
          <button className="group glass-panel bg-white/5 border-white/10 p-5 rounded-[1.5rem] flex items-center gap-5 hover:border-emerald-500/50 transition-all text-left w-full">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
              <RefreshCw className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="flex-grow">
              <h4 className="text-lg font-bold text-white">Synchroniser avec le Drive Local</h4>
              <div className="flex gap-3 mt-2 opacity-60 group-hover:opacity-100 transition-all">
                <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg border border-white/10">
                  <div className="w-3 h-3 bg-[#E0001A] rounded-full" />
                  <span className="text-[9px] font-black">C4</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg border border-white/10">
                  <div className="w-3 h-3 bg-[#00519E] rounded-full" />
                  <span className="text-[9px] font-black">LE</span>
                </div>
              </div>
            </div>
          </button>

          {/* Direct Order Option */}
          <button className="group glass-panel bg-emerald-500/10 border-emerald-500/30 p-5 rounded-[1.5rem] flex items-center gap-5 hover:border-emerald-500 hover:bg-emerald-500/20 transition-all text-left w-full shadow-[0_0_40px_rgba(17,212,115,0.05)]">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-[0_0_20px_rgba(17,212,115,0.3)]">
              <ShoppingCart className="w-6 h-6 text-[#050706]" />
            </div>
            <div className="flex-grow">
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-bold text-white">Commande Directe Mindlife</h4>
                <span className="bg-emerald-500/20 text-emerald-400 text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Luxe</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Livraison Conciergerie à domicile — 08:00 Demain</p>
            </div>
          </button>
        </div>

        {/* Cart Preview */}
        <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
          <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4">Aperçu Panier IA • {getPeriodLabel()}</h4>
          <div className="space-y-3">
            {shoppingList.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-slate-300">{item.category} (x{item.count})</span>
                <span className="text-white font-bold">{(item.price * getPeriodMultiplier() / 7).toFixed(2)}€</span>
              </div>
            ))}
            <div className="h-px bg-white/10 my-2" />
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-white uppercase">Total Ingrédients</span>
              <span className="text-xl font-black text-emerald-400">{calculateTotalIngredients()}€</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map / Pickup Points */}
      <div className="logistics-panel glass-panel p-8 rounded-[2.5rem] space-y-6 flex flex-col h-full">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-black text-white italic tracking-tighter">Points de Retrait</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
              Géolocalisation du Drive Élite
            </p>
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-xl bg-emerald-500 text-[#050706] flex items-center justify-center shadow-lg">
              <Car className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 rounded-xl bg-white/5 text-slate-500 flex items-center justify-center border border-white/10">
              <Truck className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="flex-grow relative rounded-[2rem] overflow-hidden border border-white/10 bg-[#080a09] min-h-[300px]">
          {/* Dot pattern background */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div 
              className="w-full h-full"
              style={{
                backgroundImage: 'radial-gradient(circle, #11d473 1px, transparent 1px)',
                backgroundSize: '40px 40px'
              }}
            />
          </div>

          {/* Store marker */}
          <div className="absolute top-1/3 left-1/4 group cursor-pointer">
            <div className="relative">
              <div className="w-12 h-12 bg-emerald-500/30 rounded-full animate-ping absolute -inset-1" />
              <div className="w-10 h-10 bg-[#050706] border-2 border-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(17,212,115,0.6)] relative z-10">
                <Store className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="absolute left-14 top-1/2 -translate-y-1/2 glass-panel bg-[#050706]/95 px-4 py-2 rounded-xl whitespace-nowrap shadow-2xl border-emerald-500/40">
                <span className="block text-[8px] font-black text-emerald-400 uppercase tracking-widest">Drive Élite A</span>
                <span className="text-[10px] text-white font-bold">Prêt dans 15 min</span>
              </div>
            </div>
          </div>

          {/* User location */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border-4 border-[#050706] shadow-2xl relative z-20">
              <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(17,212,115,1)]" />
            </div>
            <div className="w-40 h-40 bg-emerald-500/10 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>

          {/* Bottom info bar */}
          <div className="absolute bottom-6 left-6 right-6 p-4 glass-panel bg-[#050706]/90 rounded-[1.5rem] flex justify-between items-center border-emerald-500/30 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Navigation className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Destination</p>
                <p className="text-xs font-bold text-white">Domaine de la Rose, 75016</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-emerald-400 font-mono text-sm font-black">08 MIN</span>
              <p className="text-[8px] text-slate-500 font-bold uppercase">Trafic Fluide</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
