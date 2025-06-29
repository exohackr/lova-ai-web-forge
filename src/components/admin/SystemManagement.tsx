
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Key, Eye } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const SystemManagement = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [ipLookupUsername, setIpLookupUsername] = useState("");
  const [foundUserIp, setFoundUserIp] = useState("");

  useEffect(() => {
    loadGeminiApiKey();
  }, []);

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

      const ipValue = data.registration_ip ? String(data.registration_ip) : "No IP recorded";
      setFoundUserIp(ipValue);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to lookup user IP",
        variant: "destructive",
      });
    }
  };

  return (
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
  );
};
