import { AlertCircle } from 'lucide-react';
import { BADGE_CLASSES } from '../constants';

interface ActionItemProps {
  text: string;
  badge?: string;
  badgeColor?: string;
  isUrgent?: boolean;
  isDone?: boolean;
}

/**
 * Composant pour afficher une action dans une carte de catégorie
 */
const ActionItem = ({ 
  text, badge, badgeColor = 'slate', isUrgent = false, isDone = false 
}: ActionItemProps) => {
  const badgeClass = BADGE_CLASSES[badgeColor] || BADGE_CLASSES.slate;

  return (
    <div className={`flex items-center gap-2 py-1.5 ${isDone ? 'opacity-50' : ''}`}>
      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isDone ? 'bg-emerald-400' : isUrgent ? 'bg-rose-400' : 'bg-slate-500'}`} />
      <span className={`text-xs flex-1 truncate ${isDone ? 'line-through text-slate-500' : 'text-slate-300'}`}>
        {text}
      </span>
      {badge && (
        <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${badgeClass}`}>
          {badge}
        </span>
      )}
      {isUrgent && !badge && <AlertCircle className="w-3 h-3 text-rose-400 flex-shrink-0" />}
    </div>
  );
};

export default ActionItem;
