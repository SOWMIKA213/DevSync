import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Zap, Code, Terminal, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../ThemeContext';
import { aiService } from '../services/aiService';

const VoiceCoding: React.FC = () => {
  const { settings } = useTheme();
  const isDark = settings.theme === 'dark';
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [commands, setCommands] = useState<{ text: string, type: 'command' | 'code', timestamp: string }[]>([]);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);
      };

      recognitionRef.current.onend = async () => {
        setIsListening(false);
        if (transcript) {
          await handleVoiceCommand(transcript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
    }
  }, [transcript]);

  const handleVoiceCommand = async (command: string) => {
    setIsGenerating(true);
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setCommands(prev => [...prev, { text: command, type: 'command', timestamp }]);

    try {
      const generatedCode = await aiService.generateFromVoice(command, 'javascript');
      setCommands(prev => [...prev, { text: generatedCode || '// No code generated', type: 'code', timestamp }]);
    } catch (error) {
      console.error("Error generating code from voice", error);
    } finally {
      setIsGenerating(false);
      setTranscript('');
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  return (
    <div className={`p-8 h-full transition-colors duration-500 flex flex-col items-center ${
      isDark ? 'bg-purple-950/20' : 'bg-gray-50'
    }`}>
      <div className="max-w-3xl w-full space-y-8">
        <header className="text-center">
          <h1 className={`text-3xl font-display font-bold mb-2 flex items-center justify-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Mic className={`w-8 h-8 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            Voice Coding AI
          </h1>
          <p className={isDark ? 'text-purple-400' : 'text-gray-500'}>Speak your logic, DevSync writes the code</p>
        </header>

        <div className="flex flex-col items-center gap-8">
          <button 
            onClick={toggleListening}
            className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${
              isListening 
                ? 'bg-red-500 shadow-[0_0_50px_rgba(239,68,68,0.4)] scale-110' 
                : 'bg-purple-600 hover:bg-purple-500 shadow-[0_0_30px_rgba(142,36,170,0.3)]'
            }`}
          >
            {isListening ? (
              <MicOff className="w-12 h-12 text-white" />
            ) : (
              <Mic className="w-12 h-12 text-white" />
            )}
            
            {isListening && (
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 bg-red-500 rounded-full"
              />
            )}
            {isGenerating && (
              <div className="absolute -top-2 -right-2 p-2 bg-purple-600 rounded-full animate-spin">
                <Loader2 className="w-4 h-4 text-white" />
              </div>
            )}
          </button>

          <AnimatePresence>
            {transcript && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`px-6 py-3 rounded-2xl border font-medium italic transition-colors ${
                  isDark ? 'bg-purple-900/40 border-white/10 text-purple-200' : 'bg-white border-gray-200 text-purple-700 shadow-sm'
                }`}
              >
                "{transcript}"
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-4">
          <h3 className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>Recent Voice Commands</h3>
          <div className="space-y-4">
            {commands.map((cmd, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 rounded-2xl border transition-colors ${
                  isDark 
                    ? (cmd.type === 'code' ? 'bg-purple-950/50 border-white/5' : 'bg-purple-900/20 border-white/5') 
                    : (cmd.type === 'code' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-sm')
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {cmd.type === 'command' ? (
                      <Terminal className={`w-3 h-3 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                    ) : (
                      <Code className="w-3 h-3 text-green-400" />
                    )}
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-purple-500' : 'text-purple-600'}`}>
                      {cmd.type === 'command' ? 'Command' : 'Generated Code'}
                    </span>
                  </div>
                  <span className={`text-[10px] ${isDark ? 'text-purple-600' : 'text-gray-400'}`}>{cmd.timestamp}</span>
                </div>
                {cmd.type === 'command' ? (
                  <p className={`text-sm font-medium ${isDark ? 'text-purple-100' : 'text-gray-800'}`}>"{cmd.text}"</p>
                ) : (
                  <pre className={`text-[10px] font-mono p-3 rounded-lg border ${
                    isDark ? 'text-purple-300 bg-black/20 border-white/5' : 'text-purple-300 bg-gray-900 border-gray-800'
                  }`}>
                    {cmd.text}
                  </pre>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceCoding;
