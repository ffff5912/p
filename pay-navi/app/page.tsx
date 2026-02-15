"use client";

import { useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import TabBar, { TabId } from "@/components/TabBar";
import StoreCard from "@/components/StoreCard";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useWallet } from "@/hooks/useWallet";
import { useNearbyStores } from "@/hooks/useNearbyStores";
import { Store, PaymentMethodsMap } from "@/lib/types";
import paymentMethodsData from "@/data/payment-methods.json";

const MapComponent = dynamic(() => import("@/components/Map"), { ssr: false });

const paymentMethods = paymentMethodsData as PaymentMethodsMap;

const CATEGORIES = ["全て", "コンビニ", "飲食店", "カフェ", "ショッピング"];

const GROUP_ORDER = ["クレジットカード", "コード決済", "電子マネー", "交通系IC"];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("map");
  const [expandedStoreIdx, setExpandedStoreIdx] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentFilter, setCurrentFilter] = useState("全て");

  const { location } = useGeolocation();
  const { selectedPayments, togglePayment } = useWallet();
  const {
    stores: nearbyStores,
    loading: storesLoading,
    error: storesError,
  } = useNearbyStores(location?.lat ?? null, location?.lng ?? null);

  const toggleStore = useCallback((idx: number) => {
    setExpandedStoreIdx((prev) => (prev === idx ? null : idx));
  }, []);

  const sortedStores = useMemo(
    () => [...nearbyStores].sort((a, b) => a.distance - b.distance),
    [nearbyStores]
  );

  const filteredStores = useMemo((): Store[] => {
    let stores = [...nearbyStores];
    if (currentFilter !== "全て") {
      stores = stores.filter((s) => s.category === currentFilter);
    }
    if (searchQuery) {
      stores = stores.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    stores.sort((a, b) => a.distance - b.distance);
    return stores;
  }, [nearbyStores, currentFilter, searchQuery]);

  const groups = useMemo(() => {
    const g: Record<string, { key: string; name: string; icon: string; color: string }[]> = {};
    for (const [key, pm] of Object.entries(paymentMethods)) {
      const group = pm.group;
      if (!g[group]) g[group] = [];
      g[group].push({ key, name: pm.name, icon: pm.icon, color: pm.color });
    }
    return g;
  }, []);

  const renderStoreList = (stores: Store[], containerId: string) => {
    if (storesLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-[200px] gap-3 text-[#9AA0A6] text-[13px]">
          <div className="w-8 h-8 border-[3px] border-[#E8EAED] border-t-[#1A73E8] rounded-full animate-spin" />
          周辺の店舗を検索中...
        </div>
      );
    }

    if (stores.length === 0) {
      return (
        <div className="text-center py-10 text-[#9AA0A6] text-[13px]">
          該当する店舗がありません
        </div>
      );
    }

    return stores.map((store, i) => {
      const originalIdx = nearbyStores.indexOf(store);
      return (
        <StoreCard
          key={`${containerId}-${store.name}-${store.lat}-${store.lng}`}
          store={store}
          isExpanded={expandedStoreIdx === originalIdx}
          onToggle={() => toggleStore(originalIdx)}
          selectedPayments={selectedPayments}
          paymentMethods={paymentMethods}
          animationDelay={i * 30}
        />
      );
    });
  };

  return (
    <>
      <Header status={location ? location.status : "位置情報を許可してください"} />

      <div className="fixed top-14 bottom-16 left-0 right-0 overflow-y-auto overflow-x-hidden">
        {/* Map Tab */}
        {activeTab === "map" && (
          <div>
            <div className="w-full h-[50vh] min-h-[250px] relative">
              {location ? (
                <MapComponent
                  lat={location.lat}
                  lng={location.lng}
                  stores={nearbyStores}
                  onStoreClick={toggleStore}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-[#9AA0A6] text-[13px]">
                  <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 opacity-50">
                    <circle cx="24" cy="24" r="20" stroke="#9AA0A6" strokeWidth="2" />
                    <path d="M24 14v12" stroke="#9AA0A6" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="24" cy="32" r="1.5" fill="#9AA0A6" />
                  </svg>
                  <div className="text-center">
                    <div className="font-medium mb-1">位置情報が取得できません</div>
                    <div className="text-[11px]">ブラウザの位置情報を許可してリロードしてください</div>
                  </div>
                </div>
              )}
            </div>
            <div className="px-4 py-3 pb-6">
              {storesError && (
                <div className="mb-3 p-3 bg-[#FEF7E0] rounded-xl text-[12px] text-[#E37400] leading-relaxed">
                  {storesError}
                </div>
              )}
              <div className="text-sm font-semibold text-[#5F6368] mb-2.5 px-1">
                周辺の店舗
                {!storesLoading && `（${nearbyStores.length}件）`}
              </div>
              {renderStoreList(sortedStores, "map")}
            </div>
          </div>
        )}

        {/* Search Tab */}
        {activeTab === "search" && (
          <div className="p-4">
            <div className="flex items-center bg-white rounded-full px-4 py-2.5 gap-2.5 shadow-sm mb-4">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9AA0A6"
                strokeWidth="2"
                className="w-[18px] h-[18px] shrink-0"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="店舗名で検索..."
                className="flex-1 border-none outline-none text-sm bg-transparent text-[#202124] placeholder:text-[#9AA0A6]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-hide">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`px-4 py-[7px] rounded-full border text-[13px] font-medium whitespace-nowrap cursor-pointer transition-all ${
                    currentFilter === cat
                      ? "bg-[#1A73E8] text-white border-[#1A73E8]"
                      : "bg-white text-[#5F6368] border-[#DADCE0]"
                  }`}
                  onClick={() => setCurrentFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {storesError && (
              <div className="mb-3 p-3 bg-[#FEF7E0] rounded-xl text-[12px] text-[#E37400] leading-relaxed">
                {storesError}
              </div>
            )}

            {renderStoreList(filteredStores, "search")}
          </div>
        )}

        {/* Wallet Tab */}
        {activeTab === "wallet" && (
          <div className="p-4">
            <div className="text-center p-4 bg-white rounded-xl shadow-sm animate-fade-up">
              <strong className="text-[#1A73E8] text-[22px] block mb-1 font-mono">
                {selectedPayments.size}
              </strong>
              <span className="text-[13px] text-[#5F6368]">
                登録済みの決済手段
              </span>
            </div>

            {GROUP_ORDER.map((groupName, gi) => {
              const items = groups[groupName];
              if (!items) return null;
              return (
                <div
                  key={groupName}
                  className="mt-5 animate-fade-up"
                  style={{ animationDelay: `${(gi + 1) * 60}ms` }}
                >
                  <div className="text-[13px] font-semibold text-[#5F6368] mb-2.5 flex items-center gap-1.5">
                    {groupName}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {items.map((pm) => {
                      const isSelected = selectedPayments.has(pm.key);
                      return (
                        <div
                          key={pm.key}
                          className={`bg-white rounded-xl p-3 flex items-center gap-2.5 cursor-pointer border-2 transition-all shadow-sm active:scale-[0.97] ${
                            isSelected
                              ? "border-[#1A73E8] !bg-[#E8F0FE]"
                              : "border-transparent"
                          }`}
                          onClick={() => togglePayment(pm.key)}
                        >
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0"
                            style={{ background: `${pm.color}11` }}
                          >
                            {pm.icon}
                          </div>
                          <div
                            className={`text-xs leading-tight ${
                              isSelected
                                ? "font-semibold text-[#1557B0]"
                                : "font-medium text-[#202124]"
                            }`}
                          >
                            {pm.name}
                          </div>
                          <div
                            className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                              isSelected
                                ? "bg-[#1A73E8] border-[#1A73E8]"
                                : "border-[#DADCE0]"
                            }`}
                          >
                            {isSelected && (
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="white"
                                strokeWidth="3"
                              >
                                <path d="M5 12l5 5L19 7" />
                              </svg>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div className="mt-4 mb-6 p-3 bg-[#F1F3F4] rounded-xl text-[11px] text-[#9AA0A6] leading-relaxed">
              &#9888;&#65039; 還元率はデモ用のサンプルデータです。実際の還元率はカード会社の公式サイトでご確認ください。キャンペーンや条件により変動する場合があります。
            </div>
          </div>
        )}
      </div>

      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </>
  );
}
