"use client";

import { Store, StoreReward, PaymentMethodsMap } from "@/lib/types";
import {
  findStoreRewards,
  getCategoryStyle,
  formatDistance,
} from "@/lib/utils";
import RateBadge from "./RateBadge";
import PaymentRow from "./PaymentRow";

interface StoreCardProps {
  store: Store;
  isExpanded: boolean;
  onToggle: () => void;
  selectedPayments: Set<string>;
  paymentMethods: PaymentMethodsMap;
  animationDelay?: number;
}

export default function StoreCard({
  store,
  isExpanded,
  onToggle,
  selectedPayments,
  paymentMethods,
  animationDelay = 0,
}: StoreCardProps) {
  const result = findStoreRewards(store.name);
  const rewards: StoreReward[] = result
    ? [...result.rewards].sort((a, b) => b.rate - a.rate)
    : [];
  const userRewards = rewards.filter((r) => selectedPayments.has(r.method));
  const bestReward = userRewards[0] || rewards[0];
  const catStyle = getCategoryStyle(store.category);

  const owned = rewards
    .filter((r) => selectedPayments.has(r.method))
    .sort((a, b) => b.rate - a.rate);
  const notOwned = rewards
    .filter((r) => !selectedPayments.has(r.method))
    .sort((a, b) => b.rate - a.rate);
  const displayList = [...owned, ...notOwned];

  return (
    <div
      className={`bg-white rounded-xl mb-2 overflow-hidden cursor-pointer transition-all duration-200 animate-fade-up ${
        isExpanded ? "shadow-md" : "shadow-sm"
      }`}
      style={{ animationDelay: `${animationDelay}ms` }}
      onClick={onToggle}
    >
      <div className="flex items-center px-4 py-3.5 gap-3">
        <div
          className="w-[42px] h-[42px] rounded-[10px] flex items-center justify-center text-xl shrink-0"
          style={{ background: catStyle.bg }}
        >
          {catStyle.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-[#202124] whitespace-nowrap overflow-hidden text-ellipsis">
            {store.name}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-[#9AA0A6] font-mono">
              {formatDistance(store.distance)}
            </span>
            <span
              className="text-[10px] font-medium px-1.5 py-[1px] rounded"
              style={{ background: catStyle.bg, color: catStyle.color }}
            >
              {store.category}
            </span>
          </div>
        </div>
        {bestReward && (
          <div className="text-right shrink-0">
            <div className="text-[9px] text-[#9AA0A6] font-medium mb-0.5">
              最大還元
            </div>
            <RateBadge rate={bestReward.rate} />
          </div>
        )}
      </div>

      {isExpanded && rewards.length > 0 && (
        <div className="border-t border-[#E8EAED] pt-2 pb-1" onClick={(e) => e.stopPropagation()}>
          <div className="text-[10px] font-semibold text-[#9AA0A6] uppercase tracking-wider px-4 pb-2 font-mono">
            支払い方法ランキング
          </div>
          {displayList.map((reward, i) => {
            const hasCard = selectedPayments.has(reward.method);
            const ownedIndex = owned.indexOf(reward);
            return (
              <PaymentRow
                key={reward.method}
                reward={reward}
                rankIndex={hasCard ? ownedIndex : -1}
                isBest={ownedIndex === 0}
                hasCard={hasCard}
                paymentMethods={paymentMethods}
              />
            );
          })}
        </div>
      )}

      {isExpanded && rewards.length === 0 && (
        <div className="border-t border-[#E8EAED] text-center py-5 text-[#9AA0A6] text-[13px]">
          還元率データ未登録
        </div>
      )}
    </div>
  );
}
