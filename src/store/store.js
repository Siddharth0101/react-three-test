import { configureStore } from "@reduxjs/toolkit";
import viewModeReducer from "./viewModeSlice";
import toolReducer from "./toolSlice";
import sceneReducer from "./sceneSlice";
import settingsReducer from "./settingsSlice";

export const store = configureStore({
  reducer: {
    viewMode: viewModeReducer,
    tool: toolReducer,
    scene: sceneReducer,
    settings: settingsReducer,
  },
});
