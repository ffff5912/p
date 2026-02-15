"use client";

const tabs = [
  {
    id: "map" as const,
    label: "マップ",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[22px] h-[22px]">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
    ),
  },
  {
    id: "search" as const,
    label: "検索",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[22px] h-[22px]">
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
    ),
  },
  {
    id: "wallet" as const,
    label: "マイカード",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[22px] h-[22px]">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <path d="M2 10h20" />
        <circle cx="16" cy="14" r="1.5" />
      </svg>
    ),
  },
];

export type TabId = "map" | "search" | "wallet";

interface TabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export default function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[#E8EAED] flex z-[1000] pb-[env(safe-area-inset-bottom,0)]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`flex-1 flex flex-col items-center justify-center gap-1 relative border-none bg-transparent font-[inherit] cursor-pointer transition-all duration-150 ${
            activeTab === tab.id ? "text-[#1A73E8]" : "text-[#9AA0A6]"
          }`}
          onClick={() => onTabChange(tab.id)}
        >
          {activeTab === tab.id && (
            <span className="absolute top-0 w-12 h-[3px] bg-[#1A73E8] rounded-b" />
          )}
          {tab.icon}
          <span
            className={`text-[10px] ${
              activeTab === tab.id ? "font-semibold text-[#1A73E8]" : "font-medium text-[#9AA0A6]"
            }`}
          >
            {tab.label}
          </span>
        </button>
      ))}
    </nav>
  );
}
