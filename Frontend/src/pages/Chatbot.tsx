import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Bot, Send, User, Loader2, Sparkles } from "lucide-react";
import Navigation from "@/components/Navigation";
import chatbotAvatar from "@/assets/chatbot-avatar.png";
import { chatbotAPI } from "@/lib/api";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm Admit Genie, your AI admission assistant. I can help you with college information, course details, eligibility criteria, admission deadlines, and much more. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatResponseText = (text: string) => {
    if (!text) return "";
    // Strip markdown bold/italics markers and normalize bullet points
    const withoutBold = text.replace(/\*\*/g, "");
    const withoutItalics = withoutBold.replace(/(^|\s)[*_]([^*_]+)[*_](?=\s|$)/g, "$1$2");
    const normalizedBullets = withoutItalics.replace(/^\s*-\s+/gm, "• ").replace(/^\s*\*\s+/gm, "• ");
    return normalizedBullets.trim();
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const queryText = input;
    setInput("");
    setIsTyping(true);

    try {
      const response = await chatbotAPI.sendQuery(queryText);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: formatResponseText(response.response),
        timestamp: new Date(response.timestamp),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      toast.error(error.message || "Failed to get response from chatbot");
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I encountered an error. Please try again or check your connection.",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickQuestions = [
    "What are the top engineering colleges?",
    "Tell me about admission deadlines",
    "What is the eligibility for B.Tech?",
    "How do I apply for scholarships?",
  ];

  const handleQuickQuestion = (question: string) => {
    setInput(question);
    // Auto-send quick question
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-24 pb-8 px-4 container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-4">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-secondary">AI-Powered Chat Assistant</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Chat with Admit Genie</h1>
          <p className="text-muted-foreground">
            Get instant answers to all your admission-related questions
          </p>
        </div>

        {/* Chat Container */}
        <Card className="h-[600px] flex flex-col bg-card/50 backdrop-blur-sm border-border/50 shadow-glow">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 animate-fade-in ${
                  message.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    message.role === "assistant"
                      ? "bg-gradient-primary"
                      : "bg-secondary"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <img
                      src={chatbotAvatar}
                      alt="AI Assistant"
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <User className="w-5 h-5 text-secondary-foreground" />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`flex-1 max-w-[80%] ${
                    message.role === "user" ? "text-right" : "text-left"
                  }`}
                >
                  <div
                    className={`inline-block p-4 rounded-2xl ${
                      message.role === "assistant"
                        ? "bg-muted text-foreground"
                        : "bg-gradient-primary text-primary-foreground"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 px-2">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3 animate-fade-in">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                  <img
                    src={chatbotAvatar}
                    alt="AI Assistant"
                    className="w-8 h-8 rounded-full"
                  />
                </div>
                <div className="bg-muted p-4 rounded-2xl">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-pulse"
                      style={{ animationDelay: "0.2s" }}
                    />
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-pulse"
                      style={{ animationDelay: "0.4s" }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className="px-4 py-2 border-t border-border/50">
              <p className="text-sm text-muted-foreground mb-2">Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="glass"
                    size="sm"
                    onClick={() => handleQuickQuestion(question)}
                    className="text-xs"
                    disabled={isTyping}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-border/50">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !isTyping && handleSend()}
                placeholder="Ask me anything about admissions..."
                className="flex-1"
                disabled={isTyping}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                variant="hero"
                size="icon"
              >
                {isTyping ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Chatbot;
