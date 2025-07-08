import { createClient } from '@supabase/supabase-js';

// 直接使用环境变量
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Environment check:');
console.log('SUPABASE_URL:', supabaseUrl ? 'SET' : 'NOT SET');
console.log('SUPABASE_ANON_KEY:', supabaseAnonKey ? 'SET' : 'NOT SET');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing environment variables');
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function TestPage() {
  let testResult = 'Loading...';
  let errorMessage = null;
  
  try {
    console.log('Testing Supabase connection...');
    
    // 测试数据库连接
    const { data, error } = await supabase
      .from('wordle-answers')
      .select('date, answer, puzzle_number')
      .order('date', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('Supabase error:', error);
      errorMessage = JSON.stringify(error, null, 2);
    } else {
      console.log('Supabase success:', data);
      testResult = `Success! Found ${data.length} records`;
      if (data.length > 0) {
        testResult += `. Latest: ${data[0].date} - ${data[0].answer} (Puzzle #${data[0].puzzle_number})`;
      }
    }
  } catch (err) {
    console.error('Test error:', err);
    errorMessage = err instanceof Error ? err.message : 'Unknown error';
  }
  
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Supabase Connection Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Environment Variables:</h2>
        <p>NEXT_PUBLIC_SUPABASE_URL: {supabaseUrl ? '✅ SET' : '❌ NOT SET'}</p>
        <p>NEXT_PUBLIC_SUPABASE_ANON_KEY: {supabaseAnonKey ? '✅ SET' : '❌ NOT SET'}</p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Database Test:</h2>
        <p>{testResult}</p>
      </div>
      
      {errorMessage && (
        <div style={{ marginBottom: '20px', backgroundColor: '#ffebee', padding: '10px' }}>
          <h2>Error:</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{errorMessage}</pre>
        </div>
      )}
      
      <div>
        <h2>URL Test:</h2>
        <p><a href="/">Go to main page</a></p>
      </div>
    </div>
  );
}