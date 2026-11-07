import {createIcons,House,BookOpen,FlaskConical,CheckSquare,BarChart3,MessageSquare,RotateCcw,Volume2,Mic,ArrowRight,CircleUserRound} from 'lucide';
export const iconName={
 home:'house',learn:'book-open',lab:'flask-conical',practice:'check-square',
 progress:'bar-chart-3',speak:'message-square',profile:'circle-user-round',review:'rotate-ccw',
 audio:'volume-2',mic:'mic',arrow:'arrow-right'
};
const icons={House,BookOpen,FlaskConical,CheckSquare,BarChart3,MessageSquare,RotateCcw,Volume2,Mic,ArrowRight,CircleUserRound};
export function hydrateIcons(){createIcons({icons,attrs:{'stroke-width':2,'aria-hidden':'true'}})}
