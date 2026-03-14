import { useState, useEffect, useRef } from 'react';
import { Bot, Send, Trash2, Clock, AlertCircle } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  "What are remedies for a sore throat?",
  "How do I manage stress/anxiety?",
  "My medication makes me dizzy, what to do?",
  "When should I visit an emergency room?"
];

export default function ChatbotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('movecare_chat_history');
    if (savedHistory) {
      setMessages(JSON.parse(savedHistory));
    } else {
      // Welcome message
      setMessages([
        {
          id: Date.now().toString(),
          sender: 'bot',
          text: "Hi! I'm your HealthAI assistant. Ask me anything about your symptoms, medications, or general health management.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, []);

  // Save to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('movecare_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Generate API Request to Gemini
    try {
      const token = localStorage.getItem('movecare_token');
      
      const response = await fetch('http://localhost:5001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: text.trim(),
          history: messages // Pass the existing history array
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get response');
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: "I'm sorry, I'm having trouble connecting to the medical database right now. Please try again later.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    if (confirm('Are you sure you want to clear the chat history?')) {
      const resetMsg: ChatMessage[] = [{
        id: Date.now().toString(),
        sender: 'bot',
        text: "Hi! I'm your HealthAI assistant. Ask me anything about your symptoms, medications, or general health management.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }];
      setMessages(resetMsg);
      localStorage.setItem('movecare_chat_history', JSON.stringify(resetMsg));
    }
  };

  const showQuickPrompts = messages.length <= 1 && !isTyping;

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      
      {/* SECTION 1: Chat Header (Acts like Navbar here) */}
      <header className="bg-white border-b border-slate-200 z-10 shadow-sm flex-shrink-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center border-2 border-primary-50">
                  <Bot className="w-6 h-6 text-primary-600" />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <h1 className="font-bold text-slate-900 leading-tight">HealthAI Assistant</h1>
                <p className="text-xs text-slate-500 font-medium flex items-center">
                  Powered by Claude AI
                </p>
              </div>
            </div>
          </div>

          <button 
            onClick={handleClearChat}
            className="text-slate-400 hover:text-red-600 transition-colors text-sm font-medium flex items-center px-3 py-1.5 rounded-md hover:bg-red-50"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">Clear Chat</span>
          </button>
        </div>
      </header>

      {/* SECTION 2: Chat Window */}
      <main className="flex-1 overflow-y-auto w-full relative">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-4">
          
          <div className="space-y-6">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  
                  {/* Bot Avatar space (only show on bot messages) */}
                  {!isUser && (
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex-shrink-0 flex items-center justify-center mr-3 mt-1">
                      <Bot className="w-4 h-4 text-primary-600" />
                    </div>
                  )}

                  <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm relative group ${
                    isUser 
                      ? 'bg-primary-600 text-white rounded-tr-sm' 
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
                  }`}>
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    
                    <div className={`flex items-center mt-1.5 text-[11px] font-medium ${isUser ? 'flex-row-reverse text-primary-200' : 'text-slate-400'}`}>
                      <Clock className="w-3 h-3 mr-1" />
                      <span className={isUser ? 'mr-1' : ''}>{msg.timestamp}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start animate-fade-in">
                 <div className="w-8 h-8 rounded-full bg-primary-100 flex-shrink-0 flex items-center justify-center mr-3 mt-1">
                  <Bot className="w-4 h-4 text-primary-600" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm flex items-center space-x-1.5">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} className="h-2" />
          </div>

        </div>
      </main>

      {/* SECTION 3: Quick Prompts & Input Area */}
      <footer className="bg-white border-t border-slate-200 flex-shrink-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          
          {/* Quick Prompts (Only show if chat is empty) */}
          <div className={`transition-all duration-500 overflow-hidden ${showQuickPrompts ? 'max-h-40 py-4 opacity-100' : 'max-h-0 py-0 opacity-0'}`}>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 ml-1">Suggested Questions</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="text-sm bg-slate-50 hover:bg-primary-50 border border-slate-200 hover:border-primary-200 text-slate-700 hover:text-primary-700 px-4 py-2 rounded-full transition-colors text-left"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="py-4">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputValue); }}
              className="relative flex items-end"
            >
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(inputValue);
                  }
                }}
                disabled={isTyping}
                placeholder={isTyping ? "HealthAI is typing..." : "Type your message..."}
                className="w-full bg-slate-100 border-transparent focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 rounded-2xl pl-5 pr-14 py-3.5 sm:py-4 outline-none resize-none max-h-32 min-h-[56px] text-[15px] text-slate-800 disabled:opacity-60 transition-all custom-scrollbar"
                rows={1}
                style={{ 
                  height: 'auto',
                  overflowY: inputValue.split('\n').length > 3 ? 'auto' : 'hidden' 
                }}
              />
              
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="absolute right-2 bottom-2 w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5 ml-0.5" />
              </button>
            </form>
            
            <div className="mt-3 flex items-center justify-center text-[11px] text-slate-400 p-2 text-center relative z-20 bg-white">
              <AlertCircle className="w-3.5 h-3.5 mr-1" />
              <span>This AI is not a substitute for professional medical advice. Always consult your doctor or healthcare provider.</span>
            </div>
            
          </div>
        </div>
      </footer>

    </div>
  );
}
