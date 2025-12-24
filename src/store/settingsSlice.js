// src/store/settingsSlice.js
import { createSlice } from "@reduxjs/toolkit";

const settingsSlice = createSlice({
  name: "settings",
  initialState: {
    // Grid settings
    snapToGrid: true,
    gridSize: 0.25, // 25cm grid
    showGrid: true,
    showMeasurements: true,
    
    // Wall defaults
    defaultWallHeight: 3,
    defaultWallThickness: 0.15,
    
    // Door/Window defaults
    defaultDoorWidth: 0.9,
    defaultDoorHeight: 2.1,
    defaultWindowWidth: 1.0,
    defaultWindowHeight: 1.2,
    defaultWindowSillHeight: 0.9,
    
    // UI settings
    darkMode: false,
    showWelcome: true,
  },
  reducers: {
    toggleSnapToGrid(state) {
      state.snapToGrid = !state.snapToGrid;
    },
    setGridSize(state, action) {
      state.gridSize = action.payload;
    },
    toggleShowGrid(state) {
      state.showGrid = !state.showGrid;
    },
    toggleShowMeasurements(state) {
      state.showMeasurements = !state.showMeasurements;
    },
    setDefaultWallHeight(state, action) {
      state.defaultWallHeight = action.payload;
    },
    setDefaultWallThickness(state, action) {
      state.defaultWallThickness = action.payload;
    },
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode;
    },
    hideWelcome(state) {
      state.showWelcome = false;
    },
    updateSettings(state, action) {
      return { ...state, ...action.payload };
    },
  },
});

export const {
  toggleSnapToGrid,
  setGridSize,
  toggleShowGrid,
  toggleShowMeasurements,
  setDefaultWallHeight,
  setDefaultWallThickness,
  toggleDarkMode,
  hideWelcome,
  updateSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;

// Utility function for snapping
export const snapToGrid = (value, gridSize, enabled) => {
  if (!enabled) return value;
  return Math.round(value / gridSize) * gridSize;
};

