import { getRateClass } from "@/lib/utils";

interface RateBadgeProps {
  rate: number;
}

const rateStyles: Record<string, string> = {
  "rate-hot": "bg-[#FCE8E6] text-[#EA4335]",
  "rate-warm": "bg-[#FEF7E0] text-[#E37400]",
  "rate-normal": "bg-[#E8F0FE] text-[#1A73E8]",
  "rate-cool": "bg-[#F1F3F4] text-[#5F6368]",
};

export default function RateBadge({ rate }: RateBadgeProps) {
  const cls = getRateClass(rate);
  return (
    <span
      className={`inline-flex items-center px-2 py-[3px] rounded-md font-mono font-semibold text-[13px] ${rateStyles[cls]}`}
    >
      {rate.toFixed(1)}%
    </span>
  );
}
