import React from 'react';
import { Bug, AlertTriangle, ShieldCheck, Zap, ChevronRight, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../ThemeContext';

const BugPrediction: React.FC = () => {
  const { settings } = useTheme();
  const isDark = settings.theme === 'dark';

  const predictions = [
    { 
      id: 1, 
      file: 'Editor.tsx', 
      line: 42, 
      severity: 'high', 
      type: 'Memory Leak',
      desc: 'Potential memory leak detected in useEffect. Missing cleanup function for Socket.io listener.',
      fix: 'Add socket.off() in the cleanup return of useEffect.'
    },
    { 
      id: 2, 
      file: 'server.ts', 
      line: 15, 
      severity: 'medium', 
      type: 'Security',
      desc: 'CORS policy is too permissive. Origin "*" should be restricted to specific domains in production.',
      fix: 'Update cors origin to process.env.ALLOWED_ORIGINS.'
    },
    { 
      id: 3, 
      file: 'Dashboard.tsx', 
      line: 88, 
      severity: 'low', 
      type: 'Performance',
      desc: 'Unnecessary re-render of chart component. Props are changing on every parent render.',
      fix: 'Wrap chart component in React.memo().'
    },
  ];

  return (
    <div className={`p-8 h-full transition-colors duration-500 ${
      isDark ? 'bg-purple-950/20' : 'bg-gray-50'
    }`}>
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-display font-bold flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Bug className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              Smart Bug Prediction
            </h1>
            <p className={`${isDark ? 'text-purple-400' : 'text-gray-500'} text-sm`}>AI-powered static analysis and vulnerability detection</p>
          </div>
          <button className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
            isDark 
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30' 
              : 'bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-600/20'
          }`}>
            <Search className="w-4 h-4" /> Scan Project
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`p-6 border-l-4 border-l-red-500 rounded-2xl border transition-colors ${
            isDark ? 'bg-white/5 border-white/5' : 'bg-white border-gray-200 shadow-sm'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>1</span>
            </div>
            <p className={`text-xs font-bold uppercase ${isDark ? 'text-purple-400' : 'text-gray-500'}`}>Critical Issues</p>
          </div>
          <div className={`p-6 border-l-4 border-l-yellow-500 rounded-2xl border transition-colors ${
            isDark ? 'bg-white/5 border-white/5' : 'bg-white border-gray-200 shadow-sm'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>2</span>
            </div>
            <p className={`text-xs font-bold uppercase ${isDark ? 'text-purple-400' : 'text-gray-500'}`}>Warnings</p>
          </div>
          <div className={`p-6 border-l-4 border-l-green-500 rounded-2xl border transition-colors ${
            isDark ? 'bg-white/5 border-white/5' : 'bg-white border-gray-200 shadow-sm'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="w-5 h-5 text-green-500" />
              <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>98%</span>
            </div>
            <p className={`text-xs font-bold uppercase ${isDark ? 'text-purple-400' : 'text-gray-500'}`}>Security Score</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>Predicted Vulnerabilities</h3>
          <div className="space-y-4">
            {predictions.map((bug, i) => (
              <motion.div
                key={bug.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`p-6 group transition-all rounded-2xl border ${
                  isDark 
                    ? 'bg-white/5 border-white/5 hover:border-purple-500/30' 
                    : 'bg-white border-gray-200 hover:border-purple-300 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      bug.severity === 'high' ? 'bg-red-500/20 text-red-400' : 
                      bug.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      <Bug className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{bug.type}</h4>
                      <p className={`text-[10px] font-mono ${isDark ? 'text-purple-500' : 'text-gray-400'}`}>{bug.file}:{bug.line}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-[8px] font-bold uppercase tracking-wider ${
                    bug.severity === 'high' ? 'bg-red-500/20 text-red-400' : 
                    bug.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {bug.severity} priority
                  </span>
                </div>
                
                <p className={`text-sm mb-6 ${isDark ? 'text-purple-200' : 'text-gray-600'}`}>{bug.desc}</p>
                
                <div className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${
                  isDark ? 'bg-purple-950/50 border-white/5' : 'bg-gray-50 border-gray-100'
                }`}>
                  <div className="flex items-center gap-3">
                    <Zap className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                    <span className={`text-xs font-medium ${isDark ? 'text-purple-300' : 'text-gray-500'}`}>AI Suggestion: <span className={isDark ? 'text-white' : 'text-gray-900'}>{bug.fix}</span></span>
                  </div>
                  <button className={`text-xs font-bold flex items-center gap-1 transition-colors ${
                    isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'
                  }`}>
                    Apply Fix <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BugPrediction;
