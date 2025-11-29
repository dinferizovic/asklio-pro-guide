import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { ChatMessage } from "@/components/ChatMessage";
import { toast } from "@/hooks/use-toast";
import type { ProcurementRequest, PriorityWeights, Constraints, VendorOption } from "@/pages/Index";

interface Message {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: Date;
}

interface ChatIntakeProps {
  onComplete: (options: VendorOption[]) => void;
  onUpdateTitle?: (title: string) => void;
}

const WEBHOOK_URL = "https://example.com/webhook/procurement/negotiate";

export const ChatIntake = ({ onComplete, onUpdateTitle }: ChatIntakeProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your procurement assistant. I'll help you find the best vendors for your purchase. Let's start with the basics - what would you like to buy? Please include quantities if you know them.",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [request, setRequest] = useState<Partial<ProcurementRequest>>({});
  const [weights, setWeights] = useState<Partial<PriorityWeights>>({});
  const [constraints, setConstraints] = useState<Partial<Constraints>>({});
  const [currentQuestion, setCurrentQuestion] = useState<string>("items");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (role: "assistant" | "user", content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const getNextQuestion = (): string | null => {
    if (!request.items) return "items";
    if (!request.location) return "location";
    if (!request.deadline) return "deadline";
    if (!request.budget_max) return "budget";
    if (weights.price === undefined) return "weight_price";
    if (weights.quality === undefined) return "weight_quality";
    if (weights.delivery_time === undefined) return "weight_delivery";
    if (weights.brand_reputation === undefined) return "weight_brand";
    if (weights.sustainability === undefined) return "weight_sustainability";
    if (constraints.min_warranty_years === undefined) return "constraint_warranty";
    if (constraints.must_be_premium_brand === undefined) return "constraint_premium";
    return null;
  };

  const getQuestionText = (question: string): string => {
    const questions: Record<string, string> = {
      items: "Great! What would you like to buy? Please include quantities if you know them.",
      location: "Perfect! Which city should the delivery be to?",
      deadline: "Got it. What's the latest acceptable delivery date? (e.g., 2024-03-15)",
      budget: "Thanks! What's your maximum budget for this purchase?",
      weight_price: "Now let's understand your priorities. On a scale from 1 to 5, how important is the price?",
      weight_quality: "How important is quality? (1-5)",
      weight_delivery: "How important is fast delivery? (1-5)",
      weight_brand: "How important is brand reputation? (1-5)",
      weight_sustainability: "How important is sustainability? (1-5)",
      constraint_warranty: "What's the minimum warranty period you require? (in years)",
      constraint_premium: "Do you require a premium brand? (yes/no)",
    };
    return questions[question] || "";
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userInput = inputValue.trim();
    addMessage("user", userInput);
    
    // Update session title on first message
    if (messages.length === 1 && onUpdateTitle) {
      const title = userInput.length > 30 ? userInput.substring(0, 30) + "..." : userInput;
      onUpdateTitle(title);
    }
    
    setInputValue("");

    // Process the answer
    switch (currentQuestion) {
      case "items":
        setRequest((prev) => ({ ...prev, items: userInput }));
        break;
      case "location":
        setRequest((prev) => ({ ...prev, location: userInput }));
        break;
      case "deadline":
        setRequest((prev) => ({ ...prev, deadline: userInput }));
        break;
      case "budget":
        const budget = parseFloat(userInput.replace(/[^0-9.]/g, ""));
        if (!isNaN(budget)) {
          setRequest((prev) => ({ ...prev, budget_max: budget }));
        }
        break;
      case "weight_price":
      case "weight_quality":
      case "weight_delivery":
      case "weight_brand":
      case "weight_sustainability":
        const weight = parseInt(userInput);
        if (weight >= 1 && weight <= 5) {
          const key = currentQuestion.replace("weight_", "") as keyof PriorityWeights;
          setWeights((prev) => ({ ...prev, [key]: weight }));
        }
        break;
      case "constraint_warranty":
        const warranty = parseInt(userInput);
        if (!isNaN(warranty)) {
          setConstraints((prev) => ({ ...prev, min_warranty_years: warranty }));
        }
        break;
      case "constraint_premium":
        const isPremium = userInput.toLowerCase().includes("yes");
        setConstraints((prev) => ({ ...prev, must_be_premium_brand: isPremium }));
        break;
    }

    // Move to next question
    setTimeout(() => {
      const nextQ = getNextQuestion();
      if (nextQ) {
        setCurrentQuestion(nextQ);
        addMessage("assistant", getQuestionText(nextQ));
      } else {
        addMessage(
          "assistant",
          "Perfect! I have all the information I need. Click 'Run Negotiation' to find the best options for you."
        );
      }
    }, 500);
  };

  const handleRunNegotiation = async () => {
    setIsLoading(true);

    try {
      const payload = {
        request: request as ProcurementRequest,
        weights: weights as PriorityWeights,
        constraints: constraints as Constraints,
      };

      // For demo purposes, simulate API call with mock data
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock response
      const mockOptions: VendorOption[] = [
        {
          label: "Best Price",
          vendor_name: "Value Supplies Co.",
          total_price: 53000,
          delivery_days: 35,
          quality_score: 0.8,
          warranty_years: 2,
          extras: ["installation"],
        },
        {
          label: "Best Quality",
          vendor_name: "Premium Solutions Inc.",
          total_price: 56500,
          delivery_days: 28,
          quality_score: 0.95,
          warranty_years: 3,
          extras: ["installation", "training"],
        },
        {
          label: "Fastest Delivery",
          vendor_name: "Express Vendors Ltd.",
          total_price: 54800,
          delivery_days: 14,
          quality_score: 0.85,
          warranty_years: 2,
          extras: ["installation", "24/7 support"],
        },
        {
          label: "Balanced (AI Recommended)",
          vendor_name: "Smart Choice Partners",
          total_price: 54200,
          delivery_days: 21,
          quality_score: 0.88,
          warranty_years: 3,
          extras: ["installation", "training", "maintenance"],
        },
      ];

      onComplete(mockOptions);
      
      toast({
        title: "Negotiation Complete",
        description: "Found 4 optimized vendor options for you.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to run negotiation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isComplete = getNextQuestion() === null;
  const isInitialState = messages.length === 1;

  // Initial State: Centered search-like interface
  if (isInitialState) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-240px)]">
        <div className="w-full max-w-2xl px-4">
          {/* Title and Subtitle */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-foreground mb-3">LioAnswers</h1>
            <p className="text-lg text-muted-foreground">AI-powered procurement optimization</p>
          </div>

          {/* Centered Input Field */}
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="What would you like to procure today?"
              className="flex-1 h-14 text-base px-6 rounded-full shadow-sm"
              disabled={isLoading}
              autoFocus
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={isLoading || !inputValue.trim()}
              size="lg"
              className="h-14 px-6 rounded-full"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Chat Mode: Standard chat interface after first user message
  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-2xl border border-border bg-card shadow-lg">
        {/* Messages */}
        <div className="h-[600px] overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-border bg-muted/30 p-4">
          {!isComplete ? (
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type your answer..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleRunNegotiation}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Running AI Negotiation...
                </>
              ) : (
                "Run Negotiation"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
