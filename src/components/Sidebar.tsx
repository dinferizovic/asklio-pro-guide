import { useState } from "react";
import { Plus, Edit2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

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
  onRenameSession: (sessionId: string, newTitle: string) => void;
}

export const Sidebar = ({
  sessions,
  activeSessionId,
  onNewRequest,
  onSelectSession,
  onRenameSession,
}: SidebarProps) => {
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const handleDoubleClick = (session: Session) => {
    setEditingSessionId(session.id);
    setEditTitle(session.title);
  };

  const handleSaveRename = (sessionId: string) => {
    if (editTitle.trim()) {
      onRenameSession(sessionId, editTitle.trim());
    }
    setEditingSessionId(null);
    setEditTitle("");
  };

  const handleCancelRename = () => {
    setEditingSessionId(null);
    setEditTitle("");
  };

  const handleKeyDown = (e: React.KeyboardEvent, sessionId: string) => {
    if (e.key === "Enter") {
      handleSaveRename(sessionId);
    } else if (e.key === "Escape") {
      handleCancelRename();
    }
  };

  return (
    <div className="w-[260px] h-full bg-[#F9FAFB] border-r border-border flex flex-col">
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
              <div
                key={session.id}
                className={`relative group rounded-md transition-colors ${
                  activeSessionId === session.id
                    ? "bg-[#EEF2FF] border-l-2 border-primary"
                    : "hover:bg-accent"
                }`}
              >
                {editingSessionId === session.id ? (
                  <div className="flex items-center gap-1 px-3 py-2">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, session.id)}
                      className="h-7 text-sm flex-1"
                      autoFocus
                      onBlur={() => handleSaveRename(session.id)}
                    />
                    <button
                      onClick={() => handleSaveRename(session.id)}
                      className="p-1 hover:bg-primary/10 rounded"
                    >
                      <Check className="h-3 w-3 text-primary" />
                    </button>
                    <button
                      onClick={handleCancelRename}
                      className="p-1 hover:bg-destructive/10 rounded"
                    >
                      <X className="h-3 w-3 text-destructive" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <button
                      onClick={() => onSelectSession(session.id)}
                      onDoubleClick={() => handleDoubleClick(session)}
                      className={`flex-1 text-left px-3 py-2 text-sm transition-colors ${
                        activeSessionId === session.id
                          ? "text-foreground font-medium"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {session.title}
                    </button>
                    <button
                      onClick={() => handleDoubleClick(session)}
                      className="opacity-0 group-hover:opacity-100 p-2 hover:bg-accent rounded transition-opacity"
                      title="Rename"
                    >
                      <Edit2 className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
