import React, { useState } from 'react';
import { User, Pencil, Check, X } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../types';
import { BotAvatar } from './BotAvatar';

interface Props {
  message: ChatMessageType;
  onEdit?: (id: string, newMessage: string) => void;
}

function formatMessage(text: string) {
  // Replace bold text markers (**text**) with styled spans
  const boldFormatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Split text into lines and wrap each line
  const lines = boldFormatted.split('\n');
  
  return lines.map((line, index) => (
    <React.Fragment key={index}>
      <span dangerouslySetInnerHTML={{ __html: line }} />
      {index < lines.length - 1 && <br />}
    </React.Fragment>
  ));
}

export function ChatMessage({ message, onEdit }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMessage, setEditedMessage] = useState(message.message);
  const isBot = message.type === 'bot';
  
  const handleSave = () => {
    if (editedMessage.trim() && editedMessage !== message.message) {
      onEdit?.(message.id, editedMessage);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedMessage(message.message);
    setIsEditing(false);
  };

  const formatTimestamp = (timestamp: string | Date) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleTimeString();
  };

  return (
    <div className={`flex gap-4 ${isBot ? 'bg-gradient-to-r from-gray-50 to-transparent' : ''} p-5 rounded-2xl border border-gray-200/50 transition-all duration-300 hover:border-gray-300/50 hover:shadow-sm group`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ${
        isBot 
          ? 'bg-gradient-to-br from-gray-200 to-gray-300 p-0.5' 
          : 'bg-gradient-to-br from-[#212529] to-[#343a40] text-white'
      }`}>
        {isBot ? (
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
            <BotAvatar size={40} />
          </div>
        ) : (
          <User size={20} />
        )}
      </div>
      <div className="flex-1">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editedMessage}
              onChange={(e) => setEditedMessage(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-300 focus:ring-2 focus:ring-gray-200/50 min-h-[100px]"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-1 px-3 py-1 text-sm text-white bg-gradient-to-r from-[#212529] to-[#343a40] rounded-lg hover:from-[#343a40] hover:to-[#212529] transition-all duration-300"
              >
                <Check size={14} /> Kaydet
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-300"
              >
                <X size={14} /> İptal
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {formatMessage(message.message)}
            </p>
            {!isBot && (
              <button
                onClick={() => setIsEditing(true)}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-gray-400 hover:text-gray-600 mt-2"
              >
                <Pencil size={14} />
              </button>
            )}
          </>
        )}
        <span className="text-xs text-gray-400 mt-2 block">
          {formatTimestamp(message.timestamp)}
        </span>
      </div>
    </div>
  );
}