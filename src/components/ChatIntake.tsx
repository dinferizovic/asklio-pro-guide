import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Loader2 } from "lucide-react";
import { ChatMessage } from "@/components/ChatMessage";

interface Message {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: Date;
}

interface NegotiationData {
  productRequest: string | null;
  isPhysicalProduct: boolean | null;
  deliveryLocation: string | null;
  budget: string | null;
  deadline: string | null;
  qualityWeight: number | null;
  speedWeight: number | null;
}

type ConversationStep = 0 | 1 | 2 | 3 | 4 | 5 | 6 | "complete";

interface ChatIntakeProps {
  onComplete: (options: any[]) => void;
  onUpdateTitle?: (title: string) => void;
}

const isGreeting = (text: string): boolean => {
  const greetings = ["hi", "hello", "hey", "start", "help", "yo", "sup"];
  const normalized = text.toLowerCase().trim();
  return normalized.length < 15 || greetings.some((g) => normalized === g || normalized.startsWith(g + " "));
};

const RatingButtons = ({ onSelect }: { onSelect: (rating: number) => void }) => (
  <div className="flex gap-2 justify-center py-4">
    {[1, 2, 3, 4, 5].map((num) => (
      <Button
        key={num}
        onClick={() => onSelect(num)}
        variant="outline"
        size="lg"
        className="w-12 h-12 text-lg hover:bg-primary hover:text-primary-foreground transition-colors"
      >
        {num}
      </Button>
    ))}
  </div>
);

const YesNoButtons = ({ onSelect }: { onSelect: (value: boolean) => void }) => (
  <div className="flex gap-4 justify-center py-4">
    <Button onClick={() => onSelect(true)} variant="outline" size="lg" className="px-8">
      Yes
    </Button>
    <Button onClick={() => onSelect(false)} variant="outline" size="lg" className="px-8">
      No
    </Button>
  </div>
);

export const ChatIntake = ({ onComplete, onUpdateTitle }: ChatIntakeProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [conversationStep, setConversationStep] = useState<ConversationStep>(0);
  const [negotiationData, setNegotiationData] = useState<NegotiationData>({
    productRequest: null,
    isPhysicalProduct: null,
    deliveryLocation: null,
    budget: null,
    deadline: null,
    qualityWeight: null,
    speedWeight: null,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const handleTextInput = () => {
    if (!inputValue.trim()) return;

    const userInput = inputValue.trim();
    addMessage("user", userInput);

    // Update session title on first message if it's a real request
    if (messages.length === 0 && onUpdateTitle && !isGreeting(userInput)) {
      const title = userInput.length > 30 ? userInput.substring(0, 30) + "..." : userInput;
      onUpdateTitle(title);
    }

    setInputValue("");

    // Process based on current step
    setTimeout(() => {
      if (conversationStep === 0) {
        // Step 0: Check for greeting vs direct request
        if (isGreeting(userInput)) {
          addMessage(
            "assistant",
            "Hi! To begin, please tell me what product and how many you need? (e.g., '50 Office Chairs')",
          );
          // Stay in step 0
        } else {
          // Direct request - save and move to step 1
          setNegotiationData((prev) => ({ ...prev, productRequest: userInput }));
          addMessage("assistant", "Is this a physical product that requires delivery?");
          setConversationStep(1);
        }
      } else if (conversationStep === 2) {
        // Step 2: Delivery location (only reached if physical product)
        setNegotiationData((prev) => ({ ...prev, deliveryLocation: userInput }));
        addMessage("assistant", "What is your maximum budget?");
        setConversationStep(3);
      } else if (conversationStep === 3) {
        // Step 3: Budget
        setNegotiationData((prev) => ({ ...prev, budget: userInput }));
        addMessage(
          "assistant",
          `When do you need the ${negotiationData.productRequest} by? (e.g., 'Within 2 weeks', 'By March 15th', 'ASAP')`,
        );
        setConversationStep(4);
      } else if (conversationStep === 4) {
        // Step 4: Deadline
        setNegotiationData((prev) => ({ ...prev, deadline: userInput }));
        addMessage("assistant", "On a scale of 1-5, how important is Premium Quality? (1=Basic, 5=Top Tier)");
        setConversationStep(5);
      }
    }, 500);
  };

  const handlePhysicalProductSelect = (isPhysical: boolean) => {
    setNegotiationData((prev) => ({ ...prev, isPhysicalProduct: isPhysical }));
    addMessage("user", isPhysical ? "Yes" : "No");

    setTimeout(() => {
      if (isPhysical) {
        // Ask for delivery location
        addMessage("assistant", `Where should the ${negotiationData.productRequest} be delivered to? (e.g., 'New York, NY', '123 Main St, Chicago')`);
        setConversationStep(2);
      } else {
        // Skip location, go straight to budget
        addMessage("assistant", "What is your maximum budget?");
        setConversationStep(3);
      }
    }, 500);
  };

  const handleRatingSelect = (rating: number, type: "quality" | "speed") => {
    if (type === "quality") {
      // Step 5: Quality rating
      setNegotiationData((prev) => ({ ...prev, qualityWeight: rating }));
      addMessage("user", rating.toString());
      setTimeout(() => {
        addMessage("assistant", "And how important is Fast Delivery?");
        setConversationStep(6);
      }, 500);
    } else {
      // Step 6: Speed rating - final step
      const finalData = { ...negotiationData, speedWeight: rating };
      setNegotiationData(finalData);
      addMessage("user", rating.toString());

      setTimeout(() => {
        console.log("Negotiation Data:", finalData);
        setConversationStep("complete");
      }, 500);
    }
  };

  const isInitialState = messages.length === 0;

  // Complete State: Loading Card
  if (conversationStep === "complete") {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-240px)]">
        <Card className="p-8 text-center max-w-md">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg">You will recieve an email when the right vendors were found...</p>
        </Card>
      </div>
    );
  }

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
              onKeyPress={(e) => e.key === "Enter" && handleTextInput()}
              placeholder="What would you like to procure today?"
              className="flex-1 h-14 text-base px-6 rounded-full shadow-sm"
              autoFocus
            />
            <Button
              onClick={handleTextInput}
              disabled={!inputValue.trim()}
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
          {conversationStep === 1 ? (
            <div>
              <p className="text-center text-sm text-muted-foreground mb-2">Please select:</p>
              <YesNoButtons onSelect={handlePhysicalProductSelect} />
            </div>
          ) : conversationStep === 5 ? (
            <div>
              <p className="text-center text-sm text-muted-foreground mb-2">Select a rating:</p>
              <RatingButtons onSelect={(rating) => handleRatingSelect(rating, "quality")} />
            </div>
          ) : conversationStep === 6 ? (
            <div>
              <p className="text-center text-sm text-muted-foreground mb-2">Select a rating:</p>
              <RatingButtons onSelect={(rating) => handleRatingSelect(rating, "speed")} />
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleTextInput()}
                placeholder="Type your answer..."
                className="flex-1"
              />
              <Button onClick={handleTextInput} disabled={!inputValue.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
