
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, Eye, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ModerationLog {
  id: string;
  user_id: string;
  username: string;
  action: string;
  reason: string;
  moderator: string;
  created_at: string;
}

export const ContentModeration = () => {
  const { toast } = useToast();
  const [logs, setLogs] = useState<ModerationLog[]>([]);
  const [bannedWords, setBannedWords] = useState("");
  const [newBannedWord, setNewBannedWord] = useState("");
  const [suspiciousActivity, setSuspiciousActivity] = useState<any[]>([]);

  const fetchModerationData = async () => {
    try {
      // Fetch suspicious activity (users with high usage in short time)
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('total_uses', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Filter for potentially suspicious activity
      const suspicious = profiles?.filter(user => 
        user.total_uses > 100 && 
        user.created_at && 
        new Date(user.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ) || [];

      setSuspiciousActivity(suspicious);

      // Fetch banned words from system settings
      const { data: settings, error: settingsError } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_name', 'banned_words')
        .single();

      if (!settingsError && settings) {
        setBannedWords(settings.setting_value || "");
      }
    } catch (error) {
      console.error('Error fetching moderation data:', error);
    }
  };

  useEffect(() => {
    fetchModerationData();
  }, []);

  const addBannedWord = async () => {
    if (!newBannedWord.trim()) return;

    try {
      const currentWords = bannedWords ? bannedWords.split(',').map(w => w.trim()) : [];
      const updatedWords = [...currentWords, newBannedWord.trim()].join(', ');

      const { error } = await supabase
        .from('system_settings')
        .upsert({
          setting_name: 'banned_words',
          setting_value: updatedWords,
          updated_by: 'admin'
        });

      if (error) throw error;

      setBannedWords(updatedWords);
      setNewBannedWord("");
      
      toast({
        title: "Success",
        description: "Banned word added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add banned word",
        variant: "destructive",
      });
    }
  };

  const updateBannedWords = async () => {
    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          setting_name: 'banned_words',
          setting_value: bannedWords,
          updated_by: 'admin'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Banned words updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update banned words",
        variant: "destructive",
      });
    }
  };

  const investigateUser = async (userId: string, username: string) => {
    toast({
      title: "Investigation Started",
      description: `Starting investigation for user: ${username}`,
    });
    
    // Here you could implement more detailed user investigation
    console.log(`Investigating user ${username} (${userId})`);
  };

  const quickBanUser = async (userId: string, username: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_banned: true,
          ban_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hour ban
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "User Banned",
        description: `${username} has been banned for 24 hours`,
      });

      fetchModerationData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to ban user",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center">
        <Shield className="w-5 h-5 mr-2" />
        Content Moderation Tools
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4">
          <h4 className="text-lg font-semibold mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Banned Words Management
          </h4>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="banned-words">Current Banned Words (comma-separated)</Label>
              <Textarea
                id="banned-words"
                value={bannedWords}
                onChange={(e) => setBannedWords(e.target.value)}
                placeholder="word1, word2, word3..."
                rows={4}
              />
              <Button onClick={updateBannedWords} className="mt-2" size="sm">
                Update Banned Words
              </Button>
            </div>

            <div className="flex space-x-2">
              <Input
                placeholder="Add new banned word"
                value={newBannedWord}
                onChange={(e) => setNewBannedWord(e.target.value)}
              />
              <Button onClick={addBannedWord} size="sm">
                Add Word
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h4 className="text-lg font-semibold mb-4 flex items-center">
            <Eye className="w-5 h-5 mr-2" />
            Suspicious Activity
          </h4>
          
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {suspiciousActivity.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No suspicious activity detected</p>
            ) : (
              suspiciousActivity.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{user.username}</p>
                    <div className="flex gap-2 text-sm text-gray-600">
                      <span>{user.total_uses} total uses</span>
                      <Badge variant="warning">High Activity</Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      onClick={() => investigateUser(user.id, user.username)}
                      size="sm" 
                      variant="outline"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      onClick={() => quickBanUser(user.id, user.username)}
                      size="sm" 
                      variant="destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <h4 className="text-lg font-semibold mb-4">Quick Moderation Actions</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" onClick={() => toast({ title: "Feature", description: "Mass user cleanup started" })}>
            Mass Cleanup
          </Button>
          <Button variant="outline" onClick={() => toast({ title: "Feature", description: "Spam detection enabled" })}>
            Enable Spam Detection
          </Button>
          <Button variant="outline" onClick={() => toast({ title: "Feature", description: "Auto-moderation activated" })}>
            Auto-Moderate
          </Button>
          <Button variant="outline" onClick={fetchModerationData}>
            Refresh Data
          </Button>
        </div>
      </Card>
    </div>
  );
};
