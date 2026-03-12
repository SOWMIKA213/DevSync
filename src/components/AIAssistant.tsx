import { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { FileNode } from '../types';
import { Sparkles, Send, Bot, User as UserIcon, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useTheme } from '../ThemeContext';

interface AIAssistantProps {
  activeFile: FileNode | undefined;
}

export default function AIAssistant({ activeFile }: AIAssistantProps) {
  const { settings } = useTheme();
  const isDark = settings.theme === 'dark';
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    const userMsg = prompt;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setPrompt('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const model = ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            text: `Context: You are an expert coding assistant in DevSync. 
            Active File: ${activeFile?.name || 'None'}
            Language: ${activeFile?.language || 'Unknown'}
            Code Content:
            \`\`\`
            ${activeFile?.content || 'No code selected'}
            \`\`\`
            
            User Question: ${userMsg}`
          }
        ]
      });

      const response = await model;
      const aiResponse = response.text || "I couldn't generate a response.";
      setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
    } catch (error) {
      console.error("AI Error", error);
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I encountered an error processing your request." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`h-full flex flex-col transition-colors duration-500 ${isDark ? 'bg-[#030014]' : 'bg-white'}`}>
      <div className={`p-6 border-b flex items-center gap-3 ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
        <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-500/10' : 'bg-purple-50'}`}>
          <Sparkles className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
        </div>
        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-zinc-500' : 'text-gray-400'}`}>AI Intelligence</span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {messages.length === 0 && (
          <div className="text-center py-20">
            <div className={`w-20 h-20 rounded-[2rem] border flex items-center justify-center mx-auto mb-6 transition-colors ${
              isDark ? 'bg-white/[0.02] border-white/5' : 'bg-gray-50 border-gray-100'
            }`}>
              <Bot className={`w-10 h-10 ${isDark ? 'text-zinc-800' : 'text-gray-300'}`} />
            </div>
            <h4 className={`text-lg font-bold mb-2 ${isDark ? 'text-zinc-300' : 'text-gray-800'}`}>How can I help?</h4>
            <p className={`text-sm px-8 font-light leading-relaxed ${isDark ? 'text-zinc-500' : 'text-gray-500'}`}>Ask me to refactor code, explain logic, or find potential bugs in your current file.</p>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-4 ${msg.role === 'ai' ? (isDark ? 'bg-white/[0.02] -mx-6 px-6 py-8 border-y border-white/5' : 'bg-gray-50 -mx-6 px-6 py-8 border-y border-gray-100') : ''}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${msg.role === 'ai' ? 'bg-purple-500 text-white' : (isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-gray-200 text-gray-500')}`}>
              {msg.role === 'ai' ? <Bot className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
            </div>
            <div className={`flex-1 text-sm prose prose-sm max-w-none overflow-hidden font-light leading-relaxed ${isDark ? 'text-zinc-300 prose-invert' : 'text-gray-700'}`}>
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-4 animate-pulse">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
              <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />
            </div>
            <div className="flex-1 space-y-3">
              <div className={`h-4 rounded-lg w-3/4 ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}></div>
              <div className={`h-4 rounded-lg w-1/2 ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}></div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleAskAI} className={`p-6 border-t backdrop-blur-xl ${isDark ? 'border-white/5 bg-[#030014]/50' : 'border-gray-100 bg-white/80'}`}>
        <div className="relative group">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask AI about this code..."
            rows={2}
            className={`w-full border rounded-2xl pl-5 pr-12 py-4 text-sm focus:outline-none focus:border-purple-500/50 transition-all resize-none ${
              isDark ? 'bg-black/40 border-white/10 text-white placeholder:text-zinc-700' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'
            }`}
          />
          <button 
            type="submit"
            disabled={isLoading}
            className="absolute right-3 bottom-4 p-2 bg-purple-500 text-white rounded-xl hover:bg-purple-400 disabled:opacity-50 transition-all shadow-lg shadow-purple-500/20 active:scale-90"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
