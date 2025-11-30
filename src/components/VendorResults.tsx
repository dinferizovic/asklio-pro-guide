import { TradeoffOption } from "@/types/tradeoff";
import { TradeoffCard } from "@/components/TradeoffCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface VendorResultsProps {
  options: TradeoffOption[];
  onSelectOption: (option: TradeoffOption) => void;
  onReset: () => void;
}

export const VendorResults = ({ options, onSelectOption, onReset }: VendorResultsProps) => {
  return (
    <div className="w-full h-full overflow-y-auto">
      {/* Header */}
      <div className="mb-8 text-center pt-4">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Negotiation Complete
        </h1>
        <p className="text-lg text-muted-foreground">
          Here are your top options
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 px-4 pb-8">
        {options.map((option, index) => (
          <TradeoffCard 
            key={option.vendor_id} 
            option={option} 
            onSelect={onSelectOption} 
            index={index} 
          />
        ))}
      </div>

      {/* Action Button */}
      <div className="py-8 text-center">
        <Button onClick={onReset} variant="outline" size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Start New Request
        </Button>
      </div>
    </div>
  );
};
