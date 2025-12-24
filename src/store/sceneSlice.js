// src/store/sceneSlice.js
import { createSlice } from "@reduxjs/toolkit";

let nextWallId = 1;
let nextDoorId = 1;
let nextWindowId = 1;
let nextFurnitureId = 1;
let nextTextId = 1;

const MAX_HISTORY = 50;

const sceneSlice = createSlice({
  name: "scene",
  initialState: {
    objects: [],
    history: [], // For undo
    future: [], // For redo
  },
  reducers: {
    addWall(state, action) {
      const { start, end, height = 3, thickness = 0.15 } = action.payload;
      // Save current state to history
      state.history.push([...state.objects]);
      if (state.history.length > MAX_HISTORY) state.history.shift();
      state.future = []; // Clear redo stack
      
      state.objects.push({
        id: `wall-${nextWallId++}`,
        type: "wall",
        start,
        end,
        height,
        thickness,
      });
    },
    addDoor(state, action) {
      const { wallId, position, width = 0.9, height = 2.1 } = action.payload;
      state.history.push([...state.objects]);
      if (state.history.length > MAX_HISTORY) state.history.shift();
      state.future = [];
      
      state.objects.push({
        id: `door-${nextDoorId++}`,
        type: "door",
        wallId,
        position,
        width,
        height,
      });
    },
    addWindow(state, action) {
      const {
        wallId,
        position,
        width = 1.0,
        height = 1.2,
        sillHeight = 0.9,
      } = action.payload;
      state.history.push([...state.objects]);
      if (state.history.length > MAX_HISTORY) state.history.shift();
      state.future = [];
      
      state.objects.push({
        id: `window-${nextWindowId++}`,
        type: "window",
        wallId,
        position,
        width,
        height,
        sillHeight,
      });
    },
    removeObject(state, action) {
      state.history.push([...state.objects]);
      if (state.history.length > MAX_HISTORY) state.history.shift();
      state.future = [];
      
      state.objects = state.objects.filter((o) => o.id !== action.payload);
    },
    clearObjects(state) {
      if (state.objects.length > 0) {
        state.history.push([...state.objects]);
        if (state.history.length > MAX_HISTORY) state.history.shift();
        state.future = [];
      }
      state.objects = [];
    },
    undo(state) {
      if (state.history.length > 0) {
        state.future.push([...state.objects]);
        state.objects = state.history.pop();
      }
    },
    redo(state) {
      if (state.future.length > 0) {
        state.history.push([...state.objects]);
        state.objects = state.future.pop();
      }
    },
    loadProject(state, action) {
      state.history.push([...state.objects]);
      if (state.history.length > MAX_HISTORY) state.history.shift();
      state.future = [];
      state.objects = action.payload || [];
    },
    addFurniture(state, action) {
      const { furnitureType, position, rotation = 0, customWidth, customDepth } = action.payload;
      state.history.push([...state.objects]);
      if (state.history.length > MAX_HISTORY) state.history.shift();
      state.future = [];
      
      state.objects.push({
        id: `furniture-${nextFurnitureId++}`,
        type: "furniture",
        furnitureType,
        position,
        rotation,
        customWidth,
        customDepth,
      });
    },
    addText(state, action) {
      const { text, position, fontSize = 0.2, color = "#333333" } = action.payload;
      state.history.push([...state.objects]);
      if (state.history.length > MAX_HISTORY) state.history.shift();
      state.future = [];
      
      state.objects.push({
        id: `text-${nextTextId++}`,
        type: "text",
        text,
        position,
        fontSize,
        color,
      });
    },
    updateObject(state, action) {
      const { id, updates } = action.payload;
      state.history.push([...state.objects]);
      if (state.history.length > MAX_HISTORY) state.history.shift();
      state.future = [];
      
      const obj = state.objects.find((o) => o.id === id);
      if (obj) {
        Object.assign(obj, updates);
      }
    },
    duplicateObject(state, action) {
      const obj = state.objects.find((o) => o.id === action.payload);
      if (obj) {
        state.history.push([...state.objects]);
        if (state.history.length > MAX_HISTORY) state.history.shift();
        state.future = [];
        
        const newObj = { ...obj };
        // Offset the position slightly
        if (newObj.position) {
          newObj.position = [newObj.position[0] + 0.5, newObj.position[1] + 0.5];
        } else if (newObj.start && newObj.end) {
          newObj.start = [newObj.start[0] + 0.5, newObj.start[1] + 0.5];
          newObj.end = [newObj.end[0] + 0.5, newObj.end[1] + 0.5];
        }
        
        // Generate new ID based on type
        if (newObj.type === "wall") newObj.id = `wall-${nextWallId++}`;
        else if (newObj.type === "door") newObj.id = `door-${nextDoorId++}`;
        else if (newObj.type === "window") newObj.id = `window-${nextWindowId++}`;
        else if (newObj.type === "furniture") newObj.id = `furniture-${nextFurnitureId++}`;
        else if (newObj.type === "text") newObj.id = `text-${nextTextId++}`;
        
        state.objects.push(newObj);
      }
    },
  },
});

export const { 
  addWall, 
  addDoor, 
  addWindow, 
  removeObject, 
  clearObjects,
  undo,
  redo,
  loadProject,
  addFurniture,
  addText,
  updateObject,
  duplicateObject,
} = sceneSlice.actions;
export default sceneSlice.reducer;
