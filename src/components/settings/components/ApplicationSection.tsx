'use client';

import { Settings, Moon, Sun, Languages, FileText, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProfileFormData } from '../types';

interface ApplicationSectionProps {
  formData: ProfileFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProfileFormData>>;
  expanded: boolean;
}

export function ApplicationSection({ formData, setFormData, expanded }: ApplicationSectionProps) {
  if (!expanded) return null;

  return (
    <div className="overflow-hidden animate-expand">
      <div className="px-6 pb-8 space-y-8">
        {/* Theme & Language */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Theme */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/40">
              <Moon className="w-3 h-3" />
              Thème
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFormData({ ...formData, theme: 'dark' })}
                className={cn(
                  "py-4 rounded-2xl border flex items-center justify-center gap-3 transition-all",
                  formData.theme === 'dark'
                    ? "bg-gradient-to-br from-violet-500/30 to-purple-500/20 border-violet-500/40"
                    : "bg-white/5 border-white/10 hover:border-violet-500/30"
                )}
              >
                <Moon className="w-5 h-5" />
                <span className="font-bold">Sombre</span>
              </button>
              <button
                onClick={() => setFormData({ ...formData, theme: 'light' })}
                className={cn(
                  "py-4 rounded-2xl border flex items-center justify-center gap-3 transition-all",
                  formData.theme === 'light'
                    ? "bg-gradient-to-br from-amber-500/30 to-yellow-500/20 border-amber-500/40"
                    : "bg-white/5 border-white/10 hover:border-amber-500/30"
                )}
              >
                <Sun className="w-5 h-5" />
                <span className="font-bold">Clair</span>
              </button>
            </div>
          </div>

          {/* Language */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/40">
              <Languages className="w-3 h-3" />
              Langue
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFormData({ ...formData, language: 'fr' })}
                className={cn(
                  "py-4 rounded-2xl border flex items-center justify-center gap-3 transition-all",
                  formData.language === 'fr'
                    ? "bg-gradient-to-br from-blue-500/30 to-indigo-500/20 border-blue-500/40"
                    : "bg-white/5 border-white/10 hover:border-blue-500/30"
                )}
              >
                <span className="text-xl">🇫🇷</span>
                <span className="font-bold">Français</span>
              </button>
              <button
                onClick={() => setFormData({ ...formData, language: 'en' })}
                className={cn(
                  "py-4 rounded-2xl border flex items-center justify-center gap-3 transition-all",
                  formData.language === 'en'
                    ? "bg-gradient-to-br from-blue-500/30 to-indigo-500/20 border-blue-500/40"
                    : "bg-white/5 border-white/10 hover:border-blue-500/30"
                )}
              >
                <span className="text-xl">🇬🇧</span>
                <span className="font-bold">English</span>
              </button>
            </div>
          </div>
        </div>

        {/* Export PDF */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/5 border border-violet-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold">Export Plan d'Action</h4>
                <p className="text-sm text-white/40">Générez un PDF complet avec votre profil</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-bold text-sm hover:from-violet-600 hover:to-purple-600 transition-all">
              <Download className="w-4 h-4" />
              Exporter PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
