
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import type { Session } from '@supabase/supabase-js';

interface AccountProps {
  session: Session;
  onProfileUpdate: (profile: { full_name: string | null; avatar_url: string | null }) => void;
}

const Account: React.FC<AccountProps> = ({ session, onProfileUpdate }) => {
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let ignore = false;
    async function getProfile() {
      setLoading(true);
      const { user } = session;

      const { data, error } = await supabase
        .from('users')
        .select(`full_name, avatar_url`)
        .eq('id', user.id)
        .single();

      if (!ignore) {
        if (error && error.code !== 'PGRST116') { // PGRST116 = 'Bad Request', raised when no rows found
          console.warn('Error fetching profile:', error);
          setMessage(`Error: ${error.message}`);
        } else if (data) {
          setFullName(data.full_name);
          setAvatarUrl(data.avatar_url);
          onProfileUpdate({ full_name: data.full_name, avatar_url: data.avatar_url });
        }
      }
      setLoading(false);
    }

    getProfile();

    return () => {
      ignore = true;
    };
  }, [session, onProfileUpdate]);

  async function updateProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setLoading(true);
    const { user } = session;

    const updates = {
      id: user.id,
      full_name: fullName,
      avatar_url: avatarUrl,
      updated_at: new Date(),
    };

    const { error } = await supabase.from('users').upsert(updates);

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage('Profile updated successfully!');
      onProfileUpdate({ full_name: fullName, avatar_url: avatarUrl });
    }
    setLoading(false);
  }

  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
           <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
           <p className="text-slate-400 font-medium animate-pulse">Loading User Profile...</p>
        </div>
      );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl mx-auto">
        <header>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">User Account</h2>
            <p className="text-slate-500">Manage your profile details and preferences.</p>
        </header>

        <form onSubmit={updateProfile} className="p-8 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-6">
            <div className="flex items-center gap-6">
                 <div className="relative">
                    <img
                        src={avatarUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${session.user.email}`}
                        alt="Avatar"
                        className="w-24 h-24 rounded-full object-cover border-4 border-slate-100"
                    />
                 </div>
                 <div className="flex-1">
                    <p className="text-lg font-bold text-slate-800">{fullName || 'New User'}</p>
                    <p className="text-sm text-slate-500">{session.user.email}</p>
                 </div>
            </div>
            <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">Full Name</label>
                <input
                    id="fullName"
                    type="text"
                    className="mt-1 w-full px-4 py-3 text-sm border border-slate-300 rounded-xl focus:ring-blue-500 focus:border-blue-500"
                    value={fullName || ''}
                    onChange={(e) => setFullName(e.target.value)}
                />
            </div>
            <div>
                <label htmlFor="avatarUrl" className="block text-sm font-medium text-slate-700">Avatar URL</label>
                <input
                    id="avatarUrl"
                    type="url"
                    className="mt-1 w-full px-4 py-3 text-sm border border-slate-300 rounded-xl focus:ring-blue-500 focus:border-blue-500"
                    value={avatarUrl || ''}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                />
            </div>

            <div>
                <button
                    className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-colors disabled:opacity-50"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Update Profile'}
                </button>
            </div>
             {message && (
                <p className={`text-center text-sm font-medium p-3 rounded-xl ${message.startsWith('Error') ? 'text-rose-600 bg-rose-50' : 'text-emerald-600 bg-emerald-50'}`}>
                    {message}
                </p>
            )}
        </form>
    </div>
  );
};

export default Account;
