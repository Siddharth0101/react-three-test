// src/store/toolSlice.js
import { createSlice } from "@reduxjs/toolkit";

const toolSlice = createSlice({
  name: "tool",
  initialState: {
    selectedTool: "select",
    // Wall tool state
    wallStart: null, // [x, y] first click point
    // Selection state
    selectedObjectId: null,
    hoveredObjectId: null,
  },
  reducers: {
    selectTool(state, action) {
      state.selectedTool = action.payload;
      // Reset tool-specific state when switching tools
      state.wallStart = null;
      state.selectedObjectId = null;
    },
    selectDefaultTool(state) {
      state.selectedTool = "select";
      state.wallStart = null;
    },
    setWallStart(state, action) {
      state.wallStart = action.payload;
    },
    clearWallStart(state) {
      state.wallStart = null;
    },
    selectObject(state, action) {
      state.selectedObjectId = action.payload;
    },
    clearSelection(state) {
      state.selectedObjectId = null;
    },
    setHoveredObject(state, action) {
      state.hoveredObjectId = action.payload;
    },
  },
});

export const { 
  selectTool, 
  selectDefaultTool, 
  setWallStart, 
  clearWallStart,
  selectObject,
  clearSelection,
  setHoveredObject,
} = toolSlice.actions;

export default toolSlice.reducer;
