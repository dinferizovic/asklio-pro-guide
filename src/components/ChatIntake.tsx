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

interface ChatIntakeProps {
  onComplete: (options: any[]) => void;
  onUpdateTitle?: (title: string) => void;
}

const isGreeting = (text: string): boolean => {
  const greetings = ["hi", "hello", "hey", "start", "help", "yo", "sup"];
  const normalized = text.toLowerCase().trim();
  return normalized.length < 15 || greetings.some((g) => normalized === g || normalized.startsWith(g + " "));
};

export const ChatIntake = ({ onComplete, onUpdateTitle }: ChatIntakeProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const callOpenAI = async (chatMessages: Message[]) => {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

    if (!apiKey) {
      console.error("NEXT_PUBLIC_OPENAI_API_KEY is missing.");
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "OpenAI API key is not configured. Please contact the administrator.",
          timestamp: new Date(),
        },
      ]);
      return;
    }

    const systemPrompt = `
You are an intake assistant for a procurement negotiation agent called LioAnswers.

Your goal is to gather from the user the following information, in this order:

1) productRequest – what product and how many units they need.
2) isPhysicalProduct – whether it is a physical product that requires delivery (yes/no).
3) deliveryLocation – ONLY IF isPhysicalProduct is yes, ask where it should be delivered.
4) budget – the maximum budget.
5) deadline – when they need it delivered.
6) qualityWeight – how important product quality is on a 1–5 scale.
7) speedWeight – how important delivery speed is on a 1–5 scale.

You must infer from the full conversation which pieces of information the user has already provided. 
Do not ask again about information that is already clearly answered.

Behavior rules:
- If you do not yet know productRequest, briefly greet the user and ask what product and quantity they need.
- Once you know productRequest, move on to isPhysicalProduct.
- Once you know isPhysicalProduct:
  - If it is yes, ask for deliveryLocation (city/country or region).
  - If it is no, skip deliveryLocation and move on to budget.
- After that, ask for budget, then deadline, then qualityWeight, then speedWeight.
- Ask only ONE clear question at a time (1–2 sentences).
- Answer in the same language as the user.
- Do not mention internal field names like "productRequest" in your messages.

Completion rule:
When you are confident that you know all required fields
(productRequest, isPhysicalProduct, budget, deadline, qualityWeight, speedWeight, 
and deliveryLocation if isPhysicalProduct is yes),
respond with exactly this single sentence and nothing else:

All information is successfully gathered.
    `.trim();

    try {
      setIsLoading(true);

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          temperature: 0.4,
          messages: [
            { role: "system", content: systemPrompt },
            ...chatMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenAI error:", errorText);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: "Sorry, there was an error while talking to the AI assistant.",
            timestamp: new Date(),
          },
        ]);
        return;
      }

      const data = await response.json();
      const aiReply: string | undefined = data.choices?.[0]?.message?.content;

      if (!aiReply) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: "I could not generate a response. Please try again in a moment.",
            timestamp: new Date(),
          },
        ]);
        return;
      }

      const trimmedReply = aiReply.trim();

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: trimmedReply,
        timestamp: new Date(),
      };

      const finalMessages = [...chatMessages, assistantMessage];
      setMessages(finalMessages);

      if (trimmedReply === "All information is successfully gathered.") {
        setIsComplete(true);
        onComplete?.(finalMessages as any[]);
      }
    } catch (error) {
      console.error("Failed to call OpenAI:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "There was a network error while contacting the AI assistant.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextInput = () => {
    if (!inputValue.trim() || isLoading || isComplete) return;

    const userInput = inputValue.trim();
    setInputValue("");

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userInput,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    // Set session title based on the first non-greeting message
    if (messages.length === 0 && onUpdateTitle && !isGreeting(userInput)) {
      const title = userInput.length > 30 ? userInput.substring(0, 30) + "..." : userInput;
      onUpdateTitle(title);
    }

    void callOpenAI(newMessages);
  };

  const isInitialState = messages.length === 0;

  // Final state: show completion card
  if (isComplete) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-240px)]">
        <Card className="p-8 text-center max-w-md">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg mb-1">All information is successfully gathered.</p>
          <p className="text-sm text-muted-foreground">
            You will receive an email when the right vendors were found...
          </p>
        </Card>
      </div>
    );
  }

  // Initial landing state: centered hero + single input
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
              onKeyDown={(e) => e.key === "Enter" && handleTextInput()}
              placeholder="What would you like to procure today?"
              className="flex-1 h-14 text-base px-6 rounded-full shadow-sm"
              autoFocus
              disabled={isLoading}
            />
            <Button
              onClick={handleTextInput}
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
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
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
              onKeyDown={(e) => e.key === "Enter" && handleTextInput()}
              placeholder="Type your answer..."
              className="flex-1"
              disabled={isLoading || isComplete}
            />
            <Button onClick={handleTextInput} disabled={!inputValue.trim() || isLoading || isComplete}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
