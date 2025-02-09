import React, { useState } from 'react';
import { User } from '../types';
import { BotAvatar } from './BotAvatar';
import { UserPlus, LogIn } from 'lucide-react';
import { supabase, formatPhoneForDatabase, validatePhoneNumber } from '../lib/supabase';

interface Props {
  onLogin: (user: User) => void;
}

export function Login({ onLogin }: Props) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const formatPhoneNumber = (value: string) => {
    const number = value.replace(/\D/g, '');
    const match = number.match(/^(\d{0,4})(\d{0,3})(\d{0,2})(\d{0,2})$/);
    if (!match) return value;
    const parts = [match[1], match[2], match[3], match[4]].filter(Boolean);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0];
    let formatted = parts[0];
    if (parts.length >= 2) formatted += ' ' + parts[1];
    if (parts.length >= 3) formatted += ' ' + parts[2];
    if (parts.length >= 4) formatted += ' ' + parts[3];
    return formatted;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const { data: { user: authUser }, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) throw signInError;
      if (!authUser?.id) throw new Error('Kullanıcı bulunamadı');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError) throw profileError;
      if (!profile) throw new Error('Profil bulunamadı');

      onLogin({
        id: authUser.id,
        username: profile.username,
        password: password,
        fullName: profile.username,
        phone: profile.phone_number
      });

    } catch (err) {
      console.error('Login error:', err);
      setError('Giriş yapılırken bir hata oluştu. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!email || !password || !username) {
      setError('Tüm zorunlu alanları doldurunuz');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      setIsLoading(false);
      return;
    }

    if (phone && !validatePhoneNumber(phone)) {
      setError('Geçerli bir telefon numarası giriniz (örn: 0555 123 45 67)');
      setIsLoading(false);
      return;
    }

    try {
      const formattedPhone = phone ? formatPhoneForDatabase(phone) : null;

      // First create the auth user
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            phone_number: formattedPhone
          }
        }
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError('Bu e-posta adresi zaten kayıtlı. Lütfen giriş yapın veya farklı bir e-posta adresi kullanın.');
        } else {
          throw signUpError;
        }
        return;
      }

      if (!user) throw new Error('Kullanıcı oluşturulamadı');

      // Manually create the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email,
          username,
          phone_number: formattedPhone,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) throw profileError;

      setSuccess('Kayıt başarılı! Giriş yapabilirsiniz.');
      setIsRegistering(false);
      setEmail('');
      setPassword('');
      setUsername('');
      setPhone('');

    } catch (err) {
      console.error('Registration error:', err);
      setError('Kayıt olurken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] via-[#f1f3f5] to-[#e9ecef] flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1583425921686-c5daf5f49e22?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] opacity-[0.03] bg-fixed"
        style={{ 
          backgroundSize: '300px',
          backgroundRepeat: 'repeat',
          transform: 'rotate(-5deg) scale(1.1)',
          filter: 'contrast(120%) brightness(150%)'
        }}
      />
      
      <div className="w-full max-w-md p-8 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#e9ecef] to-[#dee2e6] p-0.5 shadow-lg mb-4">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
              <BotAvatar size={80} />
            </div>
          </div>
          <h1 className="text-3xl font-display text-gray-800 tracking-wide font-medium">Sezar</h1>
          <p className="text-sm text-gray-500 mt-1">Antik çağların bilgeliği, modern zamanın rehberi</p>
        </div>

        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm text-center">
            {success}
          </div>
        )}

        <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
          {isRegistering && (
            <>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Kullanıcı Adı *
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError('');
                  }}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all duration-300"
                  placeholder="Kullanıcı adınızı girin"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon Numarası
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all duration-300"
                  placeholder="0555 123 45 67"
                  maxLength={14}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Format: 05xx xxx xx xx
                </p>
              </div>
            </>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              E-posta *
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all duration-300"
              placeholder="E-posta adresinizi girin"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Şifre *
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all duration-300"
              placeholder="Şifrenizi girin"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div className="space-y-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-[#212529] to-[#343a40] text-white rounded-xl hover:from-[#343a40] hover:to-[#212529] transition-all duration-300 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span>Yükleniyor...</span>
              ) : (
                <span className="flex items-center gap-2">
                  {isRegistering ? (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Kayıt Ol</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Giriş Yap</span>
                    </>
                  )}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
                setSuccess('');
                setEmail('');
                setPassword('');
                setUsername('');
                setPhone('');
              }}
              className="w-full text-sm text-gray-600 hover:text-gray-800 transition-colors duration-300"
            >
              {isRegistering ? 'Zaten hesabınız var mı? Giriş yapın' : 'Hesabınız yok mu? Kayıt olun'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}