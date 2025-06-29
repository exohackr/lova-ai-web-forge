
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Crown, Sparkles, Settings, Shield, Ban, Key, Eye, Clock } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  id: string;
  username: string;
  display_style: string;
  daily_uses_remaining: number;
  total_uses: number;
  is_admin: boolean;
  is_banned: boolean;
  ban_expires_at: string | null;
  registration_ip: string | null;
}

export const AdminPanel = () => {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [targetUsername, setTargetUsername] = useState("");
  const [usesToGive, setUsesToGive] = useState("");
  const [displayStyle, setDisplayStyle] = useState(profile?.display_style || "normal");
  const [users, setUsers] = useState<UserProfile[]>([]);
  
  // New admin features state
  const [adminUsername, setAdminUsername] = useState("");
  const [removeAdminUsername, setRemoveAdminUsername] = useState("");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [banUsername, setBanUsername] = useState("");
  const [unbanUsername, setUnbanUsername] = useState("");
  const [tempBanUsername, setTempBanUsername] = useState("");
  const [tempBanDays, setTempBanDays] = useState("");
  const [ipLookupUsername, setIpLookupUsername] = useState("");
  const [foundUserIp, setFoundUserIp] = useState("");
  const [blacklistIp, setBlacklistIp] = useState("");
  const [blacklistReason, setBlacklistReason] = useState("");
  const [unblacklistIp, setUnblacklistIp] = useState("");

  useEffect(() => {
    fetchUsers();
    loadGeminiApiKey();
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

  const loadGeminiApiKey = async () => {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('key_value')
        .eq('key_name', 'GEMINI_API_KEY')
        .single();

      if (data && !error) {
        setGeminiApiKey('••••••••••••••••'); // Show masked value
      }
    } catch (error) {
      console.error('Error loading API key:', error);
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

  const makeUserAdmin = async () => {
    if (!adminUsername) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: true })
        .eq('username', adminUsername);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to make user admin",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: `${adminUsername} is now an admin`,
      });
      setAdminUsername("");
      fetchUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to make user admin",
        variant: "destructive",
      });
    }
  };

  const removeUserAdmin = async () => {
    if (!removeAdminUsername) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: false })
        .eq('username', removeAdminUsername);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to remove admin privileges",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: `Removed admin privileges from ${removeAdminUsername}`,
      });
      setRemoveAdminUsername("");
      fetchUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove admin privileges",
        variant: "destructive",
      });
    }
  };

  const updateGeminiApiKey = async () => {
    if (!geminiApiKey || geminiApiKey === '••••••••••••••••') return;

    try {
      const { error } = await supabase
        .from('api_keys')
        .upsert({
          key_name: 'GEMINI_API_KEY',
          key_value: geminiApiKey,
          updated_by: profile?.id
        });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update API key",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Gemini API key updated successfully",
      });
      setGeminiApiKey('••••••••••••••••');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update API key",
        variant: "destructive",
      });
    }
  };

  const banUser = async () => {
    if (!banUsername) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: true, ban_expires_at: null })
        .eq('username', banUsername);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to ban user",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: `${banUsername} has been permanently banned`,
      });
      setBanUsername("");
      fetchUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to ban user",
        variant: "destructive",
      });
    }
  };

  const unbanUser = async () => {
    if (!unbanUsername) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: false, ban_expires_at: null })
        .eq('username', unbanUsername);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to unban user",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: `${unbanUsername} has been unbanned`,
      });
      setUnbanUsername("");
      fetchUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unban user",
        variant: "destructive",
      });
    }
  };

  const tempBanUser = async () => {
    if (!tempBanUsername || !tempBanDays) return;

    try {
      const banExpiresAt = new Date();
      banExpiresAt.setDate(banExpiresAt.getDate() + parseInt(tempBanDays));

      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_banned: true, 
          ban_expires_at: banExpiresAt.toISOString()
        })
        .eq('username', tempBanUsername);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to temp ban user",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: `${tempBanUsername} has been temp banned for ${tempBanDays} days`,
      });
      setTempBanUsername("");
      setTempBanDays("");
      fetchUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to temp ban user",
        variant: "destructive",
      });
    }
  };

  const lookupUserIp = async () => {
    if (!ipLookupUsername) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('registration_ip')
        .eq('username', ipLookupUsername)
        .single();

      if (error || !data) {
        toast({
          title: "Error",
          description: "User not found",
          variant: "destructive",
        });
        return;
      }

      setFoundUserIp(data.registration_ip || "No IP recorded");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to lookup user IP",
        variant: "destructive",
      });
    }
  };

  const blacklistIpAddress = async () => {
    if (!blacklistIp) return;

    try {
      const { error } = await supabase
        .from('blacklisted_ips')
        .insert({
          ip_address: blacklistIp,
          reason: blacklistReason || 'No reason provided',
          created_by: profile?.id
        });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to blacklist IP",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: `IP ${blacklistIp} has been blacklisted`,
      });
      setBlacklistIp("");
      setBlacklistReason("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to blacklist IP",
        variant: "destructive",
      });
    }
  };

  const unblacklistIpAddress = async () => {
    if (!unblacklistIp) return;

    try {
      const { error } = await supabase
        .from('blacklisted_ips')
        .delete()
        .eq('ip_address', unblacklistIp);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to remove IP from blacklist",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: `IP ${unblacklistIp} has been removed from blacklist`,
      });
      setUnblacklistIp("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove IP from blacklist",
        variant: "destructive",
      });
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Self Management */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Self Management
          </h3>
          
          <Button 
            onClick={giveUnlimitedUses}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            Give Myself Unlimited Uses
          </Button>

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
              Update Style
            </Button>
          </div>
        </div>

        {/* User Management */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            User Management
          </h3>
          
          <div className="space-y-2">
            <Label>Give Uses to User</Label>
            <Input
              placeholder="Username"
              value={targetUsername}
              onChange={(e) => setTargetUsername(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Number of uses"
              value={usesToGive}
              onChange={(e) => setUsesToGive(e.target.value)}
            />
            <Button 
              onClick={giveUsesToUser}
              disabled={!targetUsername || !usesToGive}
              className="w-full"
            >
              Give Uses
            </Button>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Admin Management</Label>
            <div className="flex space-x-2">
              <Input
                placeholder="Username to make admin"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
              />
              <Button onClick={makeUserAdmin} size="sm">
                Make Admin
              </Button>
            </div>
            <div className="flex space-x-2">
              <Input
                placeholder="Username to remove admin"
                value={removeAdminUsername}
                onChange={(e) => setRemoveAdminUsername(e.target.value)}
              />
              <Button onClick={removeUserAdmin} variant="destructive" size="sm">
                Remove Admin
              </Button>
            </div>
          </div>
        </div>

        {/* System Management */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <Key className="w-5 h-5 mr-2" />
            System Management
          </h3>

          <div className="space-y-2">
            <Label>Gemini API Key</Label>
            <Input
              type="password"
              placeholder="Enter new API key"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
            />
            <Button onClick={updateGeminiApiKey} className="w-full">
              Update API Key
            </Button>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>IP Lookup</Label>
            <div className="flex space-x-2">
              <Input
                placeholder="Username"
                value={ipLookupUsername}
                onChange={(e) => setIpLookupUsername(e.target.value)}
              />
              <Button onClick={lookupUserIp} size="sm">
                <Eye className="w-4 h-4" />
              </Button>
            </div>
            {foundUserIp && (
              <p className="text-sm text-gray-600 bg-gray-100 p-2 rounded">
                IP: {foundUserIp}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Ban Management Section */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <Ban className="w-5 h-5 mr-2" />
            Ban Management
          </h3>

          <div className="space-y-2">
            <Label>Permanent Ban</Label>
            <div className="flex space-x-2">
              <Input
                placeholder="Username to ban"
                value={banUsername}
                onChange={(e) => setBanUsername(e.target.value)}
              />
              <Button onClick={banUser} variant="destructive" size="sm">
                Ban
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Unban User</Label>
            <div className="flex space-x-2">
              <Input
                placeholder="Username to unban"
                value={unbanUsername}
                onChange={(e) => setUnbanUsername(e.target.value)}
              />
              <Button onClick={unbanUser} variant="outline" size="sm">
                Unban
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Temporary Ban</Label>
            <div className="flex space-x-2">
              <Input
                placeholder="Username"
                value={tempBanUsername}
                onChange={(e) => setTempBanUsername(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Days"
                value={tempBanDays}
                onChange={(e) => setTempBanDays(e.target.value)}
              />
              <Button onClick={tempBanUser} variant="destructive" size="sm">
                <Clock className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* IP Blacklist Management */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">IP Blacklist</h3>

          <div className="space-y-2">
            <Label>Blacklist IP</Label>
            <Input
              placeholder="IP Address"
              value={blacklistIp}
              onChange={(e) => setBlacklistIp(e.target.value)}
            />
            <Input
              placeholder="Reason (optional)"
              value={blacklistReason}
              onChange={(e) => setBlacklistReason(e.target.value)}
            />
            <Button onClick={blacklistIpAddress} variant="destructive" className="w-full">
              Blacklist IP
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Remove from Blacklist</Label>
            <div className="flex space-x-2">
              <Input
                placeholder="IP Address"
                value={unblacklistIp}
                onChange={(e) => setUnblacklistIp(e.target.value)}
              />
              <Button onClick={unblacklistIpAddress} variant="outline" size="sm">
                Remove
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* User List */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">All Users</h3>
        <div className="max-h-64 overflow-y-auto space-y-2">
          {users.map((user) => (
            <div key={user.id} className="flex justify-between items-center p-3 bg-white rounded border">
              <div className="flex items-center space-x-3">
                <span className="font-medium">{user.username}</span>
                {user.is_admin && <Badge variant="secondary">Admin</Badge>}
                {user.is_banned && <Badge variant="destructive">Banned</Badge>}
              </div>
              <div className="flex space-x-4 text-sm text-gray-600">
                <span>Uses: {user.daily_uses_remaining}</span>
                <span>Total: {user.total_uses}</span>
                {user.registration_ip && <span>IP: {user.registration_ip}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
