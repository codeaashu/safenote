// Simple test to check Supabase connection
// Add this to your browser console to test

import { supabase } from './src/lib/supabaseClient.js';

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test 1: Check if we can connect to Supabase
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact' });
    
    if (error) {
      console.error('❌ Connection error:', error);
      return false;
    }
    
    console.log('✅ Connected to Supabase successfully');
    console.log('Users table count:', data);
    
    // Test 2: Try to insert a test user
    const testUsername = 'test_' + Math.random().toString(36).substr(2, 9);
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert([{
        username: testUsername,
        password: 'testpass123'
      }])
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Insert error:', insertError);
      return false;
    }
    
    console.log('✅ Successfully inserted test user:', insertData);
    
    // Clean up - delete the test user
    await supabase
      .from('users')
      .delete()
      .eq('id', insertData.id);
    
    console.log('✅ Test completed successfully');
    return true;
    
  } catch (err) {
    console.error('❌ Test failed:', err);
    return false;
  }
}

// Run the test
testConnection();
