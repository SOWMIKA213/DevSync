export type UserRole = 'owner' | 'admin' | 'developer' | 'viewer';

export interface User {
  id: string;
  name: string;
  color: string;
  avatar?: string;
  cursor?: {
    lineNumber: number;
    column: number;
  };
  role: UserRole;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  fontSize: number;
  fontFamily: string;
}

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  language?: string;
  content?: string;
  children?: FileNode[];
  parentId?: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: string;
  timestamp: string;
  type?: 'text' | 'code' | 'system';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  members: string[]; // UIDs
  memberRoles: { [uid: string]: UserRole };
  visibility: 'public' | 'private';
  language: string;
  createdAt: string;
  updatedAt: string;
  lastEditedBy?: string;
  deployStatus?: 'idle' | 'building' | 'success' | 'failed';
  deployUrl?: string;
}

export interface BugPrediction {
  line: number;
  severity: 'low' | 'medium' | 'high';
  message: string;
  suggestion: string;
}
