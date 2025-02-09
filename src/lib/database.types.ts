export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          created_at: string
          updated_at: string | null
          email: string | null
          phone_number: string | null
          password: string | null
        }
        Insert: {
          id: string
          username?: string
          created_at?: string
          updated_at?: string | null
          email?: string | null
          phone_number?: string | null
          password?: string | null
        }
        Update: {
          id?: string
          username?: string
          created_at?: string
          updated_at?: string | null
          email?: string | null
          phone_number?: string | null
          password?: string | null
        }
      }
      threads: {
        Row: {
          id: string
          user_id: string
          title: string
          created_at: string
          updated_at: string
        }
      }
      messages: {
        Row: {
          id: string
          thread_id: string
          content: string
          type: 'user' | 'bot'
          created_at: string
        }
      }
    }
  }
}