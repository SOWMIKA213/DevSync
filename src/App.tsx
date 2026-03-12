/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, collection, onSnapshot, query, where } from 'firebase/firestore';
import Sidebar from './components/Sidebar';
import FileExplorer from './components/FileExplorer';
import CodeEditor from './components/Editor';
import ChatPanel from './components/ChatPanel';
import MeetingPanel from './components/MeetingPanel';
import AIPanel from './components/AIPanel';
import ProjectVisualizer from './components/ProjectVisualizer';
import Terminal from './components/Terminal';
import Dashboard from './components/Dashboard';
import TimeTravel from './components/TimeTravel';
import VoiceCoding from './components/VoiceCoding';
import BugPrediction from './components/BugPrediction';
import Login from './components/Login';
import { User, FileNode, ChatMessage, Project, UserSettings } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Share2, Rocket, ChevronRight, ChevronLeft, Menu, LogIn, LogOut, Code2, Sparkles, Plus, Globe, Lock, X } from 'lucide-react';
import { useTheme } from './ThemeContext';
import { aiService } from './services/aiService';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activeFile, setActiveFile] = useState<FileNode | null>(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [collaborators, setCollaborators] = useState<User[]>([]);
  const [projectFiles, setProjectFiles] = useState<FileNode[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const { settings, setSettings } = useTheme();
  
  const socketRef = useRef<Socket | null>(null);
  const aiTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Apply theme to body
    document.body.className = settings.theme === 'dark' ? 'dark bg-purple-950' : 'light bg-gray-50';
  }, [settings.theme]);

  useEffect(() => {
    if (!activeProject) {
      setProjectFiles([]);
      return;
    }

    const q = query(collection(db, `projects/${activeProject.id}/files`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const filesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FileNode));
      
      // Basic tree construction (flat to nested)
      const root: FileNode = { id: 'root', name: activeProject.name, type: 'folder', children: [] };
      const fileMap: { [key: string]: FileNode } = { root };
      
      filesData.forEach(file => {
        fileMap[file.id] = { ...file, children: [] };
      });

      filesData.forEach(file => {
        const parent = file.parentId ? fileMap[file.parentId] : root;
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(fileMap[file.id]);
        }
      });

      setProjectFiles([root]);
      
      // Set first file as active if none selected
      if (!activeFile && filesData.length > 0) {
        const firstFile = filesData.find(f => f.type === 'file');
        if (firstFile) {
          setActiveFile(firstFile);
          setCode(firstFile.content || '');
          setLanguage(firstFile.language || 'javascript');
        }
      }
    });

    return () => unsubscribe();
  }, [activeProject]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
        };
        setUser(userData);
        
        // Initialize Socket
        socketRef.current = io();
      } else {
        setUser(null);
        socketRef.current?.disconnect();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (socketRef.current && activeProject && user) {
      const roomId = activeProject.id;

      socketRef.current.emit('join-room', { 
        roomId, 
        userName: user.displayName || 'Anonymous', 
        color: ['#ab47bc', '#6a1b9a', '#8e24aa', '#4a148c'][Math.floor(Math.random() * 4)]
      });

      socketRef.current.on('room-state', ({ code, language, users }) => {
        if (code) setCode(code);
        if (language) setLanguage(language);
        setCollaborators(users.map(([id, data]: any) => ({ id, ...data })));
      });

      socketRef.current.on('code-update', (newCode) => {
        setCode(newCode);
      });

      socketRef.current.on('cursor-update', ({ id, cursor }) => {
        setCollaborators(prev => prev.map(u => u.id === id ? { ...u, cursor } : u));
      });

      socketRef.current.on('new-message', (msg) => {
        setMessages(prev => [...prev, msg]);
      });

      socketRef.current.on('user-joined', (user) => {
        setCollaborators(prev => [...prev, user]);
      });

      socketRef.current.on('user-left', (userId) => {
        setCollaborators(prev => prev.filter(u => u.id !== userId));
      });

      return () => {
        socketRef.current?.off('room-state');
        socketRef.current?.off('code-update');
        socketRef.current?.off('cursor-update');
        socketRef.current?.off('new-message');
        socketRef.current?.off('user-joined');
        socketRef.current?.off('user-left');
      };
    }
  }, [activeProject, user]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  useEffect(() => {
    const checkJoinLink = async () => {
      const path = window.location.pathname;
      if (path.startsWith('/join/') && user) {
        const projectId = path.split('/join/')[1];
        if (projectId) {
          try {
            const projectRef = doc(db, 'projects', projectId);
            const projectSnap = await getDoc(projectRef);
            
            if (projectSnap.exists()) {
              const projectData = projectSnap.data() as Project;
              if (!projectData.members.includes(user.uid)) {
                await updateDoc(projectRef, {
                  members: arrayUnion(user.uid),
                  [`memberRoles.${user.uid}`]: 'developer'
                });
                alert(`Joined project: ${projectData.name}`);
              }
              setActiveProject({ id: projectSnap.id, ...projectData } as Project);
              setActiveTab('explorer');
              window.history.replaceState({}, '', '/');
            }
          } catch (error) {
            console.error("Error joining project:", error);
          }
        }
      }
    };

    checkJoinLink();
  }, [user]);

  const handleLogout = () => signOut(auth);

  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined && activeProject) {
      setCode(value);
      socketRef.current?.emit('code-change', { roomId: activeProject.id, code: value });
      
      // Debounced AI suggestion
      if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
      aiTimeoutRef.current = setTimeout(async () => {
        if (value.length > 10) {
          const suggestion = await aiService.getCodeSuggestion(value, language, "Continuing the code");
          if (suggestion) {
            console.log("AI Suggestion:", suggestion);
          }
        }
      }, 3000);
    }
  };

  const handleSendMessage = (text: string) => {
    if (activeProject) {
      socketRef.current?.emit('chat-message', { 
        roomId: activeProject.id, 
        message: text, 
        userName: user?.displayName || 'Anonymous' 
      });
    }
  };

  const handleCursorChange = (cursor: { lineNumber: number, column: number }) => {
    if (activeProject) {
      socketRef.current?.emit('cursor-move', { roomId: activeProject.id, cursor });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-purple-950 flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 blur-2xl bg-purple-500/20 rounded-full animate-pulse"></div>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 relative z-10"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const handleRunCode = async () => {
    setActiveTab('terminal');
    setTerminalOutput(prev => [...prev, `> Executing ${activeFile?.name || 'App.tsx'}...`]);
    
    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language })
      });
      const data = await response.json();
      setTerminalOutput(prev => [...prev, data.output]);
    } catch (error) {
      setTerminalOutput(prev => [...prev, 'Error: Failed to execute code.']);
    }
  };

  const handleDeploy = async () => {
    if (!activeProject) return;
    
    setActiveProject(prev => prev ? { ...prev, deployStatus: 'building' } : null);
    setTerminalOutput(prev => [...prev, `[DEPLOY] Starting build for ${activeProject.name}...`]);
    
    // Simulate build process
    setTimeout(() => {
      setTerminalOutput(prev => [...prev, `[DEPLOY] Build successful. Deploying to edge...`]);
      
      setTimeout(() => {
        const deployUrl = `https://${activeProject.name.toLowerCase().replace(/\s+/g, '-')}.devsync.app`;
        setActiveProject(prev => prev ? { ...prev, deployStatus: 'success', deployUrl } : null);
        setTerminalOutput(prev => [...prev, `[DEPLOY] Deployment successful! Live at: ${deployUrl}`]);
      }, 2000);
    }, 3000);
  };

  const inviteLink = activeProject ? `${window.location.origin}/join/${activeProject.id}` : '';

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(inviteLink);
    alert('Invite link copied to clipboard!');
  };

  const renderMainContent = () => {
    switch (activeTab) {
      case 'visualize': return <ProjectVisualizer />;
      case 'dashboard': return (
        <Dashboard 
          onOpenProject={(p) => {
            setActiveProject(p);
            setActiveTab('explorer');
          }}
        />
      );
      case 'history': return <TimeTravel />;
      case 'voice': return <VoiceCoding />;
      case 'bugs': return <BugPrediction />;
      default:
        return (
          <div className="flex flex-col h-full">
            <div className="flex-1 min-h-0">
              <CodeEditor 
                code={code} 
                language={language} 
                onChange={handleCodeChange}
                onCursorChange={handleCursorChange}
                collaborators={collaborators}
                projectId={activeProject?.id}
                fileId={activeFile?.id}
              />
            </div>
            <div className="h-1/3 min-h-[200px]">
              <Terminal initialLines={terminalOutput} />
            </div>
          </div>
        );
    }
  };

  const renderRightPanel = () => {
    switch (activeTab) {
      case 'chat': return <ChatPanel messages={messages} onSendMessage={handleSendMessage} currentUser={user.displayName || 'User'} collaborators={collaborators} />;
      case 'meeting': return <MeetingPanel />;
      default: return <AIPanel currentCode={code} language={language} />;
    }
  };

  return (
    <div className={`flex h-screen w-screen overflow-hidden transition-colors duration-500 ${settings.theme === 'dark' ? 'bg-purple-950 text-purple-100' : 'bg-gray-50 text-gray-900'}`}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {isSidebarOpen && (
        <motion.div 
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 256, opacity: 1 }}
          className="h-full"
        >
          <FileExplorer 
            files={projectFiles} 
            onFileSelect={(f) => {
              setActiveFile(f);
              if (f.content) setCode(f.content);
              if (f.language) setLanguage(f.language);
            }} 
            activeFileId={activeFile?.id} 
          />
        </motion.div>
      )}

      <main className="flex-1 flex flex-col min-w-0 relative">
        <header className={`h-14 border-b flex items-center justify-between px-6 backdrop-blur-md z-40 transition-colors ${settings.theme === 'dark' ? 'bg-purple-900/20 border-white/5' : 'bg-white/80 border-gray-200'}`}>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2 rounded-lg transition-colors ${settings.theme === 'dark' ? 'hover:bg-white/5 text-purple-400' : 'hover:bg-gray-100 text-purple-600'}`}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold uppercase tracking-widest ${settings.theme === 'dark' ? 'text-purple-500' : 'text-purple-400'}`}>Project:</span>
              <span className={`text-sm font-bold ${settings.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{activeProject?.name || 'DevSync Core'}</span>
              <ChevronRight className="w-4 h-4 text-purple-700" />
              <span className={settings.theme === 'dark' ? 'text-purple-300' : 'text-gray-600'}>{activeFile?.name || 'App.tsx'}</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex -space-x-2">
              {collaborators.map((collab) => (
                <div 
                  key={collab.id}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold text-white shadow-lg ${settings.theme === 'dark' ? 'border-purple-950' : 'border-white'}`}
                  style={{ backgroundColor: collab.color }}
                  title={collab.name}
                >
                  {collab.name[0]}
                </div>
              ))}
              <button 
                onClick={() => setIsInviteModalOpen(true)}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                  settings.theme === 'dark' 
                    ? 'bg-purple-800 border-purple-950 text-purple-300 hover:bg-purple-700' 
                    : 'bg-purple-100 border-white text-purple-600 hover:bg-purple-200'
                }`}
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            <div className={`h-8 w-px ${settings.theme === 'dark' ? 'bg-white/5' : 'bg-gray-200'}`} />

            <div className="flex items-center gap-3">
              <button 
                onClick={handleRunCode}
                className="flex items-center gap-2 px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-purple-600/20"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Run
              </button>
              <button 
                onClick={handleDeploy}
                disabled={activeProject?.deployStatus === 'building'}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  activeProject?.deployStatus === 'building' ? 'bg-amber-500/20 text-amber-500 border-amber-500/20' :
                  activeProject?.deployStatus === 'success' ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/20' :
                  settings.theme === 'dark' ? 'bg-white/5 hover:bg-white/10 text-purple-300 border-white/5' : 'bg-gray-100 hover:bg-gray-200 text-purple-600 border-gray-200'
                }`}
              >
                <Rocket className={`w-3.5 h-3.5 ${activeProject?.deployStatus === 'building' ? 'animate-bounce' : ''}`} />
                {activeProject?.deployStatus === 'building' ? 'Building...' : 
                 activeProject?.deployStatus === 'success' ? 'Deployed' : 'Deploy'}
              </button>
              <button onClick={handleLogout} className={`p-2 transition-colors ${settings.theme === 'dark' ? 'text-purple-500 hover:text-red-400' : 'text-purple-400 hover:text-red-500'}`}>
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 relative overflow-hidden">
          {renderMainContent()}
        </div>

        {/* Invite Modal */}
        <AnimatePresence>
          {isInviteModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsInviteModalOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className={`relative w-full max-w-md p-8 rounded-[2.5rem] border shadow-2xl transition-colors ${
                  settings.theme === 'dark' ? 'bg-purple-950 border-white/10' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex justify-between items-center mb-8">
                  <h2 className={`text-2xl font-black tracking-tight ${settings.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Invite Team</h2>
                  <button onClick={() => setIsInviteModalOpen(false)} className={`p-2 rounded-full transition-colors ${settings.theme === 'dark' ? 'hover:bg-white/5 text-purple-400' : 'hover:bg-gray-100 text-purple-600'}`}><X className="w-6 h-6" /></button>
                </div>

                <div className="space-y-6">
                  <div className={`p-6 rounded-2xl border space-y-4 transition-colors ${settings.theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                    <p className={`text-sm ${settings.theme === 'dark' ? 'text-purple-300' : 'text-gray-600'}`}>Share this link with your teammates to collaborate in real-time.</p>
                    <div className="flex gap-2">
                      <input 
                        readOnly 
                        value={inviteLink}
                        className={`flex-1 border rounded-xl px-4 py-2 text-xs focus:outline-none transition-colors ${
                          settings.theme === 'dark' ? 'bg-black/20 border-white/10 text-purple-400' : 'bg-white border-gray-200 text-purple-600'
                        }`}
                      />
                      <button 
                        onClick={handleCopyInvite}
                        className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-purple-600/20"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-purple-500">Member Roles</h3>
                    <div className="space-y-2">
                      {['Owner', 'Admin', 'Developer', 'Viewer'].map((role) => (
                        <div key={role} className={`flex items-center justify-between p-3 rounded-xl transition-colors cursor-pointer group ${
                          settings.theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100'
                        }`}>
                          <span className={`text-sm font-medium ${settings.theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>{role}</span>
                          <ChevronRight className="w-4 h-4 text-purple-700 group-hover:text-purple-500 transition-colors" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      {isRightPanelOpen && (
        <motion.div 
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 320, opacity: 1 }}
          className="h-full"
        >
          {renderRightPanel()}
        </motion.div>
      )}

      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        <button 
          onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
          className="p-4 bg-purple-600 text-white rounded-2xl shadow-2xl shadow-purple-600/40 hover:scale-110 transition-transform"
        >
          {isRightPanelOpen ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
}

