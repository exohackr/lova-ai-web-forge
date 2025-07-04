
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, Send, Sparkles, Lock } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  onResponse: (response: string) => void;
}

export const ChatInterface = ({ onResponse }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !user || !profile) return;

    // Check if user is banned
    if (profile.is_banned) {
      toast({
        title: "Account Banned",
        description: "Your account has been banned from using this service.",
        variant: "destructive",
      });
      return;
    }

    // Check daily usage limit (diddy has unlimited)
    if (profile.username !== 'diddy' && profile.daily_uses_remaining <= 0) {
      toast({
        title: "Daily Limit Reached",
        description: "You've reached your daily usage limit. Try again tomorrow!",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      console.log('Sending message to AI:', input);
      
      // Use secure edge function for AI requests
      const { data, error } = await supabase.functions.invoke('secure-ai', {
        body: { prompt: input }
      });

      console.log('AI response:', { data, error });

      if (error) {
        console.error('AI request error:', error);
        throw error;
      }

      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response.";
      
      const assistantMessage: Message = { role: 'assistant', content: aiResponse };
      setMessages(prev => [...prev, assistantMessage]);
      onResponse(aiResponse);

      // Refresh profile to update usage count
      await refreshProfile();

      const remainingUses = profile.username === 'diddy' ? 
        'unlimited' : 
        `${Math.max(0, profile.daily_uses_remaining - 1)}`;

      toast({
        title: "Success!",
        description: `Generated response! ${remainingUses === 'unlimited' ? 'Unlimited uses available' : `${remainingUses} uses remaining today`}.`,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      
      let errorMessage = "Failed to generate response. Please try again.";
      
      if (error.message?.includes('Daily usage limit exceeded')) {
        errorMessage = "You've reached your daily usage limit. Try again tomorrow!";
      } else if (error.message?.includes('User is banned')) {
        errorMessage = "Your account has been restricted.";
      } else if (error.message?.includes('Unauthorized')) {
        errorMessage = "Please log in again to continue.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <Card className="p-6 text-center">
        <Lock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold mb-2">Sign in to use AI</h3>
        <p className="text-gray-600">Please sign in to start generating content with AI.</p>
      </Card>
    );
  }

  if (profile?.is_banned) {
    return (
      <Card className="p-6 text-center bg-red-50 border-red-200">
        <h3 className="text-lg font-semibold mb-2 text-red-800">Account Banned</h3>
        <p className="text-red-600">Your account has been banned from using this service.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">AI Chat</h3>
        <div className="text-sm text-gray-600">
          {profile?.username === 'diddy' ? 
            '∞ unlimited uses' : 
            `${profile?.daily_uses_remaining || 0} uses remaining today`}
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg ${
              message.role === 'user'
                ? 'bg-blue-100 ml-8'
                : 'bg-gray-100 mr-8'
            }`}
          >
            <div className="font-medium text-sm mb-1">
              {message.role === 'user' ? 'You' : 'AI'}
            </div>
            <div className="text-sm">{message.content}</div>
          </div>
        ))}
      </div>

      <div className="flex space-x-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI to generate website content..."
          className="flex-1"
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <Button
          onClick={sendMessage}
          disabled={!input.trim() || isLoading || (profile?.username !== 'diddy' && (profile?.daily_uses_remaining || 0) <= 0)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>

      {profile?.username !== 'diddy' && (profile?.daily_uses_remaining || 0) <= 0 && (
        <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">
            You've reached your daily limit of 5 uses. Come back tomorrow for more!
          </p>
        </div>
      )}
    </div>
  );
};
