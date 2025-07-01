
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, Sparkles } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { SelfManagement } from "./admin/SelfManagement";
import { UserManagement } from "./admin/UserManagement";
import { SystemManagement } from "./admin/SystemManagement";
import { BanManagement } from "./admin/BanManagement";
import { IpBlacklistManagement } from "./admin/IpBlacklistManagement";
import { UserList } from "./admin/UserList";
import { AdvancedUserManagement } from "./admin/AdvancedUserManagement";
import { AnalyticsDashboard } from "./admin/AnalyticsDashboard";
import { UserSearchFilter } from "./admin/UserSearchFilter";
import { ContentModeration } from "./admin/ContentModeration";
import { SystemLogs } from "./admin/SystemLogs";
import { UserProfile } from "./admin/types";

export const AdminPanel = () => {
  const { profile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('total_uses', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }

      // Type the data properly with null handling for registration_ip
      const typedUsers: UserProfile[] = (data || []).map((user: any) => ({
        ...user,
        registration_ip: user.registration_ip ? String(user.registration_ip) : null
      }));

      setUsers(typedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  if (!profile || (profile.username !== 'diddy' && !profile.is_admin)) {
    return null;
  }

  return (
    <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200">
      <div className="flex items-center space-x-2 mb-6">
        <Crown className="w-6 h-6 text-yellow-600" />
        <h2 className="text-2xl font-bold text-yellow-800">Admin Panel</h2>
        <Badge variant="secondary" className="bg-yellow-200 text-yellow-800">
          <Sparkles className="w-3 h-3 mr-1" />
          {profile.username === 'diddy' ? 'diddy' : 'admin'}
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <SelfManagement />
            <UserManagement onUserUpdate={fetchUsers} />
            <SystemManagement />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BanManagement onUserUpdate={fetchUsers} />
            <IpBlacklistManagement />
          </div>
        </TabsContent>

        <TabsContent value="users">
          <UserList users={users} />
        </TabsContent>

        <TabsContent value="advanced">
          <AdvancedUserManagement onUserUpdate={fetchUsers} />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="moderation">
          <ContentModeration />
        </TabsContent>

        <TabsContent value="search">
          <UserSearchFilter users={users} onUserUpdate={fetchUsers} />
        </TabsContent>

        <TabsContent value="logs">
          <SystemLogs />
        </TabsContent>

        <TabsContent value="system">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SystemManagement />
            <IpBlacklistManagement />
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
