export interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  message: string;
  timestamp: Date;
  botType?: 'sezar' | 'sentiment';
  sentimentAnalysis?: string;
  sentimentScore?: number;
}

export interface ChatResponse {
  id: string;
  type: 'abort' | 'textResponse';
  textResponse: string | null;
  sources: Array<{
    title: string;
    chunk: string;
  }>;
  close: boolean;
  error: string | null;
}

export interface User {
  id: string;
  username: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface Thread {
  id: string;
  title: string;
  createdAt: Date;
  messages: ChatMessage[];
}

export interface ForumTopic {
  id: string;
  categoryId: string;
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  likes: number;
  comments: Comment[];
}

export interface Comment {
  id: string;
  content: string;
  author: string;
  createdAt: Date;
  likes: number;
  replies: Comment[];
}

export interface ForumData {
  topics: ForumTopic[];
}