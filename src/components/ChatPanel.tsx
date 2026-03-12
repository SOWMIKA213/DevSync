import React, { useState, useRef, useEffect } from 'react';
import { Send, User as UserIcon, Hash, AtSign } from 'lucide-react';
import { ChatMessage, User } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../ThemeContext';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  currentUser: string;
  collaborators?: User[];
}

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSendMessage, currentUser, collaborators = [] }) => {
  const { settings } = useTheme();
  const isDark = settings.theme === 'dark';
  const [inputText, setInputText] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputText(value);

    const words = value.split(' ');
    const lastWord = words[words.length - 1];

    if (lastWord.startsWith('@')) {
      setShowMentions(true);
      setMentionFilter(lastWord.slice(1));
    } else {
      setShowMentions(false);
    }
  };

  const handleMentionSelect = (userName: string) => {
    const words = inputText.split(' ');
    words[words.length - 1] = `@${userName} `;
    setInputText(words.join(' '));
    setShowMentions(false);
  };

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  const filteredCollaborators = collaborators.filter(c => 
    c.name.toLowerCase().includes(mentionFilter.toLowerCase())
  );

  return (
    <div className={`flex flex-col h-full border-l transition-colors duration-500 ${
      isDark ? 'bg-purple-900/20 border-white/5' : 'bg-white border-gray-200'
    }`}>
      <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
        <div className="flex items-center gap-2">
          <Hash className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
          <h2 className={`font-bold text-sm ${isDark ? 'text-purple-200' : 'text-gray-900'}`}>Project Chat</h2>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
          isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'
        }`}>
          {collaborators.length + 1} Online
        </span>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth scrollbar-hide"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col ${msg.sender === currentUser ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                  {msg.sender}
                </span>
                <span className={`text-[10px] ${isDark ? 'text-purple-500' : 'text-gray-400'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className={`px-3 py-2 rounded-2xl text-sm max-w-[85%] shadow-lg ${
                msg.sender === currentUser 
                  ? 'bg-purple-600 text-white rounded-tr-none' 
                  : (isDark ? 'bg-purple-800/50 text-purple-100 rounded-tl-none border border-white/5' : 'bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200')
              }`}>
                {msg.text.split(' ').map((word, idx) => (
                  word.startsWith('@') ? (
                    <span key={idx} className={`font-bold px-1 rounded ${isDark ? 'text-purple-300 bg-purple-900/50' : 'text-purple-600 bg-purple-100'}`}>{word} </span>
                  ) : word + ' '
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className={`p-4 border-t relative ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
        <AnimatePresence>
          {showMentions && filteredCollaborators.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={`absolute bottom-full left-4 right-4 mb-2 border shadow-2xl overflow-hidden z-50 rounded-xl backdrop-blur-md ${
                isDark ? 'bg-purple-900/80 border-purple-500/30' : 'bg-white border-gray-200'
              }`}
            >
              <div className={`p-2 border-b flex items-center gap-2 ${isDark ? 'bg-purple-900/50 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                <AtSign className={`w-3 h-3 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                <span className={`text-[10px] font-bold uppercase ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>Mention Team Member</span>
              </div>
              <div className="max-h-40 overflow-y-auto">
                {filteredCollaborators.map((collab) => (
                  <button
                    key={collab.id}
                    onClick={() => handleMentionSelect(collab.name)}
                    className={`w-full p-2 flex items-center gap-3 transition-colors text-left ${
                      isDark ? 'hover:bg-purple-500/20' : 'hover:bg-gray-100'
                    }`}
                  >
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ backgroundColor: collab.color }}
                    >
                      {collab.name[0]}
                    </div>
                    <span className={`text-xs ${isDark ? 'text-purple-200' : 'text-gray-700'}`}>{collab.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative">
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className={`w-full border rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-purple-500/50 transition-all ${
              isDark ? 'bg-purple-950/50 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
            }`}
          />
          <button
            onClick={handleSend}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 transition-colors ${
              isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-800'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
