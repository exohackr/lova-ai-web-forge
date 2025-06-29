
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Ban, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BanManagementProps {
  onUserUpdate: () => void;
}

export const BanManagement = ({ onUserUpdate }: BanManagementProps) => {
  const { toast } = useToast();
  const [banUsername, setBanUsername] = useState("");
  const [unbanUsername, setUnbanUsername] = useState("");
  const [tempBanUsername, setTempBanUsername] = useState("");
  const [tempBanDays, setTempBanDays] = useState("");

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
      onUserUpdate();
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
      onUserUpdate();
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
      onUserUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to temp ban user",
        variant: "destructive",
      });
    }
  };

  return (
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
  );
};
