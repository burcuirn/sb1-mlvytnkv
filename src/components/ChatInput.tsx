import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface Props {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled }: Props) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Mesajınızı yazın..."
        disabled={disabled}
        className="flex-1 rounded-2xl border border-gray-200 px-5 py-3 bg-transparent focus:outline-none focus:border-gray-300 focus:ring-2 focus:ring-gray-200/50 disabled:bg-gray-50 text-gray-700 placeholder-gray-400 transition-all duration-300"
      />
      <button
        type="submit"
        disabled={disabled || !message.trim()}
        className="rounded-2xl bg-gradient-to-r from-[#212529] to-[#343a40] px-6 py-3 text-white hover:from-[#343a40] hover:to-[#212529] disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed border border-gray-200/50 transition-all duration-300 group"
      >
        <Send size={18} className="group-hover:scale-110 transition-transform duration-300" />
      </button>
    </form>
  );
}