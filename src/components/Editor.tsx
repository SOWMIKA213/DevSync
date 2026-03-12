import React, { useEffect, useRef, useState } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send } from 'lucide-react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { User } from '../types';
import { useTheme } from '../ThemeContext';

interface CodeEditorProps {
  code: string;
  language: string;
  onChange: (value: string | undefined) => void;
  onCursorChange: (cursor: { lineNumber: number; column: number }) => void;
  collaborators: User[];
  projectId?: string;
  fileId?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ 
  code, 
  language, 
  onChange, 
  onCursorChange,
  collaborators,
  projectId = 'default-project',
  fileId = 'default-file'
}) => {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [activeCommentLine, setActiveCommentLine] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');
  const { settings } = useTheme();
  const isDark = settings.theme === 'dark';

  useEffect(() => {
    if (!projectId || !fileId) return;

    const q = query(
      collection(db, `projects/${projectId}/comments`),
      where('fileId', '==', fileId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newComments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setComments(newComments);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `projects/${projectId}/comments`);
    });

    return () => unsubscribe();
  }, [projectId, fileId]);

  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(isDark ? 'devsync-purple' : 'vs');
    }
  }, [isDark]);

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Custom theme
    monaco.editor.defineTheme('devsync-purple', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6a1b9a', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'ab47bc' },
        { token: 'string', foreground: 'ce93d8' },
        { token: 'number', foreground: 'f3e5f5' },
      ],
      colors: {
        'editor.background': '#0a0118',
        'editor.foreground': '#f3e5f5',
        'editorCursor.foreground': '#ab47bc',
        'editor.lineHighlightBackground': '#1a0533',
        'editorLineNumber.foreground': '#4a148c',
        'editor.selectionBackground': '#4a148c55',
        'editorIndentGuide.background': '#2d0a54',
      }
    });

    monaco.editor.setTheme(isDark ? 'devsync-purple' : 'vs');

    editor.onDidChangeCursorPosition((e: any) => {
      onCursorChange({
        lineNumber: e.position.lineNumber,
        column: e.position.column
      });
    });

    // Add glyph margin for comments
    editor.onMouseDown((e: any) => {
      if (e.target.type === 2) { // Glyph margin
        setActiveCommentLine(e.target.position.lineNumber);
      }
    });
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || activeCommentLine === null) return;

    try {
      await addDoc(collection(db, `projects/${projectId}/comments`), {
        projectId,
        fileId,
        line: activeCommentLine,
        authorId: auth.currentUser?.uid,
        authorName: auth.currentUser?.displayName || 'Anonymous',
        text: commentText,
        timestamp: serverTimestamp()
      });
      setCommentText('');
      setActiveCommentLine(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `projects/${projectId}/comments`);
    }
  };

  return (
    <div className={`h-full w-full editor-container overflow-hidden rounded-xl border transition-colors duration-500 relative ${
      isDark ? 'bg-purple-950/50 border-white/5' : 'bg-white border-gray-200'
    }`}>
      <Editor
        height="100%"
        defaultLanguage={language}
        language={language}
        value={code}
        theme={isDark ? 'devsync-purple' : 'vs'}
        onChange={onChange}
        onMount={handleEditorDidMount}
        options={{
          fontSize: settings.fontSize,
          fontFamily: settings.fontFamily,
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 16, bottom: 16 },
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          lineNumbersMinChars: 3,
          glyphMargin: true,
        }}
      />

      {/* Comment Overlay */}
      <AnimatePresence>
        {activeCommentLine !== null && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`absolute right-4 top-16 w-64 p-4 z-50 shadow-2xl border rounded-2xl backdrop-blur-md transition-colors ${
              isDark ? 'bg-purple-900/80 border-purple-500/30' : 'bg-white/90 border-purple-200'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`text-[10px] font-bold uppercase ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>Comment on Line {activeCommentLine}</span>
              <button onClick={() => setActiveCommentLine(null)} className={`${isDark ? 'text-purple-500 hover:text-white' : 'text-purple-400 hover:text-purple-700'}`}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className={`w-full border rounded-lg p-2 text-xs focus:outline-none focus:border-purple-500 min-h-[80px] mb-3 transition-colors ${
                isDark ? 'bg-purple-950/50 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
              }`}
            />
            <button
              onClick={handleAddComment}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20"
            >
              <Send className="w-3 h-3" /> Post Comment
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Existing Comments Indicators */}
      <div className="absolute left-0 top-0 h-full pointer-events-none">
        {comments.map((comment, i) => (
          <div 
            key={i}
            className={`absolute left-1 w-4 h-4 flex items-center justify-center ${isDark ? 'text-purple-400' : 'text-purple-600'}`}
            style={{ top: `${(comment.line - 1) * (settings.fontSize * 1.5) + 16}px` }} // Approx line height
            title={`${comment.authorName}: ${comment.text}`}
          >
            <MessageSquare className={`w-3 h-3 ${isDark ? 'fill-purple-400/20' : 'fill-purple-600/10'}`} />
          </div>
        ))}
      </div>

      {/* Collaborator Cursors */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {collaborators.map((collab) => {
          if (!collab.cursor || !editorRef.current) return null;
          
          // Approximate position calculation for visual feedback
          // In a real app, we'd use monaco.editor.deltaDecorations
          const top = (collab.cursor.lineNumber - 1) * (settings.fontSize * 1.5) + 16;
          const left = collab.cursor.column * (settings.fontSize * 0.6) + 40;

          return (
            <motion.div
              key={collab.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, top, left }}
              className="absolute z-30 flex flex-col items-start"
            >
              <div 
                className="w-0.5 h-5" 
                style={{ backgroundColor: collab.color }} 
              />
              <div 
                className="px-1.5 py-0.5 rounded text-[8px] font-bold text-white whitespace-nowrap shadow-sm"
                style={{ backgroundColor: collab.color }}
              >
                {collab.name}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default CodeEditor;
