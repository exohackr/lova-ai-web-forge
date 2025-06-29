
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const SelfManagement = () => {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [displayStyle, setDisplayStyle] = useState(profile?.display_style || "normal");

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

  return (
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
  );
};
