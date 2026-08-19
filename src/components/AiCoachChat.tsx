import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types';
import { Sparkles, Send, X, ShieldAlert, Bot, User, MessageSquare, AlertCircle } from 'lucide-react';

interface AiCoachChatProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AiCoachChat: React.FC<AiCoachChatProps> = ({ isOpen, onClose, profile }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello Athlete! I'm your Gym & Martial Arts AI Coach. Ask me anything about programming splits, 3D muscle anatomy, punching/kicking biomechanics, or recovery pacing.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'How do I balance heavy squats with Muay Thai / BJJ?',
    'What muscles generate explosive punching power?',
    'How many rest days do I need in a hybrid routine?',
    'What is the ideal pre-training carb timing for combat sports?',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSend = async (userText: string) => {
    const textToSend = userText.trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-coach-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            sender: m.sender === 'user' ? 'user' : 'assistant',
            text: m.text,
          })),
          userContext: profile,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const botMessage: ChatMessage = {
        id: `msg_bot_${Date.now()}`,
        sender: 'assistant',
        text:
          data.reply ||
          'I am currently operating in offline mode. Please review the 3D Anatomy Lab or Nutrition Guide for evidence-based athletic principles.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      // Safe educational fallback response
      let fallbackText = `I am here to help with your training! When balancing strength training with combat sports, prioritize compound multi-joint movements (such as squats, Romanian deadlifts, and overhead presses) while keeping 24-48 hours between maximal leg sessions and intense sparring.`;
      
      // If user mentions pain/injury in their prompt
      if (/pain|hurt|injury|torn|dizzy|ache|sprain/i.test(textToSend)) {
        fallbackText = `⚠️ Medical Safety Notice: If you are experiencing acute pain, joint instability, or injury symptoms, please immediately discontinue physical activity and consult a licensed sports physician or physical therapist. The AI coach cannot provide medical diagnoses.`;
      }

      const botMessage: ChatMessage = {
        id: `msg_bot_${Date.now()}`,
        sender: 'assistant',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl h-[650px] max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-amber-600 flex items-center justify-center shadow-lg shadow-rose-900/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Apex AI Coach <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-semibold border border-rose-500/30">Assistant</span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Gym Programming • Biomechanics • Combat Conditioning
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Safety Disclaimer Subheader */}
        <div className="px-4 py-2 bg-amber-950/20 border-b border-amber-500/20 flex items-center gap-2 text-[11px] text-amber-300/90">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span>Educational athletic guidance only. Cannot diagnose injuries or prescribe medical treatments.</span>
        </div>

        {/* Chat Messages Stream */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  msg.sender === 'user'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-900/40'
                    : 'bg-slate-800 text-amber-400 border border-slate-700'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.sender === 'user'
                    ? 'bg-rose-600 text-white rounded-tr-none'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                {msg.text}
                <span className="block text-[10px] text-slate-400 mt-2 text-right">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-800 text-amber-400 border border-slate-700 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl rounded-tl-none flex items-center gap-2 text-xs text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                Coach is analyzing athletic biomechanics...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/40 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="px-3 py-1 rounded-full text-[11px] font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 whitespace-nowrap transition-colors flex-shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="p-4 border-t border-slate-800 bg-slate-950 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask about exercises, fight conditioning, anatomy, or recovery..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-30 text-white transition-all shadow-md shadow-rose-900/30 active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
