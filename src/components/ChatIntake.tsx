import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Loader2 } from "lucide-react";
import { ChatMessage } from "@/components/ChatMessage";

// Simplified message type for relay
interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatIntakeProps {
  onComplete: (options: any[]) => void;
  onUpdateTitle?: (title: string) => void;
}

// n8n webhook URL for chat intake
const N8N_WEBHOOK_URL = "https://nikor.app.n8n.cloud/webhook/chat";

export const ChatIntake = ({ onComplete, onUpdateTitle }: ChatIntakeProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);
  const [isLoading, setIsLoading] = useState(false);
  const [intakeComplete, setIntakeComplete] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * Send message to n8n webhook and receive response
   * Expected response: { reply: string, action: "continue" | "intake_complete" }
   */
  const sendToWebhook = async (userMessage: string) => {
    setIsLoading(true);

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          sessionId,
          history: messages, // Full history of { role, content } objects
        }),
      });

      if (!response.ok) {
        throw new Error(`Webhook error: ${response.status}`);
      }

      // Expected response format: { reply: string, action: "continue" | "intake_complete" }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Webhook error:", error);
      return {
        reply: "Sorry, there was a connection error. Please try again.",
        action: "continue",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || intakeComplete) return;

    const userMessage = inputValue.trim();
    setInputValue("");

    // 1. Add user message to UI immediately
    const updatedMessages = [...messages, { role: "user" as const, content: userMessage }];
    setMessages(updatedMessages);

    // 2. Update session title from first meaningful message
    if (messages.length === 0 && onUpdateTitle) {
      const title = userMessage.length > 30 ? userMessage.substring(0, 30) + "..." : userMessage;
      onUpdateTitle(title);
    }

    // 3. Send to n8n and wait for response
    const { reply, action } = await sendToWebhook(userMessage);

    // 4. Add assistant reply to chat
    setMessages((prev) => [...prev, { role: "assistant", content: reply }]);

    // 5. Handle transition if intake is complete
    if (action === "intake_complete") {
      // Wait 2 seconds to let user read the final message
      setTimeout(() => {
        setIntakeComplete(true);
        console.log("Intake complete. Session ID:", sessionId);
      }, 2000);
    }
  };

  const isInitialState = messages.length === 0;

  // Processing state: show confirmation card after intake is complete
  if (intakeComplete) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-240px)]">
        <Card className="p-8 text-center max-w-md">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg mb-2">All information is successfully gathered.</p>
          <p className="text-sm text-muted-foreground">
            You will receive an email when the right vendors have been found.
          </p>
        </Card>
      </div>
    );
  }

  // Initial state: centered hero + single input
  if (isInitialState) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-240px)]">
        <div className="w-full max-w-2xl px-4">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-foreground mb-3">LioAnswers</h1>
            <p className="text-lg text-muted-foreground">AI-powered procurement optimization</p>
          </div>

          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="What would you like to procure today?"
              className="flex-1 h-14 text-base px-6 rounded-full shadow-sm"
              autoFocus
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              size="lg"
              className="h-14 px-6 rounded-full"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Standard chat mode
  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-2xl border border-border bg-card shadow-lg">
        {/* Messages */}
        <div className="h-[600px] overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <ChatMessage key={`${message.role}-${index}`} message={message} />
          ))}
          {isLoading && <div className="text-center text-xs text-muted-foreground py-2">Lio is thinking...</div>}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="border-t border-border bg-muted/30 p-4">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type your answer..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
