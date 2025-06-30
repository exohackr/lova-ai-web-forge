
-- Add new columns to profiles table for enhanced user management
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_moderator BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS has_subscription BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_type TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_picture TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_username_change TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS custom_color TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Create system settings table for admin control
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_name TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Insert default system settings
INSERT INTO public.system_settings (setting_name, setting_value) VALUES
  ('ai_enabled', 'true'),
  ('site_name', 'Lova AI'),
  ('site_icon', ''),
  ('ai_prompt', 'Generate a complete, modern, and fully responsive HTML document for a website based on the following description. The HTML should be well-structured, include a <head> section with appropriate meta tags for responsiveness and title, and a <body> section. Use Tailwind CSS classes exclusively for all styling. Do not include any <style> tags or inline CSS. Ensure good visual design, layout, and user experience. Include dummy content where appropriate.'),
  ('paypal_link_basic', ''),
  ('paypal_link_premium', ''),
  ('username_cooldown_days', '14')
ON CONFLICT (setting_name) DO NOTHING;

-- Create announcements table
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- 'info', 'warning', 'success', 'error'
  is_active BOOLEAN DEFAULT TRUE,
  is_persistent BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on new tables
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Policies for system_settings (admin only)
CREATE POLICY "Admins can manage system settings" 
  ON public.system_settings 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (username = 'diddy' OR is_admin = true)
    )
  );

-- Policies for announcements
CREATE POLICY "Users can view active announcements" 
  ON public.announcements 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Admins can manage announcements" 
  ON public.announcements 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (username = 'diddy' OR is_admin = true)
    )
  );

-- Update the handle_new_user function to capture IP from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, registration_ip)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    CASE 
      WHEN NEW.raw_user_meta_data->>'ip' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'ip')::inet 
      ELSE NULL 
    END
  );
  RETURN NEW;
END;
$$;
