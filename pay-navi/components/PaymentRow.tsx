import { getRankClass } from "@/lib/utils";
import { PaymentMethodsMap, StoreReward } from "@/lib/types";
import RateBadge from "./RateBadge";

const rankStyles: Record<string, string> = {
  "rank-1": "bg-[#E6F4EA] text-[#34A853]",
  "rank-2": "bg-[#E8F0FE] text-[#1A73E8]",
  "rank-3": "bg-[#FEF7E0] text-[#E37400]",
  "rank-other": "bg-[#F1F3F4] text-[#9AA0A6]",
};

interface PaymentRowProps {
  reward: StoreReward;
  rankIndex: number;
  isBest: boolean;
  hasCard: boolean;
  paymentMethods: PaymentMethodsMap;
}

export default function PaymentRow({
  reward,
  rankIndex,
  isBest,
  hasCard,
  paymentMethods,
}: PaymentRowProps) {
  const pm = paymentMethods[reward.method];
  if (!pm) return null;

  const rankCls = rankIndex >= 0 ? getRankClass(rankIndex) : "rank-other";

  return (
    <div
      className={`flex items-center px-4 py-2 gap-[10px] transition-colors ${
        isBest ? "bg-gradient-to-r from-[rgba(52,168,83,0.06)] to-transparent" : ""
      } ${!hasCard ? "opacity-35" : ""}`}
    >
      <span
        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 font-mono ${rankStyles[rankCls]}`}
      >
        {rankIndex >= 0 ? rankIndex + 1 : "-"}
      </span>
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 border border-[#E8EAED]"
        style={{ background: `${pm.color}11` }}
      >
        {pm.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-[13px] text-[#202124] ${isBest ? "font-semibold" : "font-medium"}`}>
          {pm.name}
          {!hasCard && (
            <span className="text-[9px] text-[#9AA0A6] bg-[#F1F3F4] px-[5px] py-[1px] rounded-sm ml-1.5 font-normal">
              未登録
            </span>
          )}
        </div>
        <div className="text-[11px] text-[#9AA0A6] mt-[1px] whitespace-nowrap overflow-hidden text-ellipsis">
          {reward.note}
        </div>
      </div>
      <RateBadge rate={reward.rate} />
    </div>
  );
}
