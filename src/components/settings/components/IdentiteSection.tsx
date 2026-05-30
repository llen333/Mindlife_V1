'use client';

import {
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  MapPin,
  Globe,
  Edit3,
} from 'lucide-react';
import { ProfileFormData } from '../types';

interface IdentiteSectionProps {
  formData: ProfileFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProfileFormData>>;
  expanded: boolean;
}

export function IdentiteSection({ formData, setFormData, expanded }: IdentiteSectionProps) {
  if (!expanded) return null;

  return (
    <div className="overflow-hidden animate-expand">
      <div className="px-6 pb-8 space-y-8">
        {/* Avatar & Name Row */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border-2 border-orange-500/30 overflow-hidden flex items-center justify-center">
              {formData.name ? (
                <span className="text-4xl font-black bg-gradient-to-br from-orange-400 to-amber-400 bg-clip-text text-transparent">
                  {formData.name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User className="w-12 h-12 text-orange-500/50" />
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Edit3 className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Name & Email */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/40">
                <User className="w-3 h-3" />
                Nom complet
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-orange-500/40 focus:bg-orange-500/5 transition-all text-white placeholder:text-white/20"
                placeholder="Votre nom"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/40">
                <Mail className="w-3 h-3" />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-orange-500/40 focus:bg-orange-500/5 transition-all text-white placeholder:text-white/20"
                placeholder="votre@email.com"
              />
            </div>
          </div>
        </div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/40">
              <Phone className="w-3 h-3" />
              Téléphone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-orange-500/40 focus:bg-orange-500/5 transition-all text-white placeholder:text-white/20"
              placeholder="+33 6 00 00 00 00"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/40">
              <Calendar className="w-3 h-3" />
              Date de naissance
            </label>
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-orange-500/40 focus:bg-orange-500/5 transition-all text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/40">
              <Clock className="w-3 h-3" />
              Fuseau horaire
            </label>
            <select
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-orange-500/40 transition-all text-white appearance-none cursor-pointer"
            >
              <option value="Europe/Paris">Paris (GMT+1)</option>
              <option value="Europe/London">Londres (GMT)</option>
              <option value="America/New_York">New York (GMT-5)</option>
              <option value="America/Los_Angeles">Los Angeles (GMT-8)</option>
            </select>
          </div>
        </div>

        {/* Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/40">
              <MapPin className="w-3 h-3" />
              Pays
            </label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-orange-500/40 focus:bg-orange-500/5 transition-all text-white placeholder:text-white/20"
              placeholder="France"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/40">
              <Globe className="w-3 h-3" />
              Ville
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-orange-500/40 focus:bg-orange-500/5 transition-all text-white placeholder:text-white/20"
              placeholder="Paris"
            />
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/40">
            <Edit3 className="w-3 h-3" />
            Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-orange-500/40 focus:bg-orange-500/5 transition-all resize-none text-white placeholder:text-white/20"
            placeholder="Parlez-nous de vous..."
          />
        </div>
      </div>
    </div>
  );
}
