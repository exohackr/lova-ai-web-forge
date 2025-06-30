
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
  const [moderatorUsername, setModeratorUsername] = useState("");
  const [removeModerator, setRemoveModerator] = useState("");
  const [subscriptionUsername, setSubscriptionUsername] = useState("");
  const [subscriptionType, setSubscriptionType] = useState("basic");
  const [removeSubscriptionUsername, setRemoveSubscriptionUsername] = useState("");
  const [tagUsername, setTagUsername] = useState("");
  const [tagValue, setTagValue] = useState("");
  const [removeTagUsername, setRemoveTagUsername] = useState("");
  const [colorUsername, setColorUsername] = useState("");
  const [colorValue, setColorValue] = useState("#000000");
  const [usernameToChange, setUsernameToChange] = useState("");
  const [newUsername, setNewUsername] = useState("");

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

  const makeUserModerator = async () => {
    if (!moderatorUsername) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_moderator: true, daily_uses_remaining: 999999 })
        .eq('username', moderatorUsername);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to make user moderator",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: `${moderatorUsername} is now a moderator with unlimited uses`,
      });
      setModeratorUsername("");
      onUserUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to make user moderator",
        variant: "destructive",
      });
    }
  };

  const removeUserModerator = async () => {
    if (!removeModerator) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_moderator: false, daily_uses_remaining: 5 })
        .eq('username', removeModerator);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to remove moderator privileges",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: `Removed moderator privileges from ${removeModerator}`,
      });
      setRemoveModerator("");
      onUserUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove moderator privileges",
        variant: "destructive",
      });
    }
  };

  const giveUserSubscription = async () => {
    if (!subscriptionUsername) return;

    try {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      const dailyUses = subscriptionType === 'premium' ? 200 : 50;

      const { error } = await supabase
        .from('profiles')
        .update({ 
          has_subscription: true,
          subscription_type: subscriptionType,
          subscription_expires_at: expiresAt.toISOString(),
          daily_uses_remaining: dailyUses
        })
        .eq('username', subscriptionUsername);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to give subscription",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: `Gave ${subscriptionType} subscription to ${subscriptionUsername}`,
      });
      setSubscriptionUsername("");
      onUserUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to give subscription",
        variant: "destructive",
      });
    }
  };

  const removeUserSubscription = async () => {
    if (!removeSubscriptionUsername) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          has_subscription: false,
          subscription_type: null,
          subscription_expires_at: null,
          daily_uses_remaining: 5
        })
        .eq('username', removeSubscriptionUsername);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to remove subscription",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: `Removed subscription from ${removeSubscriptionUsername}`,
      });
      setRemoveSubscriptionUsername("");
      onUserUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove subscription",
        variant: "destructive",
      });
    }
  };

  const giveUserTag = async () => {
    if (!tagUsername || !tagValue) return;

    try {
      const { data: user, error: fetchError } = await supabase
        .from('profiles')
        .select('tags')
        .eq('username', tagUsername)
        .single();

      if (fetchError) {
        toast({
          title: "Error",
          description: "User not found",
          variant: "destructive",
        });
        return;
      }

      const currentTags = user.tags || [];
      const newTags = [...currentTags, tagValue];

      const { error } = await supabase
        .from('profiles')
        .update({ tags: newTags })
        .eq('username', tagUsername);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to give tag",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: `Gave tag "${tagValue}" to ${tagUsername}`,
      });
      setTagUsername("");
      setTagValue("");
      onUserUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to give tag",
        variant: "destructive",
      });
    }
  };

  const removeUserTag = async () => {
    if (!removeTagUsername) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ tags: [] })
        .eq('username', removeTagUsername);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to remove tags",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: `Removed all tags from ${removeTagUsername}`,
      });
      setRemoveTagUsername("");
      onUserUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove tags",
        variant: "destructive",
      });
    }
  };

  const updateUserColor = async () => {
    if (!colorUsername) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ custom_color: colorValue })
        .eq('username', colorUsername);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update user color",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: `Updated ${colorUsername}'s color`,
      });
      setColorUsername("");
      onUserUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user color",
        variant: "destructive",
      });
    }
  };

  const changeUsername = async () => {
    if (!usernameToChange || !newUsername) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          username: newUsername,
          last_username_change: new Date().toISOString()
        })
        .eq('username', usernameToChange);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to change username",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: `Changed ${usernameToChange} to ${newUsername}`,
      });
      setUsernameToChange("");
      setNewUsername("");
      onUserUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change username",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
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

      <Separator />

      <div className="space-y-2">
        <Label>Moderator Management</Label>
        <div className="flex space-x-2">
          <Input
            placeholder="Username to make moderator"
            value={moderatorUsername}
            onChange={(e) => setModeratorUsername(e.target.value)}
          />
          <Button onClick={makeUserModerator} size="sm">
            Make Moderator
          </Button>
        </div>
        <div className="flex space-x-2">
          <Input
            placeholder="Username to remove moderator"
            value={removeModerator}
            onChange={(e) => setRemoveModerator(e.target.value)}
          />
          <Button onClick={removeUserModerator} variant="destructive" size="sm">
            Remove Moderator
          </Button>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label>Subscription Management</Label>
        <div className="flex space-x-2">
          <Input
            placeholder="Username"
            value={subscriptionUsername}
            onChange={(e) => setSubscriptionUsername(e.target.value)}
          />
          <select 
            value={subscriptionType} 
            onChange={(e) => setSubscriptionType(e.target.value)}
            className="px-2 py-1 border rounded"
          >
            <option value="basic">Basic</option>
            <option value="premium">Premium</option>
          </select>
          <Button onClick={giveUserSubscription} size="sm">
            Give Sub
          </Button>
        </div>
        <div className="flex space-x-2">
          <Input
            placeholder="Username to remove subscription"
            value={removeSubscriptionUsername}
            onChange={(e) => setRemoveSubscriptionUsername(e.target.value)}
          />
          <Button onClick={removeUserSubscription} variant="destructive" size="sm">
            Remove Sub
          </Button>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label>Tag Management</Label>
        <div className="flex space-x-2">
          <Input
            placeholder="Username"
            value={tagUsername}
            onChange={(e) => setTagUsername(e.target.value)}
          />
          <Input
            placeholder="Tag value"
            value={tagValue}
            onChange={(e) => setTagValue(e.target.value)}
          />
          <Button onClick={giveUserTag} size="sm">
            Give Tag
          </Button>
        </div>
        <div className="flex space-x-2">
          <Input
            placeholder="Username to remove tags"
            value={removeTagUsername}
            onChange={(e) => setRemoveTagUsername(e.target.value)}
          />
          <Button onClick={removeUserTag} variant="destructive" size="sm">
            Remove Tags
          </Button>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label>Color Management</Label>
        <div className="flex space-x-2">
          <Input
            placeholder="Username"
            value={colorUsername}
            onChange={(e) => setColorUsername(e.target.value)}
          />
          <input
            type="color"
            value={colorValue}
            onChange={(e) => setColorValue(e.target.value)}
            className="w-10 h-8 border rounded"
          />
          <Button onClick={updateUserColor} size="sm">
            Set Color
          </Button>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label>Username Change</Label>
        <div className="flex space-x-2">
          <Input
            placeholder="Current username"
            value={usernameToChange}
            onChange={(e) => setUsernameToChange(e.target.value)}
          />
          <Input
            placeholder="New username"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
          />
          <Button onClick={changeUsername} size="sm">
            Change
          </Button>
        </div>
      </div>
    </div>
  );
};
