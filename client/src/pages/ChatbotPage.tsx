import { useState, useEffect, useRef } from 'react';
import { API_BASE, apiFetch } from '../config';
import { Bot, Send, Trash2, Clock, AlertCircle, Paperclip, X, CheckCheck } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  image?: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  "मुझे बुखार और बदन दर्द है, क्या करूं?",
  "My sugar levels are high, what should I eat?",
  "BP बढ़ा हुआ है, घर पर क्या करें?",
  "Which doctor should I see for chest pain?"
];

export default function ChatbotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('movecare_chat_history');
    if (savedHistory) {
      setMessages(JSON.parse(savedHistory));
    } else {
      setMessages([{
        id: Date.now().toString(),
        sender: 'bot',
        text: "Hi! I'm your HealthAI assistant. Ask me anything about your symptoms, medications, or general health management.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('movecare_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSendMessage = async (text: string) => {
    if ((!text.trim() && !selectedImage) || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      image: selectedImage || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setSelectedImage(null);
    setIsTyping(true);

    try {
      const response = await apiFetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), image: userMsg.image, history: messages })
      });

      const data = await response.json();
      if (response.status === 401) {
        localStorage.removeItem('movecare_token');
        localStorage.removeItem('movecare_role');
        window.location.href = '/login';
        return;
      }
      if (!response.ok) throw new Error(data.message || 'Failed to get response');

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    if (confirm('Clear chat history?')) {
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
    <div className="flex flex-col h-full bg-white overflow-hidden">

      {/* Header */}
      <header className="border-b border-slate-200 flex-shrink-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center">
                <Bot className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900">HealthAI</h1>
              <p className="text-[11px] text-slate-400">Online</p>
            </div>
          </div>
          <button
            onClick={handleClearChat}
            className="text-slate-400 hover:text-red-500 transition-colors text-xs font-bold flex items-center px-3 py-1.5 rounded-lg hover:bg-red-50"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
          <div className="space-y-5">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {!isUser && (
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex-shrink-0 flex items-center justify-center mr-2.5 mt-1">
                      <Bot className="w-3.5 h-3.5 text-slate-600" />
                    </div>
                  )}
                  <div className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-3 ${isUser
                    ? 'bg-slate-900 text-white rounded-tr-md'
                    : 'bg-slate-50 border border-slate-200 text-slate-700 rounded-tl-md'
                  }`}>
                    {msg.image && (
                      <div className="mb-2">
                        <img src={msg.image} alt="Uploaded" className="max-w-full rounded-xl max-h-56 object-contain" />
                      </div>
                    )}
                    {msg.text && <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
                    <div className={`flex items-center gap-1 mt-1.5 text-[10px] font-medium ${isUser ? 'justify-end text-slate-400' : 'text-slate-400'}`}>
                      <Clock className="w-3 h-3" />
                      <span>{msg.timestamp}</span>
                      {isUser && <CheckCheck className="w-3.5 h-3.5 text-blue-400 ml-0.5" />}
                    </div>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex-shrink-0 flex items-center justify-center mr-2.5 mt-1">
                  <Bot className="w-3.5 h-3.5 text-slate-600" />
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-md px-4 py-3.5 flex items-center space-x-1.5">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-2" />
          </div>
        </div>
      </main>

      {/* Input */}
      <footer className="border-t border-slate-200 flex-shrink-0 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">

          <div className={`transition-all duration-500 overflow-hidden ${showQuickPrompts ? 'max-h-40 py-3 opacity-100' : 'max-h-0 py-0 opacity-0'}`}>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Suggestions</p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="text-xs bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 text-slate-600 hover:text-emerald-700 px-3 py-1.5 rounded-lg transition-colors text-left"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="py-3">
            {selectedImage && (
              <div className="mb-2 relative inline-block">
                <img src={selectedImage} alt="Preview" className="h-16 w-16 object-cover rounded-xl border-2 border-slate-200" />
                <button onClick={handleRemoveImage} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 shadow-md hover:bg-red-600">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputValue); }} className="relative flex items-end">
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageSelect} />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isTyping}
                className="absolute left-2 bottom-2 w-9 h-9 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 flex items-center justify-center transition-colors disabled:opacity-50 z-10"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(inputValue); } }}
                disabled={isTyping}
                placeholder={isTyping ? "HealthAI is typing..." : "Type your message..."}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 rounded-xl pl-11 pr-12 py-3 outline-none resize-none max-h-32 min-h-[48px] text-sm text-slate-800 disabled:opacity-60 transition-all"
                rows={1}
                style={{ height: 'auto', overflowY: inputValue.split('\n').length > 3 ? 'auto' : 'hidden' }}
              />

              <button
                type="submit"
                disabled={(!inputValue.trim() && !selectedImage) || isTyping}
                className="absolute right-2 bottom-2 w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition-colors disabled:opacity-30 disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>

            <div className="mt-2 flex items-center justify-center text-[10px] text-slate-400">
              <AlertCircle className="w-3 h-3 mr-1" />
              Not a substitute for professional medical advice.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
