// src/ui/TemplatesPanel.jsx
import { useState } from "react";
import { useDispatch } from "react-redux";
import { loadProject } from "../store/sceneSlice";

// Pre-built room templates
const TEMPLATES = {
  studio: {
    name: "Studio Apartment",
    description: "Compact living space ~30m²",
    icon: "🏠",
    objects: [
      { id: "wall-t1", type: "wall", start: [0, 0], end: [6, 0], height: 3, thickness: 0.15 },
      { id: "wall-t2", type: "wall", start: [6, 0], end: [6, 5], height: 3, thickness: 0.15 },
      { id: "wall-t3", type: "wall", start: [6, 5], end: [0, 5], height: 3, thickness: 0.15 },
      { id: "wall-t4", type: "wall", start: [0, 5], end: [0, 0], height: 3, thickness: 0.15 },
      // Bathroom partition
      { id: "wall-t5", type: "wall", start: [0, 3.5], end: [2, 3.5], height: 3, thickness: 0.15 },
      { id: "wall-t6", type: "wall", start: [2, 3.5], end: [2, 5], height: 3, thickness: 0.15 },
      // Door
      { id: "door-t1", type: "door", wallId: "wall-t4", position: 0.3, width: 0.9, height: 2.1 },
      // Bathroom door
      { id: "door-t2", type: "door", wallId: "wall-t5", position: 0.7, width: 0.7, height: 2.1 },
      // Window
      { id: "window-t1", type: "window", wallId: "wall-t2", position: 0.5, width: 1.2, height: 1.2, sillHeight: 0.9 },
    ],
  },
  oneBedroom: {
    name: "1 Bedroom Apartment",
    description: "Separate bedroom ~45m²",
    icon: "🛏️",
    objects: [
      // Outer walls
      { id: "wall-t1", type: "wall", start: [0, 0], end: [8, 0], height: 3, thickness: 0.15 },
      { id: "wall-t2", type: "wall", start: [8, 0], end: [8, 6], height: 3, thickness: 0.15 },
      { id: "wall-t3", type: "wall", start: [8, 6], end: [0, 6], height: 3, thickness: 0.15 },
      { id: "wall-t4", type: "wall", start: [0, 6], end: [0, 0], height: 3, thickness: 0.15 },
      // Bedroom wall
      { id: "wall-t5", type: "wall", start: [5, 0], end: [5, 4], height: 3, thickness: 0.15 },
      // Bathroom walls
      { id: "wall-t6", type: "wall", start: [0, 4], end: [2.5, 4], height: 3, thickness: 0.15 },
      { id: "wall-t7", type: "wall", start: [2.5, 4], end: [2.5, 6], height: 3, thickness: 0.15 },
      // Doors
      { id: "door-t1", type: "door", wallId: "wall-t4", position: 0.25, width: 0.9, height: 2.1 },
      { id: "door-t2", type: "door", wallId: "wall-t5", position: 0.6, width: 0.8, height: 2.1 },
      { id: "door-t3", type: "door", wallId: "wall-t6", position: 0.7, width: 0.7, height: 2.1 },
      // Windows
      { id: "window-t1", type: "window", wallId: "wall-t2", position: 0.3, width: 1.0, height: 1.2, sillHeight: 0.9 },
      { id: "window-t2", type: "window", wallId: "wall-t2", position: 0.7, width: 1.0, height: 1.2, sillHeight: 0.9 },
    ],
  },
  office: {
    name: "Small Office",
    description: "Open plan office ~40m²",
    icon: "💼",
    objects: [
      { id: "wall-t1", type: "wall", start: [0, 0], end: [8, 0], height: 3, thickness: 0.15 },
      { id: "wall-t2", type: "wall", start: [8, 0], end: [8, 5], height: 3, thickness: 0.15 },
      { id: "wall-t3", type: "wall", start: [8, 5], end: [0, 5], height: 3, thickness: 0.15 },
      { id: "wall-t4", type: "wall", start: [0, 5], end: [0, 0], height: 3, thickness: 0.15 },
      // Meeting room
      { id: "wall-t5", type: "wall", start: [5.5, 0], end: [5.5, 2.5], height: 3, thickness: 0.15 },
      { id: "wall-t6", type: "wall", start: [5.5, 2.5], end: [8, 2.5], height: 3, thickness: 0.15 },
      // Doors
      { id: "door-t1", type: "door", wallId: "wall-t4", position: 0.5, width: 1.0, height: 2.1 },
      { id: "door-t2", type: "door", wallId: "wall-t5", position: 0.6, width: 0.9, height: 2.1 },
      // Windows
      { id: "window-t1", type: "window", wallId: "wall-t2", position: 0.25, width: 1.5, height: 1.5, sillHeight: 0.8 },
      { id: "window-t2", type: "window", wallId: "wall-t2", position: 0.75, width: 1.5, height: 1.5, sillHeight: 0.8 },
      { id: "window-t3", type: "window", wallId: "wall-t3", position: 0.5, width: 2.0, height: 1.5, sillHeight: 0.8 },
    ],
  },
  lShaped: {
    name: "L-Shaped Room",
    description: "L-shaped living area ~35m²",
    icon: "📐",
    objects: [
      { id: "wall-t1", type: "wall", start: [0, 0], end: [7, 0], height: 3, thickness: 0.15 },
      { id: "wall-t2", type: "wall", start: [7, 0], end: [7, 3], height: 3, thickness: 0.15 },
      { id: "wall-t3", type: "wall", start: [7, 3], end: [4, 3], height: 3, thickness: 0.15 },
      { id: "wall-t4", type: "wall", start: [4, 3], end: [4, 6], height: 3, thickness: 0.15 },
      { id: "wall-t5", type: "wall", start: [4, 6], end: [0, 6], height: 3, thickness: 0.15 },
      { id: "wall-t6", type: "wall", start: [0, 6], end: [0, 0], height: 3, thickness: 0.15 },
      // Door
      { id: "door-t1", type: "door", wallId: "wall-t6", position: 0.25, width: 0.9, height: 2.1 },
      // Windows
      { id: "window-t1", type: "window", wallId: "wall-t1", position: 0.5, width: 1.5, height: 1.2, sillHeight: 0.9 },
      { id: "window-t2", type: "window", wallId: "wall-t4", position: 0.5, width: 1.0, height: 1.2, sillHeight: 0.9 },
    ],
  },
};

