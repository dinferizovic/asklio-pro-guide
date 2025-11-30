import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isAssistant = message.role === "assistant";

  return (
    <div
      className={cn(
        "flex gap-3 animate-in fade-in-50 slide-in-from-bottom-2 duration-300",
        isAssistant ? "justify-start" : "justify-end"
      )}
    >
      {isAssistant && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
          <Bot className="h-5 w-5 text-muted-foreground" />
        </div>
      )}

      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 shadow-sm",
          isAssistant
            ? "bg-chat-assistant text-foreground border border-border"
            : "bg-chat-user text-primary-foreground"
        )}
      >
        <p className="text-sm leading-relaxed">{message.content}</p>
      </div>

      {!isAssistant && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
          <User className="h-5 w-5 text-primary-foreground" />
        </div>
      )}
    </div>
  );
};
