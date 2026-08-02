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
        className={`relative p-4 rounded-xl border-2 text-left transition-all duration-300 group bg-card ${
          isSelected
            ? "border-primary bg-primary/10 shadow-lg shadow-primary/10 scale-[1.02]"
            : "border-border/80 hover:border-primary/40 hover:shadow-md hover:scale-[1.01] shadow-[0_6px_20px_-14px_rgba(120,90,40,0.18)]"
        }`}
        aria-pressed={isSelected}
      >
        {isPopular && (
          <div className="absolute -top-2.5 right-2">
            <Badge className="text-[9px] font-bold px-2 py-0 bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] border-0 text-white shadow-[0_4px_10px_rgba(249,115,22,0.4)]">
              <Flame className="h-2.5 w-2.5 mr-1" />
              Terlaris
            </Badge>
          </div>
        )}

        {item.discount && (
          <div className="absolute -top-2.5 left-2">
            <Badge className="text-[9px] font-bold px-2 py-0 bg-emerald-500 border-0 text-white">
              -{item.discount}%
            </Badge>
          </div>
        )}

        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold leading-snug text-foreground break-words min-w-0 whitespace-normal group-hover:text-primary transition-colors">
            {item.name}
          </p>
          <Badge
            variant="outline"
            className="text-[10px] h-5 shrink-0 border-emerald-300 text-emerald-700 bg-emerald-50"
          >
            <Zap className="h-2 w-2 mr-1" />
            Ready
          </Badge>
        </div>

        <div className="mt-2 space-y-1">
          <p className="text-base font-extrabold text-primary tabular-nums">
            {isSmm ? `${displayPrice} / 1000` : displayPrice}
          </p>
          {formattedOriginal && (
            <p className="text-xs text-muted-foreground/60 line-through">{formattedOriginal}</p>
          )}
          {isSmm && (item.min_order || item.max_order) && (
            <p className="text-[10px] text-muted-foreground/70">
              Min: {item.min_order || 1} · Max: {item.max_order || "-"}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground/70">
          <Clock className="h-2.5 w-2.5" aria-hidden="true" />
          <span>{isManual ? "Proses Manual" : "Proses Instan"}</span>
        </div>

        {isSelected && (
          <div className="absolute top-2 right-2" aria-hidden="true">
            <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
              <Check className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
          </div>
        )}
      </button>
    );
  }
);

DenominationCard.displayName = "DenominationCard";
