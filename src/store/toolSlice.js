// src/store/toolSlice.js
import { createSlice } from "@reduxjs/toolkit";

const toolSlice = createSlice({
  name: "tool",
  initialState: {
    selectedTool: "select",
  },
  reducers: {
    selectDefaultTool(state) {
      state.selectedTool = "select";
    },
  },
});

export const {
  selectDefaultTool,
} = toolSlice.actions;

export default toolSlice.reducer;
