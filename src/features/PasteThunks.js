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
    .insert([{ title: paste.title, content: paste.content }])
    .select()
    .single();
  if (error) throw error;
  return data;
});

export const updatePaste = createAsyncThunk('pastes/update', async (paste) => {
  const { data, error } = await supabase
    .from('pastes')
    .update({ title: paste.title, content: paste.content })
    .eq('id', paste.id)
    .select()
    .single();
  if (error) throw error;
  return data;
});

export const deletePaste = createAsyncThunk('pastes/delete', async (id) => {
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
  if (error) throw error;
  return data;
});
