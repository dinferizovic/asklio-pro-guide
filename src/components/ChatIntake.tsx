import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Loader2, Check } from "lucide-react";
import { ChatMessage } from "@/components/ChatMessage";
import { MOCK_RESULTS } from "@/data/mockVendors";

// Simplified message type for relay
interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatIntakeProps {
  onComplete: (options: any[]) => void;
  onUpdateTitle?: (title: string) => void;
  onNewRequest?: () => void;
}

// n8n webhook URL for chat intake
const N8N_WEBHOOK_URL = "https://nikor.app.n8n.cloud/webhook/chat";

// Starter prompt cards
const STARTER_PROMPTS = [
  {
    icon: "💻",
    title: "IT Hardware",
    subtitle: "Buy 50 MacBook Pros for Engineering."
  },
  {
    icon: "☕",
    title: "Office Supplies", 
    subtitle: "Restock kitchen coffee & snacks."
  },
  {
    icon: "🔧",
    title: "Maintenance",
    subtitle: "Find HVAC repair for Munich HQ."
  }
];

export const ChatIntake = ({ onComplete, onUpdateTitle, onNewRequest }: ChatIntakeProps) => {
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
    const response = await sendToWebhook(userMessage);

    // 4. Add assistant reply to chat
    setMessages((prev) => [...prev, { role: "assistant", content: response.reply }]);

    // 5. Handle transition if intake is complete
    if (response.action === "intake_complete") {
      // Wait 2 seconds to let user read the final message
      setTimeout(() => {
        setIntakeComplete(true);
        console.log("Intake complete. Showing confirmation screen.");
      }, 2000);
    }
  };

  // Check if last assistant message asks for a 1-5 rating
  const shouldShowRatingButtons = (): boolean => {
    if (messages.length === 0 || isLoading) return false;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== "assistant") return false;
    // Case-insensitive check for "1 to 5" or "1-5"
    const content = lastMessage.content.toLowerCase();
    return content.includes("1 to 5") || content.includes("1-5");
  };

  // Handle rating button clicks
  const handleRatingClick = async (rating: number) => {
    // Treat the rating as if the user typed it
    const userMessage = rating.toString();

    // Add user message to UI immediately
    const updatedMessages = [...messages, { role: "user" as const, content: userMessage }];
    setMessages(updatedMessages);

    // Send to n8n webhook
    const response = await sendToWebhook(userMessage);

    // Add assistant reply
    setMessages((prev) => [...prev, { role: "assistant", content: response.reply }]);

    // Handle intake_complete if needed
    if (response.action === "intake_complete") {
      setTimeout(() => {
        setIntakeComplete(true);
        console.log("Intake complete. Showing confirmation screen.");
      }, 2000);
    }
  };

  // Handle starter card clicks
  const handleStarterClick = async (prompt: string) => {
    // Add user message to UI immediately
    const updatedMessages = [{ role: "user" as const, content: prompt }];
    setMessages(updatedMessages);
    
    // Update session title
    if (onUpdateTitle) {
      const title = prompt.length > 30 ? prompt.substring(0, 30) + "..." : prompt;
      onUpdateTitle(title);
    }
    
    // Send to n8n webhook
    const response = await sendToWebhook(prompt);
    
    // Add assistant reply
    setMessages((prev) => [...prev, { role: "assistant", content: response.reply }]);
    
    // Handle intake_complete if needed
    if (response.action === "intake_complete") {
      setTimeout(() => {
        setIntakeComplete(true);
      }, 2000);
    }
  };

  const handleGoBackToChat = () => {
    setIntakeComplete(false);
  };

  const isInitialState = messages.length === 0;

  // Processing state: show confirmation card after intake is complete
  if (intakeComplete) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-240px)]">
        <Card className="p-8 text-center max-w-md">
          {/* Blue checkmark inside circle */}
          <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-4">
            <Check className="h-10 w-10 text-white" />
          </div>
          <p className="text-lg mb-2">All information is successfully gathered.</p>
          <p className="text-sm text-muted-foreground mb-6">
            You will receive an email when the right vendors have been found.
          </p>
          {/* Action buttons */}
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={handleGoBackToChat}>
              Go back
            </Button>
            <Button onClick={onNewRequest}>
              New Request
            </Button>
          </div>
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
            <h1 className="text-5xl font-bold mb-3">
              <span className="text-primary">Lio</span>
              <span className="text-foreground">Answers</span>
            </h1>
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

          {/* Suggested Query Cards - Pyramid Layout */}
          <div className="mt-8 flex flex-col items-center gap-4">
            {/* Top row - 2 cards */}
            <div className="flex gap-4">
              {STARTER_PROMPTS.slice(0, 2).map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleStarterClick(prompt.subtitle)}
                  disabled={isLoading}
                  className="flex items-start gap-3 p-4 bg-card border border-border rounded-lg
                             text-left cursor-pointer w-[220px]
                             hover:scale-105 hover:border-primary hover:shadow-md
                             transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-2xl">{prompt.icon}</span>
                  <div>
                    <p className="font-semibold text-primary">{prompt.title}</p>
                    <p className="text-sm text-muted-foreground">{prompt.subtitle}</p>
                  </div>
                </button>
              ))}
            </div>
            
            {/* Bottom row - 1 centered card */}
            <button
              onClick={() => handleStarterClick(STARTER_PROMPTS[2].subtitle)}
              disabled={isLoading}
              className="flex items-start gap-3 p-4 bg-card border border-border rounded-lg
                         text-left cursor-pointer w-[220px]
                         hover:scale-105 hover:border-primary hover:shadow-md
                         transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-2xl">{STARTER_PROMPTS[2].icon}</span>
              <div>
                <p className="font-semibold text-primary">{STARTER_PROMPTS[2].title}</p>
                <p className="text-sm text-muted-foreground">{STARTER_PROMPTS[2].subtitle}</p>
              </div>
            </button>
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
          {/* Rating buttons - shown when bot asks for 1-5 rating */}
          {shouldShowRatingButtons() && (
            <div className="flex justify-center gap-4 mb-4">
              {[1, 2, 3, 4, 5].map((rating, index) => (
                <button
                  key={rating}
                  onClick={() => handleRatingClick(rating)}
                  disabled={isLoading}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className="h-12 w-12 rounded-full border border-primary/20 bg-background text-foreground 
                             font-semibold shadow-sm hover:bg-primary hover:text-primary-foreground 
                             hover:border-primary hover:shadow-md
                             transition-all duration-200 disabled:opacity-50 
                             animate-in fade-in-0 zoom-in-95"
                >
                  {rating}
                </button>
              ))}
            </div>
          )}

          {/* Normal text input - always visible */}
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
