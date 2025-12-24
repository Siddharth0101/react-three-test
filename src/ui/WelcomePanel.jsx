// src/ui/WelcomePanel.jsx
import { useSelector } from "react-redux";

export default function WelcomePanel() {
  const objects = useSelector((s) => s.scene.objects);
  const mode = useSelector((s) => s.viewMode.mode);

  // Only show when no objects and in 2D mode
  if (objects.length > 0 || mode !== "2d") return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        background: "rgba(255, 255, 255, 0.98)",
        backdropFilter: "blur(10px)",
        padding: "32px 40px",
        borderRadius: "16px",
        boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
        border: "1px solid rgba(0,0,0,0.08)",
        zIndex: 999997,
        textAlign: "center",
        maxWidth: "400px",
      }}
    >
      <div style={{ fontSize: "48px", marginBottom: "16px" }}>🏠</div>
      <h2
        style={{
          margin: "0 0 8px 0",
          color: "#1a1a2e",
          fontSize: "22px",
          fontWeight: 700,
        }}
      >
        Welcome to Floor Planner
      </h2>
      <p
        style={{
          margin: "0 0 24px 0",
          color: "#666",
          fontSize: "14px",
          lineHeight: 1.5,
        }}
      >
        Create your floor plan by drawing walls, then add doors and windows.
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          textAlign: "left",
        }}
      >
        <StepItem
          number="1"
          icon="▭"
          title="Draw Walls"
          description="Click to start, click again to end a wall"
          shortcut="W"
        />
        <StepItem
          number="2"
          icon="🚪"
          title="Add Doors"
          description="Click on a wall to place a door"
          shortcut="D"
        />
        <StepItem
          number="3"
          icon="🪟"
          title="Add Windows"
          description="Click on a wall to place a window"
          shortcut="N"
        />
      </div>

      <div
        style={{
          marginTop: "24px",
          padding: "12px",
          background: "#f8f9fa",
          borderRadius: "8px",
          fontSize: "12px",
          color: "#666",
        }}
      >
        💡 <strong>Pro tip:</strong> Use scroll to zoom, right-click to pan
      </div>
    </div>
  );
}

function StepItem({ number, icon, title, description, shortcut }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px",
        background: "#f8f9fa",
        borderRadius: "10px",
      }}
    >
      <div
        style={{
          width: "36px",
          height: "36px",
          background: "#1a1a2e",
          color: "white",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontWeight: 600,
            color: "#1a1a2e",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {title}
          <span
            style={{
              fontSize: "10px",
              background: "#e0e0e0",
              padding: "2px 6px",
              borderRadius: "4px",
              fontFamily: "monospace",
            }}
          >
            {shortcut}
          </span>
        </div>
        <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>
          {description}
        </div>
      </div>
    </div>
  );
}

