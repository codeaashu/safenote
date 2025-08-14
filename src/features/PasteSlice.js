import { createSlice } from "@reduxjs/toolkit";
import toast from 'react-hot-toast';
import {
  fetchPastes,
  addPaste,
  updatePaste,
  deletePaste,
  fetchPasteById
} from './PasteThunks';

const initialState = {
  pastes: [],
  loading: false,
  error: null,
  selectedPaste: null,
};

export const pasteSlice = createSlice({
  name: "safenote",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all pastes
      .addCase(fetchPastes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPastes.fulfilled, (state, action) => {
        state.loading = false;
        state.pastes = action.payload;
      })
      .addCase(fetchPastes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Add paste
      .addCase(addPaste.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addPaste.fulfilled, (state, action) => {
        state.loading = false;
        state.pastes.unshift(action.payload);
        toast.success('Paste created successfully');
      })
      .addCase(addPaste.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        toast.error('Failed to create paste');
      })

      // Update paste
      .addCase(updatePaste.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePaste.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.pastes.findIndex(p => p.id === action.payload.id);
        if (idx !== -1) state.pastes[idx] = action.payload;
        toast.success('Paste updated!');
      })
      .addCase(updatePaste.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        toast.error(action.error.message || 'Failed to update paste');
      })

      // Delete paste
      .addCase(deletePaste.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePaste.fulfilled, (state, action) => {
        state.loading = false;
        state.pastes = state.pastes.filter(p => p.id !== action.payload);
        toast.success('Paste deleted!');
      })
      .addCase(deletePaste.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        toast.error(action.error.message || 'Failed to delete paste');
      })

      // Fetch paste by id
      .addCase(fetchPasteById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selectedPaste = null;
      })
      .addCase(fetchPasteById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPaste = action.payload;
      })
      .addCase(fetchPasteById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        state.selectedPaste = null;
        toast.error('Paste not found');
      });
  },
});

export const pasteReducer = pasteSlice.reducer;