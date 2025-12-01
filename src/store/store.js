import { configureStore } from "@reduxjs/toolkit";
import viewModeReducer from "./viewModeSlice";

export const store = configureStore({
  reducer: {
    viewMode: viewModeReducer,
  }
});
