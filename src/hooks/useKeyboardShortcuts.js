// src/hooks/useKeyboardShortcuts.js
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectTool, selectDefaultTool, clearSelection } from "../store/toolSlice";
import { undo, redo, removeObject, duplicateObject } from "../store/sceneSlice";

export default function useKeyboardShortcuts() {
  const dispatch = useDispatch();
  const mode = useSelector((s) => s.viewMode.mode);
  const selectedObjectId = useSelector((s) => s.tool.selectedObjectId);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        return;
      }

      // Undo: Ctrl+Z
      if (e.ctrlKey && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        dispatch(undo());
        return;
      }

      // Redo: Ctrl+Shift+Z or Ctrl+Y
      if ((e.ctrlKey && e.shiftKey && e.key === "Z") || (e.ctrlKey && e.key === "y")) {
        e.preventDefault();
        dispatch(redo());
        return;
      }

      // Duplicate: Ctrl+D
      if (e.ctrlKey && e.key === "d" && selectedObjectId) {
        e.preventDefault();
        dispatch(duplicateObject(selectedObjectId));
        return;
      }

      // Delete selected object
      if ((e.key === "Delete" || e.key === "Backspace") && selectedObjectId) {
        e.preventDefault();
        dispatch(removeObject(selectedObjectId));
        dispatch(clearSelection());
        return;
      }

      // Only allow tool shortcuts in 2D mode
      if (mode !== "2d") return;

      switch (e.key.toLowerCase()) {
        case "w":
          if (!e.ctrlKey) dispatch(selectTool("wall"));
          break;
        case "d":
          if (!e.ctrlKey) dispatch(selectTool("door"));
          break;
        case "n":
          dispatch(selectTool("window"));
          break;
        case "f":
          // Could open furniture panel
          break;
        case "t":
          dispatch(selectTool("text"));
          break;
        case "m":
          dispatch(selectTool("measure"));
          break;
        case "v":
          dispatch(selectDefaultTool());
          break;
        case "escape":
          dispatch(selectDefaultTool());
          dispatch(clearSelection());
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch, mode, selectedObjectId]);
}

