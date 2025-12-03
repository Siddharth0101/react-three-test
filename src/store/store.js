import { configureStore } from "@reduxjs/toolkit";
import viewModeReducer from "./viewModeSlice";
import toolReducer from "./toolSlice";

export const store = configureStore({
  reducer: {
    viewMode: viewModeReducer,
    tool: toolReducer,
  }
});
