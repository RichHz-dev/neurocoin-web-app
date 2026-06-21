import { BellRing } from 'lucide-react';

export default function NotificationToast({ notification }) {
  if (!notification) return null;

  return (
    <div className="fixed top-5 right-5 z-55 max-w-sm animate-bounce-short bg-slate-900 border-l-4 border-pink-500 rounded-xl shadow-xl shadow-slate-950 p-4 border border-slate-800 backdrop-blur-md">
      <div className="flex items-start gap-3">
        <BellRing className="text-pink-400 w-5 h-5 shrink-0 mt-0.5 animate-pulse" />
        <div>
          <h5 className="text-xs font-bold text-slate-200">Notificación del Mercado</h5>
          <p className="text-[11px] text-slate-400 mt-1 leading-normal pr-2">{notification.msg}</p>
        </div>
      </div>
    </div>
  );
}
