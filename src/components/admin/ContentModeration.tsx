
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, AlertTriangle, Ban, Eye, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BannedWord {
  id: string;
  word: string;
  severity: 'low' | 'medium' | 'high';
  created_at: string;
}

interface SuspiciousActivity {
  id: string;
  user_id: string;
  username: string;
  activity_type: string;
  details: string;
  timestamp: string;
  status: 'pending' | 'reviewed' | 'dismissed';
}

export const ContentModeration = () => {
  const { toast } = useToast();
  const [bannedWords, setBannedWords] = useState<BannedWord[]>([]);
  const [newWord, setNewWord] = useState("");
  const [wordSeverity, setWordSeverity] = useState<'low' | 'medium' | 'high'>('medium');
  const [suspiciousActivities, setSuspiciousActivities] = useState<SuspiciousActivity[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBannedWords = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_name', 'banned_words')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching banned words:', error);
        return;
      }

      if (data?.setting_value) {
        const words = JSON.parse(data.setting_value) as BannedWord[];
        setBannedWords(words);
      }
    } catch (error) {
      console.error('Error parsing banned words:', error);
    }
  };

  const fetchSuspiciousActivities = async () => {
    try {
      // Get users with high usage in short time periods
      const { data: highUsageUsers, error } = await supabase
        .from('usage_logs')
        .select(`
          user_id,
          used_at,
          profiles!inner(username)
        `)
        .gte('used_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('used_at', { ascending: false });

      if (error) throw error;

      // Group by user and count usage
      const userUsage: { [key: string]: { count: number; username: string; lastUsed: string } } = {};
      
      highUsageUsers?.forEach(log => {
        if (!userUsage[log.user_id]) {
          userUsage[log.user_id] = {
            count: 0,
            username: (log.profiles as any)?.username || 'Unknown',
            lastUsed: log.used_at || new Date().toISOString()
          };
        }
        userUsage[log.user_id].count++;
      });

      // Create suspicious activities for users with high usage
      const suspicious: SuspiciousActivity[] = Object.entries(userUsage)
        .filter(([_, usage]) => usage.count >= 10)
        .map(([userId, usage]) => ({
          id: `suspicious-${userId}`,
          user_id: userId,
          username: usage.username,
          activity_type: 'High API Usage',
          details: `Made ${usage.count} API calls in the last 24 hours`,
          timestamp: usage.lastUsed,
          status: 'pending' as const
        }));

      setSuspiciousActivities(suspicious);
    } catch (error) {
      console.error('Error fetching suspicious activities:', error);
    }
  };

  useEffect(() => {
    fetchBannedWords();
    fetchSuspiciousActivities();
  }, []);

  const saveBannedWords = async (words: BannedWord[]) => {
    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          setting_name: 'banned_words',
          setting_value: JSON.stringify(words)
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error saving banned words:', error);
      return false;
    }
  };

  const addBannedWord = async () => {
    if (!newWord.trim()) return;

    const newBannedWord: BannedWord = {
      id: Date.now().toString(),
      word: newWord.toLowerCase(),
      severity: wordSeverity,
      created_at: new Date().toISOString()
    };

    const updatedWords = [...bannedWords, newBannedWord];
    setBannedWords(updatedWords);
    
    const success = await saveBannedWords(updatedWords);
    
    if (success) {
      setNewWord("");
      toast({
        title: "Word Added",
        description: `"${newWord}" has been added to the banned words list`,
      });
    } else {
      setBannedWords(bannedWords); // Revert on error
      toast({
        title: "Error",
        description: "Failed to save banned word",
        variant: "destructive",
      });
    }
  };

  const removeBannedWord = async (id: string) => {
    const updatedWords = bannedWords.filter(word => word.id !== id);
    setBannedWords(updatedWords);
    
    const success = await saveBannedWords(updatedWords);
    
    if (success) {
      toast({
        title: "Word Removed",
        description: "Word has been removed from the banned list",
      });
    } else {
      setBannedWords(bannedWords); // Revert on error
      toast({
        title: "Error",
        description: "Failed to remove banned word",
        variant: "destructive",
      });
    }
  };

  const updateActivityStatus = async (id: string, status: 'reviewed' | 'dismissed') => {
    setSuspiciousActivities(prev => 
      prev.map(activity => 
        activity.id === id ? { ...activity, status } : activity
      )
    );

    toast({
      title: "Status Updated",
      description: `Activity marked as ${status}`,
    });
  };

  const banUserFromActivity = async (userId: string, username: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_banned: true,
          ban_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        })
        .eq('id', userId);

      if (error) throw error;
      
      toast({
        title: "User Banned",
        description: `User ${username} has been banned for 7 days`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to ban user",
        variant: "destructive",
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'reviewed': return 'default';
      case 'dismissed': return 'outline';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Shield className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">Content Moderation</h3>
      </div>

      {/* Banned Words Section */}
      <Card className="p-4">
        <h4 className="font-medium mb-4 flex items-center">
          <AlertTriangle className="w-4 h-4 mr-2" />
          Banned Words Management
        </h4>
        
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Add banned word..."
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            className="flex-1"
          />
          <select
            value={wordSeverity}
            onChange={(e) => setWordSeverity(e.target.value as 'low' | 'medium' | 'high')}
            className="px-3 py-2 border rounded-md"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <Button onClick={addBannedWord} disabled={!newWord.trim()}>
            Add Word
          </Button>
        </div>

        <div className="space-y-2 max-h-40 overflow-y-auto">
          {bannedWords.length > 0 ? (
            bannedWords.map((word) => (
              <div key={word.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center space-x-2">
                  <span className="font-mono">{word.word}</span>
                  <Badge variant={getSeverityColor(word.severity) as any}>
                    {word.severity}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeBannedWord(word.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-4">
              No banned words configured
            </div>
          )}
        </div>
      </Card>

      {/* Suspicious Activities Section */}
      <Card className="p-4">
        <h4 className="font-medium mb-4 flex items-center">
          <Eye className="w-4 h-4 mr-2" />
          Suspicious Activities
        </h4>

        <div className="max-h-96 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suspiciousActivities.length > 0 ? (
                suspiciousActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">{activity.username}</TableCell>
                    <TableCell>{activity.activity_type}</TableCell>
                    <TableCell className="max-w-xs truncate" title={activity.details}>
                      {activity.details}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(activity.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(activity.status) as any}>
                        {activity.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {activity.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateActivityStatus(activity.id, 'reviewed')}
                            >
                              Review
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateActivityStatus(activity.id, 'dismissed')}
                            >
                              Dismiss
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => banUserFromActivity(activity.user_id, activity.username)}
                            >
                              <Ban className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500">
                    No suspicious activities detected
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <div className="text-sm text-gray-600 text-center">
        Monitoring {suspiciousActivities.length} suspicious activities
      </div>
    </div>
  );
};
