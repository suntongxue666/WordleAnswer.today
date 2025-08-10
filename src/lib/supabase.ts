import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // 将 SUPABASE_SERVICE_ROLE_KEY 更改为 NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // 警告信息也相应调整，以更准确地反映问题
    console.warn('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
    return null;
  }

  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    return supabaseClient;
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    return null;
  }
};

// Export a default supabase client for compatibility
export const supabase = getSupabase(); 