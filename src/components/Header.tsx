
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, Menu, X, Sparkles, Trophy, Crown } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { Leaderboard } from "@/components/Leaderboard";
import { AdminPanel } from "@/components/AdminPanel";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const getDisplayName = () => {
    if (!profile) return user?.email || "User";
    
    const baseClasses = "font-semibold";
    
    switch (profile.display_style) {
      case 'rainbow':
        return (
          <span className={`${baseClasses} bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent animate-pulse`}>
            {profile.username}
          </span>
        );
      case 'sparkly-gold':
        return (
          <span className={`${baseClasses} bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent animate-pulse relative`}>
            ✨ {profile.username} ✨
          </span>
        );
      default:
        return <span className={baseClasses}>{profile.username}</span>;
    }
  };

  return (
    <>
      <header className="relative z-20 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Lova AI
              </span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Examples</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
            </nav>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {user && profile ? (
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowLeaderboard(true)}
                    className="hidden sm:flex"
                  >
                    <Trophy className="w-4 h-4 mr-2 text-yellow-500" />
                    Leaderboard
                  </Button>
                  
                  <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-full">
                    <User className="w-4 h-4 text-purple-600" />
                    <div className="flex flex-col">
                      <div className="flex items-center space-x-1">
                        {getDisplayName()}
                        {profile.username === 'diddy' && (
                          <Crown className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {profile.daily_uses_remaining} uses left
                      </span>
                    </div>
                  </div>
                  
                  {profile.username === 'diddy' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAdminPanel(!showAdminPanel)}
                      className="text-yellow-600 hover:text-yellow-700"
                    >
                      <Crown className="w-4 h-4" />
                    </Button>
                  )}
                  
                  <Button variant="ghost" size="sm" onClick={logout}>
                    Logout
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={() => navigate("/auth")}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  Sign In
                </Button>
              )}

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col space-y-3">
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Examples</a>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
                {user && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowLeaderboard(true)}
                    className="justify-start"
                  >
                    <Trophy className="w-4 h-4 mr-2 text-yellow-500" />
                    Leaderboard
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Admin Panel */}
      {showAdminPanel && profile?.username === 'diddy' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <AdminPanel />
        </div>
      )}

      <Leaderboard open={showLeaderboard} onOpenChange={setShowLeaderboard} />
    </>
  );
};
