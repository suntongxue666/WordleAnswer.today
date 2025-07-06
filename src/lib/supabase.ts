import { createClient } from '@supabase/supabase-js';

// 从环境变量获取 Supabase URL 和 anon Key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key environment variables.');
}

// 创建 Supabase 客户端实例
export const supabase = createClient(supabaseUrl, supabaseAnonKey); 