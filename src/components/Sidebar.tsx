import { Plus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Session {
  id: string;
  title: string;
  status: "intake" | "results";
}

interface SidebarProps {
  sessions: Session[];
  activeSessionId: string | null;
  onNewRequest: () => void;
  onSelectSession: (sessionId: string) => void;
  onLogout: () => void;
}

export const Sidebar = ({
  sessions,
  activeSessionId,
  onNewRequest,
  onSelectSession,
  onLogout,
}: SidebarProps) => {
  return (
    <div className="w-[260px] h-screen bg-[#F9FAFB] border-r border-border flex flex-col">
      {/* Top Section - New Request Button */}
      <div className="p-4">
        <Button
          onClick={onNewRequest}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* Middle Section - Recent Negotiations */}
      <div className="flex-1 overflow-hidden">
        <div className="px-4 py-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Recent Negotiations
          </h3>
        </div>
        <ScrollArea className="h-full px-2">
          <div className="space-y-1 pb-4">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  activeSessionId === session.id
                    ? "bg-[#EEF2FF] border-l-2 border-primary text-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {session.title}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Bottom Section - Logout Button */}
      <div className="p-4 border-t border-border">
        <Button
          onClick={onLogout}
          variant="outline"
          className="w-full border-border bg-background hover:bg-accent"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};
