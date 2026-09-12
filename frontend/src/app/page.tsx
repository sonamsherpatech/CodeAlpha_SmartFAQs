"use client"

import { useState, useRef, useEffect } from "react";
import { sendChatMessage, ChatResponse } from "@/services/api";
import {
  Send,
  Bot,
  User,
  Trash2,
  GraduationCap,
  HelpCircle,
  Clock,
  DollarSign,
  Award,
  Home as HomeIcon,
  Globe
} from "lucide-react"

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  category?: string | null;
  confidence?: number;
  suggestions?: string[];
  timestamp: string;
}

const QUICK_TOPICS = [
  { icon: GraduationCap, label: "Admission Criteria", query: "What are the general admission requirements?" },
  { icon: Clock, label: "Deadlines", query: "What is the application deadline?" },
  { icon: DollarSign, label: "Tution Fees", query: "How much is the annual tution fee?" },
  { icon: Award, label: "Scholarships", query: "Are scholarships available for students?" },
  { icon: HomeIcon, label: "Campus Housing", query: "Is on-campus accomodation provided?" },
  { icon: Globe, label: "International", query: "What are the requirements for international students?" },
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      sender: "bot",
      text: "Hello! Welcome to the University Admission Portal. I'm your FAQ Assistant. Feel free to ask me anything about admissions, deadlines, tuition fees, scholarships, or campus housing.",
      suggestions: [
        "What are the general admission requirements?",
        "How much is the annual tution fee?",
        "Are scholarships available for students?",
      ],
      timestamp: new Date().toLocaleDateString([], { hour: "2-digit", minute: "2-digit" })
    },
  ]);
  const [inputText, setInputText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || inputText).trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!queryText) setInputText("");
    setIsLoading(true);

    try {
      const response: ChatResponse = await sendChatMessage(textToSend);
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: response.answer,
        category: response.category,
        confidence: response.confidence,
        suggestions: response.suggestions,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage: Message = {
        id: `bot-err-${Date.now()}`,
        sender: "bot",
        text: "Sorry, I couldn't reach the serer. Please ensure the backend is running on port 8000.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: "bot",
        text: "Chat cleared. How else can I help you today?",
        suggestions: [
          "What are the general admission requirements?",
          "How much is the annual tution fee?",
          "What degree programs are offered?",
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      },
    ]);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-slate-900 text-base sm-text-lg">
                University Admission FAQ Assistant
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Online
              </span>
            </div>
            <p className="text-xs text-slate-500">Ask questions about admissions, fees, and programs</p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          title="Clear Conversation"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer">
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clear Chat</span>
        </button>
      </header>

      {/* Main Chat Container */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 max-w-3xl w-full mx-auto space-y-6">
        {/* Popular Topic Chips */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Quick Topics
          </p>
          <div className="flex flex-wrap gap-2">
            {QUICK_TOPICS.map((topic, index) => {
              const Icon = topic.icon;
              return (
                <button
                  key={index}
                  onClick={() => handleSend(topic.query)}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 transition cursor-pointer disabled:opacity-50"
                >
                  <Icon className="w-3.5 h-3.5 text-indigo-600" />
                  {topic.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Message Stream */}
        {
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {
                msg.sender === "bot" && (
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )
              }

              <div className="max-w-[85%] sm-max-w-[80%] space-y-2">
                <div
                  className={`p-4 rounded-xl text-sm leading-relaxed ${msg.sender === "user"
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-slate-800 border border-slate-200"
                    }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Metadata tags */}
                  {msg.sender === "bot" && (msg.category || (msg.confidence !== undefined && msg.confidence > 0)) && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
                      {msg.category && (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px] border border-slate-200">
                          {msg.category}
                        </span>
                      )}
                      {msg.confidence !== undefined && msg.confidence > 0 && msg.confidence < 1.0 && (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[11px] border border-slate-200">
                          {Math.round(msg.confidence * 100)} % match
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Suggestions */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.suggestions.map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(sug)}
                        disabled={isLoading}
                        className="text-left text-xs bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <HelpCircle className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{sug}</span>
                      </button>
                    ))}
                  </div>
                )}

                <span className={`text-[10px] text-slate-400 block px-1 ${msg.sender === "user" ? "text-right" : "text-left"
                  }`}>
                  {msg.timestamp}
                </span>
              </div>

              {msg.sender === "user" && (
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shirnk-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input bar */}
      <footer className="bg-white border-t border-slate-200 p-4 sticky bottom-0">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your question here.."
            disabled={isLoading}
            className="flex-1 bg-slate-50 border border-slate-300 focus:border-indigo-600 focus:bg-white rounded-lg px-4 py-3 text-sm text-slate-800 outline-none transition"
            />
          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim() || isLoading}
            className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition cursor-pointer flex items-center justify-center font-medium text-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  )
}