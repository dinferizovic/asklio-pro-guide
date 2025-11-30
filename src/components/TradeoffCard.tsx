import { TradeoffOption } from "@/types/tradeoff";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface TradeoffCardProps {
  option: TradeoffOption;
  onSelect: (option: TradeoffOption) => void;
  index: number;
}

const getBadgeClasses = (label: string): string => {
  const lowerLabel = label.toLowerCase();
  
  if (lowerLabel.includes("balanced") || lowerLabel.includes("best")) {
    return "bg-primary text-primary-foreground border-primary";
  }
  if (lowerLabel.includes("fastest")) {
    return "bg-blue-500 text-white border-blue-500";
  }
  return "bg-secondary text-secondary-foreground border-border";
};

export const TradeoffCard = ({ option, onSelect, index }: TradeoffCardProps) => {
  const handleSelect = () => {
    toast.success(`Contract drafting initiated for ${option.vendor_name}...`);
    onSelect(option);
  };

  return (
    <Card 
      className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg group"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-2xl font-bold text-foreground leading-tight">
            {option.vendor_name}
          </h3>
          <Badge 
            className={`${getBadgeClasses(option.label)} shrink-0 px-3 py-1 text-xs font-semibold`}
          >
            {option.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Hero Metric */}
        <div className="py-6 text-center bg-accent/30 rounded-lg">
          <p className="text-3xl font-bold text-primary">
            {option.summary}
          </p>
        </div>

        {/* AI Insight Box */}
        <div className="bg-muted/50 border border-border rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl shrink-0">🤖</span>
            <div className="flex-1">
              <p className="text-xs font-semibold text-primary mb-1">AI Insight</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {option.rationale}
              </p>
            </div>
          </div>
        </div>

        {/* Select Button */}
        <Button 
          onClick={handleSelect}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11"
        >
          Select Offer
        </Button>
      </CardContent>
    </Card>
  );
};
