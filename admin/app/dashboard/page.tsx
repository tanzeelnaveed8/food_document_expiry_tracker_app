'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface DashboardStats {
  users: {
    total: number;
    active: number;
    inactive: number;
    premium: number;
    premiumPercentage: number;
  };
  items: {
    total: number;
    food: number;
    documents: number;
    expired: number;
    expiringSoon: number;
  };
  notifications: {
    sentToday: number;
    sentThisWeek: number;
    deliveryRate: number;
    failedToday: number;
  };
  growth: {
    newUsersToday: number;
    newUsersThisWeek: number;
    newUsersThisMonth: number;
  };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      loadStats();
    }
  }, [status]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError('Failed to load statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{session?.user?.email}</span>
            <button
              onClick={() => router.push('/users')}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Users
            </button>
            <button
              onClick={() => router.push('/broadcast')}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Broadcast
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Stats */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">User Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Users"
              value={stats.users.total}
              color="blue"
            />
            <StatCard
              title="Active Users"
              value={stats.users.active}
              subtitle="Last 7 days"
              color="green"
            />
            <StatCard
              title="Premium Users"
              value={stats.users.premium}
              subtitle={`${stats.users.premiumPercentage.toFixed(1)}% of total`}
              color="purple"
            />
            <StatCard
              title="Inactive Users"
              value={stats.users.inactive}
              subtitle="30+ days"
              color="gray"
            />
          </div>
        </div>

        {/* Item Stats */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Item Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              title="Total Items"
              value={stats.items.total}
              color="blue"
            />
            <StatCard
              title="Food Items"
              value={stats.items.food}
              color="green"
            />
            <StatCard
              title="Documents"
              value={stats.items.documents}
              color="indigo"
            />
            <StatCard
              title="Expiring Soon"
              value={stats.items.expiringSoon}
              color="yellow"
            />
            <StatCard
              title="Expired"
              value={stats.items.expired}
              color="red"
            />
          </div>
        </div>

        {/* Notification Stats */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Sent Today"
              value={stats.notifications.sentToday}
              color="blue"
            />
            <StatCard
              title="Sent This Week"
              value={stats.notifications.sentThisWeek}
              color="green"
            />
            <StatCard
              title="Delivery Rate"
              value={`${stats.notifications.deliveryRate}%`}
              color="purple"
            />
            <StatCard
              title="Failed Today"
              value={stats.notifications.failedToday}
              color="red"
            />
          </div>
        </div>

        {/* Growth Stats */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Growth Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="New Users Today"
              value={stats.growth.newUsersToday}
              color="green"
            />
            <StatCard
              title="New Users This Week"
              value={stats.growth.newUsersThisWeek}
              color="blue"
            />
            <StatCard
              title="New Users This Month"
              value={stats.growth.newUsersThisMonth}
              color="purple"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  color,
}: {
  title: string;
  value: number | string;
  subtitle?: string;
  color: 'blue' | 'green' | 'purple' | 'red' | 'yellow' | 'gray' | 'indigo';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    green: 'bg-green-50 border-green-200 text-green-900',
    purple: 'bg-purple-50 border-purple-200 text-purple-900',
    red: 'bg-red-50 border-red-200 text-red-900',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    gray: 'bg-gray-50 border-gray-200 text-gray-900',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-900',
  };

  return (
    <div className={`${colorClasses[color]} border rounded-lg p-6`}>
      <h3 className="text-sm font-medium opacity-75 mb-2">{title}</h3>
      <p className="text-3xl font-bold">{value}</p>
      {subtitle && <p className="text-xs opacity-75 mt-1">{subtitle}</p>}
    </div>
  );
}
