import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tasks: [],
  loading: false,
};

export const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setTask: (state, action) => {
      state.tasks = action.payload;
    },
  },
});

export const { setTask } = taskSlice.actions;
export default taskSlice.reducer;
