
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, Download, Trash2 } from "lucide-react";
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
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter(user => {
        switch (roleFilter) {
          case "admin": return user.is_admin;
          case "moderator": return user.is_moderator;
          case "subscriber": return user.has_subscription;
          case "regular": return !user.is_admin && !user.is_moderator && !user.has_subscription;
          default: return true;
        }
      });
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(user => {
        switch (statusFilter) {
          case "banned": return user.is_banned;
          case "active": return !user.is_banned;
          case "unlimited": return user.daily_uses_remaining === 999999;
          default: return true;
        }
      });
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, statusFilter]);

  const exportUsers = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Username,Email,Total Uses,Daily Uses,Role,Status,Created At\n" +
      filteredUsers.map(user => 
        `${user.username},${user.id},${user.total_uses},${user.daily_uses_remaining},` +
        `${user.is_admin ? 'Admin' : user.is_moderator ? 'Moderator' : 'User'},` +
        `${user.is_banned ? 'Banned' : 'Active'},${user.created_at}`
      ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "users_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Success",
      description: "User data exported successfully",
    });
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
        .update({ is_banned: false, ban_expires_at: null })
        .in('id', selectedUsers);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Unbanned ${selectedUsers.length} users`,
      });

      setSelectedUsers([]);
      onUserUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unban users",
        variant: "destructive",
      });
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center">
        <Search className="w-5 h-5 mr-2" />
        Advanced User Search & Management
      </h3>

      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-64">
          <Input
            placeholder="Search by username or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
            <SelectItem value="moderator">Moderators</SelectItem>
            <SelectItem value="subscriber">Subscribers</SelectItem>
            <SelectItem value="regular">Regular Users</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
            <SelectItem value="unlimited">Unlimited Uses</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={exportUsers} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-1" />
          Export CSV
        </Button>
      </div>

      {selectedUsers.length > 0 && (
        <div className="flex gap-2 p-4 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium">{selectedUsers.length} users selected:</span>
          <Button onClick={bulkBanUsers} variant="destructive" size="sm">
            <Trash2 className="w-4 h-4 mr-1" />
            Bulk Ban
          </Button>
          <Button onClick={bulkUnbanUsers} variant="outline" size="sm">
            Bulk Unban
          </Button>
          <Button onClick={() => setSelectedUsers([])} variant="ghost" size="sm">
            Clear Selection
          </Button>
        </div>
      )}

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Select</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Uses</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.slice(0, 50).map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => toggleUserSelection(user.id)}
                    className="w-4 h-4"
                  />
                </TableCell>
                <TableCell className="font-medium">{user.username}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {user.is_admin && <Badge variant="destructive">Admin</Badge>}
                    {user.is_moderator && <Badge variant="secondary">Mod</Badge>}
                    {user.has_subscription && <Badge variant="default">Sub</Badge>}
                  </div>
                </TableCell>
                <TableCell>
                  {user.is_banned ? (
                    <Badge variant="destructive">Banned</Badge>
                  ) : (
                    <Badge variant="default">Active</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {user.daily_uses_remaining === 999999 ? (
                    <Badge variant="secondary">Unlimited</Badge>
                  ) : (
                    `${user.daily_uses_remaining}/${user.total_uses}`
                  )}
                </TableCell>
                <TableCell>
                  {new Date(user.created_at || '').toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredUsers.length > 50 && (
        <p className="text-sm text-gray-600 text-center">
          Showing first 50 of {filteredUsers.length} results. Use filters to narrow down.
        </p>
      )}
    </div>
  );
};
