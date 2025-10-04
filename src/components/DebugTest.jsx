import { useState } from 'react';

const DebugTest = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setResult('Testing connection...\n');
    
    try {
      // Test 1: Check if we can get a Supabase client
      setResult(prev => prev + '1. Testing Supabase client creation...\n');
      
      // Import the getSupabaseClient function directly
      const { getSupabaseClient } = await import('../lib/supabaseClient');
      const client = await getSupabaseClient();
      
      setResult(prev => prev + '✅ Supabase client created successfully\n');
      setResult(prev => prev + `   URL: ${client.supabaseUrl}\n`);
      setResult(prev => prev + `   Key: ${client.supabaseKey.substring(0, 20)}...\n\n`);
      
      // Test 2: Try a simple RPC call
      setResult(prev => prev + '2. Testing database connection with simple query...\n');
      
      const { error: testError } = await client.rpc('now');
      if (testError) {
        setResult(prev => prev + `❌ Database connection failed: ${testError.message}\n\n`);
      } else {
        setResult(prev => prev + '✅ Database connection successful\n\n');
      }
      
      // Test 3: Check if create_workspace function exists
      setResult(prev => prev + '3. Testing if create_workspace function exists...\n');
      
      const { data: funcData, error: funcError } = await client.rpc('create_workspace', {
        p_username: 'debug_test_' + Date.now(),
        p_password: 'debug_password'
      });
      
      if (funcError) {
        setResult(prev => prev + `❌ Function error: ${funcError.message}\n`);
        setResult(prev => prev + `   Code: ${funcError.code}\n`);
        setResult(prev => prev + `   Details: ${funcError.details}\n\n`);
      } else {
        setResult(prev => prev + `✅ Function call successful: ${JSON.stringify(funcData)}\n\n`);
      }
      
    } catch (error) {
      setResult(prev => prev + `❌ Error: ${error.message}\n`);
      setResult(prev => prev + `   Stack: ${error.stack}\n`);
    }
    
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#1a1a1a', color: 'white', fontFamily: 'monospace' }}>
      <h2>SafeNote Debug Tool</h2>
      <button 
        onClick={testConnection} 
        disabled={loading}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: loading ? '#666' : '#0066cc', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Testing...' : 'Test Connection & Functions'}
      </button>
      
      <pre style={{ 
        backgroundColor: '#000', 
        padding: '20px', 
        marginTop: '20px', 
        borderRadius: '5px',
        whiteSpace: 'pre-wrap',
        maxHeight: '400px',
        overflow: 'auto'
      }}>
        {result || 'Click the button to start debugging...'}
      </pre>
    </div>
  );
};

export default DebugTest;