import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'Content-Type': 'application/json'
    }
  }
});

// Helper function to log Supabase errors
export const logSupabaseError = (error: any, context: string) => {
  console.error(`Supabase Error (${context}):`, {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code
  });
};

// Helper function to handle database operations with error logging
export const safeDbOperation = async <T>(
  operation: () => Promise<T>,
  context: string
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    logSupabaseError(error, context);
    throw error;
  }
};

// UUID validation function
export function isValidUUID(uuid: string | null | undefined): boolean {
  if (!uuid) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Helper function to format phone number for database
export function formatPhoneForDatabase(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  return `+90${cleanPhone.substring(1)}`;
}

// Helper function to validate phone number format
export function validatePhoneNumber(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, '');
  return /^05[0-9]{9}$/.test(cleanPhone);
}

// Helper function to handle Supabase errors
export function handleSupabaseError(error: any): string {
  if (error instanceof Error) {
    if (error.message.includes('invalid input syntax for type uuid')) {
      return 'Invalid user ID format. Please log in again.';
    }
    if (error.message.includes('JWT expired')) {
      return 'Your session has expired. Please log in again.';
    }
    return error.message;
  }
  return 'An unexpected error occurred';
}