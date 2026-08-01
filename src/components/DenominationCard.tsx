import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, Flame, Zap } from "lucide-react";
import { useCurrency } from "@/providers/CurrencyProvider";

export const DenominationCard = memo(
  ({
    item,
    isSelected,
    onSelect,
    isPopular,
    productType = "game",
    isManual: manualFlag,
  }: {
    item: {
      id: string;
      name: string;
      price_myr?: number;
      price_idr?: number;
      price?: number;
      discount?: number;
      min_order?: number;
      max_order?: number;
    };
    isSelected: boolean;
    onSelect: (id: string) => void;
    isPopular?: boolean;
    productType?: string;
    isManual?: boolean;
  }) => {
    const { formatPrice } = useCurrency();
    const isSmm = productType === "smm";
    const isManual = manualFlag ?? ["joki", "vilog", "voucher", "apk"].includes(productType);
    const displayPrice = formatPrice(item.price_myr, item.price_idr || item.price);
    const originalPrice = item.discount ? (item.price_myr || item.price || 0) * (1 + item.discount / 100) : null;
    const formattedOriginal = originalPrice ? formatPrice(originalPrice, originalPrice) : null;

    return (
      <button
        type="button"
        onClick={() => onSelect(item.id)}
        className={`relative p-4 rounded-xl border-2 text-left transition-all duration-300 group ${
          isSelected
            ? "border-[#8B5CF6] bg-[#8B5CF6]/10 shadow-lg shadow-[#8B5CF6]/10 scale-[1.02]"
            : "border-white/5 bg-white/[0.02] hover:border-white/20 hover:shadow-md hover:scale-[1.01]"
        }`}
        aria-pressed={isSelected}
      >
        {isPopular && (
          <div className="absolute -top-2.5 right-2">
            <Badge className="text-[9px] font-bold px-2 py-0 bg-gradient-to-r from-[#FF6B00] to-[#FFB800] border-0 text-black">
              <Flame className="h-2.5 w-2.5 mr-1" />
              Terlaris
            </Badge>
          </div>
        )}

        {item.discount && (
          <div className="absolute -top-2.5 left-2">
            <Badge className="text-[9px] font-bold px-2 py-0 bg-green-500 border-0 text-white">
              -{item.discount}%
            </Badge>
          </div>
        )}

        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-snug text-white break-words min-w-0 whitespace-normal group-hover:text-[#8B5CF6] transition-colors">
            {item.name}
          </p>
          <Badge
            variant="outline"
            className="text-[10px] h-5 shrink-0 border-green-500/30 text-green-500 bg-green-500/10"
          >
            <Zap className="h-2 w-2 mr-1" />
            Ready
          </Badge>
        </div>

        <div className="mt-2 space-y-1">
          <p className="text-base font-bold text-[#8B5CF6]">
            {isSmm ? `${displayPrice} / 1000` : displayPrice}
          </p>
          {formattedOriginal && (
            <p className="text-xs text-white/40 line-through">{formattedOriginal}</p>
          )}
          {isSmm && (item.min_order || item.max_order) && (
            <p className="text-[10px] text-white/40">
              Min: {item.min_order || 1} · Max: {item.max_order || "-"}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 mt-2 text-[10px] text-white/40">
          <Clock className="h-2.5 w-2.5" aria-hidden="true" />
          <span>{isManual ? "Proses Manual" : "Proses Instan"}</span>
        </div>

        {isSelected && (
          <div className="absolute top-2 right-2" aria-hidden="true">
            <div className="h-6 w-6 rounded-full bg-[#8B5CF6] flex items-center justify-center">
              <Check className="h-3.5 w-3.5 text-white" />
            </div>
          </div>
        )}
      </button>
    );
  }
);

DenominationCard.displayName = "DenominationCard";