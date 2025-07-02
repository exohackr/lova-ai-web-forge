
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, Wand2, Lock, Eye, Code, Download } from "lucide-react";
import { ChatInterface } from "@/components/ChatInterface";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const SiteGenerator = () => {
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const trackUsage = async () => {
    if (!user || !profile) return false;

    // Check if user has uses remaining (diddy has unlimited)
    if (profile.username !== 'diddy' && profile.daily_uses_remaining <= 0) {
      toast({
        title: "No uses remaining",
        description: "You've used all your daily credits. More will be available tomorrow!",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Log the usage
      const { error: logError } = await supabase
        .from('usage_logs')
        .insert([{ user_id: user.id }]);

      if (logError) {
        console.error('Error logging usage:', logError);
        return false;
      }

      // Update user's remaining uses and total uses (unless they're diddy)
      if (profile.username !== 'diddy') {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            daily_uses_remaining: profile.daily_uses_remaining - 1,
            total_uses: profile.total_uses + 1
          })
          .eq('id', user.id);

        if (updateError) {
          console.error('Error updating profile:', updateError);
          return false;
        }
      } else {
        // For diddy, just update total uses
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            total_uses: profile.total_uses + 1
          })
          .eq('id', user.id);

        if (updateError) {
          console.error('Error updating profile:', updateError);
          return false;
        }
      }

      await refreshProfile();
      return true;
    } catch (error) {
      console.error('Error tracking usage:', error);
      return false;
    }
  };

  const generateSite = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!description.trim()) {
      toast({
        title: "Description required",
        description: "Please describe the website you want to generate.",
        variant: "destructive",
      });
      return;
    }

    const canProceed = await trackUsage();
    if (!canProceed) return;

    setIsGenerating(true);
    
    try {
      const prompt = `Generate a complete, modern, and fully responsive HTML document for a website based on the following description.
      The HTML should be well-structured, include a <head> section with appropriate meta tags for responsiveness and title, and a <body> section.
      Use Tailwind CSS classes exclusively for all styling. Do not include any <style> tags or inline CSS.
      Make sure to include the Tailwind CSS CDN link in the head section.
      Ensure good visual design, layout, and user experience. Include dummy content where appropriate.
      Description: ${description}`;

      const apiKey = "AIzaSyDY7qMaXLfpEPUJmyyzF5tLpKVtSIt0fUg";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }]
        })
      });

      const result = await response.json();

      if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
        const generatedText = result.candidates[0].content.parts[0].text;
        const htmlMatch = generatedText.match(/```html\n(.*?)```/s);
        const htmlContent = htmlMatch ? htmlMatch[1] : generatedText;
        
        setGeneratedHtml(htmlContent);
        setShowChat(true);
        setShowPreview(true);
        
        toast({
          title: "Site generated!",
          description: "Your website has been created successfully. You can now preview, view code, or download it.",
        });
      } else {
        throw new Error("No content generated");
      }
    } catch (error) {
      console.error("Error generating site:", error);
      toast({
        title: "Generation failed",
        description: "Failed to generate your website. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadHtml = () => {
    if (!generatedHtml) return;
    
    const blob = new Blob([generatedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-website.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started",
      description: "Your website HTML file is being downloaded.",
    });
  };

  const startOver = () => {
    setGeneratedHtml("");
    setShowChat(false);
    setShowPreview(false);
    setShowCode(false);
    setDescription("");
  };

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <Card className="p-8 bg-white/80 backdrop-blur-xl border-white/20 shadow-xl">
          <div className="text-center space-y-6">
            <Lock className="w-16 h-16 mx-auto text-gray-400" />
            <h2 className="text-2xl font-bold text-gray-900">Authentication Required</h2>
            <p className="text-gray-600">Please sign in to start generating websites with AI</p>
            <Button
              onClick={() => navigate("/auth")}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              Sign In to Continue
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      {!showChat ? (
        <Card className="p-8 bg-white/80 backdrop-blur-xl border-white/20 shadow-xl">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Describe Your Dream Website</h2>
              <p className="text-gray-600">Tell us what you want to build, and we'll create it for you</p>
              {profile && (
                <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    {profile.username === 'diddy' ? (
                      <span className="text-yellow-600 font-semibold">👑 Unlimited uses available</span>
                    ) : (
                      <>You have <span className="font-semibold text-purple-600">{profile.daily_uses_remaining}</span> uses remaining today</>
                    )}
                  </p>
                </div>
              )}
            </div>

            <Textarea
              placeholder="e.g., A modern e-commerce site selling handmade jewelry with a clean product grid, hero section, and contact form..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-32 text-lg resize-none border-gray-200 focus:border-purple-500 focus:ring-purple-500"
            />

            <Button
              onClick={generateSite}
              disabled={isGenerating || !description.trim() || (profile && profile.username !== 'diddy' && profile.daily_uses_remaining <= 0)}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating your site...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 mr-2" />
                  Generate Website
                </>
              )}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Generated Site Controls */}
          <Card className="p-6 bg-white/80 backdrop-blur-xl border-white/20 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Your Generated Website</h3>
              <div className="flex gap-2">
                <Button
                  variant={showPreview ? "default" : "outline"}
                  onClick={() => { setShowPreview(true); setShowCode(false); }}
                  className="flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </Button>
                <Button
                  variant={showCode ? "default" : "outline"}
                  onClick={() => { setShowCode(true); setShowPreview(false); }}
                  className="flex items-center gap-2"
                >
                  <Code className="w-4 h-4" />
                  View Code
                </Button>
                <Button
                  variant="outline"
                  onClick={downloadHtml}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download HTML
                </Button>
                <Button
                  variant="outline"
                  onClick={startOver}
                >
                  Start Over
                </Button>
              </div>
            </div>

            {/* Website Preview */}
            {showPreview && generatedHtml && (
              <div className="border rounded-lg overflow-hidden bg-white">
                <div className="bg-gray-100 px-4 py-2 text-sm text-gray-600 border-b">
                  Website Preview
                </div>
                <iframe
                  srcDoc={generatedHtml}
                  className="w-full h-96 border-0"
                  title="Generated Website Preview"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            )}

            {/* Code View */}
            {showCode && generatedHtml && (
              <div className="border rounded-lg overflow-hidden bg-white">
                <div className="bg-gray-100 px-4 py-2 text-sm text-gray-600 border-b flex justify-between items-center">
                  HTML Source Code
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedHtml);
                      toast({ title: "Copied!", description: "HTML code copied to clipboard" });
                    }}
                  >
                    Copy Code
                  </Button>
                </div>
                <pre className="p-4 text-sm overflow-auto max-h-96 bg-gray-50">
                  <code>{generatedHtml}</code>
                </pre>
              </div>
            )}
          </Card>

          {/* Chat Interface */}
          <ChatInterface 
            onResponse={(response) => {
              console.log("AI Response:", response);
            }}
          />
        </div>
      )}
    </div>
  );
};
