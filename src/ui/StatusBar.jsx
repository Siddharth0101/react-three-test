// src/ui/StatusBar.jsx
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";

export default function StatusBar() {
  const selectedTool = useSelector((s) => s.tool.selectedTool);
  const selectedObjectId = useSelector((s) => s.tool.selectedObjectId);
  const mode = useSelector((s) => s.viewMode.mode);
  const objects = useSelector((s) => s.scene.objects);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const getToolTip = () => {
    if (mode !== "2d") {
      return mode === "3d" 
        ? "Drag to rotate • Scroll to zoom • Right-click to pan"
        : "WASD to move • Mouse to look • ESC to unlock";
    }

    switch (selectedTool) {
      case "select":
        return selectedObjectId 
          ? "Click empty area to deselect • Press Del to delete • Ctrl+D to duplicate"
          : "Click objects to select • Drag to move";
      case "wall":
        return "Click to start wall • Click again to finish • ESC to cancel";
      case "door":
        return "Click on a wall to place door";
      case "window":
        return "Click on a wall to place window";
      case "text":
        return "Click to add text annotation";
      case "measure":
        return "Click to start measuring • Click again to finish • Right-click to cancel";
      default:
        return "Select a tool to begin";
    }
  };

  // Count objects by type
  const wallCount = objects.filter(o => o.type === "wall").length;
  const doorCount = objects.filter(o => o.type === "door").length;
  const windowCount = objects.filter(o => o.type === "window").length;
  const furnitureCount = objects.filter(o => o.type === "furniture").length;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "28px",
        background: "rgba(26, 26, 46, 0.95)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        fontSize: "12px",
        color: "rgba(255,255,255,0.7)",
        zIndex: 999996,
        borderTop: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      {/* Left section - Tool tip */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "#22c55e",
            boxShadow: "0 0 6px #22c55e",
          }}
        />
        <span>{getToolTip()}</span>
      </div>

      {/* Center section - Object counts */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {wallCount > 0 && (
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ opacity: 0.6 }}>▭</span> {wallCount}
          </span>
        )}
        {doorCount > 0 && (
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ opacity: 0.6 }}>🚪</span> {doorCount}
          </span>
        )}
        {windowCount > 0 && (
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ opacity: 0.6 }}>🪟</span> {windowCount}
          </span>
        )}
        {furnitureCount > 0 && (
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ opacity: 0.6 }}>🛋️</span> {furnitureCount}
          </span>
        )}
      </div>

      {/* Right section - Mode & Time */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <span
          style={{
            padding: "2px 8px",
            background: "rgba(255,255,255,0.1)",
            borderRadius: "4px",
            fontWeight: 500,
          }}
        >
          {mode.toUpperCase()}
        </span>
        <span style={{ fontFamily: "SF Mono, Monaco, monospace", fontSize: "11px" }}>
          {time.toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}

