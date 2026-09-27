import React from 'react';
import { X, Play, Compass, Mountain, Waves } from 'lucide-react';
import { StageId } from '../game/types';

interface StageSelectModalProps {
  isOpen: boolean;
  currentStage: StageId;
  onClose: () => void;
  onSelect: (stage: StageId) => void;
}

export const StageSelectModal: React.FC<StageSelectModalProps> = ({
  isOpen,
  currentStage,
  onClose,
  onSelect,
}) => {
  if (!isOpen) return null;

  const stages = [
    {
      id: 1 as StageId,
      name: '第一關：開拓篇 (Pioneer World)',
      subtitle: '8向俯視射擊冒險',
      desc: '廣袤大地冒險，使用空氣砲擊破障礙岩石尋找竹蜻蜓，擊敗外星魔物並尋找粉紅任意門！',
      icon: Compass,
      color: 'border-lime-600 bg-lime-950/40 text-lime-400',
      activeColor: 'ring-2 ring-lime-400',
    },
    {
      id: 2 as StageId,
      name: '第二關：魔境篇 (Mystery Ruins)',
      subtitle: '2D 橫向平台跳躍捲軸',
      desc: '古代巨神像神殿遺跡，重力與跳躍是過關關鍵！跨越斷崖懸崖、閃躲蝙蝠與石像魔。',
      icon: Mountain,
      color: 'border-amber-600 bg-amber-950/40 text-amber-400',
      activeColor: 'ring-2 ring-amber-400',
    },
    {
      id: 3 as StageId,
      name: '第三關：海底篇 (Submarine Castle)',
      subtitle: '水下搜救迷宮 & 波賽頓 BOSS 戰',
      desc: '深海浮力與氧氣（O2）考驗！救出被困的大雄、靜香、小夫與胖虎，並粉碎波賽頓旗艦核心！',
      icon: Waves,
      color: 'border-cyan-600 bg-cyan-950/40 text-cyan-400',
      activeColor: 'ring-2 ring-cyan-400',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-stone-900 border-4 border-red-700 rounded-lg p-6 text-stone-200 shadow-2xl">
        <div className="flex items-center justify-between border-b-2 border-red-700 pb-3 mb-4">
          <h2 className="text-xl font-bold font-mono tracking-wider text-red-500 flex items-center gap-2">
            <span>★</span> 關卡選擇 (STAGE SELECT)
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-stone-800 rounded text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-stone-400 mb-4 font-mono">
          選擇要立即遊玩的 1986 FC 經典章節：
        </p>

        <div className="space-y-3">
          {stages.map((st) => {
            const Icon = st.icon;
            const isCurrent = currentStage === st.id;
            return (
              <div
                key={st.id}
                onClick={() => {
                  onSelect(st.id);
                  onClose();
                }}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-[1.02] flex items-start gap-4 ${st.color} ${isCurrent ? st.activeColor : 'opacity-90 hover:opacity-100'}`}
              >
                <div className="p-2.5 rounded-lg bg-black/50 shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold font-mono text-sm">{st.name}</h3>
                    {isCurrent && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-red-600 text-white font-mono">
                        當前
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-semibold opacity-90 mb-1">{st.subtitle}</div>
                  <p className="text-xs text-stone-300 leading-relaxed">{st.desc}</p>
                </div>
                <div className="self-center">
                  <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                    <Play className="w-4 h-4 fill-current" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded font-mono text-xs transition-colors"
          >
            取消 (Cancel)
          </button>
        </div>
      </div>
    </div>
  );
};
