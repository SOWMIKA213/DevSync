import React, { useState } from 'react';
import { History, Play, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../ThemeContext';

const TimeTravel: React.FC = () => {
  const { settings } = useTheme();
  const isDark = settings.theme === 'dark';
  const [currentTime, setCurrentTime] = useState(100);

  const snapshots = [
    { id: 1, time: '10:30 AM', desc: 'Initial commit', author: 'Sarah' },
    { id: 2, time: '11:15 AM', desc: 'Added sidebar logic', author: 'Alex' },
    { id: 3, time: '12:00 PM', desc: 'Fixed editor bug', author: 'You' },
    { id: 4, time: '02:30 PM', desc: 'Implemented AI features', author: 'Sarah' },
    { id: 5, time: '03:45 PM', desc: 'Current State', author: 'You' },
  ];

  return (
    <div className={`p-8 h-full transition-colors duration-500 flex flex-col ${
      isDark ? 'bg-purple-950/20' : 'bg-gray-50'
    }`}>
      <div className="max-w-4xl mx-auto w-full space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-display font-bold flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <History className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              Time Travel Debugging
            </h1>
            <p className={`${isDark ? 'text-purple-400' : 'text-gray-500'} text-sm`}>Travel through past code states to identify bugs</p>
          </div>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-500 transition-colors flex items-center gap-2 shadow-lg shadow-purple-600/20">
            <RotateCcw className="w-4 h-4" /> Restore Point
          </button>
        </header>

        <div className={`p-12 relative rounded-[2.5rem] border transition-colors ${
          isDark ? 'bg-purple-900/20 border-white/5' : 'bg-white border-gray-200 shadow-xl'
        }`}>
          {/* Timeline Slider */}
          <div className={`relative h-2 rounded-full mb-12 ${isDark ? 'bg-purple-900' : 'bg-gray-200'}`}>
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 to-fuchsia-500 rounded-full"
              style={{ width: `${currentTime}%` }}
            />
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={currentTime}
              onChange={(e) => setCurrentTime(parseInt(e.target.value))}
              className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            
            {/* Markers */}
            {[0, 25, 50, 75, 100].map((m) => (
              <div 
                key={m}
                className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 transition-all ${
                  currentTime >= m 
                    ? (isDark ? 'bg-purple-400 border-purple-950 scale-125' : 'bg-purple-600 border-white scale-125') 
                    : (isDark ? 'bg-purple-800 border-purple-950' : 'bg-gray-300 border-white')
                }`}
                style={{ left: `${m}%` }}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>Snapshot Details</h3>
              <div className={`p-6 space-y-4 rounded-2xl border ${
                isDark ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'
              }`}>
                <div className="flex justify-between items-center">
                  <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {snapshots[Math.floor(currentTime / 21)]?.time || snapshots[0].time}
                  </span>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                    isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'
                  }`}>
                    STABLE
                  </span>
                </div>
                <p className={`text-sm ${isDark ? 'text-purple-200' : 'text-gray-600'}`}>
                  {snapshots[Math.floor(currentTime / 21)]?.desc || snapshots[0].desc}
                </p>
                <div className={`flex items-center gap-2 pt-4 border-t ${isDark ? 'border-white/5' : 'border-gray-200'}`}>
                  <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
                    {snapshots[Math.floor(currentTime / 21)]?.author[0] || 'S'}
                  </div>
                  <span className={`text-xs ${isDark ? 'text-purple-400' : 'text-gray-500'}`}>
                    Modified by <span className={`font-bold ${isDark ? 'text-purple-200' : 'text-gray-900'}`}>{snapshots[Math.floor(currentTime / 21)]?.author || 'Sarah'}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>Code Preview</h3>
              <div className={`p-4 font-mono text-[10px] overflow-hidden h-48 rounded-2xl border ${
                isDark ? 'bg-purple-950/50 border-white/5 text-purple-300/70' : 'bg-gray-900 border-gray-800 text-purple-300'
              }`}>
                <pre>
{`function calculateSum(a, b) {
  // Snapshot at ${snapshots[Math.floor(currentTime / 21)]?.time || '10:30 AM'}
  const result = a + b;
  console.log("Result:", result);
  return result;
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <button className={`p-4 rounded-2xl transition-all ${
            isDark ? 'bg-white/5 text-purple-400 hover:bg-white/10' : 'bg-white text-purple-600 hover:bg-gray-50 shadow-md'
          }`}>
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button className="p-4 bg-purple-600 text-white rounded-2xl hover:bg-purple-500 transition-all shadow-lg shadow-purple-600/20">
            <Play className="w-6 h-6" />
          </button>
          <button className={`p-4 rounded-2xl transition-all ${
            isDark ? 'bg-white/5 text-purple-400 hover:bg-white/10' : 'bg-white text-purple-600 hover:bg-gray-50 shadow-md'
          }`}>
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeTravel;
