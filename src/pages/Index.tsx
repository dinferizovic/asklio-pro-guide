import { useState } from "react";
import { ChatIntake } from "@/components/ChatIntake";
import { ResultsView } from "@/components/ResultsView";
import { Moon, LogOut, FileText, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import askLioLogo from "@/assets/asklio-logo.png";

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
        {/* Top Row: Logo/Branding + Actions */}
        <div className="border-b border-border">
          <div className="container mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              {/* Left: Logo and Branding */}
              <div className="flex items-center gap-3">
                {/* Logo */}
                <img src={askLioLogo} alt="askLio" className="h-10 w-auto object-contain" />
                <h1 className="text-xl font-bold">
                  <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">askLio</span>
                  {" "}
                  <span className="text-foreground">Hackathon</span>
                </h1>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-3">
                <button className="p-2 hover:bg-accent rounded-lg transition-colors">
                  <Moon className="h-5 w-5 text-muted-foreground" />
                </button>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
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
        </div>

        {/* Bottom Row: Navigation Tabs */}
        <div className="container mx-auto px-6">
          <nav className="flex items-center gap-8">
            <button className="flex items-center gap-2 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <FileText className="h-4 w-4" />
              Hackathon Materials
            </button>
            <button className="relative flex items-center gap-2 py-3 text-sm font-semibold text-foreground">
              <MessageSquare className="h-4 w-4" />
              LioAnswers
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content - Direct on Background */}
      <main className="container mx-auto px-6 py-8">
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
