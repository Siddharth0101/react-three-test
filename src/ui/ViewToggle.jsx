import { useDispatch, useSelector } from "react-redux";
import { setMode } from "../store/viewModeSlice";
import { useState } from "react";

export default function ViewToggle() {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.viewMode.mode);
  const [hoveredMode, setHoveredMode] = useState(null);

  const modes = [
    { 
      id: "2d", 
      label: "2D Plan", 
      icon: "📐",
      description: "Edit floor plan from above"
    },
    { 
      id: "3d", 
      label: "3D View", 
      icon: "🏠",
      description: "Orbit around your design" 
    },
    { 
      id: "walkthrough", 
      label: "Walkthrough", 
      icon: "🚶",
      description: "Walk through your space"
    },
  ];

  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 999999,
        display: "flex",
        gap: "4px",
        background: "rgba(255, 255, 255, 0.98)",
        backdropFilter: "blur(12px)",
        padding: "6px",
        borderRadius: "14px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)",
      }}
    >
      {modes.map((m) => {
        const isActive = mode === m.id;
        const isHovered = hoveredMode === m.id;
        
        return (
          <div
            key={m.id}
            style={{ position: "relative" }}
            onMouseEnter={() => setHoveredMode(m.id)}
            onMouseLeave={() => setHoveredMode(null)}
          >
            <button
              onClick={() => dispatch(setMode(m.id))}
              style={{
                padding: "10px 18px",
                background: isActive
                  ? "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)"
                  : isHovered
                  ? "#f8fafc"
                  : "transparent",
                color: isActive ? "white" : "#1a1a2e",
                border: isActive ? "none" : "1px solid transparent",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: isActive ? 600 : 500,
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: isActive ? "0 4px 12px rgba(26, 26, 46, 0.3)" : "none",
              }}
            >
              <span style={{ fontSize: "16px" }}>{m.icon}</span>
              {m.label}
            </button>
            
            {/* Tooltip */}
            {isHovered && !isActive && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
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
                {m.description}
                <div
                  style={{
                    position: "absolute",
                    top: "-5px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 0,
                    height: 0,
                    borderLeft: "6px solid transparent",
                    borderRight: "6px solid transparent",
                    borderBottom: "6px solid #1a1a2e",
                  }}
                />
              </div>
            )}
          </div>
        );
      })}

      {/* Instructions for walkthrough mode */}
      {mode === "walkthrough" && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            marginTop: "12px",
            background: "linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%)",
            color: "white",
            padding: "12px 18px",
            borderRadius: "10px",
            fontSize: "12px",
            whiteSpace: "nowrap",
            boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <kbd style={{ 
                background: "rgba(255,255,255,0.15)", 
                padding: "3px 6px", 
                borderRadius: "4px",
                fontSize: "11px",
                fontFamily: "SF Mono, Monaco, monospace"
              }}>Click</kbd>
              <span style={{ color: "rgba(255,255,255,0.7)" }}>look around</span>
            </span>
            <span style={{ color: "rgba(255,255,255,0.3)" }}>•</span>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <kbd style={{ 
                background: "rgba(255,255,255,0.15)", 
                padding: "3px 6px", 
                borderRadius: "4px",
                fontSize: "11px",
                fontFamily: "SF Mono, Monaco, monospace"
              }}>WASD</kbd>
              <span style={{ color: "rgba(255,255,255,0.7)" }}>move</span>
            </span>
            <span style={{ color: "rgba(255,255,255,0.3)" }}>•</span>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <kbd style={{ 
                background: "rgba(255,255,255,0.15)", 
                padding: "3px 6px", 
                borderRadius: "4px",
                fontSize: "11px",
                fontFamily: "SF Mono, Monaco, monospace"
              }}>ESC</kbd>
              <span style={{ color: "rgba(255,255,255,0.7)" }}>unlock</span>
            </span>
          </div>
        </div>
      )}
      
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateX(-50%) translateY(4px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
          }
        `}
      </style>
    </div>
  );
}
