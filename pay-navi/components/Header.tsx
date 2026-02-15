"use client";

interface HeaderProps {
  status: string;
}

export default function Header({ status }: HeaderProps) {
  return (
    <header className="h-14 bg-white flex items-center px-4 border-b border-[#E8EAED] fixed top-0 left-0 right-0 z-[1000]">
      <div className="flex items-center gap-2">
        <svg viewBox="0 0 28 28" fill="none" className="w-7 h-7">
          <rect width="28" height="28" rx="8" fill="#1A73E8" />
          <text x="14" y="19" textAnchor="middle" fill="white" fontSize="16">
            ¥
          </text>
        </svg>
        <span className="text-lg font-bold text-[#202124] tracking-tight">
          ペイ得ナビ
        </span>
      </div>
      <span className="ml-auto text-[11px] text-[#9AA0A6] font-mono">
        {status}
      </span>
    </header>
  );
}
