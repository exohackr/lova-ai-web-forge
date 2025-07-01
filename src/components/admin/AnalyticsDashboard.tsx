
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, Activity, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AnalyticsData {
  totalUsers: number;
  totalUses: number;
  adminCount: number;
  moderatorCount: number;
  bannedCount: number;
  subscriptionCount: number;
  usersByDate: { date: string; count: number }[];
  usesByUser: { username: string; uses: number }[];
}

export const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) throw error;

      const totalUsers = profiles.length;
      const totalUses = profiles.reduce((sum, user) => sum + (user.total_uses || 0), 0);
      const adminCount = profiles.filter(user => user.is_admin).length;
      const moderatorCount = profiles.filter(user => user.is_moderator).length;
      const bannedCount = profiles.filter(user => user.is_banned).length;
      const subscriptionCount = profiles.filter(user => user.has_subscription).length;

      // Group users by creation date
      const usersByDate = profiles.reduce((acc: any, user) => {
        const date = new Date(user.created_at || '').toLocaleDateString();
        const existing = acc.find((item: any) => item.date === date);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ date, count: 1 });
        }
        return acc;
      }, []).slice(-7); // Last 7 days

      // Top users by total uses
      const usesByUser = profiles
        .sort((a, b) => (b.total_uses || 0) - (a.total_uses || 0))
        .slice(0, 10)
        .map(user => ({
          username: user.username,
          uses: user.total_uses || 0
        }));

      setAnalytics({
        totalUsers,
        totalUses,
        adminCount,
        moderatorCount,
        bannedCount,
        subscriptionCount,
        usersByDate,
        usesByUser
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="text-center">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="text-center">Failed to load analytics</div>;
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const pieData = [
    { name: 'Regular Users', value: analytics.totalUsers - analytics.adminCount - analytics.moderatorCount },
    { name: 'Admins', value: analytics.adminCount },
    { name: 'Moderators', value: analytics.moderatorCount },
    { name: 'Banned', value: analytics.bannedCount },
    { name: 'Subscribers', value: analytics.subscriptionCount }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center">
        <TrendingUp className="w-5 h-5 mr-2" />
        Analytics Dashboard
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Users className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{analytics.totalUsers}</p>
              <p className="text-sm text-gray-600">Total Users</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{analytics.totalUses}</p>
              <p className="text-sm text-gray-600">Total Uses</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Crown className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold">{analytics.adminCount}</p>
              <p className="text-sm text-gray-600">Admins</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Users className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-2xl font-bold">{analytics.subscriptionCount}</p>
              <p className="text-sm text-gray-600">Subscribers</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4">
          <h4 className="text-lg font-semibold mb-4">User Registrations (Last 7 Days)</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={analytics.usersByDate}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
          <h4 className="text-lg font-semibold mb-4">User Distribution</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-4">
        <h4 className="text-lg font-semibold mb-4">Top Users by Total Uses</h4>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={analytics.usesByUser}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="username" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="uses" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};
