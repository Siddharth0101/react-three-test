// src/store/toolSlice.js
import { createSlice } from "@reduxjs/toolkit";

const toolSlice = createSlice({
  name: "tool",
  initialState: {
    selectedTool: "select", // "select" | "line"
    isDrawing: false,
    currentPoints: [],      // [[x,y,z], [x,y,z], ...] for active polyline
  },
  reducers: {
    selectLineTool(state) {
      state.selectedTool = "line";
      state.isDrawing = false;
      state.currentPoints = [];
    },
    selectDefaultTool(state) {
      state.selectedTool = "select";
      state.isDrawing = false;
      state.currentPoints = [];
    },
    startLine(state, action) {
      state.isDrawing = true;
      state.currentPoints = [action.payload]; // first point
    },
    addLinePoint(state, action) {
      state.currentPoints.push(action.payload);
    },
    resetLine(state) {
      state.isDrawing = false;
      state.currentPoints = [];
    },
  },
});

export const {
  selectLineTool,
  selectDefaultTool,
  startLine,
  addLinePoint,
  resetLine,
} = toolSlice.actions;

export default toolSlice.reducer;
