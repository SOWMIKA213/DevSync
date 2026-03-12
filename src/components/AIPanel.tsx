import React, { useState } from 'react';
import { Sparkles, Bug, Zap, MessageSquare, Code, ShieldCheck, TrendingUp, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiService } from '../services/aiService';
import ReactMarkdown from 'react-markdown';
import { useTheme } from '../ThemeContext';

interface AIPanelProps {
  currentCode: string;
  language: string;
}

const AIPanel: React.FC<AIPanelProps> = ({ currentCode, language }) => {
  const { settings } = useTheme();
  const isDark = settings.theme === 'dark';
  const [activeMode, setActiveMode] = useState<'pair' | 'debug' | 'explain'>('pair');
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [bugs, setBugs] = useState<any[]>([]);
  const [suggestion, setSuggestion] = useState<string | null>(null);

  const handleExplain = async () => {
    setIsLoading(true);
    const result = await aiService.explainCode(currentCode, language);
    setExplanation(result);
    setIsLoading(false);
    setActiveMode('explain');
  };

  const handlePredictBugs = async () => {
    setIsLoading(true);
    const result = await aiService.predictBugs(currentCode, language);
    setBugs(result);
    setIsLoading(false);
    setActiveMode('debug');
  };

  const handleGetSuggestion = async () => {
    setIsLoading(true);
    const result = await aiService.getCodeSuggestion(currentCode, language, "General improvement");
    setSuggestion(result || "No suggestions at the moment.");
    setIsLoading(false);
    setActiveMode('pair');
  };

  const insights = [
    { icon: ShieldCheck, label: 'Security', value: bugs.length > 0 ? 'Risk Detected' : 'Secure', color: bugs.length > 0 ? 'text-red-400' : 'text-green-400' },
    { icon: TrendingUp, label: 'Performance', value: 'Optimal', color: 'text-blue-400' },
    { icon: Bug, label: 'Bugs', value: `${bugs.length} Predicted`, color: 'text-purple-400' },
  ];

  return (
    <div className={`flex flex-col h-full border-l transition-colors duration-500 ${
      isDark ? 'bg-purple-900/20 border-white/5' : 'bg-white border-gray-200'
    }`}>
      <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
        <div className="flex items-center gap-2">
          <Sparkles className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
          <h2 className={`font-bold text-sm ${isDark ? 'text-purple-200' : 'text-gray-900'}`}>AI Assistant</h2>
        </div>
        {isLoading && <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />}
      </div>

      <div className="flex-1 p-4 space-y-6 overflow-y-auto">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2">
          {insights.map((stat, i) => (
            <div key={i} className={`p-2 flex flex-col items-center justify-center text-center rounded-xl border transition-colors ${
              isDark ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'
            }`}>
              <stat.icon className={`w-4 h-4 mb-1 ${stat.color}`} />
              <span className={`text-[8px] uppercase font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>{stat.label}</span>
              <span className={`text-[10px] font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</span>
            </div>
          ))}
        </div>

        {/* AI Modes */}
        <div className="space-y-3">
          <h3 className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>AI Actions</h3>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={handleGetSuggestion}
              className={`p-3 rounded-xl border text-left transition-all ${
                activeMode === 'pair' 
                  ? 'bg-purple-600/20 border-purple-500/50' 
                  : (isDark ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-gray-50 border-gray-200 hover:bg-gray-100')
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Code className={`w-4 h-4 ${activeMode === 'pair' ? 'text-purple-400' : 'text-purple-500/50'}`} />
                <span className={`text-xs font-bold ${isDark ? 'text-purple-200' : 'text-gray-900'}`}>Pair Programmer</span>
              </div>
              <p className={`text-[10px] ${isDark ? 'text-purple-400/70' : 'text-gray-500'}`}>Get real-time code suggestions</p>
            </button>

            <button
              onClick={handlePredictBugs}
              className={`p-3 rounded-xl border text-left transition-all ${
                activeMode === 'debug' 
                  ? 'bg-purple-600/20 border-purple-500/50' 
                  : (isDark ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-gray-50 border-gray-200 hover:bg-gray-100')
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Bug className={`w-4 h-4 ${activeMode === 'debug' ? 'text-purple-400' : 'text-purple-500/50'}`} />
                <span className={`text-xs font-bold ${isDark ? 'text-purple-200' : 'text-gray-900'}`}>Smart Debugger</span>
              </div>
              <p className={`text-[10px] ${isDark ? 'text-purple-400/70' : 'text-gray-500'}`}>Predict and fix vulnerabilities</p>
            </button>

            <button
              onClick={handleExplain}
              className={`p-3 rounded-xl border text-left transition-all ${
                activeMode === 'explain' 
                  ? 'bg-purple-600/20 border-purple-500/50' 
                  : (isDark ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-gray-50 border-gray-200 hover:bg-gray-100')
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Zap className={`w-4 h-4 ${activeMode === 'explain' ? 'text-purple-400' : 'text-purple-500/50'}`} />
                <span className={`text-xs font-bold ${isDark ? 'text-purple-200' : 'text-gray-900'}`}>Code Explainer</span>
              </div>
              <p className={`text-[10px] ${isDark ? 'text-purple-400/70' : 'text-gray-500'}`}>Understand complex logic</p>
            </button>
          </div>
        </div>

        {/* Results Area */}
        <div className="space-y-3">
          <h3 className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>AI Output</h3>
          <div className={`p-4 min-h-[100px] text-xs border rounded-2xl transition-colors ${
            isDark ? 'bg-white/5 border-white/5 text-purple-200' : 'bg-gray-50 border-gray-200 text-gray-800'
          }`}>
            {activeMode === 'explain' && explanation && (
              <div className={`markdown-body prose prose-sm max-w-none ${isDark ? 'prose-invert' : ''}`}>
                <ReactMarkdown>{explanation}</ReactMarkdown>
              </div>
            )}
            {activeMode === 'debug' && bugs.length > 0 && (
              <div className="space-y-4">
                {bugs.map((bug, i) => (
                  <div key={i} className={`p-3 border rounded-lg ${isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-100'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-3 h-3 text-red-400" />
                      <span className="font-bold text-red-400 uppercase text-[8px]">Line {bug.line} - {bug.severity}</span>
                    </div>
                    <p className="mb-2">{bug.message}</p>
                    <div className={`p-2 rounded font-mono text-[10px] ${isDark ? 'bg-black/20 text-green-400' : 'bg-white text-green-600 border border-green-100'}`}>
                      Fix: {bug.suggestion}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {activeMode === 'pair' && suggestion && (
              <div className="space-y-2">
                <p className={`italic ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>Suggestion:</p>
                <pre className={`p-3 rounded font-mono text-[10px] overflow-x-auto ${isDark ? 'bg-black/20' : 'bg-white border border-gray-200'}`}>
                  {suggestion}
                </pre>
              </div>
            )}
            {!explanation && !bugs.length && !suggestion && (
              <p className="text-purple-500/50 italic">Select an action above to get AI insights...</p>
            )}
          </div>
        </div>
      </div>

      <div className={`p-4 border-t ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
        <div className="relative">
          <input
            type="text"
            placeholder="Ask AI anything..."
            className={`w-full border rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-purple-500/50 transition-colors ${
              isDark ? 'bg-purple-950/50 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
            }`}
          />
          <button className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 transition-colors ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
            <MessageSquare className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const AlertTriangle = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
);

export default AIPanel;
