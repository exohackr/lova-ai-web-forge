
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Shield } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UserManagementProps {
  onUserUpdate: () => void;
}

export const UserManagement = ({ onUserUpdate }: UserManagementProps) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [targetUsername, setTargetUsername] = useState("");
  const [usesToGive, setUsesToGive] = useState("");
  const [adminUsername, setAdminUsername] = useState("");
  const [removeAdminUsername, setRemoveAdminUsername] = useState("");

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
      onUserUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to give uses to user",
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
      onUserUpdate();
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
      onUserUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove admin privileges",
        variant: "destructive",
      });
    }
  };

  return (
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
  );
};
