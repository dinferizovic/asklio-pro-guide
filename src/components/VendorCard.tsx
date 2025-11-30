import { VendorOption } from "@/data/mockVendors";
import { Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface VendorCardProps {
  vendor: VendorOption;
  onSelect: (vendor: VendorOption) => void;
  index: number;
}

export const VendorCard = ({ vendor, onSelect, index }: VendorCardProps) => {
  const isAIPick = vendor.badges.includes("AI Pick");

  // Get badge colors
  const getBadgeVariant = (badge: string): "default" | "secondary" | "outline" => {
    if (badge === "AI Pick" || badge.includes("Quality")) return "default";
    if (badge === "Lowest Price") return "secondary";
    return "outline";
  };

  return (
    <div
      style={{ animationDelay: `${index * 100}ms` }}
      className={`
        w-full bg-card rounded-xl shadow-md 
        transition-all duration-300 hover:shadow-xl hover:-translate-y-1
        flex flex-col animate-in fade-in-0 slide-in-from-bottom-4
        ${isAIPick ? "border-2 border-primary shadow-lg shadow-primary/20 scale-[1.02]" : "border border-border"}
      `}
    >
      {/* Header Section */}
      <div className="p-6 pb-4">
        <h3 className="text-2xl font-bold text-foreground mb-3">{vendor.name}</h3>
        
        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {vendor.badges.map((badge) => (
            <Badge key={badge} variant={getBadgeVariant(badge)}>
              {badge}
            </Badge>
          ))}
        </div>

        {/* Hero Metric - Price */}
        <div className="mb-4">
          <p className="text-4xl font-bold text-foreground">{vendor.price}</p>
        </div>

        {/* Details Grid */}
        <div className="space-y-3">
          {/* Delivery Time */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="text-sm">{vendor.delivery}</span>
          </div>

          {/* Quality Rating */}
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-5 w-5 ${
                  star <= vendor.quality_score
                    ? "fill-primary text-primary"
                    : "fill-muted text-muted"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* AI Insight Box */}
      <div className="px-6 pb-4 flex-1">
        <div className="bg-muted rounded-lg p-4">
          <p className="text-sm text-muted-foreground italic leading-relaxed">
            {vendor.reasoning}
          </p>
        </div>
      </div>

      {/* Footer Action */}
      <div className="p-6 pt-0">
        <Button
          onClick={() => onSelect(vendor)}
          className="w-full"
          variant={isAIPick ? "default" : "outline"}
        >
          Select Deal
        </Button>
      </div>
    </div>
  );
};
