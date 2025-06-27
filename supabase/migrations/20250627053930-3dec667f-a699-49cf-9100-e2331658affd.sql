
-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_style TEXT DEFAULT 'normal',
  daily_uses_remaining INTEGER DEFAULT 5,
  total_uses INTEGER DEFAULT 0,
  last_reset_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create usage_logs table to track AI usage
CREATE TABLE public.usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on both tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view all profiles for leaderboard" 
  ON public.profiles 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- RLS policies for usage_logs
CREATE POLICY "Users can view their own usage logs" 
  ON public.usage_logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage logs" 
  ON public.usage_logs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Admin policy for diddy to view all usage logs
CREATE POLICY "Admin can view all usage logs" 
  ON public.usage_logs 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND username = 'diddy'
    )
  );

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to reset daily uses
CREATE OR REPLACE FUNCTION public.reset_daily_uses()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET daily_uses_remaining = 5, last_reset_date = CURRENT_DATE
  WHERE last_reset_date < CURRENT_DATE AND username != 'diddy';
END;
$$;
