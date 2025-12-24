// src/App.jsx
import { Canvas } from "@react-three/fiber";
import { Provider, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { store } from "./store/store";
import Scene from "./components/Scene";
import ViewToggle from "./ui/ViewToggle";
import BottomPanel from "./ui/BottomPanel";
import StatsPanel from "./ui/StatsPanel";
import ActionBar from "./ui/ActionBar";
import WelcomePanel from "./ui/WelcomePanel";
import SettingsPanel from "./ui/SettingsPanel";
import ProjectManager from "./ui/ProjectManager";
import SelectionInfo from "./ui/SelectionInfo";
import FurnitureLibrary from "./ui/FurnitureLibrary";
import ExportPanel from "./ui/ExportPanel";
import TemplatesPanel from "./ui/TemplatesPanel";
import AIDesignPanel from "./ui/AIDesignPanel";
import useKeyboardShortcuts from "./hooks/useKeyboardShortcuts";
import useAutoSave, { loadAutoSave } from "./hooks/useAutoSave";
import { loadProject } from "./store/sceneSlice";
import { updateSettings } from "./store/settingsSlice";

function AppContent() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  
  // Enable keyboard shortcuts
  useKeyboardShortcuts();
  
  // Enable auto-save
  useAutoSave();

  // Check for auto-saved data on mount
  useEffect(() => {
    const autoSaveData = loadAutoSave();
    if (autoSaveData && autoSaveData.objects?.length > 0) {
      const shouldRestore = window.confirm(
        `Found auto-saved project from ${new Date(autoSaveData.savedAt).toLocaleString()}. Would you like to restore it?`
      );
      if (shouldRestore) {
        dispatch(loadProject(autoSaveData.objects));
        if (autoSaveData.settings) {
          dispatch(updateSettings(autoSaveData.settings));
        }
      }
    }
    setIsLoading(false);
  }, [dispatch]);

  const handleLoadProject = (project) => {
    if (project.objects) {
      dispatch(loadProject(project.objects));
    }
    if (project.settings) {
      dispatch(updateSettings(project.settings));
    }
  };

  if (isLoading) {
    return (
      <div style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f5f5",
        flexDirection: "column",
        gap: "16px",
      }}>
        <div style={{ fontSize: "48px" }}>🏠</div>
        <div style={{ fontSize: "18px", fontWeight: 600, color: "#333" }}>Floor Planner</div>
        <div style={{ fontSize: "13px", color: "#666" }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <ViewToggle />
      <BottomPanel />
      <StatsPanel />
      <ActionBar />
      <WelcomePanel />
      <SettingsPanel />
      <ProjectManager onLoad={handleLoadProject} />
      <SelectionInfo />
      <FurnitureLibrary />
      <ExportPanel />
      <TemplatesPanel />
      <AIDesignPanel />

      <Canvas
        style={{
          width: "100vw",
          height: "100vh",
          position: "absolute",
          inset: 0,
          zIndex: 1,
        }}
        gl={{ preserveDrawingBuffer: true }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}