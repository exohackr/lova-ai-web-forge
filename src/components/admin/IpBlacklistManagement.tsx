
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const IpBlacklistManagement = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [blacklistIp, setBlacklistIp] = useState("");
  const [blacklistReason, setBlacklistReason] = useState("");
  const [unblacklistIp, setUnblacklistIp] = useState("");

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

  return (
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
  );
};
