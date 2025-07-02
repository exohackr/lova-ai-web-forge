
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
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

  const generateMockData = () => {
    const mockBannedWords: BannedWord[] = [
      { id: '1', word: 'spam', severity: 'high', created_at: new Date().toISOString() },
      { id: '2', word: 'scam', severity: 'high', created_at: new Date().toISOString() },
      { id: '3', word: 'fake', severity: 'medium', created_at: new Date().toISOString() },
      { id: '4', word: 'bot', severity: 'low', created_at: new Date().toISOString() },
    ];

    const mockActivities: SuspiciousActivity[] = [
      {
        id: '1',
        user_id: 'user1',
        username: 'testuser1',
        activity_type: 'Rapid API calls',
        details: 'Made 50 API calls in 1 minute',
        timestamp: new Date().toISOString(),
        status: 'pending'
      },
      {
        id: '2',
        user_id: 'user2',
        username: 'testuser2',
        activity_type: 'Suspicious content',
        details: 'Generated content containing banned words',
        timestamp: new Date().toISOString(),
        status: 'pending'
      },
    ];

    setBannedWords(mockBannedWords);
    setSuspiciousActivities(mockActivities);
  };

  useEffect(() => {
    generateMockData();
  }, []);

  const addBannedWord = async () => {
    if (!newWord.trim()) return;

    const newBannedWord: BannedWord = {
      id: Date.now().toString(),
      word: newWord.toLowerCase(),
      severity: wordSeverity,
      created_at: new Date().toISOString()
    };

    setBannedWords(prev => [...prev, newBannedWord]);
    setNewWord("");

    toast({
      title: "Word Added",
      description: `"${newWord}" has been added to the banned words list`,
    });
  };

  const removeBannedWord = async (id: string) => {
    setBannedWords(prev => prev.filter(word => word.id !== id));
    
    toast({
      title: "Word Removed",
      description: "Word has been removed from the banned list",
    });
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
      // In a real implementation, this would ban the user
      console.log(`Banning user ${username} (${userId})`);
      
      toast({
        title: "User Banned",
        description: `User ${username} has been banned for suspicious activity`,
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
          {bannedWords.map((word) => (
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
          ))}
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
              {suspiciousActivities.map((activity) => (
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
              ))}
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
