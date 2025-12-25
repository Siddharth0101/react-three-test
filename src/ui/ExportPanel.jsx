// src/ui/ExportPanel.jsx
import { useState } from "react";
import { useSelector } from "react-redux";

export default function ExportPanel({ canvasRef }) {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const objects = useSelector((s) => s.scene.objects);

  const handleExportPNG = async () => {
    setExporting(true);
    try {
      // Get the canvas element
      const canvas = document.querySelector("canvas");
      if (!canvas) {
        alert("Canvas not found");
        return;
      }

      // Create a temporary link to download
      const link = document.createElement("a");
      link.download = `floor-plan-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
      alert("Export failed");
    }
    setExporting(false);
    setIsOpen(false);
  };

  const handleExportSVG = () => {
    // Generate SVG from objects
    const walls = objects.filter((o) => o.type === "wall");
    const doors = objects.filter((o) => o.type === "door");
    const windows = objects.filter((o) => o.type === "window");
    const furniture = objects.filter((o) => o.type === "furniture");

    // Calculate bounds
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    
    walls.forEach((wall) => {
      minX = Math.min(minX, wall.start[0], wall.end[0]);
      maxX = Math.max(maxX, wall.start[0], wall.end[0]);
      minY = Math.min(minY, wall.start[1], wall.end[1]);
      maxY = Math.max(maxY, wall.start[1], wall.end[1]);
    });

    furniture.forEach((f) => {
      if (f.position) {
        minX = Math.min(minX, f.position[0] - 1);
        maxX = Math.max(maxX, f.position[0] + 1);
        minY = Math.min(minY, f.position[1] - 1);
        maxY = Math.max(maxY, f.position[1] + 1);
      }
    });

    // Add padding
    const padding = 1;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    const width = (maxX - minX) * 100; // Scale to pixels
    const height = (maxY - minY) * 100;

    // Transform coordinates
    const tx = (x) => (x - minX) * 100;
    const ty = (y) => height - (y - minY) * 100; // Flip Y

    let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <style>
    .wall { stroke: #1a1a2e; stroke-width: 15; stroke-linecap: round; fill: none; }
    .door { stroke: #8B4513; stroke-width: 3; fill: none; }
    .window { stroke: #4a90d9; stroke-width: 3; fill: #b8d4ed; fill-opacity: 0.5; }
    .furniture { stroke: #333; stroke-width: 1; }
    .label { font-family: Arial, sans-serif; font-size: 12px; fill: #666; }
  </style>
  
  <!-- Background -->
  <rect width="100%" height="100%" fill="white"/>
  
  <!-- Grid -->
  <defs>
    <pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse">
      <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#e0e0e0" stroke-width="0.5"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#grid)"/>
  
  <!-- Walls -->
  <g class="walls">
`;

    walls.forEach((wall) => {
      svgContent += `    <line class="wall" x1="${tx(wall.start[0])}" y1="${ty(wall.start[1])}" x2="${tx(wall.end[0])}" y2="${ty(wall.end[1])}"/>
`;
    });

    svgContent += `  </g>
  
  <!-- Furniture -->
  <g class="furniture">
`;

    furniture.forEach((f) => {
      if (f.position) {
        const x = tx(f.position[0]);
        const y = ty(f.position[1]);
        svgContent += `    <rect class="furniture" x="${x - 25}" y="${y - 25}" width="50" height="50" fill="#8B4513" fill-opacity="0.7"/>
`;
      }
    });

    svgContent += `  </g>
</svg>`;

    // Download SVG
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `floor-plan-${Date.now()}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  const handleExportJSON = () => {
    const data = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      objects,
      stats: {
        walls: objects.filter((o) => o.type === "wall").length,
        doors: objects.filter((o) => o.type === "door").length,
        windows: objects.filter((o) => o.type === "window").length,
        furniture: objects.filter((o) => o.type === "furniture").length,
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `floor-plan-${Date.now()}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  return (
    <>
      {/* Export Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: 46,
          right: 70,
          padding: "10px 16px",
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
        <span>📤</span> Export
      </button>

      {/* Export Panel */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: 90,
            right: 70,
            width: "220px",
            background: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(10px)",
            borderRadius: "12px",
            boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
            border: "1px solid rgba(0,0,0,0.1)",
            zIndex: 999998,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid #eee",
              fontWeight: 600,
              fontSize: "14px",
            }}
          >
            Export Floor Plan
          </div>

          <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <ExportButton
              icon="🖼️"
              label="Export as PNG"
              description="High-quality image"
              onClick={handleExportPNG}
              loading={exporting}
            />
            <ExportButton
              icon="📐"
              label="Export as SVG"
              description="Vector graphics"
              onClick={handleExportSVG}
            />
            <ExportButton
              icon="📋"
              label="Export as JSON"
              description="Project data"
              onClick={handleExportJSON}
            />
          </div>
        </div>
      )}
    </>
  );
}

function ExportButton({ icon, label, description, onClick, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        padding: "10px 12px",
        borderRadius: "8px",
        border: "1px solid #e0e0e0",
        background: "white",
        cursor: loading ? "wait" : "pointer",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        transition: "all 0.15s",
        opacity: loading ? 0.6 : 1,
      }}
    >
      <span style={{ fontSize: "20px" }}>{icon}</span>
      <div style={{ textAlign: "left" }}>
        <div style={{ fontWeight: 500, fontSize: "13px", color: "#333" }}>
          {loading ? "Exporting..." : label}
        </div>
        <div style={{ fontSize: "10px", color: "#888" }}>{description}</div>
      </div>
    </button>
  );
}

