
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Edge function called');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get user from JWT
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('User authenticated:', user.id);

    // Get user profile to check if banned
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('Profile error:', profileError);
      return new Response(JSON.stringify({ error: 'Profile not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('Profile found:', profile.username, 'Uses remaining:', profile.daily_uses_remaining);

    // Check if user is banned
    if (profile.is_banned) {
      return new Response(JSON.stringify({ error: 'User is banned' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check daily usage limit (diddy has unlimited)
    if (profile.username !== 'diddy' && profile.daily_uses_remaining <= 0) {
      return new Response(JSON.stringify({ error: 'Daily usage limit exceeded' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { prompt } = await req.json()
    console.log('Prompt received, length:', prompt?.length);

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'No prompt provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Use the hardcoded API key for now
    const apiKey = "AIzaSyDY7qMaXLfpEPUJmyyzF5tLpKVtSIt0fUg";
    
    console.log('Making request to Gemini API');

    // Make request to Gemini API
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      }),
    })

    console.log('Gemini API response status:', geminiResponse.status);

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      return new Response(JSON.stringify({ error: 'AI API error: ' + errorText }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const result = await geminiResponse.json()
    console.log('Gemini response received');

    // Update user usage (but not for diddy)
    if (profile.username !== 'diddy') {
      console.log('Updating usage for user:', profile.username);
      await supabaseClient
        .from('profiles')
        .update({ 
          daily_uses_remaining: profile.daily_uses_remaining - 1,
          total_uses: profile.total_uses + 1
        })
        .eq('id', user.id)
    } else {
      console.log('Updating total uses for diddy');
      await supabaseClient
        .from('profiles')
        .update({ 
          total_uses: profile.total_uses + 1
        })
        .eq('id', user.id)
    }

    // Log usage
    await supabaseClient
      .from('usage_logs')
      .insert({ user_id: user.id })

    console.log('Usage updated successfully');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
