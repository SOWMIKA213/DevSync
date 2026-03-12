import React from 'react';
import { 
  Files, 
  MessageSquare, 
  Video, 
  Terminal, 
  Settings, 
  Box, 
  LayoutDashboard, 
  Bug,
  Mic,
  History
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../ThemeContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { settings } = useTheme();
  const isDark = settings.theme === 'dark';

  const menuItems = [
    { id: 'explorer', icon: Files, label: 'Explorer' },
    { id: 'chat', icon: MessageSquare, label: 'Chat' },
    { id: 'meeting', icon: Video, label: 'Meeting' },
    { id: 'visualize', icon: Box, label: '3D View' },
    { id: 'terminal', icon: Terminal, label: 'Terminal' },
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'history', icon: History, label: 'Time Travel' },
    { id: 'bugs', icon: Bug, label: 'Bug Predict' },
    { id: 'voice', icon: Mic, label: 'Voice Code' },
  ];

  return (
    <div className={`w-16 h-full border-r flex flex-col items-center py-6 gap-6 z-50 transition-colors duration-500 ${
      isDark ? 'bg-purple-950/80 border-white/5' : 'bg-white border-gray-200'
    }`}>
      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 mb-4">
        <Box className="text-white w-6 h-6" />
      </div>

      <div className="flex-1 flex flex-col gap-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`relative p-3 rounded-xl transition-all duration-300 group ${
              activeTab === item.id 
                ? (isDark ? 'bg-purple-600/20 text-purple-400' : 'bg-purple-100 text-purple-600') 
                : (isDark ? 'text-purple-300/50 hover:text-purple-300 hover:bg-white/5' : 'text-gray-400 hover:text-purple-600 hover:bg-gray-100')
            }`}
          >
            <item.icon className="w-6 h-6" />
            
            {activeTab === item.id && (
              <motion.div 
                layoutId="activeTab"
                className="absolute left-0 top-2 bottom-2 w-1 bg-purple-500 rounded-r-full"
              />
            )}

            <div className={`absolute left-16 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 ${
              isDark ? 'bg-purple-800 text-white' : 'bg-white text-gray-900 shadow-lg border border-gray-100'
            }`}>
              {item.label}
            </div>
          </button>
        ))}
      </div>

      <button className={`p-3 rounded-xl transition-all ${
        isDark ? 'text-purple-300/50 hover:text-purple-300 hover:bg-white/5' : 'text-gray-400 hover:text-purple-600 hover:bg-gray-100'
      }`}>
        <Settings className="w-6 h-6" />
      </button>
    </div>
  );
};

export default Sidebar;
