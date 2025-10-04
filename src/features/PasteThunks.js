import { createAsyncThunk } from '@reduxjs/toolkit';
import { getSupabaseClient } from '../lib/supabaseClient';

export const fetchPastes = createAsyncThunk('pastes/fetchAll', async () => {
  const client = await getSupabaseClient();
  const { data, error } = await client
    .from('pastes')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
});

export const addPaste = createAsyncThunk('pastes/add', async (paste) => {
  const client = await getSupabaseClient();
  const { data, error } = await client
    .from('pastes')
    .insert([{ title: paste.title, content: paste.content }])
    .select()
    .single();
  if (error) throw error;
  return data;
});

export const updatePaste = createAsyncThunk('pastes/update', async (paste) => {
  const client = await getSupabaseClient();
  const { data, error } = await client
    .from('pastes')
    .update({ title: paste.title, content: paste.content })
    .eq('id', paste.id)
    .select()
    .single();
  if (error) throw error;
  return data;
});

export const deletePaste = createAsyncThunk('pastes/delete', async (id) => {
  const client = await getSupabaseClient();
  const { error } = await client
    .from('pastes')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return id;
});

// ...existing code...
export const fetchPasteById = createAsyncThunk('pastes/fetchById', async (id) => {
  const client = await getSupabaseClient();
  const { data, error } = await client
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
