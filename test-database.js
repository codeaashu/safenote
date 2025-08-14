// Test script to verify Supabase database setup
// Run this in your browser console after the database is set up

import { supabase } from './src/lib/supabaseClient.js';

// Test 1: Check if users table exists and can insert data
async function testUsersTable() {
  console.log('Testing users table...');
  
  try {
    // Try to insert a test user
    const { data, error } = await supabase
      .from('users')
      .insert([{
        username: 'testuser',
        password: 'testpassword123'
      }])
      .select()
      .single();

    if (error) {
      console.error('Users table error:', error);
      return false;
    }

    console.log('✅ Users table working:', data);
    
    // Clean up - delete the test user
    await supabase
      .from('users')
      .delete()
      .eq('username', 'testuser');
    
    return true;
  } catch (err) {
    console.error('Users table test failed:', err);
    return false;
  }
}

// Test 2: Check if pastes table has username column
async function testPastesTable() {
  console.log('Testing pastes table...');
  
  try {
    // Try to insert a test paste with username
    const { data, error } = await supabase
      .from('pastes')
      .insert([{
        title: 'Test Paste',
        content: 'This is a test paste',
        username: 'testuser'
      }])
      .select()
      .single();

    if (error) {
      console.error('Pastes table error:', error);
      return false;
    }

    console.log('✅ Pastes table working:', data);
    
    // Clean up - delete the test paste
    await supabase
      .from('pastes')
      .delete()
      .eq('id', data.id);
    
    return true;
  } catch (err) {
    console.error('Pastes table test failed:', err);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('🧪 Starting Supabase database tests...');
  
  const usersTest = await testUsersTable();
  const pastesTest = await testPastesTable();
  
  if (usersTest && pastesTest) {
    console.log('🎉 All tests passed! Database is ready for SafeNote.');
  } else {
    console.log('❌ Some tests failed. Please check your database setup.');
  }
}

// Export for manual testing
window.testSupabase = runTests;
