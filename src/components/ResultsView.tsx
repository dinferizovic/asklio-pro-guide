import { Button } from "@/components/ui/button";
import { OptionCard } from "@/components/OptionCard";
import { RotateCcw, CheckCircle2 } from "lucide-react";
import type { VendorOption } from "@/pages/Index";

interface ResultsViewProps {
  options: VendorOption[];
  selectedOption: VendorOption | null;
  onSelectOption: (option: VendorOption) => void;
  onReset: () => void;
}

export const ResultsView = ({
  options,
  selectedOption,
  onSelectOption,
  onReset,
}: ResultsViewProps) => {
  return (
    <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-foreground">Negotiation Results</h2>
        <p className="text-muted-foreground">
          We found {options.length} optimized options based on your requirements
        </p>
      </div>

      {/* Options Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {options.map((option) => (
          <OptionCard
            key={option.label}
            option={option}
            isSelected={selectedOption?.label === option.label}
            onClick={() => onSelectOption(option)}
          />
        ))}
      </div>

      {/* Selection Summary */}
      {selectedOption && (
        <div className="rounded-2xl border-2 border-primary bg-accent/30 p-6 shadow-md animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary">
              <CheckCircle2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-1">Selection Confirmed</h3>
              <p className="text-muted-foreground">
                You selected: <span className="font-medium text-foreground">{selectedOption.label}</span> from{" "}
                <span className="font-medium text-foreground">{selectedOption.vendor_name}</span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Total: ${selectedOption.total_price.toLocaleString()} • Delivery: {selectedOption.delivery_days} days
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={onReset}
          variant="outline"
          size="lg"
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Start New Request
        </Button>
      </div>
    </div>
  );
};
