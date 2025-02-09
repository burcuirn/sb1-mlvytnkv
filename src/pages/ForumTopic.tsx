import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ThumbsUp, MessageSquare, Send, Reply, X } from 'lucide-react';
import { ForumTopic as ForumTopicType, Comment } from '../types';
import { loadForumData, saveForumData } from '../utils/forum';

export function ForumTopic() {
  const { categoryId, topicId } = useParams<{ categoryId: string; topicId: string }>();
  const [topic, setTopic] = useState<ForumTopicType | null>(null);
  const [content, setContent] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: string; author: string } | null>(null);
  const [replyContent, setReplyContent] = useState('');

  // Load topic data on mount
  useEffect(() => {
    const forumData = loadForumData();
    const foundTopic = forumData.topics.find(t => t.id === topicId);
    if (foundTopic) {
      setTopic(foundTopic);
    }
  }, [topicId]);

  const updateTopic = (updatedTopic: ForumTopicType) => {
    const forumData = loadForumData();
    const updatedData = {
      topics: forumData.topics.map(t => 
        t.id === updatedTopic.id ? updatedTopic : t
      )
    };
    saveForumData(updatedData);
    setTopic(updatedTopic);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !topic) return;

    const comment: Comment = {
      id: Date.now().toString(),
      content,
      author: 'Kullanıcı',
      createdAt: new Date(),
      likes: 0,
      replies: []
    };

    const updatedTopic = {
      ...topic,
      comments: [comment, ...topic.comments]
    };
    updateTopic(updatedTopic);
    setContent('');
  };

  const handleReply = (commentId: string) => {
    if (!replyContent.trim() || !topic) return;

    const reply: Comment = {
      id: Date.now().toString(),
      content: replyContent,
      author: 'Kullanıcı',
      createdAt: new Date(),
      likes: 0,
      replies: []
    };

    const updateComments = (comments: Comment[]): Comment[] =>
      comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: [...comment.replies, reply]
          };
        }
        return {
          ...comment,
          replies: updateComments(comment.replies)
        };
      });

    const updatedTopic = {
      ...topic,
      comments: updateComments(topic.comments)
    };
    updateTopic(updatedTopic);
    setReplyContent('');
    setReplyTo(null);
  };

  const handleLike = (commentId: string) => {
    if (!topic) return;

    const updateComments = (comments: Comment[]): Comment[] =>
      comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            likes: comment.likes + 1
          };
        }
        return {
          ...comment,
          replies: updateComments(comment.replies)
        };
      });

    const updatedTopic = {
      ...topic,
      comments: updateComments(topic.comments)
    };
    updateTopic(updatedTopic);
  };

  const CommentComponent = ({ comment, level = 0 }: { comment: Comment; level?: number }) => (
    <div className={`${level > 0 ? 'ml-8 mt-4' : ''}`}>
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              {comment.author[0]}
            </div>
            <div>
              <div className="font-medium text-gray-800">{comment.author}</div>
              <div className="text-sm text-gray-500">
                {comment.createdAt.toLocaleDateString()}
              </div>
            </div>
          </div>
          
          <button
            onClick={() => handleLike(comment.id)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors duration-300"
          >
            <ThumbsUp size={16} />
            <span>{comment.likes}</span>
          </button>
        </div>
        
        <div className="prose max-w-none">
          <p className="text-gray-700">{comment.content}</p>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <button
            onClick={() => setReplyTo({ id: comment.id, author: comment.author })}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors duration-300"
          >
            <Reply size={16} />
            <span>Yanıtla</span>
          </button>
        </div>

        {replyTo?.id === comment.id && (
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Yanıtlanıyor:</span>
              <span className="font-medium">{replyTo.author}</span>
              <button
                onClick={() => setReplyTo(null)}
                className="ml-auto text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleReply(comment.id);
                  }
                }}
                placeholder="Yanıtınızı yazın..."
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300"
              />
              <button
                onClick={() => handleReply(comment.id)}
                className="px-4 py-2 bg-gradient-to-r from-[#212529] to-[#343a40] text-white rounded-xl hover:from-[#343a40] hover:to-[#212529] transition-all duration-300 flex items-center gap-2"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {comment.replies.map(reply => (
        <CommentComponent key={reply.id} comment={reply} level={level + 1} />
      ))}
    </div>
  );

  if (!topic) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] via-[#f1f3f5] to-[#e9ecef]">
      <div 
        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1583425921686-c5daf5f49e22?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] opacity-[0.03] bg-fixed"
        style={{ 
          backgroundSize: '300px',
          backgroundRepeat: 'repeat',
          transform: 'rotate(-5deg) scale(1.1)',
          filter: 'contrast(120%) brightness(150%)'
        }}
      />
      
      <header className="relative bg-gradient-to-r from-[#212529] to-[#343a40] shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-5">
          <Link to={`/forum/${categoryId}`} className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-300">
            <ArrowLeft size={20} />
            <span>Kategoriye Dön</span>
          </Link>
          <div className="mt-4">
            <h1 className="text-3xl font-display text-white tracking-wide font-medium">{topic.title}</h1>
          </div>
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-6 py-12">
        <div className="space-y-6">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Düşüncelerinizi paylaşın..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300 min-h-[200px] resize-none"
            />
            
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => {
                  if (topic) {
                    const updatedTopic = {
                      ...topic,
                      likes: topic.likes + 1
                    };
                    updateTopic(updatedTopic);
                  }
                }}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors duration-300"
              >
                <ThumbsUp size={20} />
                <span>{topic.likes}</span>
              </button>
              
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-gradient-to-r from-[#212529] to-[#343a40] text-white rounded-xl hover:from-[#343a40] hover:to-[#212529] transition-all duration-300 flex items-center gap-2"
              >
                <Send size={16} />
                <span>Gönder</span>
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {topic.comments.map(comment => (
              <CommentComponent key={comment.id} comment={comment} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}