export default function TemplatesPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();

  const handleLoadTemplate = (templateKey) => {
    const template = TEMPLATES[templateKey];
    if (template) {
      if (window.confirm(`Load "${template.name}" template? This will replace your current design.`)) {
        dispatch(loadProject(template.objects));
        setIsOpen(false);
      }
    }
  };

  return (
    <>
      {/* Templates Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          top: 70,
          left: 110,
          padding: "8px 14px",
          borderRadius: "10px",
          background: isOpen ? "#1a1a2e" : "rgba(255, 255, 255, 0.95)",
          color: isOpen ? "white" : "#1a1a2e",
          border: "1px solid rgba(0,0,0,0.1)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          cursor: "pointer",
          fontSize: "13px",
          fontWeight: 500,
          display: "flex",
          alignItems: "center",
          gap: "6px",
          zIndex: 999998,
        }}
      >
        <span>📋</span> Templates
      </button>

      {/* Templates Panel */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: 110,
            left: 110,
            width: "300px",
            background: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(10px)",
            borderRadius: "16px",
            boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
            border: "1px solid rgba(0,0,0,0.1)",
            zIndex: 999998,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "16px",
              borderBottom: "1px solid #eee",
              fontWeight: 700,
              fontSize: "15px",
              color: "#1a1a2e",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>📋 Room Templates</span>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "none",
                border: "none",
                fontSize: "18px",
                cursor: "pointer",
                color: "#666",
              }}
            >
              ×
            </button>
          </div>

          <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {Object.entries(TEMPLATES).map(([key, template]) => (
              <button
                key={key}
                onClick={() => handleLoadTemplate(key)}
                style={{
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid #e0e0e0",
                  background: "white",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  transition: "all 0.15s",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f5f5f5";
                  e.currentTarget.style.borderColor = "#2196F3";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "white";
                  e.currentTarget.style.borderColor = "#e0e0e0";
                }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    background: "#f0f0f0",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "22px",
                  }}
                >
                  {template.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "13px", color: "#333" }}>
                    {template.name}
                  </div>
                  <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>
                    {template.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

