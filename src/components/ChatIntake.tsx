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

// This is the structure we ultimately send to the backend.
export interface IntakeData {
  items: {
    name: string;
    quantity: number | null;
    notes: string | null;
  }[];
  budget: number | null;
  delivery_deadline: string | null;
  location: string | null;
  qualityWeights: number | null;
  speedWeight: number | null;
}

interface ChatIntakeProps {
  // When intake is complete and the AI says
  // "All information is successfully gathered."
  // we call onComplete([intakeData]) so the parent can hit the backend API.
  onComplete: (options: any[]) => void;
  onUpdateTitle?: (title: string) => void;
}

const OPENAI_API_KEY =
  "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";
const OPENAI_MODEL = process.env.NEXT_PUBLIC_OPENAI_MODEL ?? "gpt-4.1-mini";

const isGreeting = (text: string): boolean => {
  const greetings = ["hi", "hello", "hey", "start", "help", "yo", "sup"];
  const normalized = text.toLowerCase().trim();
  return normalized.length < 15 || greetings.some((g) => normalized === g || normalized.startsWith(g + " "));
};

export const ChatIntake = ({ onComplete, onUpdateTitle }: ChatIntakeProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [intakeData, setIntakeData] = useState<IntakeData>({
    items: [],
    budget: null,
    delivery_deadline: null,
    location: null,
    qualityWeights: null,
    speedWeight: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [intakeComplete, setIntakeComplete] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (role: "assistant" | "user", content: string) => {
    const newMessage: Message = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      role,
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  /**
   * Call OpenAI:
   * - Input: full chat history + current intakeData.
   * - Output: JSON with:
   *   {
   *     "assistant_message": "...",
   *     "intake_data": { items, budget, delivery_deadline, location, qualityWeights, speedWeight }
   *   }
   *
   * The model is responsible for extracting info from the conversation,
   * updating intake_data, and deciding which question to ask next.
   * It should infer whether the product is physical; if it really cannot,
   * it only asks that yes/no question at the end.
   */
  const callOpenAI = async (chatMessages: Message[], currentData: IntakeData) => {
    if (!OPENAI_API_KEY) {
      console.error("NEXT_PUBLIC_OPENAI_API_KEY is missing.");
      addMessage("assistant", "OpenAI API key is not configured. Please contact the administrator.");
      return;
    }

    try {
      setIsLoading(true);

      const systemPrompt = `
You are an intake assistant for a procurement negotiation agent called "LioAnswers".

Your job is to collect from the user all information needed to build this JSON object:

{
  "items": [
    { "name": string, "quantity": number, "notes": string | null }
  ],
  "budget": number,
  "delivery_deadline": string,
  "location": string | null,
  "qualityWeights": number,
  "speedWeight": number
}

Field definitions:

- items: an array of requested products or services.
  - name: short description of the product/service ("La Marzocco KB90", "Google Workspace licenses", etc.).
  - quantity: numeric quantity requested (can be approximate, use the closest integer).
  - notes: optional notes like color preference or configuration; null if none.

- budget: maximum total budget (number). If the user gives a currency, keep the numeric amount.
- delivery_deadline: when they need it delivered or available (e.g. "2024-12-01", "within 2 weeks").
- location: delivery location if this is for physical items; null for pure digital/services.
- qualityWeights: importance of product/service quality on a 1–5 scale.
- speedWeight: importance of delivery speed on a 1–5 scale.

You will receive the current state of this object under the name "intake_data".
Any field (or nested field) that is null or missing is considered "not collected yet".

VERY IMPORTANT OUTPUT FORMAT:
You must ALWAYS respond with a single JSON object and NOTHING else.
The JSON must have exactly this top-level structure:

{
  "assistant_message": string,
  "intake_data": {
    "items": [
      { "name": string, "quantity": number | null, "notes": string | null }
    ],
    "budget": number | null,
    "delivery_deadline": string | null,
    "location": string | null,
    "qualityWeights": number | null,
    "speedWeight": number | null
  }
}

- "assistant_message" is what you say to the user in natural language.
- "intake_data" is your best current guess for the structured fields, updated with any new info.

Conversation rules:

1) productRequest / items:
   - If intake_data.items is empty, or item names/quantities are still unclear,
     ask what product(s) and how many units they need.
   - You may parse multiple items from a single message ("2 espresso machines and 1 grinder").

2) isPhysicalProduct:
   - You SHOULD NOT ask directly "is this a physical product?" at the beginning.
   - First, try to infer from the items whether this is physical (laptops, chairs, coffee machines) or digital (SaaS licenses, cloud credits, consulting).
   - If clearly digital-only, you may keep location = null and never ask about delivery.
   - If clearly physical, you should eventually ask for the delivery location.
   - ONLY IF you genuinely cannot tell after collecting other info, ask near the end:
     "Is this something that requires physical delivery, or is it purely digital/service?"

3) delivery location:
   - If you believe the items require physical delivery (e.g. hardware, furniture, machines)
     and intake_data.location is null, then ask where it should be delivered (city + country if possible).
   - If items are clearly digital/service-only, you may leave location as null and skip the question.

4) budget:
   - If intake_data.budget is null, ask for the maximum budget.

5) deadline:
   - If intake_data.delivery_deadline is null, ask when they need it delivered or available.

6) qualityWeights:
   - If intake_data.qualityWeights is null, ask the user to rate how important quality is from 1 to 5.

7) speedWeight:
   - If intake_data.speedWeight is null, ask the user to rate how important delivery speed is from 1 to 5.

Skipping questions:
- If the user has already given information for a field (either in recent messages or earlier),
  update that field in intake_data and DO NOT ask again.
- You can fill fields implicitly if the user expresses clear preferences (e.g. "quality is extremely important" => qualityWeights ≈ 5).

Completion rule:
- When you are confident that ALL of the following fields are filled:
  - items (with at least one item with a name and quantity),
  - budget,
  - delivery_deadline,
  - qualityWeights,
  - speedWeight,
  - and location if the items require physical delivery,
- then set assistant_message to EXACTLY:
  "All information is successfully gathered."
- In that case, do NOT ask any more questions.

Additional style:
- Ask only ONE question at a time.
- Keep assistant_message short (1–3 sentences).
- Answer in the same language as the user.
      `.trim();

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          temperature: 0.3,
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "system",
              content: `Current intake_data: ${JSON.stringify(currentData)}`,
            },
            ...chatMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          ],
        }),
      });

      if (!res.ok) {
        console.error("OpenAI error:", await res.text());
        addMessage("assistant", "Sorry, there was an error while talking to the AI. Please try again.");
        return;
      }

      const data = await res.json();
      const rawContent = data?.choices?.[0]?.message?.content;

      if (!rawContent || typeof rawContent !== "string") {
        addMessage("assistant", "I could not understand the AI response. Please try again.");
        return;
      }

      let parsed: {
        assistant_message?: string;
        intake_data?: IntakeData;
      };

      try {
        parsed = JSON.parse(rawContent);
      } catch (e) {
        console.error("Failed to parse JSON from OpenAI:", rawContent, e);
        addMessage("assistant", "There was a problem parsing the AI response. Please answer again in a simple way.");
        return;
      }

      const assistantMessageText = parsed.assistant_message ?? "";
      const updatedData: IntakeData = parsed.intake_data ?? currentData;

      // Update structured intake data from the model
      setIntakeData(updatedData);

      if (assistantMessageText) {
        addMessage("assistant", assistantMessageText);
      }

      if (assistantMessageText === "All information is successfully gathered." && !intakeComplete) {
        setIntakeComplete(true);

        // At this moment you can call your backend from the parent.
        // We pass the final intakeData structure to onComplete so the parent can do:
        // fetch("/your-backend", { method: "POST", body: JSON.stringify(intakeData) })
        try {
          onComplete([updatedData]);
        } catch {
          // Parent may choose to ignore this callback.
        }
      }
    } catch (error) {
      console.error("Error calling OpenAI:", error);
      addMessage("assistant", "Network error while calling OpenAI. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextInput = async () => {
    if (!inputValue.trim() || isLoading || intakeComplete) return;

    const userInput = inputValue.trim();
    setInputValue("");

    const userMessage: Message = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      role: "user",
      content: userInput,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    // Update session title from the first non-greeting user message
    if (messages.length === 0 && onUpdateTitle && !isGreeting(userInput)) {
      const title = userInput.length > 30 ? userInput.substring(0, 30) + "..." : userInput;
      onUpdateTitle(title);
    }

    await callOpenAI(newMessages, intakeData);
  };

  const isInitialState = messages.length === 0;

  // Completion state: show confirmation card
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
              disabled={isLoading}
            />
            <Button onClick={handleTextInput} disabled={!inputValue.trim() || isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
