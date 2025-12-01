import { createSlice } from "@reduxjs/toolkit";

const viewModeSlice = createSlice({
  name: "viewMode",
  initialState: { mode: "3d" },
  reducers: {
    toggleMode(state) {
      state.mode = state.mode === "3d" ? "2d" : "3d";
    }
  }
});

export const { toggleMode } = viewModeSlice.actions;
export default viewModeSlice.reducer;
