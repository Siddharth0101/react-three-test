// src/ui/MiniMap.jsx
import { useSelector } from "react-redux";
import { useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useMemo } from "react";

export default function MiniMap() {
  const mode = useSelector((s) => s.viewMode.mode);
  const objects = useSelector((s) => s.scene.objects);
  const { camera } = useThree();

  const mapData = useMemo(() => {
    const walls = objects.filter((o) => o.type === "wall");
    const furniture = objects.filter((o) => o.type === "furniture");
    
    if (walls.length === 0 && furniture.length === 0) return null;

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
        minX = Math.min(minX, f.position[0]);
        maxX = Math.max(maxX, f.position[0]);
        minY = Math.min(minY, f.position[1]);
        maxY = Math.max(maxY, f.position[1]);
      }
    });

    const padding = 2;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    const worldWidth = maxX - minX;
    const worldHeight = maxY - minY;
    const mapSize = 150;
    const scale = mapSize / Math.max(worldWidth, worldHeight);

    return { minX, minY, maxX, maxY, worldWidth, worldHeight, scale, mapSize, walls, furniture };
  }, [objects]);

  if (mode !== "2d" || !mapData) return null;

  const { minX, minY, scale, mapSize, walls, furniture } = mapData;

  // Transform world to map coordinates
  const toMapX = (x) => (x - minX) * scale;
  const toMapY = (y) => mapSize - (y - minY) * scale;

  // Camera viewport indicator
  const camX = toMapX(camera.position.x);
  const camY = toMapY(camera.position.y);
  const viewWidth = (window.innerWidth / camera.zoom) * scale * 0.5;
  const viewHeight = (window.innerHeight / camera.zoom) * scale * 0.5;

  return (
    <Html
      calculatePosition={() => [0, 0]}
      style={{
        position: "fixed",
        bottom: "140px",
        right: "16px",
      }}
    >
      <div
        style={{
          width: `${mapSize}px`,
          height: `${mapSize}px`,
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          border: "1px solid rgba(0,0,0,0.1)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Title */}
        <div
          style={{
            position: "absolute",
            top: "4px",
            left: "8px",
            fontSize: "9px",
            color: "#888",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Mini Map
        </div>

        {/* SVG content */}
        <svg
          width={mapSize}
          height={mapSize}
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          {/* Walls */}
          {walls.map((wall, i) => (
            <line
              key={`wall-${i}`}
              x1={toMapX(wall.start[0])}
              y1={toMapY(wall.start[1])}
              x2={toMapX(wall.end[0])}
              y2={toMapY(wall.end[1])}
              stroke="#1a1a2e"
              strokeWidth="3"
              strokeLinecap="round"
            />
          ))}

          {/* Furniture */}
          {furniture.map((f, i) => (
            f.position && (
              <rect
                key={`furn-${i}`}
                x={toMapX(f.position[0]) - 3}
                y={toMapY(f.position[1]) - 3}
                width="6"
                height="6"
                fill="#8B4513"
                rx="1"
              />
            )
          ))}

          {/* Viewport indicator */}
          <rect
            x={camX - viewWidth / 2}
            y={camY - viewHeight / 2}
            width={viewWidth}
            height={viewHeight}
            fill="rgba(33, 150, 243, 0.15)"
            stroke="#2196F3"
            strokeWidth="1.5"
            rx="2"
          />

          {/* Center dot */}
          <circle
            cx={camX}
            cy={camY}
            r="3"
            fill="#2196F3"
          />
        </svg>
      </div>
    </Html>
  );
}

