import {createIcons,House,BookOpen,FlaskConical,CheckSquare,BarChart3,MessageSquare,RotateCcw,Volume2,Mic,ArrowRight} from 'lucide';
export const iconName={
 home:'house',learn:'book-open',lab:'flask-conical',practice:'check-square',
 progress:'bar-chart-3',speak:'message-square',review:'rotate-ccw',
 audio:'volume-2',mic:'mic',arrow:'arrow-right'
};
const icons={House,BookOpen,FlaskConical,CheckSquare,BarChart3,MessageSquare,RotateCcw,Volume2,Mic,ArrowRight};
export function hydrateIcons(){createIcons({icons,attrs:{'stroke-width':2,'aria-hidden':'true'}})}
