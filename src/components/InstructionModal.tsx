import React from 'react';
import { BookOpen, X, Sparkles, Heart, Wind, ShieldAlert, Award } from 'lucide-react';
import { StageId } from '../game/types';

interface InstructionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStage: (stage: StageId) => void;
}

export const InstructionModal: React.FC<InstructionModalProps> = ({
  isOpen,
  onClose,
  onSelectStage,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-stone-900 border-4 border-amber-600 rounded-lg p-6 text-stone-200 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-amber-600 pb-3 mb-4">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-bold font-mono tracking-wider text-amber-400">
              1986 FC 哆啦A夢 說明書 (取扱説明書)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-stone-800 rounded text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 text-sm">
          {/* Story */}
          <div className="bg-stone-950/60 p-4 rounded border border-stone-800">
            <h3 className="text-amber-300 font-bold mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              【遊戲故事背景】
            </h3>
            <p className="leading-relaxed text-stone-300">
              大雄、靜香、小夫與胖虎在玩時空旅行時不慎被未知磁場所分散，落入三個截然不同的時空次元！
              哆啦A夢必須隻身穿越<b>開拓篇（宇宙拓荒區）</b>、<b>魔境篇（古代神殿遺跡）</b>與<b>海底篇（亞特蘭提斯深海）</b>，
              運用秘密道具粉碎波賽頓魔神戰艦的野心，帶領全體好友安全返回現代！
            </p>
          </div>

          {/* Three Unique Chapters */}
          <div>
            <h3 className="text-amber-300 font-bold mb-3 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              【三大篇章獨創玩法】
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-stone-950 p-3 rounded border border-lime-800">
                <div className="text-lime-400 font-bold mb-1">第一關：開拓篇</div>
                <p className="text-xs text-stone-300 mb-2">
                  2D 俯視自由 8 向射擊。擊破障礙岩石尋找竹蜻蜓與美味銅鑼燒，突破外星魔物並尋找通往下一關的<b>粉紅任意門</b>！
                </p>
                <button
                  onClick={() => { onSelectStage(1); onClose(); }}
                  className="w-full py-1 text-xs bg-lime-800 hover:bg-lime-700 text-white rounded font-mono"
                >
                  開始開拓篇
                </button>
              </div>

              <div className="bg-stone-950 p-3 rounded border border-amber-800">
                <div className="text-amber-400 font-bold mb-1">第二關：魔境篇</div>
                <p className="text-xs text-stone-300 mb-2">
                  2D 橫向捲軸跳躍平台。活用跳躍物理避開無底深淵、盤旋蝙蝠與石像魔，抵達<b>巨神像神殿之門</b>！
                </p>
                <button
                  onClick={() => { onSelectStage(2); onClose(); }}
                  className="w-full py-1 text-xs bg-amber-800 hover:bg-amber-700 text-white rounded font-mono"
                >
                  開始魔境篇
                </button>
              </div>

              <div className="bg-stone-950 p-3 rounded border border-cyan-800">
                <div className="text-cyan-400 font-bold mb-1">第三關：海底篇</div>
                <p className="text-xs text-stone-300 mb-2">
                  水下浮力迷宮與拯救大作戰。隨時注意<b>氧氣條（O₂）</b>，陸續救回大雄、靜香、小夫、胖虎，並合力消滅<b>波賽頓旗艦核心 Boss</b>！
                </p>
                <button
                  onClick={() => { onSelectStage(3); onClose(); }}
                  className="w-full py-1 text-xs bg-cyan-800 hover:bg-cyan-700 text-white rounded font-mono"
                >
                  開始海底篇
                </button>
              </div>
            </div>
          </div>

          {/* Secret Gadgets (道具一覽) */}
          <div>
            <h3 className="text-amber-300 font-bold mb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              【秘密道具與補給】
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-stone-950 p-2 rounded border border-stone-800 flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-amber-700 flex items-center justify-center font-bold text-white">
                  銅
                </div>
                <div>
                  <div className="font-bold text-amber-400">銅鑼燒</div>
                  <div className="text-[11px] text-stone-400">恢復 1 點體力</div>
                </div>
              </div>

              <div className="bg-stone-950 p-2 rounded border border-stone-800 flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-yellow-500 flex items-center justify-center font-bold text-black">
                  竹
                </div>
                <div>
                  <div className="font-bold text-yellow-400">竹蜻蜓</div>
                  <div className="text-[11px] text-stone-400">時效飛行跨越障礙</div>
                </div>
              </div>

              <div className="bg-stone-950 p-2 rounded border border-stone-800 flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-cyan-600 flex items-center justify-center font-bold text-white">
                  O₂
                </div>
                <div>
                  <div className="font-bold text-cyan-400">氧氣罐</div>
                  <div className="text-[11px] text-stone-400">補給 50% 呼吸氧氣</div>
                </div>
              </div>

              <div className="bg-stone-950 p-2 rounded border border-stone-800 flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-pink-600 flex items-center justify-center font-bold text-white">
                  門
                </div>
                <div>
                  <div className="font-bold text-pink-400">任意門</div>
                  <div className="text-[11px] text-stone-400">瞬間傳送至下篇章</div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls table */}
          <div>
            <h3 className="text-amber-300 font-bold mb-2">【操作按鍵對照】</h3>
            <table className="w-full text-xs text-left text-stone-300 bg-stone-950 rounded border border-stone-800">
              <thead className="text-stone-400 uppercase bg-stone-800/50">
                <tr>
                  <th className="px-3 py-2">動作</th>
                  <th className="px-3 py-2">電腦鍵盤</th>
                  <th className="px-3 py-2">虛擬手把</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                <tr>
                  <td className="px-3 py-1.5 font-bold">移動 / 游動</td>
                  <td className="px-3 py-1.5 font-mono text-amber-300">WASD 或 方向鍵</td>
                  <td className="px-3 py-1.5">左側十字鍵 (D-Pad)</td>
                </tr>
                <tr>
                  <td className="px-3 py-1.5 font-bold">B 鍵：空氣砲攻擊</td>
                  <td className="px-3 py-1.5 font-mono text-amber-300">J 鍵 或 空白鍵 (Space)</td>
                  <td className="px-3 py-1.5">右側紅色 B 鍵</td>
                </tr>
                <tr>
                  <td className="px-3 py-1.5 font-bold">A 鍵：跳躍 / 上浮</td>
                  <td className="px-3 py-1.5 font-mono text-amber-300">K 鍵 或 Z 鍵</td>
                  <td className="px-3 py-1.5">右側紅色 A 鍵</td>
                </tr>
                <tr>
                  <td className="px-3 py-1.5 font-bold">START 鍵：開始 / 暫停</td>
                  <td className="px-3 py-1.5 font-mono text-amber-300">Enter 或 P 鍵</td>
                  <td className="px-3 py-1.5">中央 START 鈕</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded font-mono text-sm transition-colors"
          >
            關閉說明書 (OK)
          </button>
        </div>
      </div>
    </div>
  );
};
