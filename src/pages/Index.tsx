import { useState } from "react";
import { ChatIntake } from "@/components/ChatIntake";
import { ResultsDashboard } from "@/components/ResultsDashboard";
import { Sidebar } from "@/components/Sidebar";
import { VendorOption } from "@/data/mockVendors";
import { Moon, Sun, FileText, MessageSquare, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import askLioLogo from "@/assets/asklio-logo.png";
import { toast } from "sonner";
import { useTheme } from "next-themes";

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

// VendorOption interface moved to src/data/mockVendors.ts

interface Message {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: Date;
}

interface Session {
  id: string;
  title: string;
  mode: "intake" | "results";
  messages: Message[];
  options: VendorOption[];
  selectedOption: VendorOption | null;
}

const Index = () => {
  const { theme, setTheme } = useTheme();
  const initialSessionId = `session-${Date.now()}`;
  const [sessions, setSessions] = useState<Session[]>([{
    id: initialSessionId,
    title: "New Request",
    mode: "intake",
    messages: [{
      id: "1",
      role: "assistant",
      content: "Hello! I'm your procurement assistant. I'll help you find the best vendors for your purchase. Let's start with the basics - what would you like to buy? Please include quantities if you know them.",
      timestamp: new Date(),
    }],
    options: [],
    selectedOption: null,
  }]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(initialSessionId);

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  const handleNewRequest = () => {
    const newSessionId = `session-${Date.now()}`;
    const newSession: Session = {
      id: newSessionId,
      title: "New Request",
      mode: "intake",
      messages: [{
        id: "1",
        role: "assistant",
        content: "Hello! I'm your procurement assistant. I'll help you find the best vendors for your purchase. Let's start with the basics - what would you like to buy? Please include quantities if you know them.",
        timestamp: new Date(),
      }],
      options: [],
      selectedOption: null,
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSessionId);
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    // If deleting the active session, clear it
    if (activeSessionId === sessionId) {
      setActiveSessionId(null);
    }
  };

  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
  };

  const handleNegotiationComplete = (results: VendorOption[]) => {
    if (!activeSessionId) return;
    
    setSessions((prev) =>
      prev.map((session) =>
        session.id === activeSessionId
          ? { ...session, mode: "results" as const, options: results }
          : session
      )
    );
  };

  const handleReset = () => {
    handleNewRequest();
  };

  const handleSelectOption = (option: VendorOption) => {
    if (!activeSessionId) return;
    
    setSessions((prev) =>
      prev.map((session) =>
        session.id === activeSessionId
          ? { ...session, selectedOption: option }
          : session
      )
    );
  };

  const handleLogout = () => {
    toast.success("Logged out successfully");
  };

  const updateSessionTitle = (title: string) => {
    if (!activeSessionId) return;
    
    setSessions((prev) =>
      prev.map((session) =>
        session.id === activeSessionId
          ? { ...session, title }
          : session
      )
    );
  };

  const handleRenameSession = (sessionId: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId
          ? { ...session, title: newTitle }
          : session
      )
    );
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-background">
      {/* Full-Width Top Header */}
      <header className="w-full border-b border-border bg-card shadow-sm shrink-0 h-16">
        <div className="h-full px-6 flex items-center justify-between">
          {/* Left: Logo and Branding */}
          <div className="flex items-center gap-3">
            <img src={askLioLogo} alt="askLio" className="h-8 w-auto object-contain" />
            <h1 className="text-xl font-bold">
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">askLio</span>
              {" "}
              <span className="text-foreground">Hackathon</span>
            </h1>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Moon className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <FileText className="h-4 w-4 mr-2" />
              API Docs
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-border bg-background hover:bg-accent"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Bottom: Sidebar + Main Content */}
      <div className="flex flex-row flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          sessions={sessions.map((s) => ({ id: s.id, title: s.title, status: s.mode }))}
          activeSessionId={activeSessionId}
          onNewRequest={handleNewRequest}
          onSelectSession={handleSelectSession}
          onRenameSession={handleRenameSession}
          onDeleteSession={handleDeleteSession}
        />

        {/* Right Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-card">
          {/* Navigation Tabs */}
          <div className="px-6 border-b border-border bg-card shrink-0">
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

          {/* Main Content - Centered and Constrained */}
          <main className="flex-1 overflow-y-auto bg-background">
            <div className={`mx-auto px-6 py-8 ${activeSession?.mode === "results" ? "max-w-full" : "max-w-[800px]"}`}>
              {!activeSession ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-muted-foreground mb-2">
                      Select a negotiation or start a new request
                    </h2>
                    <p className="text-muted-foreground">
                      Click "+ New Request" in the sidebar to begin
                    </p>
                  </div>
                </div>
              ) : activeSession.mode === "intake" ? (
                <ChatIntake
                  key={activeSession.id}
                  onComplete={handleNegotiationComplete}
                  onUpdateTitle={updateSessionTitle}
                  onNewRequest={handleNewRequest}
                />
              ) : (
                <ResultsDashboard
                  vendors={activeSession.options}
                  onSelectVendor={handleSelectOption}
                  onReset={handleReset}
                />
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Index;
