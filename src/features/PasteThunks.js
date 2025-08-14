import { createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../lib/supabaseClient';

export const fetchPastes = createAsyncThunk('pastes/fetchAll', async () => {
  const { data, error } = await supabase
    .from('pastes')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
});

export const addPaste = createAsyncThunk('pastes/add', async (paste) => {
  const { data, error } = await supabase
    .from('pastes')
    .insert([{ title: paste.title, content: paste.content, username: paste.username }])
    .select()
    .single();
  if (error) throw error;
  return data;
});

export const updatePaste = createAsyncThunk('pastes/update', async ({ paste, password }) => {
  // First verify the user has permission to edit this paste
  if (paste.username) {
    const { data: user, error: authError } = await supabase
      .from('users')
      .select('username')
      .eq('username', paste.username)
      .eq('password', password)
      .single();

    if (authError || !user) {
      throw new Error('Invalid password. You cannot edit this paste.');
    }
  }

  const { data, error } = await supabase
    .from('pastes')
    .update({ title: paste.title, content: paste.content })
    .eq('id', paste.id)
    .select()
    .single();
  if (error) throw error;
  return data;
});

export const deletePaste = createAsyncThunk('pastes/delete', async (payload) => {
  // Handle both old format (just id) and new format (object with id, username, password)
  const id = typeof payload === 'string' ? payload : payload.id;
  const username = typeof payload === 'object' ? payload.username : null;
  const password = typeof payload === 'object' ? payload.password : null;

  // First verify the user has permission to delete this paste (if it has a username)
  if (username && password) {
    const { data: user, error: authError } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .eq('password', password)
      .single();

    if (authError || !user) {
      throw new Error('Invalid password. You cannot delete this paste.');
    }
  }

  const { error } = await supabase
    .from('pastes')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return id;
});

export const fetchPasteById = createAsyncThunk('pastes/fetchById', async (id) => {
  const { data, error } = await supabase
    .from('pastes')
    .select('*')
    .eq('id', id)
    .single();
  if (error) {
    console.error('fetchPasteById error:', error);
    throw error;
  }
  return data;
});

// New thunk for verifying paste access
export const verifyPasteAccess = createAsyncThunk('pastes/verifyAccess', async ({ username, password }) => {
  const { data, error } = await supabase
    .from('users')
    .select('username')
    .eq('username', username)
    .eq('password', password)
    .single();

  if (error || !data) {
    throw new Error('Invalid password');
  }
  return data;
});
