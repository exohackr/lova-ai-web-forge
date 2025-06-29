
-- Add admin role column to profiles
ALTER TABLE public.profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- Add banned status and IP tracking
ALTER TABLE public.profiles ADD COLUMN is_banned BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN ban_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN registration_ip INET;

-- Create blacklisted IPs table
CREATE TABLE public.blacklisted_ips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address INET NOT NULL UNIQUE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on blacklisted IPs
ALTER TABLE public.blacklisted_ips ENABLE ROW LEVEL SECURITY;

-- Policy for admins to manage blacklisted IPs
CREATE POLICY "Admins can manage blacklisted IPs" 
  ON public.blacklisted_ips 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (username = 'diddy' OR is_admin = true)
    )
  );

-- Create API keys table for secure storage
CREATE TABLE public.api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key_name TEXT NOT NULL UNIQUE,
  key_value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on API keys
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Policy for admins to manage API keys
CREATE POLICY "Admins can manage API keys" 
  ON public.api_keys 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (username = 'diddy' OR is_admin = true)
    )
  );

-- Update the handle_new_user function to capture IP (if available in metadata)
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
