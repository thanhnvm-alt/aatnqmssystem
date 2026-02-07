import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { QmsApiService } from '../services/apiService';
import { UserRole } from '../types';

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: UserRole;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.QC);
  const [isSaving, setIsSaving] = useState(false);

  async function fetchUsers() {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email, avatar_url, role') // Explicitly select columns, excluding password_hash
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      await QmsApiService.createUser({
        fullName,
        email,
        password,
        role,
      });

      alert(`User "${fullName}" created successfully.`);

      // Reset form and refetch users
      setFullName('');
      setEmail('');
      setPassword('');
      setRole(UserRole.QC);
      await fetchUsers();

    } catch(err: any) {
       setError(`Failed to add user: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      {/* Left Column: Add User Form */}
      <div className="lg:col-span-1 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Manage Users</h2>
          <p className="text-slate-500">Add or modify user roles and access.</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800">Add New User</h3>
          <div>
            <label htmlFor="fullName" className="block text-xs font-medium text-slate-600 mb-1">Full Name</label>
            <input
              id="fullName"
              type="text"
              required
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-slate-600 mb-1">Email</label>
            <input
              id="email"
              type="email"
              required
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-xs font-medium text-slate-600 mb-1">Password</label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              placeholder="Min. 6 characters"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-xs font-medium text-slate-600 mb-1">Role</label>
            <select
              id="role"
              required
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
            >
              {Object.values(UserRole).map(roleValue => (
                <option key={roleValue} value={roleValue}>{roleValue}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg font-bold text-sm shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Creating User...' : 'Add User'}
          </button>
          {error && <p className="text-xs text-rose-600 text-center mt-2">{error}</p>}
        </form>
      </div>

      {/* Right Column: User List */}
      <div className="lg:col-span-2">
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {loading ? (
             <div className="p-12 text-center text-slate-400">Loading user data...</div>
          ) : (
             <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">User</th>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Role</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {users.map(user => (
                        <tr key={user.id}>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                    <img src={user.avatar_url || ''} alt="avatar" className="w-10 h-10 rounded-full bg-slate-100" />
                                    <div>
                                        <p className="font-bold text-sm text-slate-800">{user.full_name}</p>
                                        <p className="text-xs text-slate-500">{user.email}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider border ${
                                    user.role === UserRole.MANAGER ? 'bg-purple-100 text-purple-700 border-purple-200' :
                                    user.role === UserRole.QA ? 'bg-green-100 text-green-700 border-green-200' :
                                    'bg-blue-100 text-blue-700 border-blue-200'
                                }`}>
                                    {user.role}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
             </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
