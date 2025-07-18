
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Download, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  action: string;
  user_id?: string;
  username?: string;
  details: string;
}

export const SystemLogs = () => {
  const { toast } = useToast();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logLevel, setLogLevel] = useState("all");
  const [loading, setLoading] = useState(false);

  const generateMockLogs = () => {
    const levels: ('info' | 'warning' | 'error')[] = ['info', 'warning', 'error'];
    const actions = [
      'User Login', 'User Logout', 'Profile Update', 'Password Change',
      'AI Request', 'Admin Action', 'System Error', 'Rate Limit Hit',
      'Subscription Change', 'Payment Processed', 'File Upload', 'Data Export'
    ];

    const mockLogs: LogEntry[] = [];
    
    for (let i = 0; i < 50; i++) {
      const level = levels[Math.floor(Math.random() * levels.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
      
      mockLogs.push({
        id: `log-${i}`,
        timestamp: timestamp.toISOString(),
        level,
        action,
        user_id: Math.random() > 0.3 ? `user-${Math.floor(Math.random() * 100)}` : undefined,
        username: Math.random() > 0.3 ? `user${Math.floor(Math.random() * 100)}` : undefined,
        details: `${action} - ${level === 'error' ? 'Failed' : 'Successful'} at ${timestamp.toLocaleString()}`
      });
    }

    return mockLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // In a real app, this would fetch from actual log tables
      // For now, we'll generate mock data
      const mockLogs = generateMockLogs();
      setLogs(mockLogs);
      
      toast({
        title: "Logs Refreshed",
        description: "System logs have been updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    logLevel === "all" || log.level === logLevel
  );

  const exportLogs = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Timestamp,Level,Action,Username,Details\n" +
      filteredLogs.map(log => 
        `"${log.timestamp}","${log.level}","${log.action}","${log.username || 'System'}","${log.details}"`
      ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `system_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Success",
      description: "Logs exported successfully",
    });
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      case 'info': return 'default';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          System Logs Viewer
        </h3>
        
        <div className="flex gap-2">
          <Select value={logLevel} onValueChange={setLogLevel}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={exportLogs} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
          
          <Button onClick={fetchLogs} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <div className="max-h-96 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs">
                    {new Date(log.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getLevelColor(log.level) as any}>
                      {log.level.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{log.action}</TableCell>
                  <TableCell>{log.username || 'System'}</TableCell>
                  <TableCell className="max-w-xs truncate" title={log.details}>
                    {log.details}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <div className="text-sm text-gray-600 text-center">
        Showing {filteredLogs.length} of {logs.length} total log entries
      </div>
    </div>
  );
};
