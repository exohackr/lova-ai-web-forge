import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Download, Users, Ban, Crown, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "./types";

interface UserSearchFilterProps {
  users: UserProfile[];
  onUserUpdate: () => void;
}

export const UserSearchFilter = ({ users, onUserUpdate }: UserSearchFilterProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = !searchTerm || 
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === "all" || 
        (roleFilter === "admin" && user.is_admin) ||
        (roleFilter === "moderator" && user.is_moderator) ||
        (roleFilter === "user" && !user.is_admin && !user.is_moderator);
      
      const hasUnlimitedUses = user.daily_uses_remaining === 999999;
      const matchesStatus = statusFilter === "all" ||
        (statusFilter === "banned" && user.is_banned) ||
        (statusFilter === "active" && !user.is_banned) ||
        (statusFilter === "unlimited" && hasUnlimitedUses);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const handleUserSelect = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const bulkBanUsers = async () => {
    if (selectedUsers.length === 0) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: true })
        .in('id', selectedUsers);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Banned ${selectedUsers.length} users`,
      });

      setSelectedUsers([]);
      onUserUpdate();
    } catch (error) {
      console.error('Error banning users:', error);
      toast({
        title: "Error",
        description: "Failed to ban users",
        variant: "destructive",
      });
    }
  };

  const bulkUnbanUsers = async () => {
    if (selectedUsers.length === 0) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: false })
        .in('id', selectedUsers);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Unbanned ${selectedUsers.length} users`,
      });

      setSelectedUsers([]);
      onUserUpdate();
    } catch (error) {
      console.error('Error unbanning users:', error);
      toast({
        title: "Error",
        description: "Failed to unban users",
        variant: "destructive",
      });
    }
  };

  const bulkAddUses = async () => {
    if (selectedUsers.length === 0) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ daily_uses_remaining: 50 })
        .in('id', selectedUsers);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Added 50 uses to ${selectedUsers.length} users`,
      });

      setSelectedUsers([]);
      onUserUpdate();
    } catch (error) {
      console.error('Error adding uses:', error);
      toast({
        title: "Error",
        description: "Failed to add uses",
        variant: "destructive",
      });
    }
  };

  const exportUsers = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Username,ID,Total Uses,Daily Uses Remaining,Is Admin,Is Moderator,Is Banned,Has Unlimited Uses\n" +
      filteredUsers.map(user => {
        const hasUnlimitedUses = user.daily_uses_remaining === 999999;
        return `"${user.username || ''}","${user.id}","${user.total_uses}","${user.daily_uses_remaining}","${user.is_admin}","${user.is_moderator}","${user.is_banned}","${hasUnlimitedUses}"`;
      }).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `users_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Success",
      description: "User data exported successfully",
    });
  };

  const getUserRole = (user: UserProfile) => {
    if (user.is_admin) return "Admin";
    if (user.is_moderator) return "Moderator";
    return "User";
  };

  const getRoleColor = (user: UserProfile) => {
    if (user.is_admin) return "destructive";
    if (user.is_moderator) return "secondary";
    return "outline";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Search className="w-5 h-5 mr-2" />
          Advanced User Search & Management
        </h3>
        
        <Button onClick={exportUsers} variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export ({filteredUsers.length})
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by username or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
              <SelectItem value="moderator">Moderators</SelectItem>
              <SelectItem value="user">Users</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
              <SelectItem value="unlimited">Unlimited Uses</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">
              {filteredUsers.length} users found
            </span>
          </div>
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {selectedUsers.length} users selected
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={bulkAddUses}>
                Add 50 Uses
              </Button>
              <Button variant="outline" size="sm" onClick={bulkUnbanUsers}>
                Unban Selected
              </Button>
              <Button variant="destructive" size="sm" onClick={bulkBanUsers}>
                <Ban className="w-3 h-3 mr-1" />
                Ban Selected
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <div className="max-h-96 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Uses</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Total Uses</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => {
                const hasUnlimitedUses = user.daily_uses_remaining === 999999;
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={(checked) => handleUserSelect(user.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <span>{user.username || 'Unknown'}</span>
                        {hasUnlimitedUses && (
                          <Crown className="w-3 h-3 text-yellow-600" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleColor(user) as any}>
                        {getUserRole(user)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {hasUnlimitedUses ? (
                        <Badge variant="secondary">Unlimited</Badge>
                      ) : (
                        <span>{user.daily_uses_remaining}/5</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.is_banned ? "destructive" : "default"}>
                        {user.is_banned ? "Banned" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.tags && user.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {user.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{user.total_uses}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};
