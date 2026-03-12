import React from 'react';
import { Folder, FileCode, ChevronRight, ChevronDown, Plus, Search } from 'lucide-react';
import { FileNode } from '../types';
import { motion } from 'framer-motion';
import { useTheme } from '../ThemeContext';

interface FileExplorerProps {
  files: FileNode[];
  onFileSelect: (file: FileNode) => void;
  activeFileId?: string;
}

const FileItem: React.FC<{ 
  node: FileNode, 
  level: number, 
  onSelect: (f: FileNode) => void,
  activeId?: string,
  isDark: boolean
}> = ({ node, level, onSelect, activeId, isDark }) => {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <div>
      <div 
        onClick={() => {
          if (node.type === 'folder') setIsOpen(!isOpen);
          else onSelect(node);
        }}
        className={`flex items-center gap-2 py-1 px-2 cursor-pointer rounded-lg transition-colors group ${
          activeId === node.id 
            ? (isDark ? 'bg-purple-600/20 text-purple-300' : 'bg-purple-100 text-purple-600') 
            : (isDark ? 'hover:bg-white/5 text-purple-300/70' : 'hover:bg-gray-100 text-gray-600')
        }`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        {node.type === 'folder' ? (
          <>
            {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            <Folder className={`w-4 h-4 ${isDark ? 'text-purple-500 fill-purple-500/20' : 'text-purple-600 fill-purple-600/10'}`} />
          </>
        ) : (
          <>
            <div className="w-3" />
            <FileCode className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-500'}`} />
          </>
        )}
        <span className="text-xs font-medium truncate">{node.name}</span>
      </div>

      {node.type === 'folder' && isOpen && node.children && (
        <div className="mt-0.5">
          {node.children.map(child => (
            <FileItem 
              key={child.id} 
              node={child} 
              level={level + 1} 
              onSelect={onSelect}
              activeId={activeId}
              isDark={isDark}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FileExplorer: React.FC<FileExplorerProps> = ({ files, onFileSelect, activeFileId }) => {
  const { settings } = useTheme();
  const isDark = settings.theme === 'dark';

  return (
    <div className={`w-64 h-full border-r flex flex-col transition-colors duration-500 ${
      isDark ? 'bg-purple-950/40 border-white/5' : 'bg-white border-gray-200'
    }`}>
      <div className={`p-4 flex items-center justify-between border-b ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
        <h2 className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>Explorer</h2>
        <div className="flex gap-2">
          <button className={`p-1 rounded transition-colors ${isDark ? 'hover:bg-white/5 text-purple-400' : 'hover:bg-gray-100 text-purple-600'}`}>
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button className={`p-1 rounded transition-colors ${isDark ? 'hover:bg-white/5 text-purple-400' : 'hover:bg-gray-100 text-purple-600'}`}>
            <Search className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2 px-2">
        {files.map(file => (
          <FileItem 
            key={file.id} 
            node={file} 
            level={0} 
            onSelect={onFileSelect}
            activeId={activeFileId}
            isDark={isDark}
          />
        ))}
      </div>

      <div className={`p-4 border-t ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
        <div className={`p-3 rounded-xl border transition-colors ${
          isDark ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className={`text-[10px] font-bold uppercase ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>Git: main</span>
          </div>
          <p className={`text-[10px] ${isDark ? 'text-purple-400/60' : 'text-gray-500'}`}>3 files staged for commit</p>
        </div>
      </div>
    </div>
  );
};

export default FileExplorer;
