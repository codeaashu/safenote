import { configureStore } from '@reduxjs/toolkit'
import { pasteReducer } from '../features/PasteSlice'

export const store = configureStore({
  reducer: {
    paste: pasteReducer,
  },
})