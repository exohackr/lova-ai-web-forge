
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Crown, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface LeaderboardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UserProfile {
  id: string;
  username: string;
  display_style: string;
  total_uses: number;
}

export const Leaderboard = ({ open, onOpenChange }: LeaderboardProps) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      fetchLeaderboard();
    }
  }, [open]);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('total_uses', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching leaderboard:', error);
        return;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = (user: UserProfile) => {
    const baseClasses = "font-semibold";
    
    switch (user.display_style) {
      case 'rainbow':
        return (
          <span className={`${baseClasses} bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent animate-pulse`}>
            {user.username}
          </span>
        );
      case 'sparkly-gold':
        return (
          <span className={`${baseClasses} bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent animate-pulse relative`}>
            ✨ {user.username} ✨
          </span>
        );
      default:
        return <span className={baseClasses}>{user.username}</span>;
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 1:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 2:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-gray-500 font-bold">#{index + 1}</span>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white/95 backdrop-blur-xl border-white/20">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center justify-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span>Leaderboard</span>
            <Trophy className="w-5 h-5 text-yellow-500" />
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {users.map((user, index) => (
              <div 
                key={user.id} 
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  index === 0 ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200' :
                  index === 1 ? 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200' :
                  index === 2 ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200' :
                  'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {getRankIcon(index)}
                  <div>
                    {getDisplayName(user)}
                    {user.username === 'diddy' && (
                      <Crown className="w-4 h-4 text-yellow-500 inline ml-2" />
                    )}
                  </div>
                </div>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  {user.total_uses} uses
                </Badge>
              </div>
            ))}
            
            {users.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No users found
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
