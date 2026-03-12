import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, X, Maximize2, Play } from 'lucide-react';
import { useTheme } from '../ThemeContext';

interface TerminalProps {
  initialLines?: string[];
  onCommand?: (cmd: string) => void;
}

const Terminal: React.FC<TerminalProps> = ({ initialLines, onCommand }) => {
  const { settings } = useTheme();
  const isDark = settings.theme === 'dark';

  const [lines, setLines] = useState<string[]>(initialLines || [
    'DevSync Terminal v1.0.0',
    'Connected to cloud-container-01',
    '',
    'sowmika@devsync:~/project$ '
  ]);

  useEffect(() => {
    if (initialLines) {
      setLines(initialLines);
    }
  }, [initialLines]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const handleCommand = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const newLines = [...lines];
      newLines[newLines.length - 1] += input;
      
      if (input === 'clear') {
        setLines(['sowmika@devsync:~/project$ ']);
      } else if (input === 'ls') {
        newLines.push('src  public  package.json  vite.config.ts  node_modules');
        newLines.push('sowmika@devsync:~/project$ ');
        setLines(newLines);
      } else if (input === 'npm run dev') {
        newLines.push('> devsync@1.0.0 dev');
        newLines.push('> vite');
        newLines.push('');
        newLines.push('  VITE v6.2.0  ready in 124 ms');
        newLines.push('  ➜  Local:   http://localhost:3000/');
        newLines.push('sowmika@devsync:~/project$ ');
        setLines(newLines);
      } else {
        newLines.push(`Command not found: ${input}`);
        newLines.push('sowmika@devsync:~/project$ ');
        setLines(newLines);
      }
      
      setInput('');
    }
  };

  return (
    <div className={`h-full flex flex-col font-mono text-sm border-t transition-colors duration-500 ${
      isDark ? 'bg-purple-950/90 border-white/5' : 'bg-gray-900 border-gray-700'
    }`}>
      <div className={`flex items-center justify-between px-4 py-2 border-b transition-colors ${
        isDark ? 'bg-purple-900/40 border-white/5' : 'bg-gray-800 border-gray-700'
      }`}>
        <div className="flex items-center gap-2">
          <TerminalIcon className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-300'}`} />
          <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-purple-300' : 'text-purple-200'}`}>Terminal</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-purple-400 hover:text-purple-300"><Play className="w-3.5 h-3.5" /></button>
          <button className="text-purple-400 hover:text-purple-300"><Maximize2 className="w-3.5 h-3.5" /></button>
          <button className="text-purple-400 hover:text-purple-300"><X className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto space-y-1"
      >
        {lines.map((line, i) => (
          <div key={i} className={line.startsWith('sowmika@devsync') ? 'text-purple-400' : 'text-purple-100'}>
            {line}
            {i === lines.length - 1 && (
              <input
                autoFocus
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleCommand}
                className="bg-transparent border-none outline-none text-purple-100 ml-1 w-1/2"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Terminal;
