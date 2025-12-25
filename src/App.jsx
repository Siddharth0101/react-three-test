// src/App.jsx
import { Canvas } from "@react-three/fiber";
import { Provider, useDispatch } from "react-redux";
import { useEffect, useState, Suspense } from "react";
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
import ErrorBoundary from "./ui/ErrorBoundary";
import KeyboardShortcutsPanel from "./ui/KeyboardShortcutsPanel";
import ObjectPropertiesPanel from "./ui/ObjectPropertiesPanel";
import StatusBar from "./ui/StatusBar";
import useKeyboardShortcuts from "./hooks/useKeyboardShortcuts";
import useAutoSave, { loadAutoSave } from "./hooks/useAutoSave";
import { loadProject } from "./store/sceneSlice";
import { updateSettings } from "./store/settingsSlice";

// Loading component for Canvas Suspense
function CanvasLoader() {
  return (
    <mesh>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshBasicMaterial color="#2563eb" wireframe />
    </mesh>
  );
}

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
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: "80px",
            height: "80px",
            background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
            borderRadius: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 32px rgba(37, 99, 235, 0.3)",
          }}
        >
          <span style={{ fontSize: "40px" }}>🏠</span>
        </div>
        <div style={{ fontSize: "22px", fontWeight: 700, color: "#1a1a2e" }}>
          Floor Planner Pro
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "8px",
              height: "8px",
              background: "#2563eb",
              borderRadius: "50%",
              animation: "pulse 1s infinite",
            }}
          />
          <span style={{ fontSize: "14px", color: "#64748b" }}>Loading workspace...</span>
        </div>
        <style>
          {`
            @keyframes pulse {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.5; transform: scale(1.2); }
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* UI Overlays */}
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
      <KeyboardShortcutsPanel />
      <ObjectPropertiesPanel />
      <StatusBar />

      {/* 3D Canvas */}
      <Canvas
        style={{
          width: "100vw",
          height: "100vh",
          position: "absolute",
          inset: 0,
          zIndex: 1,
        }}
        shadows
        gl={{
          preserveDrawingBuffer: true,
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        camera={{ position: [0, 0, 10], fov: 50 }}
        onCreated={({ gl }) => {
          gl.setClearColor("#f8fafc");
        }}
      >
        <Suspense fallback={<CanvasLoader />}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </Provider>
  );
}
