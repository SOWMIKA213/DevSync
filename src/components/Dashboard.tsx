import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  LayoutGrid, 
  List as ListIcon, 
  Settings, 
  User as UserIcon, 
  MessageSquare, 
  Globe, 
  Lock, 
  MoreVertical, 
  ExternalLink, 
  Clock, 
  Users, 
  Moon, 
  Sun,
  Sparkles,
  Send,
  X,
  ChevronRight,
  Code2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Project, UserSettings } from '../types';
import { useTheme } from '../ThemeContext';
import { aiService } from '../services/aiService';

interface DashboardProps {
  onOpenProject: (project: Project) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onOpenProject }) => {
  const { settings, setSettings } = useTheme();
  const isDark = settings.theme === 'dark';
  const [projects, setProjects] = useState<Project[]>([]);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', language: 'javascript', visibility: 'private' as 'public' | 'private' });
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: 'Hello! I am your DevSync assistant. How can I help you today?' }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'projects'),
      where('members', 'array-contains', auth.currentUser.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      setProjects(projs);
    });

    return () => unsubscribe();
  }, []);

  const handleCreateProject = async () => {
    if (!newProject.name || !auth.currentUser) return;

    try {
      const projectData = {
        name: newProject.name,
        language: newProject.language,
        visibility: newProject.visibility,
        ownerId: auth.currentUser.uid,
        members: [auth.currentUser.uid],
        memberRoles: { [auth.currentUser.uid]: 'owner' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deployStatus: 'idle'
      };

      const docRef = await addDoc(collection(db, 'projects'), projectData);

      // Initialize with a default file
      await addDoc(collection(db, `projects/${docRef.id}/files`), {
        name: newProject.language === 'python' ? 'main.py' : 'index.js',
        path: newProject.language === 'python' ? 'main.py' : 'index.js',
        type: 'file',
        language: newProject.language,
        content: newProject.language === 'python' ? 'print("Hello DevSync!")' : 'console.log("Hello DevSync!");',
        projectId: docRef.id,
        createdAt: new Date().toISOString()
      });

      setIsNewProjectModalOpen(false);
      setNewProject({ name: '', language: 'javascript', visibility: 'private' });
      
      // Open the project
      onOpenProject({ id: docRef.id, ...projectData } as Project);
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  const handleAiChat = async () => {
    if (!aiInput.trim()) return;
    const userMsg = aiInput;
    setAiMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setAiInput('');

    try {
      const response = await aiService.dashboardChat(userMsg);
      setAiMessages(prev => [...prev, { role: 'ai', text: response }]);
    } catch (error) {
      setAiMessages(prev => [...prev, { role: 'ai', text: "I'm sorry, I encountered an error. Please try again." }]);
    }
  };

  const filteredProjects = projects.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className={`h-full overflow-y-auto transition-colors duration-500 ${isDark ? 'bg-purple-950/20 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto p-8 space-y-10">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
              <Sparkles className={`w-8 h-8 ${isDark ? 'text-purple-500' : 'text-purple-600'}`} />
              Control Center
            </h1>
            <p className={`${isDark ? 'text-purple-400/60' : 'text-gray-500'} font-medium`}>
              Welcome back, {auth.currentUser?.displayName || 'Developer'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className={`relative flex items-center ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'} rounded-2xl border px-4 py-2 w-64 transition-colors`}>
              <Search className={`w-4 h-4 ${isDark ? 'text-purple-500' : 'text-purple-600'} mr-2`} />
              <input 
                type="text" 
                placeholder="Search projects..." 
                className="bg-transparent border-none focus:outline-none text-sm w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setIsNewProjectModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-purple-600/20 transition-all active:scale-95"
            >
              <Plus className="w-5 h-5" /> New Project
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Main Project List */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <LayoutGrid className={`w-5 h-5 ${isDark ? 'text-purple-500' : 'text-purple-600'}`} />
                Recent Projects
              </h2>
              <div className={`flex p-1 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-200'}`}>
                <button className="p-2 rounded-lg bg-purple-600 text-white shadow-lg"><LayoutGrid className="w-4 h-4" /></button>
                <button className={`p-2 rounded-lg hover:bg-white/5 ${isDark ? 'text-purple-400' : 'text-gray-500'}`}><ListIcon className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  whileHover={{ y: -5 }}
                  className={`group relative p-6 rounded-[2rem] border transition-all duration-300 ${
                    isDark 
                      ? 'bg-purple-900/20 border-white/5 hover:border-purple-500/50 hover:bg-purple-900/40' 
                      : 'bg-white border-gray-200 hover:border-purple-500/50 shadow-sm hover:shadow-xl'
                  }`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className={`p-3 rounded-2xl ${isDark ? 'bg-purple-500/10 text-purple-500' : 'bg-purple-50 text-purple-600'}`}>
                      <Code2 className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-2">
                      {project.visibility === 'public' ? <Globe className="w-4 h-4 text-emerald-500" /> : <Lock className="w-4 h-4 text-amber-500" />}
                      <button className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/5 text-purple-400' : 'hover:bg-gray-100 text-gray-400'}`}><MoreVertical className="w-4 h-4" /></button>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    <h3 className="text-lg font-bold truncate">{project.name}</h3>
                    <p className={`text-xs ${isDark ? 'text-purple-400/60' : 'text-gray-500'} line-clamp-2`}>
                      {project.description || `A ${project.language} project built on DevSync.`}
                    </p>
                  </div>

                  <div className={`flex items-center justify-between pt-4 border-t ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                    <div className="flex -space-x-2">
                      {project.members.slice(0, 3).map((m, i) => (
                        <div key={i} className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${isDark ? 'border-purple-950 bg-purple-800' : 'border-white bg-purple-100 text-purple-600'}`}>
                          {m[0].toUpperCase()}
                        </div>
                      ))}
                      {project.members.length > 3 && (
                        <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${isDark ? 'border-purple-950 bg-purple-900' : 'border-white bg-gray-100 text-gray-600'}`}>
                          +{project.members.length - 3}
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => onOpenProject(project)}
                      className={`text-xs font-bold flex items-center gap-1 group/btn ${isDark ? 'text-purple-500 hover:text-purple-400' : 'text-purple-600 hover:text-purple-500'}`}
                    >
                      Open Project <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              ))}

              {/* Empty State / Add New */}
              <button 
                onClick={() => setIsNewProjectModalOpen(true)}
                className={`flex flex-col items-center justify-center p-6 rounded-[2rem] border-2 border-dashed transition-all duration-300 ${
                  isDark 
                    ? 'border-white/10 hover:border-purple-500/50 hover:bg-purple-500/5 text-purple-500' 
                    : 'border-gray-200 hover:border-purple-500/50 hover:bg-purple-50 text-purple-600'
                }`}
              >
                <div className={`p-4 rounded-full mb-4 ${isDark ? 'bg-purple-500/10' : 'bg-purple-50'}`}>
                  <Plus className="w-8 h-8" />
                </div>
                <span className="font-bold">Create New Project</span>
              </button>
            </div>
          </div>

          {/* Sidebar Section */}
          <div className="space-y-8">
            {/* User Profile */}
            <div className={`p-6 rounded-[2rem] border ${isDark ? 'bg-purple-900/20 border-white/5' : 'bg-white border-gray-200 shadow-sm'}`}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center text-xl font-black text-white shadow-lg">
                  {auth.currentUser?.displayName?.[0] || 'D'}
                </div>
                <div>
                  <h3 className="font-bold">{auth.currentUser?.displayName || 'Developer'}</h3>
                  <p className={`text-xs font-medium ${isDark ? 'text-purple-500' : 'text-purple-600'}`}>Pro Account</p>
                </div>
              </div>
              <button className={`w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'}`}>
                <UserIcon className="w-4 h-4" /> Edit Profile
              </button>
            </div>

            {/* Appearance Settings */}
            <div className={`p-6 rounded-[2rem] border ${isDark ? 'bg-purple-900/20 border-white/5' : 'bg-white border-gray-200 shadow-sm'}`}>
              <h3 className="font-bold mb-6 flex items-center gap-2">
                <Settings className={`w-4 h-4 ${isDark ? 'text-purple-500' : 'text-purple-600'}`} />
                Appearance
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Theme</span>
                  <div className={`flex p-1 rounded-xl ${isDark ? 'bg-black/20' : 'bg-gray-100'}`}>
                    <button 
                      onClick={() => setSettings({ ...settings, theme: 'light' })}
                      className={`p-2 rounded-lg transition-all ${settings.theme === 'light' ? 'bg-white text-purple-600 shadow-md' : 'text-gray-500'}`}
                    >
                      <Sun className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setSettings({ ...settings, theme: 'dark' })}
                      className={`p-2 rounded-lg transition-all ${settings.theme === 'dark' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-500'}`}
                    >
                      <Moon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Font Size</span>
                    <span className={`${isDark ? 'text-purple-500' : 'text-purple-600'}`}>{settings.fontSize}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="12" 
                    max="24" 
                    value={settings.fontSize}
                    onChange={(e) => setSettings({ ...settings, fontSize: parseInt(e.target.value) })}
                    className="w-full accent-purple-600"
                  />
                </div>
              </div>
            </div>

            {/* AI Assistant Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-fuchsia-600 rounded-[2rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className={`relative p-6 rounded-[2rem] border border-purple-500/30 bg-gradient-to-br from-purple-600/10 to-fuchsia-600/10 backdrop-blur-xl`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-600 rounded-xl text-white">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold">AI Assistant</h3>
                </div>
                <p className={`text-xs mb-6 leading-relaxed ${isDark ? 'text-purple-300' : 'text-purple-800'}`}>
                  Need help with your code or project management? I'm here to assist you 24/7.
                </p>
                <button 
                  onClick={() => setIsAiChatOpen(true)}
                  className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold transition-all shadow-lg shadow-purple-600/20"
                >
                  Start Chatting
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Project Modal */}
      <AnimatePresence>
        {isNewProjectModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewProjectModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`relative w-full max-w-lg p-8 rounded-[2.5rem] border shadow-2xl ${isDark ? 'bg-purple-950 border-white/10' : 'bg-white border-gray-200'}`}
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Create New Project</h2>
                <button onClick={() => setIsNewProjectModalOpen(false)} className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/5 text-white' : 'hover:bg-gray-100 text-gray-500'}`}><X className="w-6 h-6" /></button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-purple-500' : 'text-purple-600'}`}>Project Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. My Awesome App"
                    className={`w-full p-4 rounded-2xl border transition-all focus:outline-none focus:border-purple-500 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-purple-500' : 'text-purple-600'}`}>Language</label>
                    <select 
                      className={`w-full p-4 rounded-2xl border transition-all focus:outline-none focus:border-purple-500 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                      value={newProject.language}
                      onChange={(e) => setNewProject({ ...newProject, language: e.target.value })}
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="typescript">TypeScript</option>
                      <option value="python">Python</option>
                      <option value="react">React</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-purple-500' : 'text-purple-600'}`}>Visibility</label>
                    <select 
                      className={`w-full p-4 rounded-2xl border transition-all focus:outline-none focus:border-purple-500 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                      value={newProject.visibility}
                      onChange={(e) => setNewProject({ ...newProject, visibility: e.target.value as 'public' | 'private' })}
                    >
                      <option value="private">Private</option>
                      <option value="public">Public</option>
                    </select>
                  </div>
                </div>

                <button 
                  onClick={handleCreateProject}
                  className="w-full py-5 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-2xl shadow-xl shadow-purple-600/20 transition-all active:scale-95 mt-4"
                >
                  Initialize Workspace
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Chat Drawer */}
      <AnimatePresence>
        {isAiChatOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className={`fixed right-0 top-0 bottom-0 w-full max-w-md z-[110] border-l shadow-2xl flex flex-col transition-colors ${isDark ? 'bg-purple-950 border-white/10' : 'bg-white border-gray-200'}`}
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-purple-600 text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold">DevSync AI</h3>
                  <p className="text-[10px] opacity-70">Always online</p>
                </div>
              </div>
              <button onClick={() => setIsAiChatOpen(false)} className="p-2 hover:bg-white/10 rounded-full"><X className="w-6 h-6" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {aiMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-purple-600 text-white rounded-tr-none' 
                      : isDark ? 'bg-white/5 text-purple-100 rounded-tl-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className={`p-6 border-t ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
              <div className={`flex items-center gap-2 p-2 rounded-2xl transition-colors ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                <input 
                  type="text" 
                  placeholder="Ask anything..." 
                  className={`flex-1 bg-transparent border-none focus:outline-none px-4 text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAiChat()}
                />
                <button 
                  onClick={handleAiChat}
                  className="p-3 bg-purple-600 text-white rounded-xl hover:bg-purple-500 transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
