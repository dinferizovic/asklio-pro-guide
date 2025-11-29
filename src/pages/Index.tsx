import { useState } from "react";
import { ChatIntake } from "@/components/ChatIntake";
import { ResultsView } from "@/components/ResultsView";
import { Sparkles } from "lucide-react";

export interface ProcurementRequest {
  items: string;
  location: string;
  deadline: string;
  budget_max: number;
}

export interface PriorityWeights {
  price: number;
  quality: number;
  delivery_time: number;
  brand_reputation: number;
  sustainability: number;
}

export interface Constraints {
  min_warranty_years: number;
  must_be_premium_brand: boolean;
}

export interface VendorOption {
  label: string;
  vendor_name: string;
  total_price: number;
  delivery_days: number;
  quality_score: number;
  warranty_years: number;
  extras: string[];
}

const Index = () => {
  const [mode, setMode] = useState<"intake" | "results">("intake");
  const [options, setOptions] = useState<VendorOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<VendorOption | null>(null);

  const handleNegotiationComplete = (results: VendorOption[]) => {
    setOptions(results);
    setMode("results");
  };

  const handleReset = () => {
    setMode("intake");
    setOptions([]);
    setSelectedOption(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">askLio Negotiation Assistant</h1>
              <p className="text-sm text-muted-foreground">AI-powered procurement optimization</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {mode === "intake" ? (
          <ChatIntake onComplete={handleNegotiationComplete} />
        ) : (
          <ResultsView
            options={options}
            selectedOption={selectedOption}
            onSelectOption={setSelectedOption}
            onReset={handleReset}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
