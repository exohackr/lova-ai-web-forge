
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Wand2, Globe, Code, Download, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const SiteGenerator = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSite, setGeneratedSite] = useState("");
  const [showPreview, setShowPreview] = useState(true);
  const [showCode, setShowCode] = useState(false);

  const handleGenerate = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to generate websites",
        variant: "destructive",
      });
      return;
    }

    if (!profile) {
      toast({
        title: "Profile Error",
        description: "Unable to load user profile",
        variant: "destructive",
      });
      return;
    }

    if (profile.is_banned) {
      toast({
        title: "Access Denied",
        description: "Your account has been banned",
        variant: "destructive",
      });
      return;
    }

    // Check if user has uses remaining (unless they have unlimited uses)
    if (profile.daily_uses_remaining <= 0 && profile.daily_uses_remaining !== 999999) {
      toast({
        title: "No Uses Remaining",
        description: "You have no daily uses left. Please upgrade or wait for reset.",
        variant: "destructive",
      });
      return;
    }

    if (!prompt.trim()) {
      toast({
        title: "Missing Prompt",
        description: "Please enter a description for your website",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      console.log('Starting generation for user:', profile.username, 'Uses remaining:', profile.daily_uses_remaining);
      
      const { data, error } = await supabase.functions.invoke('secure-ai', {
        body: { 
          prompt: `Create a complete HTML website based on this description: ${prompt}. Include CSS styling, make it responsive and modern looking. Return only the HTML code with embedded CSS.` 
        }
      });

      console.log('AI Response:', data, 'Error:', error);

      if (error) {
        console.error('Generation error:', error);
        throw new Error(error.message || 'Failed to generate website');
      }

      if (data && data.candidates && data.candidates[0] && data.candidates[0].content) {
        const generatedContent = data.candidates[0].content.parts[0].text;
        console.log('Generated content length:', generatedContent?.length);
        
        if (!generatedContent) {
          throw new Error('No content generated from AI service');
        }
        
        setGeneratedSite(generatedContent);
        
        // Refresh profile to get updated usage count
        await refreshProfile();
        
        toast({
          title: "Website Generated!",
          description: "Your website has been generated successfully",
        });
        
        console.log('Generation completed successfully');
      } else {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response format from AI service');
      }
    } catch (error: any) {
      console.error('Generation failed:', error);
      
      let errorMessage = "Failed to generate website. Please try again.";
      
      if (error.message?.includes('Daily usage limit exceeded')) {
        errorMessage = "You have no daily uses left. Please upgrade or wait for reset.";
      } else if (error.message?.includes('User is banned')) {
        errorMessage = "Your account has been banned";
      } else if (error.message?.includes('API key not configured')) {
        errorMessage = "AI service is temporarily unavailable. Please try again later.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadHTML = () => {
    if (!generatedSite) return;

    const blob = new Blob([generatedSite], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-website.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download Started",
      description: "Your HTML file is being downloaded",
    });
  };

  const getRemainingUses = () => {
    if (!profile) return 0;
    if (profile.daily_uses_remaining === 999999) return "Unlimited";
    return profile.daily_uses_remaining;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Wand2 className="w-8 h-8 text-purple-600" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            AI Website Generator
          </h1>
        </div>
        <p className="text-gray-600 text-lg">
          Describe your dream website and watch AI bring it to life
        </p>
        
        {user && (
          <div className="flex justify-center items-center space-x-4">
            <Badge variant="secondary" className="text-sm">
              Uses Remaining: {getRemainingUses()}
            </Badge>
            {profile?.has_subscription && (
              <Badge variant="default" className="text-sm">
                {profile.subscription_type?.toUpperCase()} Member
              </Badge>
            )}
          </div>
        )}
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website Description
            </label>
            <Textarea
              placeholder="Describe the website you want to create (e.g., 'A modern portfolio website for a photographer with a dark theme and gallery section')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="w-full"
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !user}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Wand2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Your Website...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Website
              </>
            )}
          </Button>

          {!user && (
            <p className="text-sm text-gray-500 text-center">
              Please log in to generate websites
            </p>
          )}
        </div>
      </Card>

      {generatedSite && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Generated Website</h2>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                {showPreview ? 'Hide' : 'Show'} Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCode(!showCode)}
              >
                <Code className="w-4 h-4 mr-1" />
                {showCode ? 'Hide' : 'Show'} Code
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadHTML}
              >
                <Download className="w-4 h-4 mr-1" />
                Download HTML
              </Button>
            </div>
          </div>

          <Separator />

          {showPreview && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Live Preview
              </h3>
              <div className="border rounded-lg overflow-hidden" style={{ height: '500px' }}>
                <iframe
                  srcDoc={generatedSite}
                  className="w-full h-full"
                  title="Generated Website Preview"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            </div>
          )}

          {showCode && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold flex items-center">
                <Code className="w-5 h-5 mr-2" />
                HTML Source Code
              </h3>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto max-h-96">
                <pre className="text-sm">
                  <code>{generatedSite}</code>
                </pre>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
