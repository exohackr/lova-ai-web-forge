
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { UserPlus, UserMinus, Infinity, ToggleLeft, ToggleRight } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AdvancedUserManagementProps {
  onUserUpdate: () => void;
}

export const AdvancedUserManagement = ({ onUserUpdate }: AdvancedUserManagementProps) => {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [addUsesUsername, setAddUsesUsername] = useState("");
  const [addUsesAmount, setAddUsesAmount] = useState("");
  const [removeUsesUsername, setRemoveUsesUsername] = useState("");
  const [removeUsesAmount, setRemoveUsesAmount] = useState("");
  const [unlimitedUsername, setUnlimitedUsername] = useState("");
  const [removeUnlimitedUsername, setRemoveUnlimitedUsername] = useState("");
  const [isUnlimitedEnabled, setIsUnlimitedEnabled] = useState(false);

  // Update the unlimited status when profile changes
  useEffect(() => {
    if (profile) {
      const hasUnlimited = profile.daily_uses_remaining === 999999;
      console.log('Profile updated:', profile.daily_uses_remaining, 'hasUnlimited:', hasUnlimited);
      setIsUnlimitedEnabled(hasUnlimited);
    }
  }, [profile]);

  const addUsesToUser = async () => {
    if (!addUsesUsername || !addUsesAmount) {
      toast({
        title: "Error",
        description: "Please enter username and amount",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: targetUser, error: fetchError } = await supabase
        .from('profiles')
        .select('daily_uses_remaining')
        .eq('username', addUsesUsername)
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
          daily_uses_remaining: targetUser.daily_uses_remaining + parseInt(addUsesAmount)
        })
        .eq('username', addUsesUsername);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Added ${addUsesAmount} uses to ${addUsesUsername}`,
      });
      
      setAddUsesUsername("");
      setAddUsesAmount("");
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

  const removeUsesFromUser = async () => {
    if (!removeUsesUsername || !removeUsesAmount) {
      toast({
        title: "Error",
        description: "Please enter username and amount",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: targetUser, error: fetchError } = await supabase
        .from('profiles')
        .select('daily_uses_remaining')
        .eq('username', removeUsesUsername)
        .single();

      if (fetchError || !targetUser) {
        toast({
          title: "Error",
          description: "User not found",
          variant: "destructive",
        });
        return;
      }

      const newAmount = Math.max(0, targetUser.daily_uses_remaining - parseInt(removeUsesAmount));

      const { error } = await supabase
        .from('profiles')
        .update({ daily_uses_remaining: newAmount })
        .eq('username', removeUsesUsername);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Removed ${removeUsesAmount} uses from ${removeUsesUsername}`,
      });
      
      setRemoveUsesUsername("");
      setRemoveUsesAmount("");
      onUserUpdate();
    } catch (error) {
      console.error('Error removing uses:', error);
      toast({
        title: "Error",
        description: "Failed to remove uses",
        variant: "destructive",
      });
    }
  };

  const toggleUnlimitedUses = async () => {
    if (!profile) return;

    try {
      const newAmount = isUnlimitedEnabled ? 5 : 999999;
      console.log('Toggling unlimited uses. Current:', profile.daily_uses_remaining, 'New:', newAmount);
      
      const { error } = await supabase
        .from('profiles')
        .update({ daily_uses_remaining: newAmount })
        .eq('id', profile.id);

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }

      // Refresh the profile to get updated data
      await refreshProfile();
      
      toast({
        title: "Success",
        description: `Unlimited uses ${!isUnlimitedEnabled ? 'enabled' : 'disabled'}`,
      });
      onUserUpdate();
    } catch (error) {
      console.error('Error toggling unlimited uses:', error);
      toast({
        title: "Error",
        description: "Failed to toggle unlimited uses",
        variant: "destructive",
      });
    }
  };

  const giveUnlimitedUses = async () => {
    if (!unlimitedUsername) {
      toast({
        title: "Error",
        description: "Please enter a username",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: targetUser, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', unlimitedUsername)
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
        .update({ daily_uses_remaining: 999999 })
        .eq('username', unlimitedUsername);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Gave unlimited uses to ${unlimitedUsername}`,
      });
      setUnlimitedUsername("");
      onUserUpdate();
    } catch (error) {
      console.error('Error giving unlimited uses:', error);
      toast({
        title: "Error",
        description: "Failed to give unlimited uses",
        variant: "destructive",
      });
    }
  };

  const removeUnlimitedUses = async () => {
    if (!removeUnlimitedUsername) {
      toast({
        title: "Error",
        description: "Please enter a username",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: targetUser, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', removeUnlimitedUsername)
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
        .update({ daily_uses_remaining: 5 })
        .eq('username', removeUnlimitedUsername);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Removed unlimited uses from ${removeUnlimitedUsername}`,
      });
      setRemoveUnlimitedUsername("");
      onUserUpdate();
    } catch (error) {
      console.error('Error removing unlimited uses:', error);
      toast({
        title: "Error",
        description: "Failed to remove unlimited uses",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center">
        <UserPlus className="w-5 h-5 mr-2" />
        Advanced User Management
      </h3>
      
      <div className="space-y-2">
        <Label>Add Uses to User</Label>
        <div className="flex space-x-2">
          <Input
            placeholder="Username"
            value={addUsesUsername}
            onChange={(e) => setAddUsesUsername(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Amount"
            value={addUsesAmount}
            onChange={(e) => setAddUsesAmount(e.target.value)}
          />
          <Button onClick={addUsesToUser} size="sm">
            Add
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Remove Uses from User</Label>
        <div className="flex space-x-2">
          <Input
            placeholder="Username"
            value={removeUsesUsername}
            onChange={(e) => setRemoveUsesUsername(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Amount"
            value={removeUsesAmount}
            onChange={(e) => setRemoveUsesAmount(e.target.value)}
          />
          <Button onClick={removeUsesFromUser} variant="destructive" size="sm">
            Remove
          </Button>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label>Self Unlimited Uses Control</Label>
        <div className="flex items-center space-x-2">
          <Button onClick={toggleUnlimitedUses} variant="outline" size="sm">
            {isUnlimitedEnabled ? <ToggleRight className="w-4 h-4 mr-1" /> : <ToggleLeft className="w-4 h-4 mr-1" />}
            {isUnlimitedEnabled ? 'Disable' : 'Enable'} Unlimited Uses
          </Button>
          <Badge variant={isUnlimitedEnabled ? "default" : "secondary"}>
            <Infinity className="w-3 h-3 mr-1" />
            {isUnlimitedEnabled ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        <div className="text-xs text-gray-600">
          Current uses: {profile?.daily_uses_remaining || 0}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Give Unlimited Uses</Label>
        <div className="flex space-x-2">
          <Input
            placeholder="Username"
            value={unlimitedUsername}
            onChange={(e) => setUnlimitedUsername(e.target.value)}
          />
          <Button onClick={giveUnlimitedUses} size="sm">
            Give Unlimited
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Remove Unlimited Uses</Label>
        <div className="flex space-x-2">
          <Input
            placeholder="Username"
            value={removeUnlimitedUsername}
            onChange={(e) => setRemoveUnlimitedUsername(e.target.value)}
          />
          <Button onClick={removeUnlimitedUses} variant="destructive" size="sm">
            Remove Unlimited
          </Button>
        </div>
      </div>
    </div>
  );
};
