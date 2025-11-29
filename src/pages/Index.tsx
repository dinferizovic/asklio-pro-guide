import { useState } from "react";
import { ChatIntake } from "@/components/ChatIntake";
import { ResultsView } from "@/components/ResultsView";
import { Moon, LogOut, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      {/* Dashboard Header */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Logo and Team */}
            <div>
              <h1 className="text-xl font-bold text-foreground">askLio Hackathon</h1>
              <p className="text-sm text-muted-foreground">Team: hacker_team_7</p>
            </div>

            {/* Center: Navigation Tabs */}
            <nav className="flex items-center gap-8">
              <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Hackathon Materials
              </button>
              <button className="relative text-sm font-semibold text-foreground pb-1">
                LioAnswers
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></span>
              </button>
            </nav>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-accent rounded-lg transition-colors">
                <Moon className="h-5 w-5 text-muted-foreground" />
              </button>
              <Button className="bg-primary hover:bg-primary-hover text-primary-foreground">
                <FileText className="h-4 w-4 mr-2" />
                API Docs
              </Button>
              <Button variant="outline" className="border-border bg-background hover:bg-accent">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Centered Card */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-card rounded-2xl shadow-lg border border-border p-8">
            {/* Card Header */}
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-foreground mb-2">LioAnswers</h2>
              <p className="text-muted-foreground">AI-powered procurement optimization</p>
            </div>

            {/* Content */}
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
