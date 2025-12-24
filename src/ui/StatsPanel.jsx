// src/ui/StatsPanel.jsx
import { useSelector } from "react-redux";
import { useMemo } from "react";

export default function StatsPanel() {
  const objects = useSelector((s) => s.scene.objects);
  const mode = useSelector((s) => s.viewMode.mode);

  const stats = useMemo(() => {
    const walls = objects.filter((o) => o.type === "wall");
    const doors = objects.filter((o) => o.type === "door");
    const windows = objects.filter((o) => o.type === "window");
    const furniture = objects.filter((o) => o.type === "furniture");

    // Helper to get wall coordinates (handles both formats)
    const getWallCoords = (wall) => {
      // Format from AI: props.x1, y1, x2, y2
      if (wall.props?.x1 !== undefined) {
        return {
          x1: wall.props.x1,
          y1: wall.props.y1,
          x2: wall.props.x2,
          y2: wall.props.y2,
        };
      }
      // Format from wall tool: start[x,y], end[x,y]
      if (wall.start && wall.end) {
        return {
          x1: wall.start[0],
          y1: wall.start[1],
          x2: wall.end[0],
          y2: wall.end[1],
        };
      }
      return { x1: 0, y1: 0, x2: 0, y2: 0 };
    };

    // Calculate total wall length
    const totalWallLength = walls.reduce((sum, wall) => {
      const coords = getWallCoords(wall);
      const dx = coords.x2 - coords.x1;
      const dy = coords.y2 - coords.y1;
      return sum + Math.sqrt(dx * dx + dy * dy);
    }, 0);

    // Estimate floor area (simple bounding box)
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    walls.forEach((wall) => {
      const coords = getWallCoords(wall);
      minX = Math.min(minX, coords.x1, coords.x2);
      maxX = Math.max(maxX, coords.x1, coords.x2);
      minY = Math.min(minY, coords.y1, coords.y2);
      maxY = Math.max(maxY, coords.y1, coords.y2);
    });
    const boundingArea = walls.length > 0 ? (maxX - minX) * (maxY - minY) : 0;

    return {
      wallCount: walls.length,
      doorCount: doors.length,
      windowCount: windows.length,
      furnitureCount: furniture.length,
      totalWallLength: totalWallLength.toFixed(2),
      estimatedArea: boundingArea.toFixed(1),
    };
  }, [objects]);

  if (objects.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        padding: "16px",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        border: "1px solid rgba(0,0,0,0.1)",
        zIndex: 999998,
        minWidth: "180px",
        fontSize: "13px",
      }}
    >
      <div
        style={{
          fontWeight: 700,
          marginBottom: "12px",
          color: "#1a1a2e",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          borderBottom: "1px solid #eee",
          paddingBottom: "8px",
        }}
      >
        <span style={{ fontSize: "16px" }}>📊</span>
        Project Stats
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <StatRow icon="🧱" label="Walls" value={stats.wallCount} />
        <StatRow icon="🚪" label="Doors" value={stats.doorCount} />
        <StatRow icon="🪟" label="Windows" value={stats.windowCount} />
        <StatRow icon="🪑" label="Furniture" value={stats.furnitureCount} />
        
        <div style={{ borderTop: "1px solid #eee", marginTop: "4px", paddingTop: "8px" }}>
          <StatRow 
            icon="📏" 
            label="Total Length" 
            value={`${stats.totalWallLength}m`} 
          />
          {parseFloat(stats.estimatedArea) > 0 && (
            <StatRow 
              icon="📐" 
              label="Bounding Area" 
              value={`${stats.estimatedArea}m²`} 
            />
          )}
        </div>
      </div>

      {mode === "2d" && (
        <div
          style={{
            marginTop: "12px",
            padding: "8px",
            background: "#f5f5f5",
            borderRadius: "6px",
            fontSize: "11px",
            color: "#666",
          }}
        >
          💡 Tip: Press <kbd style={kbdStyle}>W</kbd> for Wall, <kbd style={kbdStyle}>D</kbd> for Door, <kbd style={kbdStyle}>Esc</kbd> to cancel
        </div>
      )}
    </div>
  );
}

function StatRow({ icon, label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span style={{ color: "#666", display: "flex", alignItems: "center", gap: "6px" }}>
        <span style={{ fontSize: "14px" }}>{icon}</span>
        {label}
      </span>
      <span style={{ fontWeight: 600, color: "#1a1a2e" }}>{value}</span>
    </div>
  );
}

const kbdStyle = {
  background: "#e0e0e0",
  padding: "2px 6px",
  borderRadius: "4px",
  fontFamily: "monospace",
  fontSize: "11px",
};

