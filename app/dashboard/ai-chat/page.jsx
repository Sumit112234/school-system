"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Bot,
  User,
  Sparkles,
  BookOpen,
  Calculator,
  FlaskConical,
  Languages,
  Lightbulb,
  Loader2,
} from "lucide-react";

export default function AIChatPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      content: "Hello! I'm your AI Study Assistant. I can help you with homework, explain concepts, solve problems, and answer questions about any subject. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  const quickPrompts = [
    { label: "Explain Photosynthesis", icon: FlaskConical },
    { label: "Solve: 2x + 5 = 15", icon: Calculator },
    { label: "Essay Writing Tips", icon: BookOpen },
    { label: "French Vocabulary", icon: Languages },
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const simulateResponse = (userMessage) => {
    const responses = {
      photosynthesis: "Photosynthesis is the process by which plants convert light energy into chemical energy. Here's how it works:\n\n1. **Light Absorption**: Chlorophyll in leaves absorbs sunlight\n2. **Water Splitting**: Water molecules are split into hydrogen and oxygen\n3. **Carbon Fixation**: CO2 from air is converted to glucose\n4. **Energy Storage**: Glucose stores energy for the plant\n\nThe overall equation is:\n6CO2 + 6H2O + light energy → C6H12O6 + 6O2\n\nWould you like me to explain any part in more detail?",
      math: "Let me solve that equation for you:\n\n**2x + 5 = 15**\n\nStep 1: Subtract 5 from both sides\n2x + 5 - 5 = 15 - 5\n2x = 10\n\nStep 2: Divide both sides by 2\n2x ÷ 2 = 10 ÷ 2\n**x = 5**\n\nTo verify: 2(5) + 5 = 10 + 5 = 15 ✓\n\nWould you like to try a similar problem?",
      essay: "Here are some effective essay writing tips:\n\n**1. Planning**\n- Understand the prompt thoroughly\n- Create an outline before writing\n- Research your topic well\n\n**2. Structure**\n- Introduction with a hook and thesis\n- Body paragraphs with topic sentences\n- Conclusion that summarizes key points\n\n**3. Writing Tips**\n- Use clear, concise language\n- Vary sentence structure\n- Support arguments with evidence\n- Proofread multiple times\n\nWould you like help with a specific type of essay?",
      default: "That's a great question! Based on what you're asking, here's what I can tell you:\n\nI'd be happy to help explain this concept in more detail. Could you tell me:\n1. What specific aspect would you like me to focus on?\n2. What grade level should I target my explanation for?\n3. Are there any related topics you'd also like to cover?\n\nFeel free to ask follow-up questions!",
    };

    const lowerMessage = userMessage.toLowerCase();
    if (lowerMessage.includes("photosynthesis")) return responses.photosynthesis;
    if (lowerMessage.includes("2x") || lowerMessage.includes("solve") || lowerMessage.includes("equation")) return responses.math;
    if (lowerMessage.includes("essay") || lowerMessage.includes("writing")) return responses.essay;
    return responses.default;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        role: "assistant",
        content: simulateResponse(userMessage.content),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const handleQuickPrompt = (prompt) => {
    setInput(prompt);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-secondary" />
          AI Study Assistant
        </h1>
        <p className="text-muted-foreground">Get help with homework, concepts, and study questions</p>
      </div>

      <div className="flex-1 flex gap-4">
        {/* Chat Area */}
        <Card className="flex-1 flex flex-col">
          <CardHeader className="border-b py-3">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 bg-secondary">
                <AvatarFallback>
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-sm">Study Assistant</CardTitle>
                <p className="text-xs text-success flex items-center gap-1">
                  <span className="h-2 w-2 bg-success rounded-full" />
                  Online
                </p>
              </div>
            </div>
          </CardHeader>

          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <Avatar className="h-8 w-8 bg-secondary shrink-0">
                      <AvatarFallback>
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.role === "user" && (
                    <Avatar className="h-8 w-8 bg-student shrink-0">
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 bg-secondary shrink-0">
                    <AvatarFallback>
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg p-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about your studies..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>

        {/* Quick Prompts Sidebar */}
        <Card className="w-72 hidden lg:flex flex-col">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Quick Prompts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickPrompts.map((prompt, i) => (
              <Button
                key={i}
                variant="outline"
                className="w-full justify-start gap-2 h-auto py-3 bg-transparent"
                onClick={() => handleQuickPrompt(prompt.label)}
              >
                <prompt.icon className="h-4 w-4 shrink-0" />
                <span className="text-left text-sm">{prompt.label}</span>
              </Button>
            ))}
          </CardContent>

          <div className="p-4 mt-auto">
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="text-center space-y-2">
                  <Badge variant="outline" className="gap-1">
                    <Sparkles className="h-3 w-3" />
                    AI Powered
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    Get instant help with any subject. Ask questions, solve problems, or get explanations.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </Card>
      </div>
    </div>
  );
}
