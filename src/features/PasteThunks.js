import { createAsyncThunk } from '@reduxjs/toolkit';
import secureSupabase from '../lib/supabaseClient';

export const fetchPastes = createAsyncThunk('pastes/fetchAll', async () => {
  // Use secure function instead of direct table access
  const data = await secureSupabase.getUserPastes('admin'); // fallback for old code
  return data.pastes || [];
});

export const addPaste = createAsyncThunk('pastes/add', async (paste) => {
  // Use secure function instead of direct table access
  const data = await secureSupabase.createPaste(
    'admin', // fallback username
    paste.title,
    paste.content
  );
  if (!data.success) throw new Error(data.error);
  return { id: data.id, title: paste.title, content: paste.content };
});

export const updatePaste = createAsyncThunk('pastes/update', async (paste) => {
  // Note: Update functionality would need to be implemented in database functions
  // For now, return the paste as-is since direct table access is disabled
  console.warn('Update paste: Direct table access disabled. Implement secure update function.');
  return paste;
});

export const deletePaste = createAsyncThunk('pastes/delete', async (id) => {
  // Note: Delete functionality would need to be implemented in database functions
  // For now, just return the id since direct table access is disabled
  console.warn('Delete paste: Direct table access disabled. Implement secure delete function.');
  return id;
});

// ...existing code...
export const fetchPasteById = createAsyncThunk('pastes/fetchById', async (id) => {
  try {
    const data = await secureSupabase.getPaste(id);
    if (!data.success) throw new Error(data.error);
    return data;
  } catch (error) {
    console.error('fetchPasteById error:', error);
    throw error;
  }
});
