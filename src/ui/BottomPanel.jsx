// src/ui/BottomPanel.jsx
import { useDispatch, useSelector } from "react-redux";
import { selectTool, selectDefaultTool } from "../store/toolSlice";

export default function BottomPanel() {
  const dispatch = useDispatch();
  const selectedTool = useSelector((s) => s.tool.selectedTool);
  const mode = useSelector((s) => s.viewMode.mode);

  const tools = [
    { id: "select", label: "Select", icon: "↖", shortcut: "V" },
    { id: "wall", label: "Wall", icon: "▭", requiresMode: "2d", shortcut: "W" },
    { id: "door", label: "Door", icon: "🚪", requiresMode: "2d", shortcut: "D" },
    { id: "window", label: "Window", icon: "🪟", requiresMode: "2d", shortcut: "N" },
  ];

  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        padding: "8px 12px",
        display: "flex",
        gap: "6px",
        justifyContent: "center",
        zIndex: 999999,
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        border: "1px solid rgba(0,0,0,0.1)",
      }}
    >
      {tools.map((tool) => {
        const isDisabled = tool.requiresMode && tool.requiresMode !== mode;
        const isSelected = selectedTool === tool.id;

        return (
          <button
            key={tool.id}
            onClick={() => {
              if (tool.id === "select") {
                dispatch(selectDefaultTool());
              } else {
                dispatch(selectTool(tool.id));
              }
            }}
            disabled={isDisabled}
            title={
              isDisabled
                ? `${tool.label} tool requires ${tool.requiresMode.toUpperCase()} mode`
                : `${tool.label} (${tool.shortcut})`
            }
            style={{
              padding: "8px 16px",
              background: isSelected
                ? "#1a1a2e"
                : isDisabled
                ? "#f0f0f0"
                : "white",
              color: isSelected ? "white" : isDisabled ? "#999" : "#1a1a2e",
              border: "none",
              borderRadius: "8px",
              cursor: isDisabled ? "not-allowed" : "pointer",
              fontWeight: isSelected ? 600 : 400,
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.15s ease",
              opacity: isDisabled ? 0.5 : 1,
            }}
          >
            <span style={{ fontSize: "16px" }}>{tool.icon}</span>
            <span>{tool.label}</span>
            {!isDisabled && (
              <span
                style={{
                  fontSize: "10px",
                  background: isSelected ? "rgba(255,255,255,0.2)" : "#f0f0f0",
                  padding: "2px 5px",
                  borderRadius: "4px",
                  fontFamily: "monospace",
                  fontWeight: 600,
                }}
              >
                {tool.shortcut}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
