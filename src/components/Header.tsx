
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, Menu, X, Sparkles, Trophy, Crown } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { Leaderboard } from "@/components/Leaderboard";
import { AdminPanel } from "@/components/AdminPanel";
import { supabase } from "@/integrations/supabase/client";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [siteSettings, setSiteSettings] = useState({ site_name: "Lova AI", site_icon: "" });
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadSiteSettings();
  }, []);

  const loadSiteSettings = async () => {
    try {
      const { data } = await supabase
        .from('system_settings')
        .select('setting_name, setting_value')
        .in('setting_name', ['site_name', 'site_icon']);

      if (data) {
        const settings = data.reduce((acc, setting) => {
          acc[setting.setting_name] = setting.setting_value || '';
          return acc;
        }, {} as any);
        setSiteSettings({
          site_name: settings.site_name || "Lova AI",
          site_icon: settings.site_icon || ""
        });
      }
    } catch (error) {
      console.error('Error loading site settings:', error);
    }
  };

  const getDisplayName = () => {
    if (!profile) return user?.email || "User";
    
    const baseClasses = "font-semibold";
    let displayName = profile.username;
    
    // Add tags if they exist
    if (profile.tags && profile.tags.length > 0) {
      const tagString = profile.tags.map(tag => `[${tag}]`).join(' ');
      displayName = `${tagString} ${profile.username}`;
    }
    
    switch (profile.display_style) {
      case 'rainbow':
        return (
          <span className={`${baseClasses} bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent animate-pulse`}>
            {displayName}
          </span>
        );
      case 'sparkly-gold':
        return (
          <span className={`${baseClasses} bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent animate-pulse relative`}>
            ✨ {displayName} ✨
          </span>
        );
      default:
        if (profile.custom_color) {
          return <span className={baseClasses} style={{ color: profile.custom_color }}>{displayName}</span>;
        }
        if (profile.is_moderator) {
          return (
            <span className={`${baseClasses} text-blue-400 animate-pulse shadow-lg`}>
              {displayName}
            </span>
          );
        }
        return <span className={baseClasses}>{displayName}</span>;
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
                {siteSettings.site_icon ? (
                  <img src={siteSettings.site_icon} alt="Logo" className="w-5 h-5" />
                ) : (
                  <Sparkles className="w-5 h-5 text-white" />
                )}
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {siteSettings.site_name}
              </span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => navigate('/features')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Features
              </button>
              <button 
                onClick={() => navigate('/examples')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Examples
              </button>
              <button 
                onClick={() => navigate('/pricing')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Pricing
              </button>
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
                  
                  {(profile.username === 'diddy' || profile.is_admin) && (
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
                <button 
                  onClick={() => navigate('/features')}
                  className="text-gray-600 hover:text-gray-900 transition-colors text-left"
                >
                  Features
                </button>
                <button 
                  onClick={() => navigate('/examples')}
                  className="text-gray-600 hover:text-gray-900 transition-colors text-left"
                >
                  Examples
                </button>
                <button 
                  onClick={() => navigate('/pricing')}
                  className="text-gray-600 hover:text-gray-900 transition-colors text-left"
                >
                  Pricing
                </button>
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
      {showAdminPanel && (profile?.username === 'diddy' || profile?.is_admin) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <AdminPanel />
        </div>
      )}

      <Leaderboard open={showLeaderboard} onOpenChange={setShowLeaderboard} />
    </>
  );
};
