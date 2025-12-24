// src/hooks/useAutoSave.js
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";

const AUTO_SAVE_KEY = "floorplanner_autosave";
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

export default function useAutoSave() {
  const objects = useSelector((s) => s.scene.objects);
  const settings = useSelector((s) => s.settings);
  const lastSaveRef = useRef(null);

  useEffect(() => {
    // Auto-save function
    const autoSave = () => {
      if (objects.length === 0) return;
      
      const autoSaveData = {
        objects,
        settings,
        savedAt: new Date().toISOString(),
      };
      
      try {
        localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(autoSaveData));
        lastSaveRef.current = Date.now();
        console.log("Auto-saved at", new Date().toLocaleTimeString());
      } catch (err) {
        console.warn("Auto-save failed:", err);
      }
    };

    // Set up interval
    const interval = setInterval(autoSave, AUTO_SAVE_INTERVAL);

    // Save on visibility change (when user switches tabs)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && objects.length > 0) {
        autoSave();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Save before unload
    const handleBeforeUnload = () => {
      if (objects.length > 0) {
        autoSave();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [objects, settings]);

  return lastSaveRef;
}

// Function to load auto-saved data
export function loadAutoSave() {
  try {
    const data = localStorage.getItem(AUTO_SAVE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn("Failed to load auto-save:", err);
  }
  return null;
}

// Function to clear auto-save
export function clearAutoSave() {
  localStorage.removeItem(AUTO_SAVE_KEY);
}

