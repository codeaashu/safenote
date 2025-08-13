import { createSlice } from "@reduxjs/toolkit";
import toast from 'react-hot-toast';

const initialState = {
  pastes: localStorage.getItem("pastes")
    ? JSON.parse(localStorage.getItem("pastes"))
    : [],
};

export const pasteSlice = createSlice({
  name: "safenote",
  initialState,
  reducers: {
    addToPaste: (state, action) => {
      const paste = action.payload;
      
      // Validate empty paste
      if (!paste.title.trim() || !paste.content.trim()) {
        toast.error('Title and content are required!');
        return;
      }

      // Check for duplicate title
      const isDuplicate = state.pastes.some(
        (item) => item.title.toLowerCase() === paste.title.toLowerCase()
      );

      if (isDuplicate) {
        toast.error('A paste with this title already exists!');
        return;
      }

      state.pastes.push(paste);
      localStorage.setItem("pastes", JSON.stringify(state.pastes));
      toast.success('Paste created successfully');
    },

    updateToPaste: (state, action) => {
      const paste = action.payload;
      const index = state.pastes.findIndex((item) => 
        item._id === paste._id
      );
      
      // Validate empty paste
      if (!paste.title.trim() || !paste.content.trim()) {
        toast.error('Title and content are required!');
        return;
      }

      if (index >= 0) {
        state.pastes[index] = paste;
        localStorage.setItem("pastes", JSON.stringify(state.pastes));
        toast.success('Paste Updated!');
      }
    },

    removeFromPaste: (state, action) => {
      const pasteId = action.payload;
      const index = state.pastes.findIndex((item) => 
        item._id === pasteId
      );

      if (index >= 0) {
        state.pastes.splice(index, 1);
        localStorage.setItem("pastes", JSON.stringify(state.pastes));
        toast.success("Paste Deleted!");
      }
    },

    resetAllPaste: (state) => {
      state.pastes = [];
      localStorage.removeItem("pastes");
    },
  },
});

export const { addToPaste, updateToPaste, resetAllPaste, removeFromPaste } = pasteSlice.actions;
export const pasteReducer = pasteSlice.reducer;