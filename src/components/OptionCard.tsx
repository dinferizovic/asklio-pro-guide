import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Clock, Award, Shield, Sparkles, Check } from "lucide-react";
import type { VendorOption } from "@/pages/Index";

interface OptionCardProps {
  option: VendorOption;
  isSelected: boolean;
  onClick: () => void;
}

export const OptionCard = ({ option, isSelected, onClick }: OptionCardProps) => {
  const isRecommended = option.label.includes("Recommended");
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative w-full rounded-xl border-2 bg-card p-6 text-left shadow-sm transition-all duration-300 hover:shadow-md",
        isSelected
          ? "border-primary ring-4 ring-primary/20 shadow-lg shadow-primary/20"
          : "border-border hover:border-primary/30",
        isRecommended && "border-primary/20",
      )}
    >
      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary shadow-md">
          <Check className="h-5 w-5 text-primary-foreground" />
        </div>
      )}

      {/* Recommended Badge */}
      {isRecommended && (
        <div className="absolute -top-3 left-6">
          <Badge className="bg-primary text-primary-foreground border-0 shadow-sm">
            <Sparkles className="mr-1 h-3 w-3" />
            AI Recommended
          </Badge>
        </div>
      )}

      {/* Header */}
      <div className="mb-4 space-y-2">
        <h3 className="text-xl font-bold text-foreground">{option.label}</h3>
        <p className="text-sm text-muted-foreground">{option.vendor_name}</p>
      </div>

      {/* Key Metrics */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Price</p>
            <p className="text-lg font-bold text-foreground">${option.total_price.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Delivery Time</p>
            <p className="text-sm font-semibold text-foreground">{option.delivery_days} days</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Award className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Quality Score</p>
            <p className="text-sm font-semibold text-foreground">{(option.quality_score * 100).toFixed(0)}%</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Warranty</p>
            <p className="text-sm font-semibold text-foreground">
              {option.warranty_years} {option.warranty_years === 1 ? "year" : "years"}
            </p>
          </div>
        </div>
      </div>

      {/* Extras */}
      {option.extras.length > 0 && (
        <div className="border-t border-border pt-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Included</p>
          <div className="flex flex-wrap gap-2">
            {option.extras.map((extra) => (
              <Badge key={extra} variant="secondary" className="text-xs capitalize">
                {extra}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </button>
  );
};
