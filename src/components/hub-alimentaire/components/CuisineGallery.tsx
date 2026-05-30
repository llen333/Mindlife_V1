'use client';

import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { cuisineStyles } from '../constants';
import type { CuisineStyle } from '../types';

interface CuisineGalleryProps {
  favoriteCuisines: string[];
  cuisineCarouselIndex: number;
  onCarouselChange: (index: number) => void;
  onToggleCuisine: (cuisineId: string) => void;
  cuisineSectionRef: React.RefObject<HTMLElement | null>;
  cuisineCardsRef: React.MutableRefObject<(HTMLDivElement | null)[]>;
  onCuisineHover: (index: number, isEntering: boolean) => void;
}

/**
 * Galerie des styles culinaires favoris
 */
export function CuisineGallery({
  favoriteCuisines,
  cuisineCarouselIndex,
  onCarouselChange,
  onToggleCuisine,
  cuisineSectionRef,
  cuisineCardsRef,
  onCuisineHover,
}: CuisineGalleryProps) {
  return (
    <section ref={cuisineSectionRef} className="mt-10">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Styles Culinaires Favoris</h2>
          <p className="text-sm text-slate-400">Orientez l&apos;IA vers vos saveurs préférées</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onCarouselChange(Math.max(0, cuisineCarouselIndex - 1))}
            className="w-10 h-10 rounded-lg border border-emerald-500/10 flex items-center justify-center hover:bg-emerald-500/5 transition-colors text-slate-400 hover:text-emerald-400"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => onCarouselChange(Math.min(cuisineStyles.length - 4, cuisineCarouselIndex + 1))}
            className="w-10 h-10 rounded-lg border border-emerald-500/10 flex items-center justify-center hover:bg-emerald-500/5 transition-colors text-slate-400 hover:text-emerald-400"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cuisineStyles.slice(cuisineCarouselIndex, cuisineCarouselIndex + 4).map((cuisine: CuisineStyle, index: number) => {
          const isSelected = favoriteCuisines.includes(cuisine.id);
          return (
            <div
              key={cuisine.id}
              ref={(el) => { cuisineCardsRef.current[index] = el; }}
              onMouseEnter={() => onCuisineHover(index, true)}
              onMouseLeave={() => onCuisineHover(index, false)}
              onClick={() => onToggleCuisine(cuisine.id)}
              className={cn(
                "group relative h-44 rounded-xl overflow-hidden cursor-pointer border-2 transition-all",
                isSelected 
                  ? "border-emerald-500/50 shadow-[0_0_20px_rgba(19,236,164,0.2)]" 
                  : "border-transparent hover:border-emerald-500/20"
              )}
            >
              <img 
                src={cuisine.image}
                alt={cuisine.label}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080c0a] via-[#080c0a]/20 to-transparent" />
              
              <div className="absolute bottom-4 left-4">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    isSelected ? "bg-emerald-400" : "bg-slate-500"
                  )} />
                  <h3 className="font-bold text-white">{cuisine.label}</h3>
                </div>
              </div>

              {isSelected && (
                <div className="absolute top-4 right-4">
                  <div className="bg-emerald-500 text-[#080c0a] p-1.5 rounded-lg">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
              )}

              {!isSelected && (
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-xs font-medium text-white bg-white/10 px-3 py-1 rounded-full">
                    Cliquer pour sélectionner
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
