import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatMessage as ChatMessageType, ChatResponse, Thread, User } from './types';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { BotAvatar } from './components/BotAvatar';
import { Login } from './components/Login';
import { MessageSquare, Trophy, Calendar, Target, Plus, Pencil, Trash2, Check, X, LogOut } from 'lucide-react';
import { supabase, safeDbOperation, logSupabaseError } from './lib/supabase';

const API_KEY = 'SVQWSN9-1H24CPH-GD7ZRY0-02PKV1H';
const API_URL = 'https://skchuzee.rcld.dev/api/v1/workspace/chatbot/chat';

export function Home() {
  // ... (önceki state tanımlamaları)

  const sendMessage = async (message: string) => {
    if (!user) return;
    
    if (!API_KEY || API_KEY === 'YOUR_API_KEY') {
      const errorMessage: ChatMessageType = {
        id: Date.now().toString(),
        type: 'bot',
        message: 'Please configure a valid API key to use the chat functionality.',
        timestamp: new Date().toISOString(),
      };
      const updatedMessages = [...currentThread.messages, errorMessage];
      setThreads(prev => prev.map(thread =>
        thread.id === currentThreadId
          ? { ...thread, messages: updatedMessages }
          : thread
      ));
      return;
    }

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      type: 'user',
      message,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...currentThread.messages, userMessage];
    setThreads(prev => prev.map(thread =>
      thread.id === currentThreadId
        ? { ...thread, messages: updatedMessages }
        : thread
    ));

    setIsLoading(true);

    try {
      // Thread oluşturma veya mevcut thread'i kullanma
      let threadId = currentThreadId;
      if (currentThreadId === 'default' || !currentThread) {
        const { data: threadData, error: threadError } = await safeDbOperation(
          () => supabase
            .from('threads')
            .insert({
              user_id: user.id,
              title: 'Yeni Sohbet',
              created_at: new Date().toISOString()
            })
            .select()
            .single(),
          'create_thread'
        );

        if (threadError) throw threadError;
        if (!threadData) throw new Error('Thread creation failed');

        threadId = threadData.id;
        setCurrentThreadId(threadId);
      }

      // Kullanıcı mesajını kaydet
      const { error: messageError } = await safeDbOperation(
        () => supabase
          .from('messages')
          .insert({
            thread_id: threadId,
            type: 'user',
            user_prompt: message,
            created_at: new Date().toISOString()
          }),
        'save_user_message'
      );

      if (messageError) throw messageError;

      // Bot yanıtını al
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          message,
          mode: 'chat',
          sessionId: threadId,
        }),
      });

      if (!response.ok) {
        throw new Error(
          response.status === 403 
            ? 'Invalid API key. Please check your configuration.' 
            : `API request failed with status ${response.status}`
        );
      }

      const data: ChatResponse = await response.json();
      if (data.error) throw new Error(data.error);

      // Bot yanıtını kaydet
      const { error: botMessageError } = await safeDbOperation(
        () => supabase
          .from('messages')
          .insert({
            thread_id: threadId,
            type: 'bot',
            bot_response: data.textResponse,
            created_at: new Date().toISOString()
          }),
        'save_bot_message'
      );

      if (botMessageError) throw botMessageError;

      const botMessage: ChatMessageType = {
        id: data.id || Date.now().toString(),
        type: 'bot',
        message: data.textResponse,
        timestamp: new Date().toISOString(),
      };

      // Thread başlığını güncelle
      if (currentThread.messages.filter(m => m.type === 'bot').length === 0) {
        const newTitle = generateThreadTitle(botMessage.message);
        const { error: updateError } = await safeDbOperation(
          () => supabase
            .from('threads')
            .update({ title: newTitle })
            .eq('id', threadId),
          'update_thread_title'
        );

        if (updateError) throw updateError;
      }

      // Local state'i güncelle
      setThreads(prev => prev.map(thread => {
        if (thread.id === threadId) {
          return {
            ...thread,
            messages: [...updatedMessages, botMessage]
          };
        }
        return thread;
      }));

    } catch (error) {
      console.error('Error in sendMessage:', error);
      logSupabaseError(error, 'send_message');
      
      const errorMessage: ChatMessageType = {
        id: Date.now().toString(),
        type: 'bot',
        message: error instanceof Error 
          ? `Error: ${error.message}` 
          : 'An unexpected error occurred. Please try again.',
        timestamp: new Date().toISOString(),
      };
      
      setThreads(prev => prev.map(thread =>
        thread.id === currentThreadId
          ? { ...thread, messages: [...updatedMessages, errorMessage] }
          : thread
      ));
    } finally {
      setIsLoading(false);
    }
  };

  // ... (component'in geri kalanı)
}