'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function BroadcastPage() {
  const { status } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetAudience, setTargetAudience] = useState<'all' | 'premium' | 'free' | 'inactive'>('all');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await api.broadcastNotification({
        title,
        body,
        targetAudience,
      });

      setSuccess(
        `Broadcast queued successfully! ${result.targetUserCount} users will receive the notification.`
      );
      setTitle('');
      setBody('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send broadcast');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Broadcast Notification</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push('/users')}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Users
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Notification Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={100}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="New Feature Available!"
              />
              <p className="mt-1 text-xs text-gray-500">
                {title.length}/100 characters
              </p>
            </div>

            <div>
              <label
                htmlFor="body"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Notification Body
              </label>
              <textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                maxLength={500}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Check out our new export feature in the premium plan..."
              />
              <p className="mt-1 text-xs text-gray-500">
                {body.length}/500 characters
              </p>
            </div>

            <div>
              <label
                htmlFor="audience"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Target Audience
              </label>
              <select
                id="audience"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Users</option>
                <option value="premium">Premium Users Only</option>
                <option value="free">Free Users Only</option>
                <option value="inactive">Inactive Users (30+ days)</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Select which users should receive this notification
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? 'Sending...' : 'Send Broadcast'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTitle('');
                  setBody('');
                  setTargetAudience('all');
                  setError('');
                  setSuccess('');
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
            </div>
          </form>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              Preview
            </h3>
            <div className="bg-white p-4 rounded border border-blue-100">
              <p className="font-semibold text-gray-900">
                {title || 'Notification Title'}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {body || 'Notification body will appear here...'}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
