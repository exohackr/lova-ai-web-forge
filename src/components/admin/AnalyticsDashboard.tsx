
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Users, Activity, TrendingUp, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalGenerations: number;
  dailyGenerations: { date: string; count: number }[];
  userDistribution: { type: string; count: number; color: string }[];
  topUsers: { username: string; total_uses: number }[];
}

export const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    activeUsers: 0,
    totalGenerations: 0,
    dailyGenerations: [],
    userDistribution: [],
    topUsers: []
  });
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      // Get total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get active users (users who have used the service in the last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data: activeUsersData } = await supabase
        .from('usage_logs')
        .select('user_id')
        .gte('used_at', sevenDaysAgo);

      const activeUsers = new Set(activeUsersData?.map(log => log.user_id) || []).size;

      // Get total generations
      const { count: totalGenerations } = await supabase
        .from('usage_logs')
        .select('*', { count: 'exact', head: true });

      // Get daily generations for the last 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const { data: usageLogs } = await supabase
        .from('usage_logs')
        .select('used_at')
        .gte('used_at', thirtyDaysAgo.toISOString())
        .order('used_at', { ascending: true });

      // Group by date
      const dailyGenerations: { [key: string]: number } = {};
      usageLogs?.forEach(log => {
        if (log.used_at) {
          const date = new Date(log.used_at).toLocaleDateString();
          dailyGenerations[date] = (dailyGenerations[date] || 0) + 1;
        }
      });

      const dailyGenerationsArray = Object.entries(dailyGenerations).map(([date, count]) => ({
        date,
        count
      }));

      // Get user distribution
      const { data: allUsers } = await supabase
        .from('profiles')
        .select('is_admin, is_moderator, has_subscription, subscription_type');

      const userDistribution = [
        { 
          type: 'Regular Users', 
          count: allUsers?.filter(u => !u.is_admin && !u.is_moderator && !u.has_subscription).length || 0,
          color: '#8884d8'
        },
        { 
          type: 'Subscribers', 
          count: allUsers?.filter(u => u.has_subscription).length || 0,
          color: '#82ca9d'
        },
        { 
          type: 'Moderators', 
          count: allUsers?.filter(u => u.is_moderator).length || 0,
          color: '#ffc658'
        },
        { 
          type: 'Admins', 
          count: allUsers?.filter(u => u.is_admin).length || 0,
          color: '#ff7300'
        }
      ];

      // Get top users
      const { data: topUsers } = await supabase
        .from('profiles')
        .select('username, total_uses')
        .order('total_uses', { ascending: false })
        .limit(10);

      setAnalytics({
        totalUsers: totalUsers || 0,
        activeUsers,
        totalGenerations: totalGenerations || 0,
        dailyGenerations: dailyGenerationsArray,
        userDistribution,
        topUsers: topUsers || []
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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center">
        <TrendingUp className="w-5 h-5 mr-2" />
        Analytics Dashboard
      </h3>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold">{analytics.totalUsers}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Active Users (7d)</p>
              <p className="text-2xl font-bold">{analytics.activeUsers}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Total Generations</p>
              <p className="text-2xl font-bold">{analytics.totalGenerations}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Avg per User</p>
              <p className="text-2xl font-bold">
                {analytics.totalUsers > 0 ? Math.round(analytics.totalGenerations / analytics.totalUsers) : 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Generations Chart */}
        <Card className="p-4">
          <h4 className="font-medium mb-4">Daily Generations (Last 30 Days)</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.dailyGenerations}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* User Distribution Chart */}
        <Card className="p-4">
          <h4 className="font-medium mb-4">User Distribution</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.userDistribution}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                label={({ type, count }) => `${type}: ${count}`}
              >
                {analytics.userDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Top Users */}
      <Card className="p-4">
        <h4 className="font-medium mb-4">Top Users by Usage</h4>
        <div className="space-y-2">
          {analytics.topUsers.length > 0 ? (
            analytics.topUsers.map((user, index) => (
              <div key={user.username} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">#{index + 1}</Badge>
                  <span className="font-medium">{user.username}</span>
                </div>
                <span className="text-sm text-gray-600">{user.total_uses} uses</span>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500">No usage data available</div>
          )}
        </div>
      </Card>
    </div>
  );
};
