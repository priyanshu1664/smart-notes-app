import { createSlice } from "@reduxjs/toolkit";

const initialState = { notes: [], isUpdate: false };

const notesSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
    setNotes: (state, action) => {
      state.notes = action.payload;
    },
    setIsUpdate: (state, action) => {
      state.isUpdate = action.payload;
    },
  },
});

export const { setNotes, setIsUpdate } = notesSlice.actions;

export default notesSlice.reducer;
