import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Key, Eye, Lock, Unlock, Globe, Bell, Mail } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const SystemManagement = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [ipLookupUsername, setIpLookupUsername] = useState("");
  const [foundUserIp, setFoundUserIp] = useState("");
  const [aiEnabled, setAiEnabled] = useState(true);
  const [siteName, setSiteName] = useState("");
  const [siteIcon, setSiteIcon] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [paypalBasic, setPaypalBasic] = useState("");
  const [paypalPremium, setPaypalPremium] = useState("");
  const [paypalBusiness, setPaypalBusiness] = useState("");
  const [usernameCooldown, setUsernameCooldown] = useState("14");
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementMessage, setAnnouncementMessage] = useState("");
  const [announcementType, setAnnouncementType] = useState("info");
  const [announcementDuration, setAnnouncementDuration] = useState("");
  const [announcementPersistent, setAnnouncementPersistent] = useState(false);

  useEffect(() => {
    loadSystemSettings();
  }, []);

  const loadSystemSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_name, setting_value');

      if (data && !error) {
        const settings = data.reduce((acc, setting) => {
          acc[setting.setting_name] = setting.setting_value;
          return acc;
        }, {} as any);

        setAiEnabled(settings.ai_enabled === 'true');
        setSiteName(settings.site_name || '');
        setSiteIcon(settings.site_icon || '');
        setContactEmail(settings.contact_email || '');
        setAiPrompt(settings.ai_prompt || '');
        setOriginalPrompt(settings.ai_prompt || '');
        setPaypalBasic(settings.paypal_link_basic || '');
        setPaypalPremium(settings.paypal_link_premium || '');
        setPaypalBusiness(settings.paypal_link_business || '');
        setUsernameCooldown(settings.username_cooldown_days || '14');
      }

      // Load API key (masked)
      const { data: apiData } = await supabase
        .from('api_keys')
        .select('key_value')
        .eq('key_name', 'GEMINI_API_KEY')
        .single();

      if (apiData) {
        setGeminiApiKey('••••••••••••••••');
      }
    } catch (error) {
      console.error('Error loading system settings:', error);
    }
  };

  const updateSystemSetting = async (settingName: string, settingValue: string) => {
    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          setting_name: settingName,
          setting_value: settingValue,
          updated_by: profile?.id
        });

      if (error) {
        console.error('Error updating setting:', error);
        throw error;
      }
      return true;
    } catch (error) {
      console.error('Error in updateSystemSetting:', error);
      return false;
    }
  };

  const toggleAi = async () => {
    const newState = !aiEnabled;
    const success = await updateSystemSetting('ai_enabled', newState.toString());
    
    if (success) {
      setAiEnabled(newState);
      toast({
        title: "Success",
        description: `AI ${newState ? 'unlocked' : 'locked down'}`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update AI status",
        variant: "destructive",
      });
    }
  };

  const updateSiteSettings = async () => {
    const updates = [
      updateSystemSetting('site_name', siteName),
      updateSystemSetting('site_icon', siteIcon),
      updateSystemSetting('contact_email', contactEmail),
      updateSystemSetting('username_cooldown_days', usernameCooldown)
    ];

    const results = await Promise.all(updates);
    
    if (results.every(Boolean)) {
      toast({
        title: "Success",
        description: "Site settings updated",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update some settings",
        variant: "destructive",
      });
    }
  };

  const updateAiPrompt = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Error",
        description: "AI prompt cannot be empty",
        variant: "destructive",
      });
      return;
    }

    const confirmed = window.confirm("Are you sure you want to update the AI prompt? This will affect all future generations.");
    if (!confirmed) return;

    console.log('Updating AI prompt to:', aiPrompt);
    
    const success = await updateSystemSetting('ai_prompt', aiPrompt);
    
    if (success) {
      setOriginalPrompt(aiPrompt);
      toast({
        title: "Success",
        description: "AI prompt updated successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update AI prompt",
        variant: "destructive",
      });
    }
  };

  const updatePaypalLinks = async () => {
    console.log('Updating PayPal links:', { paypalBasic, paypalPremium, paypalBusiness });
    
    const updates = [
      updateSystemSetting('paypal_link_basic', paypalBasic),
      updateSystemSetting('paypal_link_premium', paypalPremium),
      updateSystemSetting('paypal_link_business', paypalBusiness)
    ];

    const results = await Promise.all(updates);
    
    if (results.every(Boolean)) {
      toast({
        title: "Success",
        description: "PayPal links updated successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update PayPal links",
        variant: "destructive",
      });
    }
  };

  const createAnnouncement = async () => {
    if (!announcementTitle.trim() || !announcementMessage.trim()) {
      toast({
        title: "Error",
        description: "Title and message are required",
        variant: "destructive",
      });
      return;
    }

    try {
      let expiresAt = null;
      if (announcementDuration && !announcementPersistent) {
        const duration = parseInt(announcementDuration);
        if (duration > 0) {
          expiresAt = new Date();
          expiresAt.setHours(expiresAt.getHours() + duration);
        }
      }

      console.log('Creating announcement:', {
        title: announcementTitle,
        message: announcementMessage,
        type: announcementType,
        is_persistent: announcementPersistent,
        expires_at: expiresAt?.toISOString(),
        created_by: profile?.id
      });

      const { error } = await supabase
        .from('announcements')
        .insert({
          title: announcementTitle,
          message: announcementMessage,
          type: announcementType,
          is_persistent: announcementPersistent,
          expires_at: expiresAt?.toISOString(),
          created_by: profile?.id
        });

      if (error) {
        console.error('Error creating announcement:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Announcement created successfully",
      });

      // Reset form
      setAnnouncementTitle("");
      setAnnouncementMessage("");
      setAnnouncementDuration("");
      setAnnouncementPersistent(false);
      setAnnouncementType("info");
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast({
        title: "Error",
        description: "Failed to create announcement",
        variant: "destructive",
      });
    }
  };

  const updateGeminiApiKey = async () => {
    if (!geminiApiKey || geminiApiKey === '••••••••••••••••') {
      toast({
        title: "Error",
        description: "Please enter a new API key",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('api_keys')
        .upsert({
          key_name: 'GEMINI_API_KEY',
          key_value: geminiApiKey,
          updated_by: profile?.id
        });

      if (error) {
        console.error('Error updating API key:', error);
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
      console.error('Error updating API key:', error);
      toast({
        title: "Error",
        description: "Failed to update API key",
        variant: "destructive",
      });
    }
  };

  const lookupUserIp = async () => {
    if (!ipLookupUsername.trim()) {
      toast({
        title: "Error",
        description: "Please enter a username",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Looking up IP for username:', ipLookupUsername);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('registration_ip')
        .eq('username', ipLookupUsername)
        .single();

      if (error || !data) {
        console.error('User lookup error:', error);
        toast({
          title: "Error",
          description: "User not found",
          variant: "destructive",
        });
        setFoundUserIp("");
        return;
      }

      const ipValue = data.registration_ip ? String(data.registration_ip) : "No IP recorded";
      console.log('Found IP:', ipValue);
      setFoundUserIp(ipValue);
      
      toast({
        title: "Success",
        description: `IP found for user ${ipLookupUsername}`,
      });
    } catch (error) {
      console.error('Error looking up user IP:', error);
      toast({
        title: "Error",
        description: "Failed to lookup user IP",
        variant: "destructive",
      });
      setFoundUserIp("");
    }
  };

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center">
        <Key className="w-5 h-5 mr-2" />
        System Management
      </h3>

      <div className="space-y-2">
        <Button 
          onClick={toggleAi}
          className={`w-full ${aiEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {aiEnabled ? <Lock className="w-4 h-4 mr-2" /> : <Unlock className="w-4 h-4 mr-2" />}
          {aiEnabled ? 'Lockdown AI' : 'Unlock AI'}
        </Button>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label>Site Settings</Label>
        <Input
          placeholder="Site Name"
          value={siteName}
          onChange={(e) => setSiteName(e.target.value)}
        />
        <Input
          placeholder="Site Icon URL"
          value={siteIcon}
          onChange={(e) => setSiteIcon(e.target.value)}
        />
        <Input
          placeholder="Contact Email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
        />
        <Input
          type="number"
          placeholder="Username Change Cooldown (days)"
          value={usernameCooldown}
          onChange={(e) => setUsernameCooldown(e.target.value)}
        />
        <Button onClick={updateSiteSettings} className="w-full">
          <Globe className="w-4 h-4 mr-2" />
          Update Site Settings
        </Button>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label>AI Prompt Management</Label>
        <div className="text-xs text-gray-600 mb-2">
          <strong>Current:</strong> {originalPrompt ? originalPrompt.substring(0, 100) + '...' : 'No prompt set'}
        </div>
        <Textarea
          placeholder="AI Generation Prompt"
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          rows={3}
        />
        <Button onClick={updateAiPrompt} className="w-full">
          Update AI Prompt
        </Button>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label>PayPal Links</Label>
        <Input
          placeholder="Basic Plan PayPal Link"
          value={paypalBasic}
          onChange={(e) => setPaypalBasic(e.target.value)}
        />
        <Input
          placeholder="Premium Plan PayPal Link"  
          value={paypalPremium}
          onChange={(e) => setPaypalPremium(e.target.value)}
        />
        <Input
          placeholder="Business Plan PayPal Link"
          value={paypalBusiness}
          onChange={(e) => setPaypalBusiness(e.target.value)}
        />
        <Button onClick={updatePaypalLinks} className="w-full">
          Update PayPal Links
        </Button>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label>Announcements</Label>
        <Input
          placeholder="Announcement Title"
          value={announcementTitle}
          onChange={(e) => setAnnouncementTitle(e.target.value)}
        />
        <Textarea
          placeholder="Announcement Message"
          value={announcementMessage}
          onChange={(e) => setAnnouncementMessage(e.target.value)}
          rows={2}
        />
        <div className="flex space-x-2">
          <select 
            value={announcementType} 
            onChange={(e) => setAnnouncementType(e.target.value)}
            className="flex-1 px-2 py-1 border rounded"
          >
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="success">Success</option>
            <option value="error">Error</option>
          </select>
          <Input
            type="number"
            placeholder="Hours"
            value={announcementDuration}
            onChange={(e) => setAnnouncementDuration(e.target.value)}
            disabled={announcementPersistent}
          />
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={announcementPersistent}
            onChange={(e) => setAnnouncementPersistent(e.target.checked)}
          />
          <Label>Persistent (stay until manually removed)</Label>
        </div>
        <Button onClick={createAnnouncement} className="w-full">
          <Bell className="w-4 h-4 mr-2" />
          Create Announcement
        </Button>
      </div>

      <Separator />

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
          <div className="text-sm text-gray-600 bg-gray-100 p-2 rounded">
            <strong>IP:</strong> {foundUserIp}
          </div>
        )}
      </div>
    </div>
  );
};
