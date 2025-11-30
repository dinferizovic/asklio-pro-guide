import { VendorOption } from "@/data/mockVendors";
import { VendorCard } from "@/components/VendorCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ResultsDashboardProps {
  vendors: VendorOption[];
  onSelectVendor: (vendor: VendorOption) => void;
  onReset: () => void;
}

export const ResultsDashboard = ({ vendors, onSelectVendor, onReset }: ResultsDashboardProps) => {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Negotiation Complete
        </h1>
        <p className="text-lg text-muted-foreground">
          Top {vendors.length} Options Generated
        </p>
      </div>

      {/* Horizontal Carousel */}
      <div className="relative">
        <div className="overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide">
          <div className="flex gap-6 px-4">
            {vendors.map((vendor, index) => (
              <VendorCard
                key={vendor.id}
                vendor={vendor}
                onSelect={onSelectVendor}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-8 text-center">
        <Button onClick={onReset} variant="outline" size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Start New Request
        </Button>
      </div>
    </div>
  );
};
