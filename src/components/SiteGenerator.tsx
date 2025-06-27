
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, Wand2, Eye, Edit3, MessageSquare } from "lucide-react";
import { ChatInterface } from "@/components/ChatInterface";
import { useToast } from "@/hooks/use-toast";

export const SiteGenerator = () => {
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState("");
  const [showChat, setShowChat] = useState(false);
  const { toast } = useToast();

  const generateSite = async () => {
    if (!description.trim()) {
      toast({
        title: "Description required",
        description: "Please describe the website you want to generate.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const prompt = `Generate a complete, modern, and fully responsive HTML document for a website based on the following description.
      The HTML should be well-structured, include a <head> section with appropriate meta tags for responsiveness and title, and a <body> section.
      Use Tailwind CSS classes exclusively for all styling. Do not include any <style> tags or inline CSS.
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
        
        toast({
          title: "Site generated!",
          description: "Your website has been created successfully.",
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      {!showChat ? (
        <Card className="p-8 bg-white/80 backdrop-blur-xl border-white/20 shadow-xl">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Describe Your Dream Website</h2>
              <p className="text-gray-600">Tell us what you want to build, and we'll create it for you</p>
            </div>

            <Textarea
              placeholder="e.g., A modern e-commerce site selling handmade jewelry with a clean product grid, hero section, and contact form..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-32 text-lg resize-none border-gray-200 focus:border-purple-500 focus:ring-purple-500"
            />

            <Button
              onClick={generateSite}
              disabled={isGenerating || !description.trim()}
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
        <ChatInterface 
          initialHtml={generatedHtml}
          onBack={() => setShowChat(false)}
        />
      )}
    </div>
  );
};
