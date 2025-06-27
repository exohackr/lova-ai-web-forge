
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Crown, Sparkles, Settings } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  id: string;
  username: string;
  display_style: string;
  daily_uses_remaining: number;
  total_uses: number;
}

export const AdminPanel = () => {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [targetUsername, setTargetUsername] = useState("");
  const [usesToGive, setUsesToGive] = useState("");
  const [displayStyle, setDisplayStyle] = useState(profile?.display_style || "normal");
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

      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const giveUnlimitedUses = async () => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ daily_uses_remaining: 999999 })
        .eq('id', profile.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to give unlimited uses",
          variant: "destructive",
        });
        return;
      }

      await refreshProfile();
      toast({
        title: "Success",
        description: "Unlimited uses granted!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to give unlimited uses",
        variant: "destructive",
      });
    }
  };

  const giveUsesToUser = async () => {
    if (!targetUsername || !usesToGive) return;

    try {
      const { data: targetUser, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', targetUsername)
        .single();

      if (fetchError || !targetUser) {
        toast({
          title: "Error",
          description: "User not found",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ 
          daily_uses_remaining: targetUser.daily_uses_remaining + parseInt(usesToGive)
        })
        .eq('username', targetUsername);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to give uses to user",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: `Gave ${usesToGive} uses to ${targetUsername}`,
      });
      
      setTargetUsername("");
      setUsesToGive("");
      fetchUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to give uses to user",
        variant: "destructive",
      });
    }
  };

  const updateDisplayStyle = async () => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_style: displayStyle })
        .eq('id', profile.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update display style",
          variant: "destructive",
        });
        return;
      }

      await refreshProfile();
      toast({
        title: "Success",
        description: "Display style updated!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update display style",
        variant: "destructive",
      });
    }
  };

  if (profile?.username !== 'diddy') {
    return null;
  }

  return (
    <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200">
      <div className="flex items-center space-x-2 mb-6">
        <Crown className="w-6 h-6 text-yellow-600" />
        <h2 className="text-2xl font-bold text-yellow-800">Admin Panel</h2>
        <Badge variant="secondary" className="bg-yellow-200 text-yellow-800">
          <Sparkles className="w-3 h-3 mr-1" />
          diddy
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Self Management */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Self Management</h3>
          
          <div className="space-y-2">
            <Button 
              onClick={giveUnlimitedUses}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              Give Myself Unlimited Uses
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="display-style">Display Style</Label>
            <Select value={displayStyle} onValueChange={setDisplayStyle}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="rainbow">🌈 Rainbow</SelectItem>
                <SelectItem value="sparkly-gold">✨ Sparkly Gold</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={updateDisplayStyle} variant="outline" className="w-full">
              <Settings className="w-4 h-4 mr-2" />
              Update Style
            </Button>
          </div>
        </div>

        {/* User Management */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">User Management</h3>
          
          <div className="space-y-2">
            <Label htmlFor="target-username">Target Username</Label>
            <Input
              id="target-username"
              placeholder="Enter username"
              value={targetUsername}
              onChange={(e) => setTargetUsername(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="uses-to-give">Uses to Give</Label>
            <Input
              id="uses-to-give"
              type="number"
              placeholder="Enter number of uses"
              value={usesToGive}
              onChange={(e) => setUsesToGive(e.target.value)}
            />
          </div>

          <Button 
            onClick={giveUsesToUser}
            disabled={!targetUsername || !usesToGive}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Give Uses to User
          </Button>
        </div>
      </div>

      {/* User List */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">All Users</h3>
        <div className="max-h-64 overflow-y-auto space-y-2">
          {users.map((user) => (
            <div key={user.id} className="flex justify-between items-center p-2 bg-white rounded border">
              <span className="font-medium">{user.username}</span>
              <div className="flex space-x-2 text-sm text-gray-600">
                <span>Uses: {user.daily_uses_remaining}</span>
                <span>Total: {user.total_uses}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
