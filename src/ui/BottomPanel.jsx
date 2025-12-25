// src/ui/BottomPanel.jsx
import { useDispatch, useSelector } from "react-redux";
import { selectTool, selectDefaultTool } from "../store/toolSlice";
import { useState } from "react";

export default function BottomPanel() {
  const dispatch = useDispatch();
  const selectedTool = useSelector((s) => s.tool.selectedTool);
  const mode = useSelector((s) => s.viewMode.mode);
  const [showTooltip, setShowTooltip] = useState(null);

  const tools = [
    { id: "select", label: "Select", icon: "↖", shortcut: "V", description: "Select and move objects" },
    { id: "wall", label: "Wall", icon: "▭", requiresMode: "2d", shortcut: "W", description: "Draw walls by clicking start and end points" },
    { id: "door", label: "Door", icon: "🚪", requiresMode: "2d", shortcut: "D", description: "Add doors to walls" },
    { id: "window", label: "Window", icon: "🪟", requiresMode: "2d", shortcut: "N", description: "Add windows to walls" },
    { id: "text", label: "Text", icon: "T", requiresMode: "2d", shortcut: "T", description: "Add text labels and annotations" },
    { id: "measure", label: "Measure", icon: "📏", requiresMode: "2d", shortcut: "M", description: "Measure distances between points" },
  ];

  return (
    <div
      style={{
        position: "fixed",
        bottom: 44,
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(255, 255, 255, 0.98)",
        backdropFilter: "blur(12px)",
        padding: "10px 14px",
        display: "flex",
        gap: "6px",
        justifyContent: "center",
        zIndex: 999999,
        borderRadius: "14px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)",
      }}
    >
      {tools.map((tool) => {
        const isDisabled = tool.requiresMode && tool.requiresMode !== mode;
        const isSelected = selectedTool === tool.id;

        return (
          <div
            key={tool.id}
            style={{ position: "relative" }}
            onMouseEnter={() => setShowTooltip(tool.id)}
            onMouseLeave={() => setShowTooltip(null)}
          >
            <button
              onClick={() => {
                if (tool.id === "select") {
                  dispatch(selectDefaultTool());
                } else {
                  dispatch(selectTool(tool.id));
                }
              }}
              disabled={isDisabled}
              style={{
                padding: "10px 18px",
                background: isSelected
                  ? "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"
                  : isDisabled
                  ? "#f5f5f5"
                  : "white",
                color: isSelected ? "white" : isDisabled ? "#aaa" : "#1a1a2e",
                border: isSelected ? "none" : "1px solid rgba(0,0,0,0.08)",
                borderRadius: "10px",
                cursor: isDisabled ? "not-allowed" : "pointer",
                fontWeight: isSelected ? 600 : 500,
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                opacity: isDisabled ? 0.5 : 1,
                boxShadow: isSelected
                  ? "0 4px 12px rgba(37, 99, 235, 0.3)"
                  : "0 1px 3px rgba(0,0,0,0.05)",
                transform: isSelected ? "translateY(-1px)" : "none",
              }}
              onMouseEnter={(e) => {
                if (!isDisabled && !isSelected) {
                  e.currentTarget.style.background = "#f8fafc";
                  e.currentTarget.style.borderColor = "#2563eb";
                }
              }}
              onMouseLeave={(e) => {
                if (!isDisabled && !isSelected) {
                  e.currentTarget.style.background = "white";
                  e.currentTarget.style.borderColor = "rgba(0,0,0,0.08)";
                }
              }}
            >
              <span style={{ fontSize: tool.icon.length === 1 ? "16px" : "15px", fontWeight: 700 }}>
                {tool.icon}
              </span>
              <span>{tool.label}</span>
              {!isDisabled && (
                <span
                  style={{
                    fontSize: "10px",
                    background: isSelected ? "rgba(255,255,255,0.25)" : "#f0f0f0",
                    color: isSelected ? "rgba(255,255,255,0.9)" : "#666",
                    padding: "3px 6px",
                    borderRadius: "5px",
                    fontFamily: "SF Mono, Monaco, monospace",
                    fontWeight: 600,
                    letterSpacing: "0.5px",
                  }}
                >
                  {tool.shortcut}
                </span>
              )}
            </button>

            {/* Tooltip */}
            {showTooltip === tool.id && !isDisabled && (
              <div
                style={{
                  position: "absolute",
                  bottom: "calc(100% + 10px)",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "#1a1a2e",
                  color: "white",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  whiteSpace: "nowrap",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  zIndex: 1000,
                  animation: "fadeIn 0.15s ease",
                }}
              >
                {tool.description}
                <div
                  style={{
                    position: "absolute",
                    bottom: "-5px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 0,
                    height: 0,
                    borderLeft: "6px solid transparent",
                    borderRight: "6px solid transparent",
                    borderTop: "6px solid #1a1a2e",
                  }}
                />
              </div>
            )}

            {/* Mode indicator for disabled tools */}
            {isDisabled && showTooltip === tool.id && (
              <div
                style={{
                  position: "absolute",
                  bottom: "calc(100% + 10px)",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "#f59e0b",
                  color: "white",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  whiteSpace: "nowrap",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  zIndex: 1000,
                }}
              >
                Switch to 2D mode to use this tool
                <div
                  style={{
                    position: "absolute",
                    bottom: "-5px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 0,
                    height: 0,
                    borderLeft: "6px solid transparent",
                    borderRight: "6px solid transparent",
                    borderTop: "6px solid #f59e0b",
                  }}
                />
              </div>
            )}
          </div>
        );
      })}

      {/* Separator */}
      <div
        style={{
          width: "1px",
          background: "rgba(0,0,0,0.1)",
          margin: "0 6px",
          alignSelf: "stretch",
        }}
      />

      {/* Mode indicator */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0 12px",
          fontSize: "12px",
          color: "#666",
          fontWeight: 500,
        }}
      >
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: mode === "2d" ? "#22c55e" : mode === "3d" ? "#3b82f6" : "#f59e0b",
            marginRight: "8px",
          }}
        />
        {mode.toUpperCase()} Mode
      </div>
    </div>
  );
}
